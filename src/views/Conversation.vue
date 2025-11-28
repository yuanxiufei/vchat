<!-- 会话页：展示当前会话标题与消息列表，支持图片复制、流式生成与自动滚动到底部 -->
<template>
  <div class="w-full h-full flex flex-col overflow-hidden">
    <div v-if="conversation" class="glass rounded-xl px-4 py-4  flex items-center justify-between">
      <h3 class="font-semibold text-gray-900">{{ conversation?.title }}</h3>
      <span class="text-xs text-gray-500">{{ dayjs(conversation?.createdAt).format("YYYY-MM-DD HH:mm") }}</span>
    </div>
    <div class="flex-1 min-h-0 p-4 overflow-y-auto content-scroll pr-2">
      <MessageList :messages="filterMessages" ref="messageListRef" />
    </div>
    <div class="mt-3">
      <MessageInput
        @send="sendNewMEssage"
        v-model="inputValue"
        :disabled="messageStore.isMessageLoading"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
// 说明：
// - 通过消息与会话 Store 管理数据；
// - 发送问题后会创建一个占位“答案”消息，并启动主进程生成；
// - 监听主进程增量更新，逐步填充答案并滚动到底部。
import { ref, computed, watch, onMounted, nextTick } from "vue";
import MessageInput from "@/components/MessageInput.vue";
import MessageList from "../components/MessageList.vue";
import { MessageProps, MessageListInstance,MessageStatus } from "@/types/appType";
import { useConversationStore } from "@/stores/conversation";
import { useMessageStore } from "@/stores/message";
import { useRoute } from "vue-router";
import dayjs from "dayjs";
import { db } from "@/data/db";
import Stream from "node:stream";
const route = useRoute();
// 输入框内容
const inputValue = ref("");
// 消息列表实例引用对象节点
const messageListRef = ref<MessageListInstance>(null);
// 初始化对话列表方法对象
const conversationStore = useConversationStore();
// 初始化消息列表
const messageStore = useMessageStore();
// 过滤出当前对话的消息
const filterMessages = computed(() => messageStore.items);
// 可发送的消息
const sendMessage = computed(() =>
  filterMessages.value
    .filter((message) => message.status !== "loading")
    .map((message) => {
      return {
        role: message.type === "question" ? "user" : "assistant",
        content: message.content,
        ...(message.imagePath && { imagePath: message.imagePath }), // 如果有图片路径，添加图片路径字段
      };
    })
);

// 对话id
const conversationId = ref(parseInt(route.query.id as string));
// 初始化消息id
const initMessageId = ref(parseInt(route.query.init as string));
// 对话详情
const conversation = computed(() =>
  conversationStore.getConversationById(conversationId.value)
);
// 最后一条问题消息
const lastQuestion = computed(() =>
  messageStore.getLastQuestion(conversationId.value)
);
// 发送新消息
// 发送新消息：可附带图片，先写入问题消息，再创建答案占位并发起生成
const sendNewMEssage = async (question: string, imagePath?: string) => {
  if (question) {
    let currentIamgePath: string | null = null;
    if (imagePath) {
      try {
        currentIamgePath = await window.electronAPI.copyImageToUserDir(
          imagePath
        );
        console.log("复制图片到用户目录成功", currentIamgePath);
      } catch (error) {
        console.error("复制图片到用户目录失败", error);
      }
    }
    const date = new Date().toISOString();
    // 新增提问消息
    await messageStore.createMessage({
      content: question,
      conversationId: conversationId.value,
      type: "question",
      createdAt: date,
      updatedAt: date,
      ...(currentIamgePath && { imagePath: currentIamgePath }), // 如果有图片路径，添加图片路径字段
    });
    // 清空输入框内容
    inputValue.value = "";
    // 创建初始消息
    await creatingInitialMessage();
  }
};

// 滚动到消息列表底部
// 将消息列表滚动到底部（避免新内容不可见）
const messageScrollToBottom = async () => {
  await nextTick();
  if (messageListRef.value) {
    messageListRef.value.scrollToBottom();
  }
};

// 监听消息列表高度变化, 当高度变化时, 滚动到消息列表底部
// 监测高度增长并自动滚动至底部
const checkAndScrollToBottom = async () => {
  // 监听消息列表高度变化, 当高度变化时, 滚动到消息列表底部
  let currentMessageListHeight = 0;
  if (messageListRef.value) {
    const newHeight = messageListRef.value.ref?.clientHeight || 0;
    if (newHeight > currentMessageListHeight) {
      currentMessageListHeight = newHeight;
      await messageScrollToBottom();
    }
  }
};

// 创建初始消息
// 创建答案占位消息并触发主进程开始生成
const creatingInitialMessage = async () => {
  const createdData: Omit<MessageProps, "id"> = {
    content: "",
    conversationId: conversationId.value,
    type: "answer",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "loading",
  };
  // 新增消息
  const newMessageId = await messageStore.createMessage(createdData);
  // 滚动到消息列表底部
  await messageScrollToBottom();
  if (conversation.value) {
    const provider = await db.providers
      .where({ id: conversation.value.providerId })
      .first();
    if (provider) {
      window.electronAPI.startChat({
        messageId: newMessageId,
        providerName: provider.name,
        selectedModel: conversation.value.selectedModel,
        messages: sendMessage.value,
      });
    }
  }
};

// 监听路由参数变化, 当对话id变化时, 重新获取对话详情和消息
watch(
  () => route.query.id,
  async (newId: string) => {
    conversationId.value = parseInt(newId);
    //  初始化消息列表
    await messageStore.fetchMessagesByConversationId(conversationId.value);
    // 滚动到消息列表底部
    await messageScrollToBottom();
  }
);

//初始化对话详情和消息
// 初始化：加载消息、滚动、处理可能的初始生成与订阅流式更新
onMounted(async () => {
  // 初始化消息列表
  await messageStore.fetchMessagesByConversationId(conversationId.value);
  // 滚动到消息列表底部
  await messageScrollToBottom();
  // 如果有初始化消息id，创建初始消息
  if (initMessageId.value) {
    // 初始化消息id 为问题消息时, 创建初始消息
    await creatingInitialMessage();
  }
  let streamContent = "";
  window.electronAPI.onUpdateMessage(async (steamData) => {
    console.log("更新消息", steamData);
    const { messageId, data } = steamData;
    streamContent += data.result;
    const updatedData = {
      content: streamContent,
      status: data.is_end ? "finished" : ("streaming" as MessageStatus),
      updatedAt: new Date().toISOString(),
    };
    // 更新消息
    await messageStore.updateMessage(messageId, updatedData);
    await nextTick();
    // 滚动到消息列表底部
    await checkAndScrollToBottom();
    if (data.is_end) {
      streamContent = "";
    }
  });
});
</script>
