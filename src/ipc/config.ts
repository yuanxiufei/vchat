import { app } from 'electron'
import path from 'node:path'
import fs from 'fs/promises'

export type ProviderCfg = { apiKey?: string; baseUrl?: string; accessKey?: string; secretKey?: string }
export type AppCfg = { language: string; fontSize: number; providers: { [key: string]: ProviderCfg } }

const appRoot = app.getAppPath()
const cfgSrcPath = path.join(appRoot, 'src', 'utils', 'config.json')
const cfgPath = path.join(app.getPath('userData'), 'config.json')

const defaults: AppCfg = { language: 'zh-CN', fontSize: 14, providers: {} }

export async function readCfg(): Promise<AppCfg> {
  let srcConf: Partial<AppCfg> = {}
  let userConf: Partial<AppCfg> = {}
  try {
    const buf = await fs.readFile(cfgSrcPath)
    const json = JSON.parse(buf.toString())
    srcConf = { language: json.language, fontSize: json.fontSize, providers: { ...(json.providers || {}) } as any }
  } catch {}
  try {
    const buf = await fs.readFile(cfgPath)
    const json = JSON.parse(buf.toString())
    userConf = { language: json.language, fontSize: json.fontSize, providers: { ...(json.providers || {}) } as any }
  } catch {}
  const srcProviders: any = (srcConf as any).providers || {}
  const userProviders: any = (userConf as any).providers || {}
  const mergedProviders: any = {}
  const keys = new Set<string>([...Object.keys(srcProviders), ...Object.keys(userProviders)])
  keys.forEach((k) => {
    const u = userProviders[k]; const s = srcProviders[k]
    if (u && typeof u === 'object' && Object.keys(u).length > 0) mergedProviders[k] = u
    else if (s && typeof s === 'object' && Object.keys(s).length > 0) mergedProviders[k] = s
  })
  const merged: AppCfg = {
    language: (userConf.language ?? srcConf.language ?? defaults.language) as any,
    fontSize: Number(userConf.fontSize ?? srcConf.fontSize ?? defaults.fontSize),
    providers: mergedProviders,
  }
  try {
    const needMigrate = (!userConf.providers || Object.keys(userConf.providers || {}).length === 0) && Object.keys(srcProviders || {}).length > 0
    if (needMigrate) {
      await fs.mkdir(path.dirname(cfgPath), { recursive: true })
      await fs.writeFile(cfgPath, Buffer.from(JSON.stringify(merged)))
    }
  } catch {}
  return merged
}

export async function writeCfg(cfg: AppCfg) {
  await fs.mkdir(path.dirname(cfgPath), { recursive: true })
  await fs.writeFile(cfgPath, Buffer.from(JSON.stringify(cfg)))
  try {
    const safe: any = { ...cfg, providers: { ...(cfg.providers as any) } }
    Object.keys(safe.providers || {}).forEach((k) => {
      const v = safe.providers[k] || {}
      if (v && typeof v === 'object') {
        if ('accessKey' in v) v.accessKey = ''
        if ('secretKey' in v) v.secretKey = ''
        if ('apiKey' in v) v.apiKey = ''
      }
    })
    await fs.mkdir(path.dirname(cfgSrcPath), { recursive: true })
    await fs.writeFile(cfgSrcPath, Buffer.from(JSON.stringify(safe)))
  } catch {}
}
