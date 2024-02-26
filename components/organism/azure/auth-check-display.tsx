import { CloudConnectAzureForm } from "@fathym/atomic";
import { ComponentChildren, JSX } from "preact";

export type AzureAuthCheckDisplayProps = {
  children: ComponentChildren;

  isAuthenticated: boolean;
} & JSX.HTMLAttributes<HTMLDivElement>;

export function AzureAuthCheckDisplay(props: AzureAuthCheckDisplayProps) {
  const { children, isAuthenticated, ...divProps } = props;

  const currentDisplay = isAuthenticated
    ? children
    : <CloudConnectAzureForm action="/dashboard/clouds/azure/auth/signin" />;

  return (
    <div {...divProps}>
      {currentDisplay}
    </div>
  );
}
