import OpenAI from 'openai'
import path from 'node:path'
import { app } from 'electron'
import fs from 'fs/promises'
import fs1 from 'fs'
import { ChatCompletion } from '@baiducloud/qianfan'

/**
 * PDF 总结示例：读取项目内 PDF，调用通义兼容 OpenAI 接口提取与总结
 * 前置：设置 `ALI_API_KEY`，并确保 `src/data/1.pdf` 存在
 * 输出：写入 `src/data/output.txt`
 */
export const runDemo = async () => {
  let client: OpenAI | null = null
  if (process.env.ALI_API_KEY && process.env.ALI_API_KEY.trim().length > 0) {
    client = new OpenAI({
      apiKey: process.env.ALI_API_KEY,
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
    })
  } else {
    console.warn('ALI_API_KEY 未设置，跳过 OpenAI 客户端初始化')
    return
  }

  try {
    const pdfPath = path.resolve(app.getAppPath(), 'src/data/1.pdf')
    const fileObj = await client.files.create({ file: fs1.createReadStream(pdfPath), purpose: 'file-extract' as any })
    console.log('fileObj', fileObj)
    const resp = await client.chat.completions.create({
      model: 'qwen-long',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'system', content: `fileid://${fileObj.id}` },
        { role: 'user', content: '请帮忙概括文件讲述了什么' }
      ]
    })
    console.log('resp', resp.choices[0].message)
    const outputDir = path.join(__dirname, '../data')
    if (!fs1.existsSync(outputDir)) fs1.mkdirSync(outputDir, { recursive: true })
    const outputPath = path.join(outputDir, 'output.txt')
    console.log('写入绝对路径:', outputPath)
    try {
      fs1.writeFileSync(outputPath, resp.choices[0].message.content, { encoding: 'utf8' })
      console.log('写入成功')
    } catch (e) {
      console.error('写入文件异常:', e)
    }
  } catch (err) {
    console.error('OpenAI 请求失败:', err)
  }
}

/**
 * 千帆流式示例（ERNIE-Speed-128K）：控制台打印每个分片
 * 前置：`QIANFAN_ACCESS_KEY` 与 `QIANFAN_SECRET_KEY`
 */
export const runQianfanDemo = async () => {
  const client = new ChatCompletion({
    QIANFAN_ACCESS_KEY: process.env.QIANFAN_ACCESS_KEY,
    QIANFAN_SECRET_KEY: process.env.QIANFAN_SECRET_KEY,
    ENABLE_OAUTH: true
  })
  try {
    const stream = await client.chat({
      messages: [{ role: 'user', content: '光合作用有什么作用？' }],
      stream: true
    }, 'ERNIE-Speed-128K')
    for await (const chunk of stream as any) {
      console.log('chunk', chunk)
    }
  } catch (error) {
    console.error('API 调用失败:', error)
  }
}

/**
 * 文本流式示例（qwen-turbo）：打印增量片段
 * 前置：`ALI_API_KEY`
 */
export const runChatStreamDemo = async () => {
  if (!process.env.ALI_API_KEY || process.env.ALI_API_KEY.trim().length === 0) return
  const client = new OpenAI({
    apiKey: process.env.ALI_API_KEY,
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  })
  const stream = await client.chat.completions.create({
    model: 'qwen-turbo',
    messages: [{ role: 'system', content: '你好,你是一个六岁的男孩哦' }],
    stream: true
  })
  for await (const chunk of stream as any) {
    console.log('chunk', chunk.choices?.[0]?.delta)
  }
}

/**
 * 文本非流式示例（qwen-turbo）：输出至文件
 * 前置：`ALI_API_KEY`
 */
export const runTextDemo = async () => {
  if (!process.env.ALI_API_KEY || process.env.ALI_API_KEY.trim().length === 0) return
  const client = new OpenAI({
    apiKey: process.env.ALI_API_KEY,
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  })
  const resp = await client.chat.completions.create({
    model: 'qwen-turbo',
    messages: [{ role: 'system', content: '你好,你是一个六岁的男孩哦' }]
  })
  const outputDir = path.join(__dirname, '../data')
  if (!fs1.existsSync(outputDir)) fs1.mkdirSync(outputDir, { recursive: true })
  const outputPath = path.join(outputDir, 'output.txt')
  fs1.writeFileSync(outputPath, resp.choices[0].message.content, { encoding: 'utf8' })
}

/**
 * 图文识别示例（qwen-vl-plus）：读取本地图片进行识别
 * 前置：`ALI_API_KEY` 与 `src/data/dog.jpg`
 * 输出：写入 `src/data/output.txt`
 */
export const runImageDemo = async () => {
  if (!process.env.ALI_API_KEY || process.env.ALI_API_KEY.trim().length === 0) return
  const client = new OpenAI({
    apiKey: process.env.ALI_API_KEY,
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  })
  const imagePath = path.resolve(app.getAppPath(), 'src/data/dog.jpg')
  const imageBuffer = await fs.readFile(imagePath)
  const base64Image = imageBuffer.toString('base64')
  const resp = await client.chat.completions.create({
    model: 'qwen-vl-plus',
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: '图中是什么动物' },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}`, detail: 'high' } }
      ]
    }]
  })
  const outputDir = path.join(__dirname, '../data')
  if (!fs1.existsSync(outputDir)) fs1.mkdirSync(outputDir, { recursive: true })
  const outputPath = path.join(outputDir, 'output.txt')
  fs1.writeFileSync(outputPath, (resp as any).choices?.[0]?.message?.content ?? '', { encoding: 'utf8' })
}
