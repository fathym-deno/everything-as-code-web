import { IconSetConfig, IconSetGenerateConfig } from "@fathym/atomic-icons";

export const curIconSetConfig: IconSetConfig = {
  IconMap: {
    begin: "https://api.iconify.design/fe:beginner.svg",
    check: "https://api.iconify.design/lets-icons:check-fill.svg",
    delete: "https://api.iconify.design/material-symbols-light:delete.svg",
    loading: "https://api.iconify.design/line-md:loading-alt-loop.svg",
  },
};

export const curIconSetGenerateConfig: IconSetGenerateConfig = {
  IconSet: curIconSetConfig,
  SpriteSheet: "./iconset/icons",
};
