import { IotHubClient } from "npm:@azure/arm-iothub";
import { Registry as IoTRegistry } from "npm:azure-iothub";
import { EaCCloudAsCode } from "../../../../../src/eac/modules/clouds/EaCCloudAsCode.ts";
import { EaCIoTAsCode } from "../../../../../src/eac/modules/iot/EaCIoTAsCode.ts";
import { EnsureIoTDevicesResponse } from "../../../../../src/eac/modules/iot/models/EnsureIoTDevicesResponse.ts";
import { EaCCloudAzureDetails } from "../../../../../src/eac/modules/clouds/EaCCloudAzureDetails.ts";
import { loadAzureCloudCredentials } from "../../../../../src/utils/eac/loadAzureCloudCredentials.ts";
import { EaCDeviceDetails } from "../../../../../src/eac/modules/iot/EaCDeviceDetails.ts";

export async function ensureIoTDevices(
  cloud: EaCCloudAsCode,
  currentIoT: EaCIoTAsCode,
  iot: EaCIoTAsCode,
): Promise<EnsureIoTDevicesResponse | null> {
  if (iot.Devices) {
    const details = cloud.Details as EaCCloudAzureDetails;

    const creds = await loadAzureCloudCredentials(cloud);

    const iotClient = new IotHubClient(creds, details.SubscriptionID);

    const resGroupName = currentIoT.ResourceGroupLookup!;

    const shortName = resGroupName
      .split("-")
      .map((p) => p.charAt(0))
      .join("");

    const iotHubName = `${shortName}-iot-hub`;

    const keyName = "iothubowner";

    const keys = await iotClient.iotHubResource.getKeysForKeyName(
      resGroupName,
      iotHubName,
      keyName,
    );

    const iotHubConnStr =
      `HostName=${iotHubName}.azure-devices.net;SharedAccessKeyName=${keyName};SharedAccessKey=${keys.primaryKey}`;

    const iotRegistry = IoTRegistry.fromConnectionString(iotHubConnStr);

    const deviceLookups = Object.keys(iot.Devices || {});

    const deviceRequestCalls = deviceLookups.map(async (deviceLookup) => {
      const device = iot.Devices![deviceLookup];

      const deviceDetails: EaCDeviceDetails = device.Details!;

      try {
        await iotRegistry.get(deviceLookup);

        return null;
      } catch (err) {
        console.error(err);

        if (err.name !== "DeviceNotFoundError") {
          throw err;
        }
      }

      return {
        deviceId: deviceLookup,
        capabilities: {
          iotEdge: deviceDetails.IsIoTEdge,
        },
      };
    });

    const deviceRequests = await Promise.all(deviceRequestCalls);

    const addDevices = deviceRequests
      .filter((deviceReq) => deviceReq)
      .map((deviceReq) => deviceReq!);

    const addDevicesResp = addDevices.length > 0
      ? await iotRegistry.addDevices(addDevices)
      : null;

    return (addDevicesResp?.responseBody.errors || []).reduce(
      (result, error) => {
        result[error.deviceId] = {
          Error: error.errorCode.message,
          ErrorStatus: error.errorStatus,
        };

        return result;
      },
      {} as EnsureIoTDevicesResponse,
    );
  } else {
    return null;
  }
}
