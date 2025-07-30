<template>
     <div class="w-[80%] mx-auto h-full">
        <div class="flex items-center h-[85%]">
          <ProviderSelect :items="providers" v-model="selectedModel" />
        </div>
        <div class="flex items-center h-[15%]">
          <MessageInput v-model="inputText" @send="handleSend" />
        </div>
      </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import ProviderSelect from '@/components/ProviderSelect.vue'
import MessageInput from '@/components/MessageInput.vue'
import { ProviderProps } from '@/types/appType'
const providers = ref<ProviderProps[]>([
  {
    id: 1,
    name: 'qianfan',
    title: '百度千帆',
    desc: '文心一言 百度出品的大模型',
    models: ['ERNIE-4.0-8K', 'ERNIE-3.5-8K', 'ERNIE-Speed-128K'],
    avatar: 'https://aip-static.cdn.bcebos.com/landing/product/ernie-bote321e5.png',
    createdAt: '2024-07-03',
    updatedAt: '2024-07-03'
  },
  {
    id: 2,
    name: 'dashscope',
    title: '阿里灵积',
    desc: '通义千问',
    // https://help.aliyun.com/zh/dashscope/developer-reference/api-details?spm=a2c4g.11186623.0.0.5bf41507xgULX5#b148acc634pfc
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max', 'qwen-vl-plus'],
    avatar: 'https://qph.cf2.poecdn.net/main-thumb-pb-4160791-200-qlqunomdvkyitpedtghnhsgjlutapgfl.jpeg',
    createdAt: '2024-07-03',
    updatedAt: '2024-07-03'
  },
  {
    id: 3,
    name: 'deepseek',
    title: 'DeepSeek',
    desc: 'DeepSeek',
    // https://api-docs.deepseek.com/zh-cn/
    models: ['deepseek-chat'],
    avatar: 'https://qph.cf2.poecdn.net/main-thumb-pb-4981273-200-phhqenmywlkiybehuaqvsxpfekviajex.jpeg',
    createdAt: '2024-12-27',
    updatedAt: '2024-12-27'
  }
])
//  获取当前选中的模型
const selectedModel = ref('')
//  输入框内容
const inputText = ref('')
function handleSend(val: string) {
  // 这里可以拿到输入框内容
  console.log('发送内容：', val)
}
</script>