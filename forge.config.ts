// Electron Forge 主配置：描述打包、发布与编译流程
import type { ForgeConfig } from "@electron-forge/shared-types";
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

// Forge 配置主体
const config: ForgeConfig = {
  packagerConfig: {
    name: "smart-shat", // 应用名称（打包产物显示的 App 名）
    asar: true, // 开启 asar 打包，源码压缩到 asar，减少文件数量并提升加载速度
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}), // Windows 安装器（x64）
    new MakerDMG({}), // macOS DMG 安装包（x64/arm64）
    new MakerZIP({}, ["darwin"]), // macOS ZIP 分发包（x64/arm64）
    new MakerRpm({}), // RPM 包（RedHat/Fedora 等）
    new MakerDeb({}), // DEB 包（Debian/Ubuntu 等）
    new MakerSnap({}), // Snap 包（Ubuntu 商店）
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github", // 发布到 GitHub Releases
      config: {
        repository: {
          owner: "reginyuan", // 仓库所有者
          name: "vchat", // 仓库名称
        },
        prerelease: false, // 是否标记为预发布版本
        draft: true, // 以草稿形式创建 Release，便于人工检查后发布
        authToken: process.env.GITHUB_TOKEN, // 从环境变量读取 GitHub Token（避免硬编码）
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
    // Fuses：在打包阶段启用/禁用 Electron 功能（提升安全）
    new FusesPlugin({
      version: FuseVersion.V1, // 使用 V1 版本的 Fuse
      [FuseV1Options.RunAsNode]: false, // 禁止将 Electron 当作 Node 运行
      [FuseV1Options.EnableCookieEncryption]: true, // 启用 Cookie 加密
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false, // 禁用 NODE_OPTIONS 环境变量
      [FuseV1Options.EnableNodeCliInspectArguments]: false, // 禁用 --inspect 等调试 CLI 参数
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true, // 验证内嵌 asar 的完整性
      [FuseV1Options.OnlyLoadAppFromAsar]: true, // 仅从 asar 加载应用，阻止散文件加载（更安全）
    }),
  ],
};

export default config;
