import Handlebars from "@handlebars";
import { merge } from "@fathym/common";
import { BillingManagementClient } from "npm:@azure/arm-billing";
import {
  Deployment,
  DeploymentExtended,
  ResourceManagementClient,
} from "npm:@azure/arm-resources";
import { AccessToken } from "npm:@azure/identity";
import {
  AuthenticationProvider,
  AuthenticationProviderOptions,
  Client as GraphClient,
} from "npm:@microsoft/microsoft-graph-client";
import { TokenCredential } from "npm:@azure/identity";
import {
  loadAzureCloudCredentials,
  loadMainAzureCredentials,
} from "../../../../../src/utils/eac/loadAzureCloudCredentials.ts";
import { EaCCloudAsCode } from "../../../../../src/eac/modules/clouds/EaCCloudAsCode.ts";
import { EaCCloudAzureDetails } from "../../../../../src/eac/modules/clouds/EaCCloudAzureDetails.ts";
import { EverythingAsCodeClouds } from "../../../../../src/eac/modules/clouds/EverythingAsCodeClouds.ts";
import { EaCCloudDeployment } from "../../../../../src/api/models/EaCCloudDeployment.ts";
import { EaCCloudResourceGroupAsCode } from "../../../../../src/eac/modules/clouds/EaCCloudResourceGroupAsCode.ts";
import { EaCCloudResourceGroupDetails } from "../../../../../src/eac/modules/clouds/EaCCloudResourceGroupDetails.ts";
import { EaCCloudResourceAsCode } from "../../../../../src/eac/modules/clouds/EaCCloudResourceAsCode.ts";
import { EaCCloudResourceFormatDetails } from "../../../../../src/eac/modules/clouds/EaCCloudResourceFormatDetails.ts";
import { EaCHandlerCheckRequest } from "../../../../../src/api/models/EaCHandlerCheckRequest.ts";

class TokenProvider implements AuthenticationProvider {
  constructor(
    protected credential: TokenCredential,
    protected authenticationProviderOptions: AuthenticationProviderOptions,
  ) {}

  public async getAccessToken(): Promise<string> {
    const creds = loadMainAzureCredentials();

    const accessToken = await creds.getToken(
      this.authenticationProviderOptions!.scopes!,
    );

    return accessToken.token;
  }
}

export async function getCurrentAzureUser(accessToken: string) {
  // console.log(`Finalizing EaC commit ${commitId} Cloud details`);

  // const creds = loadAzureCloudCredentials(cloud);
  // const creds = loadMainAzureCredentials();

  const graphClient = GraphClient.initWithMiddleware({
    authProvider: new TokenProvider(
      {
        getToken: async () => {
          return {
            token: accessToken,
          } as AccessToken;
        },
      } as TokenCredential,
      {
        scopes: [`https://graph.microsoft.com/.default`], //"Application.Read.All"],
      },
    ),
  });

  const me = await graphClient
    .api("/me")
    // .select(["id"])
    .get();

  return me;
}

export async function finalizeCloudDetails(
  commitId: string,
  cloud: EaCCloudAsCode,
): Promise<void> {
  if (cloud.Details) {
    console.log(`Finalizing EaC commit ${commitId} Cloud details`);

    const details = cloud.Details as EaCCloudAzureDetails;

    // const creds = loadAzureCloudCredentials(cloud);
    // const creds = loadMainAzureCredentials();

    const graphClient = GraphClient.initWithMiddleware({
      authProvider: new TokenProvider(
        {
          getToken: () => {
            return cloud.Token;
          },
        } as TokenCredential,
        {
          scopes: [`https://graph.microsoft.com/.default`], //"Application.Read.All"],
        },
      ),
    });

    if (cloud.Token && !details.SubscriptionID && !details.TenantID) {
      const creds = await loadAzureCloudCredentials(cloud);

      const subscriptionId = "00000000-0000-0000-0000-000000000000";

      const billingClient = new BillingManagementClient(creds, subscriptionId);

      const billingAccounts = await billingClient.billingAccounts.list();

      // TODO: Create Subsction
      // TODO: Set cloud.Details.SubscriptionID values to cloud
      // TODO: Set cloud.Details.TenantID values to cloud
    }

    if (
      cloud.Token &&
      details.SubscriptionID &&
      details.TenantID &&
      !details.ApplicationID &&
      !details.AuthKey
    ) {
      // TODO:  Create RBAC service principal
      // TODO: Set cloud.Details.* values to RBAC svc principal
    }

    // const client = new ApplicationClient(creds, details.SubscriptionID);

    const svcPrinc = await graphClient
      .api("/servicePrincipals")
      .filter(`appId eq '${details.ApplicationID}'`)
      .select(["id"])
      .get();

    cloud.Details.ID = svcPrinc.value[0].id;
  }

  delete cloud.Token;
}

