<!-- 首页：选择模型并输入问题，创建新对话后跳转到会话页 -->
<template>
  <div class="max-w-[860px] w-[85%] mx-auto h-full flex flex-col px-4">
    <div class="w-full flex-1 flex items-center">
      <ProviderSelect
        v-model="currentProvider"
        :items="providers"
        size="md"
        variant="pill"
        fluid
      />
    </div>
    <div class="w-full mt-auto pb-6">
      <div
        v-if="noModels"
        class="mb-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl px-3 py-2 flex items-center justify-between"
      >
        <div class="text-xs">
          {{ t('no_models_tip') }}
        </div>
        <button
          class="px-2 py-1 text-xs bg-white border border-yellow-300 rounded-md hover:bg-yellow-100"
          @click="goSettings"
        >
          {{ t('settings') }}
        </button>
      </div>
      <MessageInput
        v-model="inputText"
        :disabled="currentProvider === ''"
        @send="handleSend"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
// 说明：
// - 从配置构建 Provider 列表（含别名）写入本地数据库，供选择器展示；
// - 发送后创建对话与首条问题消息，并跳转到会话页进行流式生成。
import { onMounted, ref, computed } from 'vue';
import ProviderSelect from '@/components/ProviderSelect.vue'
import MessageInput from '@/components/MessageInput.vue'
import { ProviderProps } from '@/types/appType'
import { t } from '@/locales'
import { db, initProviders } from '@/data/db'
import { useRouter } from 'vue-router';
import { useConversationStore } from '@/stores/conversation'
const router = useRouter()
const providers = ref<ProviderProps[]>([])
// 初始化对话列表方法对象
const conversationStore = useConversationStore()
//  获取当前选中的模型
const currentProvider = ref('')
//  输入框内容
const inputText = ref('')
const noModels = computed(()=> providers.value.every(p=>!Array.isArray(p.models) || p.models.length===0))
const goSettings = ()=> router.push('/settings')

