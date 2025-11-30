<!-- 对话列表组件：展示最近对话，点击进入对应会话并高亮选中项 -->
<template>
  <div class="Conversation-list space-y-2">
    <div
      v-for="item in items"
      :key="item.id"
      class="item surface cursor-pointer p-3 transition-colors group relative"
      :class="{
        'row row-hover': item.id !== conversationStore.selectedId,
        'bg-gray-50 ring-1 ring-[#34C759]/20': item.id === conversationStore.selectedId
      }"
    >
      <div @click.prevent="goToConversation(item.id)">
        <div class="flex justify-between items-center text-xs leading-5 text-gray-500">
          <div>{{ item.selectedModel }}</div>
          <div>{{ dayjs(item.updatedAt).format('YYYY-MM-DD') }}</div>
        </div>
        <div
          class="absolute right-2 flex items-center gap-1"
          style="top:60%; transform: translateY(-50%);"
        >
          <button
            class="more-btn w-8 h-8 flex items-center justify-center text-gray-600 hover:text-black transition cursor-pointer text-lg"
            title="more"
            aria-label="more"
            @click.stop="toggleMenu(item.id)"
          >
            …
          </button>
        </div>
        <div
          v-if="openMenuId===item.id"
          class="more-menu absolute right-2 bg-white border border-gray-200 rounded-lg shadow-lg text-xs w-44 z-20"
          style="top:60%; transform: translateY(-50%);"
          @mouseleave="openMenuId=null"
        >
          <button
            class="block w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer"
            @click.stop="onTogglePin(item.id)"
          >
            {{ item.pinned ? t('unpin') : t('pin') }}
          </button>
          <button
            class="block w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer"
            @click.stop="startRename(item.id, item.title)"
          >
            {{ t('rename') }}
          </button>
          <button
            class="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 cursor-pointer"
            @click.stop="startDelete(item.id)"
          >
            {{ t('delete') }}
          </button>
          <div
            v-if="renameId===item.id"
            class="px-3 py-2 border-t border-gray-100"
          >
            <input
              v-model="renameTitle"
              class="w-full h-8 bg-white border border-gray-200 rounded-md px-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-200"
            >
            <div class="flex gap-2 justify-end mt-2">
              <button
                class="px-2 py-1 text-xs bg-white border border-gray-200 rounded-md hover:bg-gray-50"
                @click.stop="cancelRename()"
              >
                {{ t('cancel') }}
              </button>
              <button
                class="px-2 py-1 text-xs btn-primary"
                @click.stop="confirmRename(item.id)"
              >
                {{ t('save') }}
              </button>
            </div>
          </div>
        </div>
        <h2 class="font-medium mt-1 text-gray-900 truncate flex items-center gap-2">
          <span
            v-if="item.pinned"
            class="px-1 text-[10px] rounded bg-yellow-100 text-yellow-700"
          >{{ t('pinned') }}</span>
          <span class="truncate">{{ item.title }}</span>
        </h2>
      </div>
    </div>
  </div>
  <!-- 独立删除确认弹窗 -->
  <div
    v-if="deleteConfirmId!==null"
    class="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
    @click.self="cancelDelete()"
  >
    <div class="bg-white rounded-2xl shadow-lg p-5 w-96">
      <div class="text-sm text-gray-700 mb-3">
        {{ t('confirm_delete') }}
      </div>
      <div class="flex gap-3 justify-end">
        <button
          class="px-3 py-1 text-xs bg-white border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
          @click="cancelDelete()"
        >
          {{ t('cancel') }}
        </button>
        <button
          class="px-3 py-1 text-xs btn-primary cursor-pointer"
          @click="confirmDelete(deleteConfirmId!)"
        >
          {{ t('delete') }}
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
// 说明：点击即路由跳转，并更新选中对话 ID 用于高亮
import { ConversationProps } from '@/types/appType'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { useConversationStore } from '@/stores/conversation'
import { t } from '@/locales'
import { ref, onMounted, onUnmounted } from 'vue'
const router = useRouter()
const conversationStore = useConversationStore()
withDefaults(defineProps<{ items: ConversationProps[] }>(), {
  items: () => []
})
const goToConversation = (id: number) => {
  router.push({ path: `/conversation`, query: { id } })
  conversationStore.selectedId = id
}
const openMenuId = ref<number | null>(null)
const toggleMenu = (id:number)=>{ openMenuId.value = openMenuId.value===id? null : id }
const renameId = ref<number | null>(null)
const renameTitle = ref('')
const deleteConfirmId = ref<number | null>(null)
const startDelete = (id:number)=>{ deleteConfirmId.value = id }
const cancelDelete = ()=>{ deleteConfirmId.value = null }
const confirmDelete = async (id:number)=>{
  await conversationStore.deleteConversation(id)
  deleteConfirmId.value = null
  openMenuId.value = null
  const nextId = conversationStore.selectedId
  if(nextId && nextId !== -1){
    router.push({ path: '/conversation', query: { id: String(nextId) } })
  } else {
    router.push('/')
  }
}
const startRename = (id:number, title:string)=>{ renameId.value = id; renameTitle.value = title || '' }
const cancelRename = ()=>{ renameId.value = null; renameTitle.value = '' }
const confirmRename = async (id:number)=>{
  const next = renameTitle.value.trim()
  if(next){ await conversationStore.renameConversation(id, next); openMenuId.value = null }
  cancelRename()
}
const onTogglePin = async (id:number) => { await conversationStore.togglePin(id); openMenuId.value = null }
onMounted(()=>{
  const handler = (e: MouseEvent)=>{
    const path = e.composedPath() as any[]
    const inside = path.some((el:any)=> el && el.classList && (el.classList.contains('more-btn') || el.classList.contains('more-menu')))
    if(!inside) openMenuId.value = null
  }
  ;(window as any)._convMenuHandler = handler
  document.addEventListener('click', handler, true)
})
onUnmounted(()=>{
  const handler = (window as any)._convMenuHandler
  if(handler) document.removeEventListener('click', handler, true)
  delete (window as any)._convMenuHandler
})
</script>
<style scoped>
.more-btn{ opacity:0; }
.item:hover .more-btn{ opacity:1; }
</style>