export async function buildCloudDeployments(
  commitId: string,
  eac: EverythingAsCodeClouds,
  cloudLookup: string,
  cloud: EaCCloudAsCode,
): Promise<EaCCloudDeployment[]> {
  console.log(`Building EaC commit ${commitId} Cloud deloyments`);

  const resGroupLookups = Object.keys(cloud.ResourceGroups || {});

  const deployments: EaCCloudDeployment[] = [];

  for (const resGroupLookup of resGroupLookups) {
    const resGroup = cloud.ResourceGroups![resGroupLookup];

    const deployment = await buildCloudDeployment(
      commitId,
      eac,
      cloudLookup,
      resGroupLookup,
      resGroup,
    );

    if (deployment) {
      deployments.push(deployment);
    }
  }

  return deployments;
}

export async function buildCloudDeployment(
  commitId: string,
  eac: EverythingAsCodeClouds,
  cloudLookup: string,
  resGroupLookup: string,
  resGroup: EaCCloudResourceGroupAsCode,
): Promise<EaCCloudDeployment | undefined> {
  if (Object.keys(resGroup.Resources || {}).length > 0) {
    console.log(
      `Building EaC commit ${commitId} Cloud deployment for ${resGroupLookup}`,
    );

    const resGroupTemplateResources: Record<string, unknown>[] = [];

    const useResGroupDetails = resGroup.Details ||
      eac.Clouds![cloudLookup].ResourceGroups![resGroupLookup].Details;

    const armResources = await buildArmResourcesForResourceGroupDeployment(
      useResGroupDetails!,
      cloudLookup,
      resGroupLookup,
      resGroup,
    );

    resGroupTemplateResources.push(...armResources);

    const deploymentName = `resource-group-${resGroupLookup}-${Date.now()}`;

    const deployment: Deployment = {
      location: useResGroupDetails!.Location,
      properties: {
        mode: "Incremental",
        expressionEvaluationOptions: {
          scope: "outer",
        },
        template: {
          $schema:
            "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
          contentVersion: "1.0.0.0",
          resources: resGroupTemplateResources,
        },
      },
      tags: {
        Cloud: cloudLookup,
      },
    };

    return {
      CloudLookup: cloudLookup,
      Deployment: deployment,
      Name: deploymentName,
      ResourceGroupLookup: resGroupLookup,
    };
  }

  return undefined;
}

export async function buildArmResourcesForResourceGroupDeployment(
  useResGroupDetails: EaCCloudResourceGroupDetails,
  cloudLookup: string,
  resGroupLookup: string,
  resGroup: EaCCloudResourceGroupAsCode,
): Promise<Record<string, unknown>[]> {
  const armResources: Record<string, unknown>[] = [];

  armResources.push({
    type: "Microsoft.Resources/resourceGroups",
    apiVersion: "2018-05-01",
    name: resGroupLookup,
    location: useResGroupDetails.Location,
    tags: {
      Cloud: cloudLookup,
    },
  });

  const resourceArmResources = await buildArmResourcesForResources(
    cloudLookup,
    resGroupLookup,
    resGroup.Resources || {},
    [`[resourceId('Microsoft.Resources/resourceGroups', '${resGroupLookup}')]`],
  );

  armResources.push(...resourceArmResources);

  return armResources;
}

export async function buildArmResourcesForResources(
  cloudLookup: string,
  resGroupLookup: string,
  resources: Record<string, EaCCloudResourceAsCode>,
  dependsOn: string[],
): Promise<Record<string, unknown>[]> {
  const resLookups = Object.keys(resources);

  const armResources: Record<string, unknown>[] = [];

  for (const resLookup of resLookups) {
    const resource = resources[resLookup];

    const resArmResource = await buildResourceTemplateResource(
      cloudLookup,
      resGroupLookup,
      resLookup,
      resource,
      dependsOn,
    );

    armResources.push(resArmResource);
  }

  return armResources;
}

export async function buildResourceTemplateResource(
  cloudLookup: string,
  resGroupLookup: string,
  resLookup: string,
  resource: EaCCloudResourceAsCode,
  dependsOn: string[],
): Promise<Record<string, unknown>> {
  const details = resource.Details as EaCCloudResourceFormatDetails;

  const assets = await loadCloudResourceDetailAssets(details);

  const deploymentName = `resource-${resLookup}-${Date.now()}`;

  const armResource = {
    type: "Microsoft.Resources/deployments",
    apiVersion: "2019-10-01",
    dependsOn: dependsOn,
    resourceGroup: resGroupLookup,
    name: deploymentName,
    properties: {
      mode: "Incremental",
      expressionEvaluationOptions: {
        scope: "inner",
      },
      parameters: await formatParameters(details.Data || {}, assets.Parameters),
      template: {
        ...assets.Content,
      },
    },
    tags: {
      Cloud: cloudLookup,
    },
  };

  const peerResources = armResource.properties.template.resources as Record<
    string,
    unknown
  >[];

  if (resource.Resources) {
    const subResArmResources = await buildArmResourcesForResources(
      cloudLookup,
      resGroupLookup,
      resource.Resources || {},
      peerResources.map((pr) => {
        let name = pr.name as string;

        if (name.startsWith("[")) {
          name = name.substring(1, name.length - 1);
        } else {
          name = `'${name}'`;
        }

        return `[resourceId('${pr.type}', ${name})]`;
      }),
      // [
      //   // `[resourceId('Microsoft.Resources/resourceGroups', '${resGroupLookup}')]`,
      //   // `[resourceId('Microsoft.Resources/deployments', '${deploymentName}')]`,
      // ],
    );

    peerResources.push(...subResArmResources);
  }

  return armResource;
}

