<template>
    <div class="mx-auto w-[100%] h-full flex flex-col align-center justify-center overflow-y-auto  scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
       <div class="w-[100%] mx-auto h-[10%] bg-gray-200 border-b border-gary-300 flex items-center px-3 mb-2 justify-between" v-if="conversation">
            <h3 class="font-semibold text-gray-900"> {{ conversation?.title }}</h3>
            <span class="text-sm text-gary-500">{{ conversation?.createdAt }}</span>
        </div>
        <div class="w-[80%] mx-auto flex-1 min-h-0">
            <MessageList :messages="filterMessages" />
        </div>
        <div class="w-[80%] mx-auto h-[15%] min-h-[60px]">
            <MessageInput />
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import MessageInput from '@/components/MessageInput.vue'
import MessageList from '../components/MessageList.vue'
import { MessageProps, ConversationProps } from '@/types/appType'
import { conversations, messages } from '@/data/testData'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const filterMessages = ref<MessageProps[]>([])
const conversationId = ref(parseInt(route.query.id as string))
const conversation = ref<ConversationProps>()
watch(() => route.query.id, (newId: string) => {
    conversationId.value = parseInt(newId)
    conversation.value = conversations.find((item) => item.id === conversationId.value)
    filterMessages.value = messages.filter((item) => item.conversationId === conversationId.value)
})
</script>