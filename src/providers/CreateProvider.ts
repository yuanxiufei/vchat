import { BaseProvider } from "./BaseProviders";
import { QianfanProvider } from "./QianfanProvider";
import { OpenAIProvider } from "./OpenAIProvider";
import { DeepSeekProvider } from "./DeepSeekProvider";
import { ClaudeProvider } from "./ClaudeProvider";

/**
 * Provider 工厂：根据名称创建对应的提供器
 * - 优先使用渲染端传入的 `options`（来自用户配置）
 * - 若未提供，则回退至环境变量（通过 dotenv 加载）
 */
export function CreateProvider(
    providerName: string,
    options?: { apiKey?: string; baseUrl?: string; accessKey?: string; secretKey?: string }
): BaseProvider {
    const baseName = providerName.split('_')[0]
    switch (baseName) {
        case 'qianfan':
            return new QianfanProvider(
                options?.accessKey || process.env.QIANFAN_ACCESS_KEY,
                options?.secretKey || process.env.QIANFAN_SECRET_KEY
            )
        case 'dashscope':
            return new OpenAIProvider(
                options?.apiKey || process.env.ALI_API_KEY,
                options?.baseUrl || process.env.ALI_API_BASE_URL
            )
        case 'deepseek':
            return new DeepSeekProvider(
                options?.apiKey || process.env.DEEPSEEK_API_KEY,
                options?.baseUrl || process.env.DEEPSEEK_API_BASE_URL
            )
        case 'openai':
            return new OpenAIProvider(
                options?.apiKey || process.env.OPENAI_API_KEY,
                options?.baseUrl || process.env.OPENAI_API_BASE_URL
            )
        case 'claude':
            return new ClaudeProvider(
                options?.apiKey || process.env.CLAUDE_API_KEY,
                options?.baseUrl || process.env.CLAUDE_API_BASE_URL
            )
        default:
            throw new Error(`不支持的提供器: ${providerName}`)
    }
}
