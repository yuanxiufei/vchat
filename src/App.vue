<!-- 根组件：左侧对话列表 + 顶部创建/设置入口，右侧路由视图展示首页/设置/会话 -->
<template>
  <div class="flex items-start justify-between h-screen p-4">
    <div class="w-[300px] h-full glass rounded-xl shadow-sm border overflow-hidden">
      <div class="h-[90%] overflow-y-auto p-2 sidebar-scroll">
        <ConversationList :items="items" />
        <div class="text-center text-gray-500 mt-3 text-sm">
          共 {{ conversationStore.totalNumber }} 条对话
        </div>
      </div>
      <div class="h-[10%] grid grid-cols-2 gap-2 p-3">
        <RouterLink to="/">
          <Button icon-name="radix-icons:chat-bubble" class="w-full surface">
            {{ t('new_conversation') }}
          </Button>
        </RouterLink>
        <RouterLink to="/settings">
          <Button icon-name="radix-icons:gear" plain class="w-full surface">
            {{ t('settings') }}
          </Button>
        </RouterLink>
      </div>
    </div>
    <div class="h-full flex-1 ml-4 overflow-y-auto content-scroll p-4">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
// 说明：
// - 挂载时初始化 providers 表与对话列表；
// - 拉取配置并应用字体与语言；
// - 监听全屏与配置更新，保持 UI 一致。
import ConversationList from '@/components/ConversationList.vue'
import { onMounted, onUnmounted, computed, ref } from 'vue'
import Button from './components/Button.vue'
import { initProviders } from '@/data/db'
import { useConversationStore } from '@/stores/conversation'
import { t, setLang } from '@/locales'

// 初始化对话列表方法对象
const conversationStore = useConversationStore()
// 动态获取对话列表
const items = computed(() => conversationStore.items)
onMounted(async () => {
  // 初始化providers表
  await initProviders()
  // 查询所有对话并更新到对话列表方法对象中
  await conversationStore.fetchConversations()
  // 加载应用配置并应用字体大小
  try {
    const cfg = await (window as any).electronAPI.getConfig()
    document.documentElement.style.fontSize = `${Number(cfg.fontSize) || 14}px`
    setLang(cfg.language)
  } catch {}
})

const isFullScreen = ref(false)
function onKey(e: KeyboardEvent){ if(e.key === 'Escape' && isFullScreen.value) (window as any).electronAPI.setFullScreen(false) }
onMounted(()=>{
  (window as any).electronAPI.onWindowFullScreen((state:boolean)=>{ isFullScreen.value = state })
  document.addEventListener('keydown', onKey)
  ;(window as any).electronAPI.onConfigUpdated((cfg:{ fontSize:number })=>{
    document.documentElement.style.fontSize = `${Number(cfg.fontSize) || 14}px`
  })
  ;(window as any).electronAPI.onConfigUpdated((cfg:{ language:string })=>{ setLang(cfg.language) })
})
onUnmounted(()=>{ document.removeEventListener('keydown', onKey) })
console.log('🐝 This message is being logged by "App.vue", included via Vite');
</script>

<style scoped></style>
