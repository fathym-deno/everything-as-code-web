import { Icon, IconProps } from "./icon.deps.ts"

export function LoadingIcon(props: IconProps) {
  return <Icon {...props} src="/./iconset/icons" icon="loading" />;
}
