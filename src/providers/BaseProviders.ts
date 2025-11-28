// Provider 抽象基类：统一对话入口与增量响应转换
import { ChatMessageProps, UniversalChunkProps } from "@/types/appType";

export abstract class BaseProvider {
    // 发起对话，返回异步可迭代的通用数据块流
    abstract chat(message: ChatMessageProps[], modelName: string): Promise<AsyncIterable<UniversalChunkProps>>;
    // 各 Provider 将自身响应转换为 UniversalChunkProps
    protected abstract transformResponse(chunk:any): UniversalChunkProps;
}
