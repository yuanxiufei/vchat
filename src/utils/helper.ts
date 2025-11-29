// 消息格式转换工具：将统一的对话消息转换为各 Provider 所需的请求格式
import fs from "fs/promises";
import { lookup } from "mime-types";

function detectImageMime(buf: Buffer, pathHint?: string): string {
  if (buf.length >= 4) {
    // PNG: 89 50 4E 47
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return 'image/png'
    // JPEG: FF D8
    if (buf[0] === 0xFF && buf[1] === 0xD8) return 'image/jpeg'
    // GIF: 47 49 46 38
    if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return 'image/gif'
    // WEBP: 52 49 46 46 .... 57 45 42 50
    if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) return 'image/webp'
    // HEIF/HEIC/AVIF: 'ftyp' at 4-7 then brand at 8-11
    if (buf.length >= 12 && buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) {
      const brand = String.fromCharCode(buf[8], buf[9], buf[10], buf[11]).toLowerCase()
      if (brand.includes('heic') || brand.includes('heif')) return 'image/heic'
      if (brand.includes('avif')) return 'image/avif'
      if (brand.includes('mif1') || brand.includes('msf1')) return 'image/heif'
    }
    // BMP: 42 4D
    if (buf[0] === 0x42 && buf[1] === 0x4D) return 'image/bmp'
    // TIFF: 49 49 2A 00 or 4D 4D 00 2A
    if ((buf[0] === 0x49 && buf[1] === 0x49 && buf[2] === 0x2A && buf[3] === 0x00) ||
        (buf[0] === 0x4D && buf[1] === 0x4D && buf[2] === 0x00 && buf[3] === 0x2A)) return 'image/tiff'
    // ICO/CUR: 00 00 01 00 (ICO) / 00 00 02 00 (CUR)
    if (buf[0] === 0x00 && buf[1] === 0x00 && (buf[2] === 0x01 || buf[2] === 0x02) && buf[3] === 0x00) return 'image/x-icon'
  }
  const mt = pathHint ? lookup(pathHint) : null
  if (typeof mt === 'string' && mt) return mt
  // 回退：根据路径关键词判断 ICO
  if (pathHint && /\.(ico|x-icon)$/i.test(pathHint)) return 'image/x-icon'
  return 'image/png'
}
// OpenAI 兼容（含图文）：文本为字符串，图文为 [{text},{image_url}]
export async function convertMessages(
  messages: { role: string; content: string; imagePath?: string }[]
) {
  const convertedMessage = [];
  for (const message of messages) {
    let convertedContent: string | any[];
    if (message.imagePath) {
      // 读取本地图片，转换为 base64 data URL，并附带 detail: high
      let filePath = message.imagePath
      if (filePath.startsWith('file://')) filePath = filePath.replace(/^file:\/\//, '')
      const imageBuffer = await fs.readFile(filePath)
      const base64Image = imageBuffer.toString("base64")
      const mimeType = detectImageMime(imageBuffer, filePath)
      const textContent = (message.content && message.content.trim()) ? message.content : '[图片]'
      convertedContent = [
        { type: "text", text: textContent },
        {
          type: "image_url",
          image_url: { url: `data:${mimeType};base64,${base64Image}`, detail: "high" },
        },
      ]
    } else {
      // 纯文本消息保留字符串
      convertedContent = message.content;
    }
    // 移除 imagePath 字段，避免发送非协议字段
    const { imagePath, ...messageWithoutImagePath } = message;
    convertedMessage.push({
      ...messageWithoutImagePath,
      content: convertedContent,
    });
  }
  return convertedMessage;
}

// Anthropic Claude：messages 为 [{role, content: parts[]}]
// parts 支持 {type:'text'} 与 {type:'image', source:{type:'base64', media_type, data}}
export async function convertMessagesAnthropic(
  messages: { role: string; content: string; imagePath?: string }[]
) {
  const out: any[] = []
  for (const m of messages) {
    const parts: any[] = []
    if (m.content) parts.push({ type: 'text', text: m.content })
    if (m.imagePath) {
      // 读取图片并转为 base64，按 Anthropic 要求提供 media_type 与 data
      let filePath = m.imagePath
      if (filePath.startsWith('file://')) filePath = filePath.replace(/^file:\/\//, '')
      const buf = await fs.readFile(filePath)
      const b64 = buf.toString('base64')
      const mime = detectImageMime(buf, filePath)
      parts.push({ type: 'image', source: { type: 'base64', media_type: mime, data: b64 } })
    }
    // Claude 角色限制：仅 user/assistant
    out.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: parts })
  }
  return out
}

// 百度千帆：简化为纯文本，若只有图片则填充占位文本
export async function convertMessagesQianfan(
  messages: { role: string; content: string; imagePath?: string }[]
) {
  const out: { role: string; content: string }[] = []
  for (const m of messages) {
    let content = (m.content || '').trim()
    if (!content && m.imagePath) content = '[图片]'
    out.push({ role: m.role, content })
  }
  return out
}
