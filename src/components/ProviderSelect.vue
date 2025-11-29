<!-- 模型选择组件：列表按 Provider 分组，选择具体模型返回 "providerId/model" -->
<template>
    <div class="provider-select w-full">
        <SelectRoot v-model="currentModel">
            <SelectTrigger :class="triggerShapeClass">
                <template v-if="variant==='pill'">
                  <div class="flex items-center gap-2 min-w-0">
                    <img v-if="selectedAvatar" :src="selectedAvatar" class="h-5 w-5 rounded" alt="avatar" />
                    <span class="truncate">{{ selectedLabel || t('select_model') }}</span>
                  </div>
                </template>
                <template v-else>
                  <SelectValue :placeholder="t('select_model')" />
                </template>
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
                  :style="contentStyle"
                >
                    <SelectScrollUpButton class="flex items-center justify-center h-6 text-gray-400">
                      <Icon icon="radix-icons:chevron-up" class="h-5 w-5" />
                    </SelectScrollUpButton>
                    <SelectViewport class="p-2 w-full">
                        <div v-for="provider in filteredItems" :key="provider.id">
                          <SelectLabel class="flex items-center px-4 h-7 text-gray-500 cursor-pointer">
                            <img :src="provider.avatar" :alt="provider.name" class="h-5 w-5 mr-2 rounded" />
                            <span class="truncate max-w-[220px]">{{ provider.title || provider.name }}</span>
                          </SelectLabel>
                          <SelectGroup>
                            <SelectItem v-for="(model,index) in provider.models" :key="index" :value="`${provider.id}/${model}`" 
                            class="outline-none rounded flex items-center h-7 pl-8 pr-4 relative
                            text-green-700 cursor-pointer data-[highlighted]:bg-green-700
                            data-[highlighted]:text-white"
                            >
                            <SelectItemIndicator class="absolute left-2 w-6">
                                <Icon icon="radix-icons:check" class="h-5 w-5" />
                            </SelectItemIndicator>
                               <SelectItemText class="truncate max-w-[220px]">
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
        <div v-if="!filteredItems.length && showEmptyTip" class="text-xs text-gray-600 mt-2 flex items-center gap-2">
          <span>{{ t('no_models_tip') }}</span>
          <button type="button" class="text-green-700 hover:text-black underline cursor-pointer" @click="goSettings">{{ t('settings') }}</button>
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
const props = defineProps<{ items: ProviderProps[], size?: 'sm' | 'md' | 'lg', variant?: 'simple' | 'pill', showEmptyTip?: boolean, fluid?: boolean, menuMin?: number, menuMax?: number, menuWidth?: number }>()
const currentModel = defineModel<string>({ default: '' })
const filteredItems = computed(()=> (props.items || []).filter(p=>Array.isArray(p.models) && p.models.length))

const triggerClass = computed(()=>{
  if (props.fluid) return 'w-full'
  const size = props.size || 'md'
  if (size === 'sm') return 'min-w-[180px] max-w-[240px]'
  if (size === 'lg') return 'min-w-[260px] max-w-[320px]'
  return 'min-w-[200px] max-w-[260px]'
})

const variant = computed(()=> props.variant || 'pill')
const triggerShapeClass = computed(()=>{
  const base = 'flex items-center justify-between bg-white shadow-sm border border-gray-200 outline-none data-[placeholder]:text-gray-400 cursor-pointer text-sm flex-shrink-0 '
  const width = triggerClass.value + ' '
  if (variant.value==='simple') return base + 'rounded-lg h-8 px-3 ' + width
  return base + 'rounded-full h-9 px-4 ' + width
})

const showEmptyTip = computed(()=> !!props.showEmptyTip)

const contentStyle = computed(()=> ({ width: (props.menuWidth || 280) + 'px', minWidth: (props.menuMin || 200) + 'px', maxWidth: (props.menuMax || (props.menuWidth || 280)) + 'px', '--radix-select-trigger-width': '0px' } as any))

const selectedLabel = computed(()=>{
  const val = currentModel.value
  if (!val) return ''
  const [pidStr, model] = String(val).split('/')
  const pid = parseInt(pidStr)
  const prov = (props.items || []).find(p=>p.id===pid)
  const title = prov?.title || prov?.name || ''
  return title && model ? `${title} · ${model}` : (model || '')
})
const selectedAvatar = computed(()=>{
  const val = currentModel.value
  if (!val) return ''
  const pid = parseInt(String(val).split('/')[0])
  const prov = (props.items || []).find(p=>p.id===pid)
  return prov?.avatar || ''
})

const router = useRouter()
function goSettings(){ router.push('/settings') }
</script>
