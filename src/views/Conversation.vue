<template>
    <div class="w-[80%] mx-auto h-full flex flex-col overflow-y-auto pt-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        <div class="flex-1 min-h-0">
            <MessageList :messages="filterMessages" />
        </div>
        <div class="h-[15%] min-h-[60px]">
            <MessageInput />
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import MessageInput from '@/components/MessageInput.vue'
import MessageList from '../components/MessageList.vue'
import { MessageProps } from '@/types/appType'
import { useRoute, useRouter } from 'vue-router'
const messages = ref<MessageProps[]>(
    [
        // conversationId: 1
        {
            id: 1,
            content: '你好，请问你是谁？',
            type: 'question',
            conversationId: 1,
            status: 'pending',
            createdAt: '2023-01-01 10:00',
            updatedAt: '2023-01-01 10:00',
        },
        {
            id: 2,
            content: '我是你的智能助手，可以帮助你解答各种问题。',
            type: 'answer',
            conversationId: 1,
            status: 'pending',
            createdAt: '2023-01-01 10:00',
            updatedAt: '2023-01-01 10:00',
        },
        {
            id: 3,
            content: '今天天气怎么样？',
            type: 'question',
            conversationId: 1,
            status: 'pending',
            createdAt: '2023-01-01 10:01',
            updatedAt: '2023-01-01 10:01',
        },
        {
            id: 4,
            content: '很抱歉，我无法获取实时天气信息，但你可以通过天气APP查询。',
            type: 'answer',
            conversationId: 1,
            status: 'pending',
            createdAt: '2023-01-01 10:01',
            updatedAt: '2023-01-01 10:01',
        },
        {
            id: 5,
            content: '你能帮我写一段Vue组件代码吗？',
            type: 'question',
            conversationId: 1,
            status: 'pending',
            createdAt: '2023-01-01 10:02',
            updatedAt: '2023-01-01 10:02',
        },
        {
            id: 6,
            content: '<template>\n  <div>Hello, Vue!</div>\n</template>',
            type: 'answer',
            conversationId: 1,
            status: 'pending',
            createdAt: '2023-01-01 10:02',
            updatedAt: '2023-01-01 10:02',
        },
        {
            id: 7,
            content: '谢谢你！',
            type: 'question',
            conversationId: 1,
            status: 'pending',
            createdAt: '2023-01-01 10:03',
            updatedAt: '2023-01-01 10:03',
        },
        {
            id: 8,
            content: '不客气，有问题随时问我。',
            type: 'answer',
            conversationId: 1,
            status: 'pending',
            createdAt: '2023-01-01 10:03',
            updatedAt: '2023-01-01 10:03',
        },
        {
            id: 9,
            content: '',
            type: 'answer',
            conversationId: 1,
            status: 'loading',
            createdAt: '2023-01-01 10:04',
            updatedAt: '2023-01-01 10:04',
        },
        {
            id: 10,
            content: '光合作用的基本过程是什么？',
            type: 'question',
            conversationId: 2,
            status: 'pending',
            createdAt: '2023-01-02 09:00',
            updatedAt: '2023-01-02 09:00',
        },
        {
            id: 11,
            content: '光合作用是绿色植物利用光能将二氧化碳和水转化为有机物并释放氧气的过程。',
            type: 'answer',
            conversationId: 2,
            status: 'pending',
            createdAt: '2023-01-02 09:00',
            updatedAt: '2023-01-02 09:00',
        },
        {
            id: 12,
            content: '有哪些影响光合作用效率的因素？',
            type: 'question',
            conversationId: 2,
            status: 'pending',
            createdAt: '2023-01-02 09:01',
            updatedAt: '2023-01-02 09:01',
        },
        {
            id: 13,
            content: '主要有光照强度、二氧化碳浓度、温度和水分等。',
            type: 'answer',
            conversationId: 2,
            status: 'pending',
            createdAt: '2023-01-02 09:01',
            updatedAt: '2023-01-02 09:01',
        },
        {
            id: 14,
            content: '请举例说明光合作用的实际应用。',
            type: 'question',
            conversationId: 2,
            status: 'pending',
            createdAt: '2023-01-02 09:02',
            updatedAt: '2023-01-02 09:02',
        },
        {
            id: 15,
            content: '温室种植、农业增产等都离不开对光合作用的调控。',
            type: 'answer',
            conversationId: 2,
            status: 'pending',
            createdAt: '2023-01-02 09:02',
            updatedAt: '2023-01-02 09:02',
        },
        // conversationId: 3
        {
            id: 20,
            content: 'ref 和 reactive 有什么区别？',
            type: 'question',
            conversationId: 3,
            status: 'pending',
            createdAt: '2023-01-03 11:02',
            updatedAt: '2023-01-03 11:02',
        },
        {
            id: 21,
            content: 'ref 用于基本类型数据响应式，reactive 用于对象和数组的响应式。',
            type: 'answer',
            conversationId: 3,
            status: 'pending',
            createdAt: '2023-01-03 11:02',
            updatedAt: '2023-01-03 11:02',
        },
        {
            id: 22,
            content: 'computed 有什么作用？',
            type: 'question',
            conversationId: 3,
            status: 'pending',
            createdAt: '2023-01-03 11:03',
            updatedAt: '2023-01-03 11:03',
        },
        {
            id: 23,
            content: 'computed 用于声明计算属性，具有缓存特性。',
            type: 'answer',
            conversationId: 3,
            status: 'pending',
            createdAt: '2023-01-03 11:03',
            updatedAt: '2023-01-03 11:03',
        },
        // conversationId: 4
        {
            id: 24,
            content: '请介绍一下 TypeScript 的基本类型。',
            type: 'question',
            conversationId: 4,
            status: 'pending',
            createdAt: '2023-01-04 14:00',
            updatedAt: '2023-01-04 14:00',
        },
        {
            id: 25,
            content: 'TypeScript 的基本类型有 number、string、boolean、null、undefined、symbol、bigint 等。',
            type: 'answer',
            conversationId: 4,
            status: 'pending',
            createdAt: '2023-01-04 14:00',
            updatedAt: '2023-01-04 14:00',
        },
        {
            id: 26,
            content: 'interface 和 type 有什么区别？',
            type: 'question',
            conversationId: 4,
            status: 'pending',
            createdAt: '2023-01-04 14:01',
            updatedAt: '2023-01-04 14:01',
        },
        {
            id: 27,
            content: 'interface 更适合描述对象结构，type 更灵活可用于联合类型、交叉类型等。',
            type: 'answer',
            conversationId: 4,
            status: 'pending',
            createdAt: '2023-01-04 14:01',
            updatedAt: '2023-01-04 14:01',
        },
        // conversationId: 5
        {
            id: 28,
            content: '什么是前端路由？',
            type: 'question',
            conversationId: 5,
            status: 'pending',
            createdAt: '2023-01-05 15:00',
            updatedAt: '2023-01-05 15:00',
        },
        {
            id: 29,
            content: '前端路由用于在单页应用中实现页面切换而无需刷新浏览器。',
            type: 'answer',
            conversationId: 5,
            status: 'pending',
            createdAt: '2023-01-05 15:00',
            updatedAt: '2023-01-05 15:00',
        },
        {
            id: 30,
            content: 'Vue Router 的常用模式有哪些？',
            type: 'question',
            conversationId: 5,
            status: 'pending',
            createdAt: '2023-01-05 15:01',
            updatedAt: '2023-01-05 15:01',
        },
        {
            id: 31,
            content: '常用模式有 hash 模式和 history 模式。',
            type: 'answer',
            conversationId: 5,
            status: 'pending',
            createdAt: '2023-01-05 15:01',
            updatedAt: '2023-01-05 15:01',
        }
    ]
)
const route = useRoute()
const router = useRouter()
const conversationId = ref(parseInt(route.query.id as string))
watch(() => route.query.id, (newVal) => {
  conversationId.value = parseInt(newVal as string)
})
const filterMessages = computed(() => {
    return messages.value.filter((item) => item.conversationId === conversationId.value)
})
</script>