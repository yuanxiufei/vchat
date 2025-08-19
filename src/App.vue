<template>
  <div class="flex items-center justify-between h-screen">
    <div class="w-[300px] h-full bg-gray-200 border-r border-gray-300">
      <div class="h-[90%] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        <ConversationList :items="conversations" />
      </div>
      <div class="h-[10%] grid grid-cols-2 gap-2 p-2 flex items-center">
        <RouterLink to="/">
          <Button icon-name="radix-icons:chat-bubble" class="w-full">
            新建对话
          </Button>
        </RouterLink>
        <RouterLink to="/settings">
          <Button icon-name="radix-icons:gear" plain class="w-full">
            应用设置
          </Button>
        </RouterLink>
      </div>
    </div>
    <div class="h-full flex-1">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ConversationProps, ProviderProps } from '@/types/appType'
import ConversationList from '@/components/ConversationList.vue'
import { Icon } from '@iconify/vue'
import { onMounted, ref } from 'vue'
import Button from './components/Button.vue'
import { conversations as conversationsData, providers } from '@/data/testData'
import { db } from '@/db'
const conversations = ref<ConversationProps[]>([])
conversations.value = conversationsData

onMounted(async () => {
  // 新增
  // const insertedId = await db.providers.add(providers[0])
  // console.log('insertedId', insertedId)
  const items = await db.providers.where({ id: 1 }).toArray()
  console.log('items', items)
  // 更新
  const updateItems = await db.providers.update(1, { desc: 'update desc' });
  console.log('updateItems', updateItems)
  // 删除
  const deleteItems = await db.providers.delete(1);
  console.log('deleteItems', deleteItems)
})
console.log('🐝 This message is being logged by "App.vue", included via Vite');
</script>

<style scoped></style>
