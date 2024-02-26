import { type Config } from "tailwindcss";
import unimportant from "npm:tailwindcss-unimportant";
import { buildTailwindComponentsConfigs } from "@fathym/common";
import FathymAtomicTailwindComponents from "@fathym/atomic/tailwind.components.ts";

const tailwindComponents = [...FathymAtomicTailwindComponents];

await buildTailwindComponentsConfigs(tailwindComponents);

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx}",
    "build/tailwind-components.config",
  ],
  plugins: [unimportant],
} satisfies Config;
