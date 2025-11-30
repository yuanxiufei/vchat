import type { ConfigEnv, UserConfig } from "vite";
import { defineConfig, mergeConfig } from "vite";
import {
  getBuildConfig,
  getBuildDefine,
  builtins,
  pluginHotRestart,
} from "./vite.base.config";
import path from "node:path";
// remove external replace plugin; alias handles dotenv resolution

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<"build">;
  const { forgeConfigSelf } = forgeEnv;
  const define = getBuildDefine(forgeEnv);
  const config: UserConfig = {
    build: {
      lib: {
        entry: forgeConfigSelf.entry!,
        fileName: () => "[name].js",
        formats: ["cjs"],
      },
      rollupOptions: {
        external: builtins,
        plugins: [
          ({
            name: 'replace-dotenv-require',
            transform(code: string) {
              const c = code
                .replace(/require\(["']dotenv["']\)\.config\(\)/g, '')
                .replace(/require\(["']dotenv["']\)/g, '({config(){}})')
              return { code: c, map: null as any }
            }
          } as any)
        ]
      },
    },
    plugins: [pluginHotRestart("restart")],
    define,
    resolve: {
      // Load the Node.js entry.
      mainFields: ["module", "jsnext:main", "jsnext"],
      alias: {
        dotenv: path.resolve(__dirname, "src/shims/dotenv.ts"),
      },
    },
  };

  return mergeConfig(getBuildConfig(forgeEnv), config);
});