// 根据配置构建/更新 Provider 列表到本地数据库
async function buildProviders(){
  await initProviders()
  const existed = await db.providers.toArray()
  const existedMap = new Map(existed.map(p=>[p.name,p]))
  function sid(name:string){
    if(name==='qianfan') return 1
    if(name==='dashscope') return 2
    if(name==='deepseek') return 3
    if(name==='openai') return 4
    if(name==='claude') return 5
    let h = 0
    for(let i=0;i<name.length;i++){ h = (h*31 + name.charCodeAt(i)) >>> 0 }
    return 100000 + (h % 900000000)
  }
  try{
    const cfg:any = await (window as any).electronAPI.getConfig()
    const pv = cfg?.providers || {}
    const list:ProviderProps[] = []
    function pickBase(name:string){
      const cur = existedMap.get(name)
      if(cur) return { ...cur }
      const now = new Date().toISOString()
      if(name==='qianfan') return { id: sid(name), name, title: '百度千帆', desc: '文心一言', models: [], avatar: 'https://aip-static.cdn.bcebos.com/landing/product/ernie-bote321e5.png', createdAt: now, updatedAt: now }
      if(name==='dashscope') return { id: sid(name), name, title: '阿里灵积', desc: '通义千问', models: [], avatar: 'https://qph.cf2.poecdn.net/main-thumb-pb-4160791-200-qlqunomdvkyitpedtghnhsgjlutapgfl.jpeg', createdAt: now, updatedAt: now }
      if(name==='deepseek') return { id: sid(name), name, title: 'DeepSeek', desc: 'DeepSeek', models: [], avatar: 'https://qph.cf2.poecdn.net/main-thumb-pb-4981273-200-phhqenmywlkiybehuaqvsxpfekviajex.jpeg', createdAt: now, updatedAt: now }
      if(name==='openai') return { id: sid(name), name, title: 'OpenAI', desc: 'OpenAI', models: [], avatar: 'https://seeklogo.com/images/O/openai-logo-8B9BFEDC88-seeklogo.com.png', createdAt: now, updatedAt: now }
      if(name==='claude') return { id: sid(name), name, title: 'Claude', desc: 'Anthropic', models: [], avatar: 'https://logos-download.com/wp-content/uploads/2023/10/Anthropic_AI_Logo.png', createdAt: now, updatedAt: now }
      return { id: sid(name), name, title: name, desc: name, models: [], avatar: '', createdAt: now, updatedAt: now }
    }
    ;['qianfan','dashscope','deepseek','openai','claude'].forEach((name)=>{
      const base = pickBase(name)
      const cur:any = (pv as any)[name] || {}
      const models = Array.isArray(cur.models) ? cur.models : []
      list.push({ ...base, title: cur.title || base.title, desc: cur.desc || base.desc, avatar: cur.avatar || base.avatar, models })
    })
    Object.keys(pv).forEach((key)=>{
      if(/^openai_|^dashscope_|^deepseek_|^qianfan_|^claude_/.test(key)){
        const v:any = (pv as any)[key] || {}
        const now = new Date().toISOString()
        list.push({ id: sid(key), name: key, title: v.title || key, desc: v.desc || key, models: Array.isArray(v.models)? v.models: [], avatar: v.avatar || '', createdAt: now, updatedAt: now })
      }
    })
    for(const p of list){
      const found = await db.providers.where({ name: p.name }).first()
      if(found){
        await db.providers.put({ ...found, title: p.title, desc: p.desc, avatar: p.avatar, models: p.models, updatedAt: new Date().toISOString() })
        p.id = found.id
      } else {
        await db.providers.add(p)
      }
    }
    const nameSet = new Set(list.map(p=>p.name))
    const all = await db.providers.toArray()
    for(const old of all){
      if(!nameSet.has(old.name)){
        await db.providers.put({ ...old, models: [], updatedAt: new Date().toISOString() })
      }
    }
    providers.value = await db.providers.toArray()
  }catch{
    providers.value = existed
  }
}

// 初始化 Provider 列表，并订阅配置更新
onMounted(async()=>{
  await buildProviders()
  if(noModels.value) currentProvider.value = ''
  ;(window as any).electronAPI.onConfigUpdated(async()=>{ await buildProviders() })
})
//模型信息动态获取
// 解析选择器输出为 providerId + selectedModel
const modelInfo = computed(() => {
  // 获取当前选中的模型
  const  [providerId, selectedModel] = currentProvider.value.split('/')
  return {
    providerId: parseInt(providerId),
    selectedModel
  }
})
// 发送问题：创建对话与问题消息，携带可选图片，再跳转到会话页
const handleSend = async (question: string, imagePath?:string) => {
  // 结构模型信息
  const {providerId, selectedModel } = modelInfo.value
  //  新增对话日期
  const currentDate = new Date().toISOString()

  let currentIamgePath :string | null = null
  if (imagePath) {
    try {
      currentIamgePath = await window.electronAPI.copyImageToUserDir(imagePath)
      console.log('复制图片到用户目录成功', currentIamgePath)
    } catch (error) {
      console.error('复制图片到用户目录失败', error)
    }
  }
  //  新增对话
  const conversationId = await conversationStore.createConversation({
    title:question,
    selectedModel,
    providerId,
    createdAt: currentDate,
    updatedAt: currentDate,
  })

  // 新增消息
  const newMessageId = await db.messages.add({
    content: question,
    conversationId, // 对话id
    createdAt: currentDate,
    updatedAt: currentDate,
    type: 'question',
    ...(currentIamgePath && { imagePath: currentIamgePath })  // 如果有图片路径，添加图片路径字段
  })

  // 跳转到对话详情页
  router.push({ path: '/conversation', query: { id: String(conversationId), init: String(newMessageId) } })

  console.log('providerId', providerId, 'selectedModel', selectedModel)
}
</script>
