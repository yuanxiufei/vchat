// 百度千帆 SDK 封装：提供基于 ChatCompletion 的流式对话
import { ChatCompletion } from "@baiducloud/qianfan";
import { BaseProvider } from "./BaseProviders";
import { ChatMessageProps, BaiduChunkProps } from "@/types/appType";
import { convertMessagesQianfan } from "../utils/helper";
/**
 * 千帆提供器
 */
export class QianfanProvider extends BaseProvider {
    
  private client: any; // 千帆客户端
  /**
   * 构造函数
   * @param accessKey 访问密钥
   * @param secretKey 密钥
   */
  // 使用 AK/SK 初始化客户端（启用 OAuth）
  constructor(accessKey: string, secretKey: string) {
    super();
    this.client = new ChatCompletion({
      QIANFAN_ACCESS_KEY: accessKey,
      QIANFAN_SECRET_KEY: secretKey,
      ENABLE_OAUTH: true,
    });
  }
  /**
   * 聊天
   * @param message 消息
   * @param modelName 模型名称
   * @returns 流
   */
  // 调用千帆聊天接口，返回异步可迭代的流式响应
  async chat(message: ChatMessageProps[], modelName: string){
      const convertedMessages = await convertMessagesQianfan(message)
      // 转换消息格式
      const stream = await this.client.chat(
        {
          messages: convertedMessages as any,
          stream: true,
        },
        modelName
      );
       // 绑定this
        const  self = this
        // 异步范围迭代器循环数据,转换响应
        return {
            async *[Symbol.asyncIterator]() {
                for await (const chunk of stream) {
                    yield self.transformResponse(chunk)
                }
            }
        }
  }
     /**
       * 转换响应
       * @param chunk 数据块
       * @returns 通用数据块
       */
      // 统一增量响应结构，便于界面层消费
      protected transformResponse(chunk:any): BaiduChunkProps {
         return {
          is_end: chunk.is_end,
          result: chunk.result || '',
         }
      }
}
