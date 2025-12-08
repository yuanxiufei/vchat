// Electron Forge 主配置：描述打包、发布与编译流程
import type { ForgeConfig } from "@electron-forge/shared-types";
import path from 'node:path'
// 不同平台安装包生成器
import { MakerSquirrel } from "@electron-forge/maker-squirrel"; // Windows 安装器（.exe）
import { MakerZIP } from "@electron-forge/maker-zip"; // macOS ZIP 包
import { MakerDeb } from "@electron-forge/maker-deb"; // Debian/Ubuntu (.deb)
import { MakerRpm } from "@electron-forge/maker-rpm"; // RedHat/Fedora (.rpm)
import { MakerDMG } from "@electron-forge/maker-dmg"; // macOS DMG 安装包
import { MakerSnap } from "@electron-forge/maker-snap"; // Ubuntu Snap 包
// 编译插件：使用 Vite 构建主进程/预加载/渲染进程
import { VitePlugin } from "@electron-forge/plugin-vite";
// 安全与功能开关（Fuses）：在签名之前锁定 Electron 行为
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
// 环境变量配置：从 .env 文件加载敏感配置（如 API 密钥）
import dotenv from 'dotenv';
// 加载 .env 文件中的环境变量
dotenv.config();

// Forge 配置主体
const config: ForgeConfig = {
  packagerConfig: {
    name: "SmartChat",
    executableName: "SmartChat",
    icon: path.resolve(__dirname, 'src', 'styles', 'logo', process.platform === 'darwin' ? 'logo.icns' : process.platform === 'win32' ? 'logo.ico' : 'logo.png'),
    asar: true,
    extraResource: [
      path.resolve(__dirname, 'src', 'styles', 'logo')
    ],
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: 'SmartChat',
      setupExe: 'SmartChat-Setup.exe',
      setupIcon: path.resolve(__dirname, 'src', 'styles', 'logo', 'logo.ico')
    }),
    new MakerDMG({ icon: path.resolve(__dirname, 'src', 'styles', 'logo', 'logo.icns') }),
    new MakerZIP({}, ["darwin"]), // macOS ZIP 分发包（x64/arm64）
    new MakerRpm({}), // RPM 包（RedHat/Fedora 等）
    new MakerDeb({}), // DEB 包（Debian/Ubuntu 等）
    ...(process.platform === 'linux' && process.env.FORGE_ENABLE_SNAP === 'true' ? [new MakerSnap({})] : []), // Snap 包（Ubuntu 商店，可开关）
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github", // 发布到 GitHub Releases
      config: {
        repository: {
          owner: "yuanxiufei",
          name: "SmartChat",
        },
        prerelease: false,
        draft: false,
        tag: `v${require('./package.json').version}`,
        releaseName: `SmartChat v${require('./package.json').version}`,
        releaseNotes: process.env.RELEASE_NOTES,
        authToken: process.env.GITHUB_TOKEN,
      },
    },
  ],
  plugins: [
    new VitePlugin({
      // build：定义多个入口的 Vite 构建（主进程/预加载等）
      build: [
        {
          entry: "src/main.ts", // 主进程入口
          config: "vite.main.config.ts", // 主进程 Vite 配置
          target: "main", // 构建目标：Electron 主进程
        },
        {
          entry: "src/preload.ts", // 预加载脚本入口
          config: "vite.preload.config.ts", // 预加载 Vite 配置
          target: "preload", // 构建目标：预加载环境
        },
      ],
      renderer: [
        {
          name: "main_window", // 渲染进程命名（用于多窗口场景）
          config: "vite.renderer.config.ts", // 渲染进程 Vite 配置
        },
      ],
    }),
    // 仅在打包/制作安装包阶段启用 Fuses，避免与 Vite 开发插件冲突
    ...(process.argv.includes('make') || process.argv.includes('package') || process.argv.includes('publish')
      ? [
          new FusesPlugin({
            version: FuseVersion.V1,
            [FuseV1Options.RunAsNode]: false,
            [FuseV1Options.EnableCookieEncryption]: true,
            [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
            [FuseV1Options.EnableNodeCliInspectArguments]: false,
            [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
            [FuseV1Options.OnlyLoadAppFromAsar]: true,
          }),
        ]
      : []),
  ],
};

export default config;
