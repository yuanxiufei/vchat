<!-- 消息输入组件：支持文本输入与图片选择预览，按回车或点击按钮发送 -->
<template>
  <div class="w-full surface overflow-hidden">
    <div v-if="imagePreview" class="mb-2 relative flex items-center ">
      <img :src="imagePreview" alt="Preview" class="w-20 h-20 rounded" >
    </div>
   <div class="flex items-center">
     <input type="file" accept="image/*" ref="fileInput" class="hidden" @change="handleImageUpload">
      <Icon
        icon="radix-icons:image"
        :width="20"
        :height="20"
        :class="['mx-2', disabled ? 'text-gray-300 cursor-not-allowed pointer-events-none' : 'text-gray-500 cursor-pointer hover:text-gray-700']"
        @click="triggerFileInput"
      />
    <input
      v-model="inputValue"
      :disabled="disabled"
      @keyup.enter="handleSend"
      class="flex-1 h-10 px-3 outline-none placeholder-gray-400 text-gray-900 border-0 focus:ring-0"
      type="text"
      :placeholder="t('input_placeholder')"
    />
    <button
      class="btn-primary px-4 py-1.5 mx-2 flex items-center justify-center self-center"
      style="height:32px;"
      @click="handleSend"
      :disabled="disabled"
    >
      <Icon icon="mdi:send-outline" class="w-5 h-5 mr-1" />
      {{ t('send') }}
    </button>
   </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { t } from '@/locales'
// defineProps、defineEmits 直接用宏，不需要 import
const props = defineProps<{ modelValue?: string, disabled?: boolean }>()
const emits = defineEmits(['update:modelValue', 'send'])
const inputValue = ref(props.modelValue || '')
const fileInput = ref<HTMLInputElement | null>(null)
const imagePreview = ref('')
const selectedImage = ref<File | null>(null)
watch(() => props.modelValue, val => {
  if (val !== inputValue.value) inputValue.value = val || ''
})
// 触发文件选择输入框
function triggerFileInput() {
  if (props.disabled) return
  if (fileInput.value) fileInput.value.value = ''
  fileInput.value?.click()
}
// 处理文件选择：读取图片并生成预览 Data URL
function handleImageUpload(e: Event) {
  const target = (e.target as HTMLInputElement)
  if (target.files && target.files.length >0) {
    // 处理图片上传
    selectedImage.value = target.files && target.files[0]
     // 创建 FileReader 对象，用于读取文件内容
     const reader = new FileReader()
     // 图片加载完成后，将图片数据赋值给 imagePreview
     reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
     }
     // 读取文件内容为 Data URL 格式
     reader.readAsDataURL(selectedImage.value as File)
  }
}
// 处理发送：将文本与可选图片路径一起发出，并重置输入状态
function handleSend() {
  if (inputValue.value.trim() !== '') {
    const payloadPath = (selectedImage.value as any)?.path || imagePreview.value || ''
    emits('send', inputValue.value, payloadPath)
    emits('update:modelValue', '')
    inputValue.value = ''
    imagePreview.value = ''
    selectedImage.value = null
    if (fileInput.value) fileInput.value.value = ''
  }
}

watch(inputValue, val => emits('update:modelValue', val))
</script>
