<!-- 模型选择组件：列表按 Provider 分组，选择具体模型返回 "providerId/model" -->
<template>
    <div class="provider-select w-full">
        <SelectRoot v-model="currentModel">
            <SelectTrigger class="flex items-center justify-between rounded-lg h-8 px-3 bg-white shadow-sm border border-gray-200 outline-none data-[placeholder]:text-gray-400 cursor-pointer min-w-[180px] max-w-[240px] text-sm truncate flex-shrink-0">
                <SelectValue :placeholder="t('select_model')" />
                <Icon icon="radix-icons:chevron-down" class="h-5 w-5" />
            </SelectTrigger>
            <SelectPortal>
                <SelectContent
                  v-if="filteredItems.length"
                  :position="'popper'"
                  :align="'end'"
                  :side="'bottom'"
                  :sideOffset="8"
                  :avoidCollisions="false"
                  class="bg-white rounded-xl shadow z-[1000] border border-gray-100 max-h-[60vh] overflow-auto"
                >
                    <SelectScrollUpButton class="flex items-center justify-center h-6 text-gray-400">
                      <Icon icon="radix-icons:chevron-up" class="h-5 w-5" />
                    </SelectScrollUpButton>
                    <SelectViewport class="p-2 min-w-[240px]">
                        <div v-for="provider in filteredItems" :key="provider.id">
                          <SelectLabel class="flex items-center px-6 h-7 text-gray-500 cursor-pointer">
                            <img :src="provider.avatar" :alt="provider.name" class="h-5 w-5 mr-2 rounded" />
                            {{ provider.title || provider.name }}
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
                          <SelectSeparator class="h-[1px] my-1 bg-gray-200" />
                        </div>
                    </SelectViewport>
                    <SelectScrollDownButton class="flex items-center justify-center h-6 text-gray-400">
                      <Icon icon="radix-icons:chevron-down" class="h-5 w-5" />
                    </SelectScrollDownButton>
                </SelectContent>
            </SelectPortal>
        </SelectRoot>
        <div v-if="!filteredItems.length" class="text-xs text-gray-600 mt-2">
          {{ t('no_models_tip') }}
          <button type="button" class="ml-1 text-green-700 hover:text-black underline cursor-pointer" @click="goSettings">{{ t('settings') }}</button>
        </div>
    </div>
</template>

<script setup lang="ts">
// 说明：
// - props.items 来自数据库构建的 Provider 列表；
// - 仅展示包含模型的 Provider；
// - v-model 输出格式为 "providerId/model"，供首页解析。
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
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
import { t } from '@/locales'
// defineProps、defineModel 直接用宏，不需要 import
const props = defineProps<{ items: ProviderProps[] }>()
const currentModel = defineModel<string>({ default: '' })
const filteredItems = computed(()=> (props.items || []).filter(p=>Array.isArray(p.models) && p.models.length))

const router = useRouter()
function goSettings(){ router.push('/settings') }
</script>