export async function loadCloudResourceDetailAssets(
  details: EaCCloudResourceFormatDetails,
): Promise<{
  Content: Record<string, unknown>;
  Parameters: Record<string, unknown>;
}> {
  const assetPaths = [
    { Lookup: "Content", Path: details.Template.Content },
    { Lookup: "Parameters", Path: details.Template.Parameters },
  ];

  const assetCalls = assetPaths.map(async (asset) => {
    const result = await fetch(asset.Path);

    return {
      Lookup: asset.Lookup,
      Value: (await result.json()) as Record<string, unknown>,
    };
  });

  const assets = (await Promise.all(assetCalls)).reduce((prev, cur) => {
    return {
      ...prev,
      [cur.Lookup]: cur.Lookup == "Parameters"
        ? cur.Value.parameters
        : cur.Value,
    };
  }, {}) as {
    Content: Record<string, unknown>;
    Parameters: Record<string, unknown>;
  };

  return assets;
}

export async function beginEaCDeployments(
  commitId: string,
  cloud: EaCCloudAsCode,
  deployments: EaCCloudDeployment[],
): Promise<EaCHandlerCheckRequest[]> {
  console.log(`Beginning EaC commit ${commitId} Cloud deloyments`);

  const details = cloud.Details as EaCCloudAzureDetails;

  const creds = await loadAzureCloudCredentials(cloud);

  const resClient = new ResourceManagementClient(creds, details.SubscriptionID);

  const beginDeploymentCalls = deployments.map(async (deployment) => {
    const beginDeploy = await resClient.deployments
      .beginCreateOrUpdateAtSubscriptionScope(
        // deployment.ResourceGroupLookup,
        deployment.Name,
        deployment.Deployment,
      );

    return {
      CommitID: commitId,
      CorelationID: crypto.randomUUID(),
      ...deployment,
    } as EaCHandlerCheckRequest;
  });

  const checks = await Promise.all(beginDeploymentCalls);

  return checks;
}

export async function loadDeploymentDetails(
  commitId: string,
  cloud: EaCCloudAsCode,
  deploymentName: string,
  resGroupLookup?: string,
  resGroupLookupPassthrough?: string,
): Promise<{
  Deployment: DeploymentExtended;
  Messages: Record<string, unknown>;
}> {
  console.log(
    `Processing EaC commit ${commitId} Cloud checks for deployment ${deploymentName}`,
  );

  const details = cloud.Details as EaCCloudAzureDetails;

  const creds = await loadAzureCloudCredentials(cloud);

  const resClient = new ResourceManagementClient(creds, details.SubscriptionID);

  const getDeployment = resGroupLookup
    ? resClient.deployments.get(resGroupLookup, deploymentName)
    : resClient.deployments.getAtSubscriptionScope(deploymentName);

  const deployment = await getDeployment;

  const list = resGroupLookup
    ? resClient.deploymentOperations.list(resGroupLookup, deploymentName)
    : resClient.deploymentOperations.listAtSubscriptionScope(deploymentName);

  const ops = await list;

  let messages: Record<string, unknown> = {
    [deploymentName]: {
      LastActivity: deployment.properties!.timestamp,
      State: deployment.properties!.provisioningState,
    },
  };

  for await (const operation of ops) {
    const nextResource = operation.properties!.targetResource?.resourceName!;

    if (
      operation.properties?.targetResource?.resourceType ===
        "Microsoft.Resources/deployments"
    ) {
      const subDeployDetails = await loadDeploymentDetails(
        commitId,
        cloud,
        nextResource,
        resGroupLookupPassthrough,
        resGroupLookupPassthrough,
      );

      messages[deploymentName] = merge(
        messages[deploymentName] as object,
        subDeployDetails.Messages,
      );
    } else if (nextResource) {
      messages[deploymentName] = merge(messages[deploymentName] as object, {
        [nextResource]: {
          // Duration: operation.properties!.duration,
          LastActivity: operation.properties!.timestamp,
          Message: operation.properties!.statusMessage,
          Operation: operation.properties!.provisioningOperation,
          State: operation.properties!.provisioningState,
          Status: operation.properties!.statusCode,
          Type: operation.properties!.targetResource?.resourceType,
        },
      });
    }
  }

  return {
    Deployment: deployment,
    Messages: messages,
  };
}

export async function formatParameters(
  parameters: Record<string, unknown>,
  paramsTemplate: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const params = JSON.stringify(paramsTemplate);

  const result = Handlebars.compile(params)(parameters);

  return JSON.parse(result) as Record<string, unknown>;
}
