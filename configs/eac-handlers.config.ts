import { EaCHandlers } from "../src/api/EaCHandlers.ts";

export const eacHandlers: EaCHandlers = {
  Clouds: {
    APIPath: "http://localhost:5437/api/eac/handlers/clouds",
    Order: 100,
  },
  DevOpsActions: {
    APIPath: "http://localhost:5437/api/eac/handlers/devops-actions",
    Order: 400,
  },
  GitHubApps: {
    APIPath: "http://localhost:5437/api/eac/handlers/github-apps",
    Order: 100,
  },
  IoT: {
    APIPath: "http://localhost:5437/api/eac/handlers/iot",
    Order: 200,
  },
  Secrets: {
    APIPath: "http://localhost:5437/api/eac/handlers/secrets",
    Order: 300,
  },
  SourceConnections: {
    APIPath: "http://localhost:5437/api/eac/handlers/source-connections",
    Order: 300,
  },
  Sources: {
    APIPath: "http://localhost:5437/api/eac/handlers/sources",
    Order: 500,
  },
};
