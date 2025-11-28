// 消息格式转换工具：将统一的对话消息转换为各 Provider 所需的请求格式
import fs from "fs/promises";
import { lookup } from "mime-types";
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
      const mt = lookup(filePath)
      const mimeType = (typeof mt === 'string' && mt) ? mt : 'image/png'
      convertedContent = [
        { type: "text", text: message.content },
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
      const mt = lookup(filePath)
      const mime = typeof mt === 'string' && mt ? mt : 'image/png'
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
