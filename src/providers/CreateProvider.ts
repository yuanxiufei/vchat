import { BaseProvider } from "./BaseProviders";
import { QianfanProvider } from "./QianfanProvider";
import { OpenAIProvider } from "./OpenAIProvider";
import { DeepSeekProvider } from "./DeepSeekProvider";
import { ClaudeProvider } from "./ClaudeProvider";

/**
 * Provider 工厂：根据名称创建对应的提供器
 * - 仅使用渲染端传入的 `options`（来自应用设置）
 * - 不再回退到环境变量，避免打包后触发 dotenv 依赖
 */
export function CreateProvider(
    providerName: string,
    options?: { apiKey?: string; baseUrl?: string; accessKey?: string; secretKey?: string }
): BaseProvider {
    const baseName = providerName.split('_')[0]
    switch (baseName) {
        case 'qianfan':
            return new QianfanProvider(
                String(options?.accessKey || ''),
                String(options?.secretKey || '')
            )
        case 'dashscope':
            return new OpenAIProvider(
                String(options?.apiKey || ''),
                String(options?.baseUrl || '')
            )
        case 'deepseek':
            return new DeepSeekProvider(
                String(options?.apiKey || ''),
                String(options?.baseUrl || '')
            )
        case 'openai':
            return new OpenAIProvider(
                String(options?.apiKey || ''),
                String(options?.baseUrl || '')
            )
        case 'claude':
            return new ClaudeProvider(
                String(options?.apiKey || ''),
                String(options?.baseUrl || '')
            )
        default:
            throw new Error(`不支持的提供器: ${providerName}`)
    }
}
