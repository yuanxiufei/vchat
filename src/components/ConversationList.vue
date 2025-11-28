<!-- 对话列表组件：展示最近对话，点击进入对应会话并高亮选中项 -->
<template>
  <div class="Conversation-list space-y-2">
    <div class="item surface cursor-pointer p-3 transition-colors" v-for="item in items"
      :key="item.id"
      :class="{
        'row row-hover': item.id !== conversationStore.selectedId,
        'bg-gray-50 ring-1 ring-[#34C759]/20': item.id === conversationStore.selectedId
      }">

      <div @click.prevent="goToConversation(item.id)">
        <div class="flex justify-between items-center text-xs leading-5 text-gray-500">
          <div>{{ item.selectedModel }}</div>
          <div>{{ dayjs(item.updatedAt).format('YYYY-MM-DD') }}</div>
        </div>
        <h2 class="font-medium mt-1 text-gray-900 truncate">{{ item.title }}</h2>
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
const router = useRouter()
const conversationStore = useConversationStore()
defineProps({
  items: {
    type: Array as () => ConversationProps[]
  }
})
const goToConversation = (id: number) => {
  router.push({ path: `/conversation`, query: { id } })
  conversationStore.selectedId = id
}
</script>
<style lang="scss" scoped></style>
