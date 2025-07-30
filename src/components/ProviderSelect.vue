<template>
    <div class="provider-select w-full">
        <SelectRoot v-model="currentModel">
            <SelectTrigger class="flex w-full items-center justify-between rounded-md py-1.5 px-3 shadow-md border outline-none
            data-[placeholder]:text-gray-400">
                <SelectValue placeholder="选择模型" />
                <Icon icon="radix-icons:chevron-down" class="h-5 w-5" />
            </SelectTrigger>
            <SelectPortal>
                <SelectContent class="bg-white rounded-md shadow-md z-[100%] border">
                    <SelectViewport class="p-2">
                        <div v-for="provider in props.items" :key="provider.id">
                          <SelectLabel class="flex items-center px-6 h-7 text-gray-500 cursor-pointer">
                            <img :src="provider.avatar" :alt="provider.name" class="h-5 w-5 mr-2 rounded" />
                            {{ provider.name }}
                          </SelectLabel>
                          <SelectGroup>
                            <SelectItem v-for="(model,index) in provider.models" :key="index" :value="`${provider.id}/${model}`" 
                            class="outline-none rounded flex items-center h-7 px-6 relative
                            text-green-700 cursor-pointer data-[highlighted]:bg-green-700
                            data-[highlighted]:text-white"
                            >
                            <SelectItemIndicator class="absolute left-2 w-6">
                                <Icon icon="radix-icons:check" class="h-5 w-5" />
                            </SelectItemIndicator>
                               <SelectItemText>
                                   {{ model }}
                               </SelectItemText>
                            </SelectItem>
                          </SelectGroup>
                          <SelectSeparator class="h-[1px] my-2 bg-gray-300" />
                        </div>
                    </SelectViewport>
                </SelectContent>
            </SelectPortal>
        </SelectRoot>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ProviderProps } from '@/types/appType'
import {
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectItemIndicator,
    SelectItemText,
    SelectLabel,
    SelectPortal,
    SelectRoot,
    SelectScrollDownButton,
    SelectScrollUpButton,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
    SelectViewport,
} from 'radix-vue'
import { Icon } from '@iconify/vue';
// defineProps、defineModel 直接用宏，不需要 import
const props = defineProps<{ items: ProviderProps[] }>()
const currentModel = defineModel<string>({ default: '' })
</script>