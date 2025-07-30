<template>
  <div class="Conversation-list">
    <div class="item border-gray-300 border-t cursor-pointer bg-white hover:bg-gray-200 p-2"
    v-for="item in items"
    :key="item.id"
    >

  <div @click.prevent="goToConversation(item.id)">
    <div class="flex justify-between items-center  text-sm  leading-5 text-gray-500">
      <div>{{ item.selectedModel }}</div>
      <div>{{ item.updatedAt }}</div>
    </div>
    <h2 class="font-semibold leading-5 text-gray-900 tr">{{ item.title }}</h2>
  </div>
  </div>
  </div>
</template>
<script setup lang="ts">
import { ConversationProps } from '@/types/appType'
import { useRouter } from 'vue-router'
const router = useRouter()
defineProps({
  items: {
    type: Array as () => ConversationProps[]
  }
})
const goToConversation = (id: number) => {
  router.push({ path: `/conversation`, query: { id }})
}
</script>
<style lang="scss" scoped>

</style>
