export type EaCApplicationLookupConfiguration = {
  AllowedMethods?: string[];

  IsPrivate?: boolean;

  IsTriggerSignIn?: boolean;

  PathPattern: string;

  Priority: number;

  UserAgentRegex?: string;
};
