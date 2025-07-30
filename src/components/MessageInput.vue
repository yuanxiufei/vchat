<template>
  <div class="flex items-center border rounded-md overflow-hidden w-full">
    <input
      v-model="inputValue"
      @keyup.enter="handleSend"
      class="flex-1 px-3 py-2 outline-none"
      type="text"
      placeholder="请输入内容"
    />
    <button
      class="bg-green-700 text-white px-4 py-1.5 mx-2 rounded flex items-center justify-center self-center"
      style="height:32px;"
      @click="handleSend"
    >
      <Icon icon="mdi:send-outline" class="w-5 h-5 mr-1" />
      发送
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
// defineProps、defineEmits 直接用宏，不需要 import
const props = defineProps<{ modelValue?: string }>()
const emits = defineEmits(['update:modelValue', 'send'])
const inputValue = ref(props.modelValue || '')

watch(() => props.modelValue, val => {
  if (val !== inputValue.value) inputValue.value = val || ''
})

function handleSend() {
  if (inputValue.value.trim() !== '') {
    emits('send', inputValue.value)
    emits('update:modelValue', '')
    inputValue.value = ''
  }
}
watch(inputValue, val => emits('update:modelValue', val))
</script>