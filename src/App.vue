<template>
  <div class="flex items-center justify-between h-screen">
    <div class="w-[300px] h-full bg-gray-200 border-r border-gray-300">
      <div class="h-[90%] overflow-y-auto">
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
      <RouterView/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ConversationProps, ProviderProps } from '@/types/appType'
import ConversationList from '@/components/ConversationList.vue'

import { Icon } from '@iconify/vue'
import { ref } from 'vue'
import Button from './components/Button.vue'
const conversations: ConversationProps[] = [
  {
    id: 1, selectedModel: 'GPT-3.5-Turbo', title: '什么是光合作用1', createdAt: '2024-07-03', updatedAt: '2025-07-03',
    providerId: 0
  },
  {
    id: 2, selectedModel: 'GPT-3.5-Turbo', title: '什么是光合作用', createdAt: '2024-07-03', updatedAt: '2025-07-03',
    providerId: 0
  },
  {
    id: 3, selectedModel: 'GPT-3.5-Turbo', title: '什么是光合作用', createdAt: '2024-07-03', updatedAt: '2025-07-03',
    providerId: 0
  },
  { id: 4, selectedModel: 'GPT-3.5-Turbo', title: '什么是光合作用，你的说法很正确，理解的很不错', createdAt: '2024-07-03', updatedAt: '2025-07-03', providerId: 0 },
  { id: 5, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的过程', createdAt: '2024-07-04', updatedAt: '2025-07-04', providerId: 0 },
  { id: 6, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的意义', createdAt: '2024-07-05', updatedAt: '2025-07-05', providerId: 0 },
  {
    id: 7, selectedModel: 'GPT-3.5-Turbo', title: '植物如何进行光合作用', createdAt: '2024-07-06', updatedAt: '2025-07-06',
    providerId: 0
  },
  {
    id: 8, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的化学方程式', createdAt: '2024-07-07', updatedAt: '2025-07-07',
    providerId: 0
  },
  {
    id: 9, selectedModel: 'GPT-3.5-Turbo', title: '光合作用与呼吸作用的区别', createdAt: '2024-07-08', updatedAt: '2025-07-08',
    providerId: 0
  },
  {
    id: 10, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的能量转换', createdAt: '2024-07-09', updatedAt: '2025-07-09',
    providerId: 0
  },
  {
    id: 11, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的历史发现', createdAt: '2024-07-10', updatedAt: '2025-07-10',
    providerId: 0
  },
  {
    id: 12, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的实验', createdAt: '2024-07-11', updatedAt: '2025-07-11',
    providerId: 0
  },
  {
    id: 13, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的影响因素', createdAt: '2024-07-12', updatedAt: '2025-07-12',
    providerId: 0
  },
  {
    id: 14, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的产物', createdAt: '2024-07-13', updatedAt: '2025-07-13',
    providerId: 0
  },
  {
    id: 15, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的场所', createdAt: '2024-07-14', updatedAt: '2025-07-14',
    providerId: 0
  },
  {
    id: 16, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的意义和作用', createdAt: '2024-07-15', updatedAt: '2025-07-15',
    providerId: 0
  },
  {
    id: 17, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的原理', createdAt: '2024-07-16', updatedAt: '2025-07-16',
    providerId: 0
  },
  {
    id: 18, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的步骤', createdAt: '2024-07-17', updatedAt: '2025-07-17',
    providerId: 0
  },
  {
    id: 19, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的应用', createdAt: '2024-07-18', updatedAt: '2025-07-18',
    providerId: 0
  },
  {
    id: 20, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的研究进展', createdAt: '2024-07-19', updatedAt: '2025-07-19',
    providerId: 0
  },
  {
    id: 21, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的未来', createdAt: '2024-07-20', updatedAt: '2025-07-20',
    providerId: 0
  },
  {
    id: 22, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的相关实验', createdAt: '2024-07-21', updatedAt: '2025-07-21',
    providerId: 0
  },
  {
    id: 23, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的能量来源', createdAt: '2024-07-22', updatedAt: '2025-07-22',
    providerId: 0
  },
  {
    id: 24, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的氧气产生', createdAt: '2024-07-23', updatedAt: '2025-07-23',
    providerId: 0
  },
  {
    id: 25, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的碳固定', createdAt: '2024-07-24', updatedAt: '2025-07-24',
    providerId: 0
  },
  {
    id: 26, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的叶绿体', createdAt: '2024-07-25', updatedAt: '2025-07-25',
    providerId: 0
  },
  {
    id: 27, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的光反应', createdAt: '2024-07-26', updatedAt: '2025-07-26',
    providerId: 0
  },
  {
    id: 28, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的暗反应', createdAt: '2024-07-27', updatedAt: '2025-07-27',
    providerId: 0
  },
  {
    id: 29, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的能量流动', createdAt: '2024-07-28', updatedAt: '2025-07-28',
    providerId: 0
  },
  {
    id: 30, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的生态意义', createdAt: '2024-07-29', updatedAt: '2025-07-29',
    providerId: 0
  },
  {
    id: 31, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的相关知识', createdAt: '2024-07-30', updatedAt: '2025-07-30',
    providerId: 0
  },
  {
    id: 32, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的常见问题', createdAt: '2024-07-31', updatedAt: '2025-07-31',
    providerId: 0
  },
  {
    id: 33, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的误区', createdAt: '2024-08-01', updatedAt: '2025-08-01',
    providerId: 0
  },
  {
    id: 34, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的趣味知识', createdAt: '2024-08-02', updatedAt: '2025-08-02',
    providerId: 0
  },
  {
    id: 35, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的相关书籍', createdAt: '2024-08-03', updatedAt: '2025-08-03',
    providerId: 0
  },
  {
    id: 36, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的相关论文', createdAt: '2024-08-04', updatedAt: '2025-08-04',
    providerId: 0
  },
  {
    id: 37, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的相关视频', createdAt: '2024-08-05', updatedAt: '2025-08-05',
    providerId: 0
  },
  {
    id: 38, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的相关课程', createdAt: '2024-08-06', updatedAt: '2025-08-06',
    providerId: 0
  },
  {
    id: 39, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的相关网站', createdAt: '2024-08-07', updatedAt: '2025-08-07',
    providerId: 0
  },
  {
    id: 40, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的相关实验室', createdAt: '2024-08-08', updatedAt: '2025-08-08',
    providerId: 0
  }
]


console.log('🐝 This message is being logged by "App.vue", included via Vite');
</script>

<style scoped></style>
