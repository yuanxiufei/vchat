import type { ConfigEnv, UserConfig } from 'vite'
import { defineConfig } from 'vite'
import { pluginExposeRenderer } from './vite.base.config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'renderer'>
  const { root, mode, forgeConfigSelf } = forgeEnv
  const name = forgeConfigSelf.name ?? ''

  return {
    root,
    mode,
    base: './',
    build: {
      outDir: `.vite/renderer/${name}`,
    },
    plugins: [vue(), pluginExposeRenderer(name)],
    css: {
      postcss: './postcss.config.js',
    },
    resolve: {
      preserveSymlinks: true,
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    server: {
      watch: {
        ignored: ["**/src/utils/*.json"]
      }
    },
    clearScreen: false,
  } as UserConfig
})
