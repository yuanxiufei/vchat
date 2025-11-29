// 对话：一次与模型的会话元信息（标题、选中模型、时间与关联 Provider）
export interface ConversationProps {
  id: number;
  title: string;
  selectedModel: string;
  createdAt: string;
  updatedAt: string;
  providerId: number;
  pinned?: boolean;
}
// 提供器：模型提供方或别名配置项（含标题描述头像与模型列表）
export interface ProviderProps {
  id: number;
  name: string;
  title?: string;
  desc?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  models: string[];
}

// 消息状态：pending(待发送)/loading(创建占位)/streaming(流式生成)/finished(完成)
export type MessageStatus = "pending" | "streaming" | "loading" | "finished";
// 消息：问题或答案；答案可携带状态与图片路径
export interface MessageProps {
  id: number;
  content: string;
  type: "question" | "answer";
  conversationId: number;
  status?: MessageStatus;
  createdAt: string;
  updatedAt: string;
  imagePath?: string;
}


// 对话消息参数：发送至主进程/Provider 的统一消息结构
export interface ChatMessageProps {
  role: string;
  content: string;
  imagePath?: string;
}

// 开始对话参数：包含选择的 Provider/模型与用于更新的 messageId
export interface CreateChatProps {
  messages: ChatMessageProps[];
  providerName: string;
  selectedModel: string;
  messageId: number;
}

// 流式消息更新：主进程向渲染端推送的增量数据结构
export interface updatedStreamData {
  messageId: number;
  data: {
    is_end: boolean;
    result: string;
  };
}

// 更新流数据回调类型：供预加载向渲染端传递的监听签名
export type onUpdateCallback = (data: updatedStreamData) => void;

// 消息列表实例：用于暴露滚动方法给父组件
export interface MessageListInstance {
  ref: HTMLDivElement | null;
  scrollToBottom?: () => void;
}

// 通用数据块：Provider 转换后的统一流式增量结构
export interface UniversalChunkProps {
  is_end: boolean;
  result: string;
}

// 百度数据块：千帆增量结构（与通用结构一致，仅区分来源）
export interface BaiduChunkProps {
  is_end: boolean;
  result: string;
}
