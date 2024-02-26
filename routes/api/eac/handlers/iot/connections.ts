// deno-lint-ignore-file no-explicit-any
import { HandlerContext, Handlers } from "$fresh/server.ts";
import { respond } from "@fathym/common";
import { IotHubClient } from "npm:@azure/arm-iothub";
import { Registry as IoTRegistry } from "npm:azure-iothub";
import { EaCAPIUserState } from "../../../../../src/api/EaCAPIUserState.ts";
import { EaCHandlerConnectionsRequest } from "../../../../../src/api/models/EaCHandlerConnectionsRequest.ts";
import { EverythingAsCodeClouds } from "../../../../../src/eac/modules/clouds/EverythingAsCodeClouds.ts";
import { EverythingAsCodeIoT } from "../../../../../src/eac/modules/iot/EverythingAsCodeIoT.ts";
import { EaCIoTAsCode } from "../../../../../src/eac/modules/iot/EaCIoTAsCode.ts";
import { EaCHandlerConnectionsResponse } from "../../../../../src/api/models/EaCHandlerConnectionsResponse.ts";
import { EaCDeviceAsCode } from "../../../../../src/eac/modules/iot/EaCDeviceAsCode.ts";
import { loadAzureCloudCredentials } from "../../../../../src/utils/eac/loadAzureCloudCredentials.ts";
import { EaCCloudAzureDetails } from "../../../../../src/eac/modules/clouds/EaCCloudAzureDetails.ts";

export const handler: Handlers = {
  /**
   * Use this endpoint to retrieve locations for the provided services.
   * @param _req
   * @param ctx
   * @returns
   */
  async POST(req: Request, ctx: HandlerContext<any, EaCAPIUserState>) {
    const handlerRequest: EaCHandlerConnectionsRequest = await req.json();

    const eac: EverythingAsCodeIoT & EverythingAsCodeClouds =
      handlerRequest.EaC;

    const iotDef = handlerRequest.Model as EaCIoTAsCode;

    let deviceLookups = Object.keys(iotDef.Devices || {});

    const iot = handlerRequest.Current as EaCIoTAsCode;

    if (deviceLookups.length === 0) {
      deviceLookups = Object.keys(iot.Devices || {});
    }

    return respond({
      Model: {
        Devices: await loadIoTDevicesConnections(
          eac,
          iot,
          iotDef.Devices!,
          iot.Devices!,
          deviceLookups,
        ),
      } as EaCIoTAsCode,
    } as EaCHandlerConnectionsResponse);
  },
};

async function loadIoTDevicesConnections(
  currentEaC: EverythingAsCodeIoT & EverythingAsCodeClouds,
  iot: EaCIoTAsCode,
  devicesDef: Record<string, EaCDeviceAsCode>,
  devices: Record<string, EaCDeviceAsCode>,
  deviceLookups: string[],
): Promise<Record<string, EaCDeviceAsCode>> {
  const cloud = currentEaC.Clouds![iot.CloudLookup!];

  const creds = await loadAzureCloudCredentials(cloud);

  const details = cloud.Details as EaCCloudAzureDetails;

  const iotClient = new IotHubClient(creds, details.SubscriptionID);

  const resGroupName = iot.ResourceGroupLookup!;

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

  const mappedCalls = deviceLookups!.map(async (deviceLookup) => {
    const deviceDef = devicesDef ? devicesDef[deviceLookup] : {};

    const device = devices![deviceLookup];

    const azureDevice = await iotRegistry.get(deviceLookup);

    return {
      DeviceLookup: deviceLookup,
      Device: {
        Keys: azureDevice.responseBody.authentication?.symmetricKey,
      },
    };
  }, {});

  const mapped = await Promise.all(mappedCalls);

  return mapped.reduce((dvcs, dev) => {
    dvcs[dev.DeviceLookup] = dev.Device;

    return dvcs;
  }, {} as Record<string, EaCDeviceAsCode>);
}
