import type { AppCfg } from './config'

export function getModelsForProvider(cfg: AppCfg, providerName: string): string[] {
  const pv: any = (cfg.providers || {})
  const cur: any = pv[providerName] || {}
  return Array.isArray(cur.models) ? cur.models : []
}

export function isModelSupported(cfg: AppCfg, providerName: string, model: string): boolean {
  const models = getModelsForProvider(cfg, providerName)
  return !!model && models.includes(model)
}

export function pickFallbackModel(cfg: AppCfg, providerName: string): string {
  const models = getModelsForProvider(cfg, providerName)
  return models[0] || ''
}

export function hasImage(messages: { imagePath?: string }[]): boolean {
  return messages.some(m => !!m.imagePath)
}

export function supportsImage(providerName: string, model: string): boolean {
  const base = (providerName || '').split('_')[0]
  const m = (model || '').toLowerCase()
  if (!m) return false
  if (base === 'dashscope') {
    return m.includes('qwen-vl') || m.includes('vl') || m.includes('vision')
  }
  if (base === 'openai') {
    return m.includes('gpt-4o') || m.includes('gpt-4.1') || m.includes('vision')
  }
  if (base === 'claude') {
    return m.includes('claude-3') || m.includes('opus') || m.includes('sonnet')
  }
  // deepseek / qianfan 默认视为不支持图像（除非模型名含明显标识）
  if (base === 'deepseek' || base === 'qianfan') {
    return m.includes('vl') || m.includes('vision')
  }
  return false
}
