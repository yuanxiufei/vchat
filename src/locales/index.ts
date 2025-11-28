import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN.json'

const loaded: Record<string, boolean> = { 'zh-CN': true, zh: true }

export const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: { 'zh-CN': zhCN, zh: zhCN }
})

async function loadMessages(locale: string) {
  if (loaded[locale]) return
  let msgs: any = {}
  if (locale === 'en-US' || locale === 'en') msgs = (await import('./en-US.json')).default
  ;(i18n.global as any).setLocaleMessage(locale, msgs)
  // 同步别名
  if (locale === 'en-US') (i18n.global as any).setLocaleMessage('en', msgs)
  loaded[locale] = true
}

function normalizeLocale(l: string) {
  if (l === 'zh' || l === 'zh-CN') return 'zh-CN'
  if (l === 'en' || l === 'en-US') return 'en-US'
  return 'zh-CN'
}

export async function setLang(l: string) {
  const target = normalizeLocale(l)
  await loadMessages(target)
  ;(i18n.global as any).locale.value = target
}

export function t(key: string) {
  return (i18n.global as any).t(key)
}
