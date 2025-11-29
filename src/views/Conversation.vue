<!-- 会话页：展示当前会话标题与消息列表，支持图片复制、流式生成与自动滚动到底部 -->
<template>
  <div class="w-full h-full flex flex-col overflow-hidden">
    <div v-if="conversation" class="glass rounded-xl px-4 py-4  flex items-center justify-between">
      <h3 class="font-semibold text-gray-900">{{ conversation?.title }}</h3>
      <div class="flex items-center gap-3">
        <template v-if="availableProviders.length">
          <select v-model="currentProviderName" @change="switchProvider" class="h-8 w-40 bg-white border border-gray-200 rounded-md px-2 text-sm">
            <option v-for="p in availableProviders" :key="p.name" :value="p.name">{{ p.title || p.name }}</option>
          </select>
        </template>
        <span class="text-xs text-gray-500">{{ dayjs(conversation?.createdAt).format("YYYY-MM-DD HH:mm") }}</span>
      </div>
    </div>
    <div class="flex-1 min-h-0 p-4 overflow-y-auto content-scroll pr-2">
      <MessageList :messages="filterMessages" ref="messageListRef" />
    </div>
    <div v-if="!canSend" class="mb-2 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl px-3 py-2 flex items-center justify-between">
      <div class="text-xs">{{ t('no_models_tip') }}</div>
      <button class="px-2 py-1 text-xs bg-white border border-yellow-300 rounded-md hover:bg-yellow-100" @click="goSettings">{{ t('settings') }}</button>
    </div>
    <div class="mt-3">
      <MessageInput
        @send="sendNewMEssage"
        v-model="inputValue"
        :disabled="messageStore.isMessageLoading || !canSend"
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
import { t } from '@/locales'
import { useRouter } from 'vue-router'
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
const router = useRouter();
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
// 可选的可用 Provider 列表（读取配置校验必填字段）
const availableProviders = ref<{name:string; title?:string; models:string[] }[]>([])
const currentProviderName = ref('')
async function buildAvailableProviders(){
  const cfg:any = await (window as any).electronAPI.getConfig()
  const pv:any = cfg?.providers || {}
  const out:any[] = []
  for(const name of Object.keys(pv)){
    const v:any = pv[name] || {}
    const base = name.split('_')[0]
    const hasM = Array.isArray(v.models) && v.models.length>0
    let ok = hasM
    if(base==='qianfan'){ ok = ok && !!v.accessKey && !!v.secretKey }
    if(base==='dashscope' || base==='openai' || base==='deepseek' || base==='claude'){ ok = ok && !!v.apiKey && !!v.baseUrl }
    if(ok) out.push({ name, title: v.title, models: v.models })
  }
  availableProviders.value = out
  currentProviderName.value = (conversation.value ? (await db.providers.where({ id: conversation.value.providerId }).first())?.name : '') || (out[0]?.name || '')
}
// 可发送判定（根据 Provider 配置是否完整）
const canSend = ref(false)
const effectiveProviderName = ref<string>('')
async function refreshCanSend(){
  const conv = conversation.value
  if(!conv){ canSend.value = false; effectiveProviderName.value=''; return }
  const provider = await db.providers.where({ id: conv.providerId }).first()
  if(!provider){ canSend.value = false; effectiveProviderName.value=''; return }
  const name = provider.name || ''
  const cfg:any = await (window as any).electronAPI.getConfig()
  const all:any = (cfg?.providers || {})
  const cur:any = all[name] || {}
  const base = name.split('_')[0]
  const hasModels = Array.isArray(cur.models) ? cur.models.length>0 : (Array.isArray(provider.models) && provider.models.length>0)
  const isQianfan = name.startsWith('qianfan')
  const isDashscope = name.startsWith('dashscope')
  const isOpenai = name.startsWith('openai')
  const isDeepseek = name.startsWith('deepseek')
  const isClaude = name.startsWith('claude')
  let ok = hasModels
  if(isQianfan){ ok = ok && !!cur.accessKey && !!cur.secretKey }
  if(isDashscope || isOpenai || isDeepseek || isClaude){ ok = ok && !!cur.apiKey && !!cur.baseUrl }
  let eff = ''
  if(ok){ eff = name }
  if(!ok){
    for(const k of Object.keys(all)){
      if(k===name) continue
      if(k.startsWith(base + '_')){
        const v:any = all[k] || {}
        const mOk = Array.isArray(v.models) && v.models.length>0
        let c = mOk
        if(base==='qianfan'){ c = c && !!v.accessKey && !!v.secretKey }
        if(base==='dashscope' || base==='openai' || base==='deepseek' || base==='claude'){ c = c && !!v.apiKey && !!v.baseUrl }
        if(c){ eff = k; break }
      }
    }
  }
  effectiveProviderName.value = eff
  canSend.value = !!eff
  // 若当前选中模型不属于有效提供器，自动切换为其第一个模型
  if(eff){
    const ev:any = all[eff] || {}
    const evModels:string[] = Array.isArray(ev.models) ? ev.models : []
    if(evModels.length){
      const curSel = conversation.value?.selectedModel || ''
      if(!evModels.includes(curSel)){
        const first = evModels[0]
        await db.conversations.update(conversationId.value, { selectedModel: first, updatedAt: new Date().toISOString() })
        const it = conversationStore.items.find(i=>i.id===conversationId.value)
        if(it){ it.selectedModel = first }
      }
    }
  }
}
async function switchProvider(){
  const name = currentProviderName.value
  const p = await db.providers.where({ name }).first()
  if(!p) return
  const cfg:any = await (window as any).electronAPI.getConfig()
  const v:any = (cfg?.providers || {})[name] || {}
  const firstModel = Array.isArray(v.models) && v.models.length ? v.models[0] : (Array.isArray(p.models) && p.models.length? p.models[0]: conversation.value?.selectedModel)
  await db.conversations.update(conversationId.value, { providerId: p.id, selectedModel: firstModel, updatedAt: new Date().toISOString() })
  const it = conversationStore.items.find(i=>i.id===conversationId.value)
  if(it){ it.providerId = p.id; it.selectedModel = firstModel }
  await refreshCanSend()
}
const goSettings = ()=> router.push('/settings')
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
        providerName: effectiveProviderName.value || provider.name,
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
  await buildAvailableProviders()
  await refreshCanSend()
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
  // 配置更新时重新判定发送能力
  ;(window as any).electronAPI.onConfigUpdated(async()=>{ await buildAvailableProviders(); await refreshCanSend() })
});
</script>
