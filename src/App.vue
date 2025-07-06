<template>
    <div class="flex items-center justify-between h-screen">
      <div class="w-[300px] h-full bg-gray-200 border-r border-gray-300">
        <div class="h-[90%] overflow-y-auto">
          <ConversationList :items="conversations" />
        </div>
        <div class="h-[10%] grid grid-cols-2 gap-2 p-2">
     <button
    class="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 active:scale-95 transition-all duration-150 text-white rounded-full shadow-lg py-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300"
  >
    <Icon icon="radix-icons:chat-bubble"></Icon>
    新建对话
  </button>
  <button
    class="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-400 hover:from-red-600 hover:to-red-500 active:scale-95 transition-all duration-150 text-white rounded-full shadow-lg py-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-red-300"
  >
    <Icon icon="radix-icons:gear"></Icon>
    配置
  </button>
        </div>
      </div>
      <div class="h-full flex-1">
        content
      </div>
    </div>
</template>

<script setup lang="ts">
import { ConversationProps } from '@/types/appType'
import ConversationList from '@/components/ConversationList.vue'
import { Icon } from '@iconify/vue'
import { ref } from 'vue'
const conversations: ConversationProps[] = [
  { id: 1, selectedModel: 'GPT-3.5-Turbo', title: '什么是光合作用1', createdAt: '2024-07-03', updatedAt: '2025-07-03' },
  { id: 2, selectedModel: 'GPT-3.5-Turbo', title: '什么是光合作用', createdAt: '2024-07-03', updatedAt: '2025-07-03' },
  { id: 3, selectedModel: 'GPT-3.5-Turbo', title: '什么是光合作用', createdAt: '2024-07-03', updatedAt: '2025-07-03' },
  { id: 4, selectedModel: 'GPT-3.5-Turbo', title: '什么是光合作用，你的说法很正确，理解的很不错', createdAt: '2024-07-03', updatedAt: '2025-07-03' },
  { id: 5, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的过程', createdAt: '2024-07-04', updatedAt: '2025-07-04' },
  { id: 6, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的意义', createdAt: '2024-07-05', updatedAt: '2025-07-05' },
  { id: 7, selectedModel: 'GPT-3.5-Turbo', title: '植物如何进行光合作用', createdAt: '2024-07-06', updatedAt: '2025-07-06' },
  { id: 8, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的化学方程式', createdAt: '2024-07-07', updatedAt: '2025-07-07' },
  { id: 9, selectedModel: 'GPT-3.5-Turbo', title: '光合作用与呼吸作用的区别', createdAt: '2024-07-08', updatedAt: '2025-07-08' },
  { id: 10, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的能量转换', createdAt: '2024-07-09', updatedAt: '2025-07-09' },
  { id: 11, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的历史发现', createdAt: '2024-07-10', updatedAt: '2025-07-10' },
  { id: 12, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的实验', createdAt: '2024-07-11', updatedAt: '2025-07-11' },
  { id: 13, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的影响因素', createdAt: '2024-07-12', updatedAt: '2025-07-12' },
  { id: 14, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的产物', createdAt: '2024-07-13', updatedAt: '2025-07-13' },
  { id: 15, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的场所', createdAt: '2024-07-14', updatedAt: '2025-07-14' },
  { id: 16, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的意义和作用', createdAt: '2024-07-15', updatedAt: '2025-07-15' },
  { id: 17, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的原理', createdAt: '2024-07-16', updatedAt: '2025-07-16' },
  { id: 18, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的步骤', createdAt: '2024-07-17', updatedAt: '2025-07-17' },
  { id: 19, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的应用', createdAt: '2024-07-18', updatedAt: '2025-07-18' },
  { id: 20, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的研究进展', createdAt: '2024-07-19', updatedAt: '2025-07-19' },
  { id: 21, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的未来', createdAt: '2024-07-20', updatedAt: '2025-07-20' },
  { id: 22, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的相关实验', createdAt: '2024-07-21', updatedAt: '2025-07-21' },
  { id: 23, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的能量来源', createdAt: '2024-07-22', updatedAt: '2025-07-22' },
  { id: 24, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的氧气产生', createdAt: '2024-07-23', updatedAt: '2025-07-23' },
  { id: 25, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的碳固定', createdAt: '2024-07-24', updatedAt: '2025-07-24' },
  { id: 26, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的叶绿体', createdAt: '2024-07-25', updatedAt: '2025-07-25' },
  { id: 27, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的光反应', createdAt: '2024-07-26', updatedAt: '2025-07-26' },
  { id: 28, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的暗反应', createdAt: '2024-07-27', updatedAt: '2025-07-27' },
  { id: 29, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的能量流动', createdAt: '2024-07-28', updatedAt: '2025-07-28' },
  { id: 30, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的生态意义', createdAt: '2024-07-29', updatedAt: '2025-07-29' },
  { id: 31, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的相关知识', createdAt: '2024-07-30', updatedAt: '2025-07-30' },
  { id: 32, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的常见问题', createdAt: '2024-07-31', updatedAt: '2025-07-31' },
  { id: 33, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的误区', createdAt: '2024-08-01', updatedAt: '2025-08-01' },
  { id: 34, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的趣味知识', createdAt: '2024-08-02', updatedAt: '2025-08-02' },
  { id: 35, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的相关书籍', createdAt: '2024-08-03', updatedAt: '2025-08-03' },
  { id: 36, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的相关论文', createdAt: '2024-08-04', updatedAt: '2025-08-04' },
  { id: 37, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的相关视频', createdAt: '2024-08-05', updatedAt: '2025-08-05' },
  { id: 38, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的相关课程', createdAt: '2024-08-06', updatedAt: '2025-08-06' },
  { id: 39, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的相关网站', createdAt: '2024-08-07', updatedAt: '2025-08-07' },
  { id: 40, selectedModel: 'GPT-3.5-Turbo', title: '光合作用的相关实验室', createdAt: '2024-08-08', updatedAt: '2025-08-08' }
]
console.log('🐝 This message is being logged by "App.vue", included via Vite');
</script>

<style scoped>

</style>
