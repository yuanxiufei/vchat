<!-- 设置页：管理应用语言/字号与各模型 Provider 配置，支持新增别名配置与编辑/移除 -->
<template>
  <div class="w-full px-6 mx-auto ">
    <div class="grid grid-cols-12 gap-6">
      <section
        class="col-span-12 md:col-span-12 xl:col-span-9 2xl:col-span-9 space-y-6"
      >
        <div class="glass rounded-2xl p-6 shadow-sm">
          <h2 class="text-lg font-semibold">{{ t("app_settings") }}</h2>
          <div class="grid grid-cols-2 gap-6 mt-4">
            <div>
              <label class="block text-sm text-gray-600 mb-2">{{
                t("language")
              }}</label>
              <select
                v-model="language"
                class="w-full h-10 bg-white border border-gray-200 rounded-lg px-3 shadow-sm focus:outline-none focus:border-gray-200"
              >
                <option value="zh-CN">简体中文</option>
                <option value="en-US">English</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-2">{{
                t("font_size")
              }}</label>
              <input
                type="range"
                min="12"
                max="20"
                step="1"
                v-model.number="fontSize"
                class="w-full"
              />
              <div class="text-xs text-gray-500 mt-1">{{ fontSize }}px</div>
            </div>
          </div>
        </div>

        <details class="glass p-4 rounded-xl shadow-sm self-start" open>
          <summary class="cursor-pointer font-medium">{{ t('config_docs') }}</summary>
          <ul class="text-sm text-gray-600 space-y-2 mt-3">
            <li><a class="hover:text-black" href="#" @click.prevent="openDoc('openai')">{{ t('docs_openai') }}</a></li>
            <li><a class="hover:text-black" href="#" @click.prevent="openDoc('deepseek')">{{ t('docs_deepseek') }}</a></li>
            <li><a class="hover:text-black" href="#" @click.prevent="openDoc('claude')">{{ t('docs_claude') }}</a></li>
            <li><a class="hover:text-black" href="#" @click.prevent="openDoc('qianfan')">{{ t('docs_qianfan') }}</a></li>
            <li><a class="hover:text-black" href="#" @click.prevent="openDoc('dashscope')">{{ t('docs_dashscope') }}</a></li>
            <li><a class="hover:text-black" href="#" @click.prevent="openDoc('openai_compat')">{{ t('docs_openai_compat') }}</a></li>
          </ul>
        </details>

        <div>
          <div class="flex items-center justify-between mb-3">
            <div class="text-base font-semibold">{{ t('model_settings') }}</div>
            <DialogRoot v-model:open="showAdd">
              <DialogTrigger asChild>
                <button class="px-3 py-1 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300" type="button" @click="openAdd">{{ t('add') }}</button>
              </DialogTrigger>
              <DialogPortal to="body">
                <DialogOverlay class="fixed inset-0 bg-black/10 backdrop-blur-sm" />
                <DialogContent class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] glass w-[560px] max-w-[90vw] rounded-2xl p-6 shadow-sm" aria-describedby="add-model-desc">
                  <DialogTitle class="text-base font-semibold mb-1">{{ t('add_model_config') }}</DialogTitle>
                  <p id="add-model-desc" class="text-xs text-gray-500 mb-3">请填写必要参数后点击添加</p>
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs text-gray-600 mb-1">{{ t('type') }}</label>
                      <SelectRoot v-model="newType">
                        <SelectTrigger class="w-full h-9 border rounded-md px-3 flex items-center justify-between">
                          <SelectValue :placeholder="t('select_type')" />
                        </SelectTrigger>
                        <SelectPortal to="body">
                          <SelectContent class="bg-white rounded-md shadow-md z-[1000] border">
                            <SelectViewport class="p-2">
                              <SelectItem value="dashscope" class="outline-none rounded flex items-center h-7 px-3 text-green-700 cursor-pointer data-[highlighted]:bg-green-700 data-[highlighted]:text-white"><SelectItemText>{{ t('dashscope_label') }}</SelectItemText></SelectItem>
                              <SelectItem value="qianfan" class="outline-none rounded flex items-center h-7 px-3 text-green-700 cursor-pointer data-[highlighted]:bg-green-700 data-[highlighted]:text-white"><SelectItemText>{{ t('qianfan_label') }}</SelectItemText></SelectItem>
                              <SelectItem value="openai" class="outline-none rounded flex items-center h-7 px-3 text-green-700 cursor-pointer data-[highlighted]:bg-green-700 data-[highlighted]:text-white"><SelectItemText>{{ t('openai_label') }}</SelectItemText></SelectItem>
                              <SelectItem value="deepseek" class="outline-none rounded flex items-center h-7 px-3 text-green-700 cursor-pointer data-[highlighted]:bg-green-700 data-[highlighted]:text-white"><SelectItemText>{{ t('deepseek_label') }}</SelectItemText></SelectItem>
                              <SelectItem value="claude" class="outline-none rounded flex items-center h-7 px-3 text-green-700 cursor-pointer data-[highlighted]:bg-green-700 data-[highlighted]:text-white"><SelectItemText>{{ t('claude_label') }}</SelectItemText></SelectItem>
                            </SelectViewport>
                          </SelectContent>
                        </SelectPortal>
                      </SelectRoot>
                      <div v-if="typeExists" class="text-xs text-red-600 mt-1">{{ t('type_exists_warning') }}</div>
                    </div>
                <template v-if="newType === 'qianfan'">
                  <div>
                    <label class="block text-xs text-gray-600 mb-1"
                      >Access Key</label
                    >
                    <input
                      v-model="form.accessKey"
                      class="w-full h-9 border rounded-md px-3"
                      placeholder="ak_..."
                    />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1"
                      >Secret Key</label
                    >
                    <input
                      v-model="form.secretKey"
                      class="w-full h-9 border rounded-md px-3"
                      placeholder="sk_..."
                    />
                  </div>
                </template>
                <template v-else>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1"
                      >API Key</label
                    >
                    <input
                      v-model="form.apiKey"
                      class="w-full h-9 border rounded-md px-3"
                      placeholder="sk_..."
                    />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1"
                      >BaseUrl</label
                    >
                    <input
                      v-model="form.baseUrl"
                      class="w-full h-9 border rounded-md px-3"
                      placeholder="https://api.example.com"
                    />
                  </div>
                </template>
                <div class="lg:col-span-2">
                  <label class="block text-xs text-gray-600 mb-1">{{ t('alias_label') }}</label>
                  <input
                    v-model="form.alias"
                    class="w-full h-9 border rounded-md px-3"
                    :placeholder="t('alias_placeholder')"
                  />
                </div>
                <div class="lg:col-span-2">
                  <label class="block text-xs text-gray-600 mb-1">{{ t('models_label') }}</label>
                  <input
                    v-model="form.models"
                    class="w-full h-9 border rounded-md px-3"
                    :placeholder="t('models_placeholder')"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">{{ t('title_label') }}</label>
                  <input
                    v-model="form.title"
                    class="w-full h-9 border rounded-md px-3"
                    :placeholder="t('title_placeholder')"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">{{ t('avatar_label') }}</label>
                  <input
                    v-model="form.avatar"
                    class="w-full h-9 border rounded-md px-3"
                    :placeholder="t('avatar_placeholder')"
                  />
                </div>
                <div class="lg:col-span-2">
                  <label class="block text-xs text-gray-600 mb-1">{{ t('desc_label') }}</label>
                  <input
                    v-model="form.desc"
                    class="w-full h-9 border rounded-md px-3"
                    :placeholder="t('desc_placeholder')"
                  />
                </div>
              </div>
                  <div class="flex gap-3 justify-end mt-4">
                    <button class="btn-primary px-4 py-2" type="button" :disabled="!validAdd" @click="addProvider">{{ t('add') }}</button>
                    <DialogClose asChild>
                <button class="px-3 py-1 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300" type="button" @click="cancelAdd">{{ t('cancel') }}</button>
                    </DialogClose>
                  </div>
                </DialogContent>
              </DialogPortal>
            </DialogRoot>
          </div>
          <div
            class="grid sm:grid-cols-1 md:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6 items-start"
          >
            <details
              v-if="hasProvider('dashscope')"
              id="dashscope"
              class="glass p-4 rounded-xl shadow-sm self-start"
              open
            >
              <summary class="cursor-pointer font-medium">
                {{ t('dashscope_title') }}
              </summary>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">{{ t('api_key') }}</label>
                  <input
                    v-model="providers.dashscope.apiKey"
                    class="w-full h-9 bg-white border border-gray-200 rounded-lg px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                    placeholder="ak_..."
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">{{ t('base_url') }}</label>
                  <input
                    v-model="providers.dashscope.baseUrl"
                    class="w-full h-9 bg-white border border-gray-200 rounded-lg px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                    placeholder="https://dashscope.aliyuncs.com/compatible-mode/v1"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">{{ t('title_label') }}</label>
                  <input
                    v-model="providers.dashscope.title"
                    class="w-full h-9 bg-white border border-gray-200 rounded-lg px-3 shadow-sm"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">{{ t('avatar_label') }}</label>
                  <input
                    v-model="providers.dashscope.avatar"
                    class="w-full h-9 bg-white border border-gray-200 rounded-lg px-3 shadow-sm"
                  />
                </div>
                <div class="lg:col-span-2">
                  <label class="block text-xs text-gray-600 mb-1">{{ t('models_label') }}</label>
                  <input
                    :value="toModelsString(providers.dashscope.models)"
                    @input="
                      setModels(
                        'dashscope',
                        ($event.target as HTMLInputElement).value
                      )
                    "
                    class="w-full h-9 border border-gray-300 rounded-md px-3"
                  />
                </div>
                <div class="lg:col-span-2 flex justify-end">
                   <button
                     class="px-3 py-1 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300"
                     type="button"
                     @click="removeProvider('dashscope')"
                   >
                    {{ t('remove') }}
                  </button>
                </div>
              </div>
            </details>

            <details
              v-if="hasProvider('qianfan')"
              id="qianfan"
              class="glass p-4 rounded-xl shadow-sm self-start"
            >
              <summary class="cursor-pointer font-medium">
                {{ t('qianfan_title') }}
              </summary>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">{{ t('access_key') }}</label>
                  <input
                    v-model="providers.qianfan.accessKey"
                    class="w-full h-9 border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-[#34C759]/30"
                    placeholder="ak_..."
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">{{ t('secret_key') }}</label>
                  <input
                    v-model="providers.qianfan.secretKey"
                    class="w-full h-9 border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-[#34C759]/30"
                    placeholder="sk_..."
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">{{ t('title_label') }}</label>
                  <input
                    v-model="providers.qianfan.title"
                    class="w-full h-9 border border-gray-300 rounded-md px-3"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">{{ t('avatar_label') }}</label>
                  <input
                    v-model="providers.qianfan.avatar"
                    class="w-full h-9 border border-gray-300 rounded-md px-3"
                  />
                </div>
                <div class="lg:col-span-2">
                  <label class="block text-xs text-gray-600 mb-1">{{ t('models_label') }}</label>
                  <input
                    :value="toModelsString(providers.qianfan.models)"
                    @input="
                      setModels(
                        'qianfan',
                        ($event.target as HTMLInputElement).value
                      )
                    "
                    class="w-full h-9 border border-gray-300 rounded-md px-3"
                  />
                </div>
                <div class="lg:col-span-2 flex justify-end">
                   <button
                     class="px-3 py-1 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300"
                     type="button"
                     @click="removeProvider('qianfan')"
                   >
                    {{ t('remove') }}
                  </button>
                </div>
              </div>
            </details>

            <details
              v-if="hasProvider('openai')"
              id="openai"
              class="glass p-4 rounded-xl shadow-sm self-start"
            >
              <summary class="cursor-pointer font-medium">{{ t('openai_title') }}</summary>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">{{ t('api_key') }}</label>
                  <input
                    v-model="providers.openai.apiKey"
                    class="w-full h-9 border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-[#34C759]/30"
                    placeholder="sk-..."
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">{{ t('base_url') }}</label>
                  <input
                    v-model="providers.openai.baseUrl"
                    class="w-full h-9 border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-[#34C759]/30"
                    placeholder="https://api.openai.com/v1"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">{{ t('title_label') }}</label>
                  <input
                    v-model="providers.openai.title"
                    class="w-full h-9 border border-gray-300 rounded-md px-3"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">{{ t('avatar_label') }}</label>
                  <input
                    v-model="providers.openai.avatar"
                    class="w-full h-9 border border-gray-300 rounded-md px-3"
                  />
                </div>
                <div class="lg:col-span-2">
                  <label class="block text-xs text-gray-600 mb-1">{{ t('models_label') }}</label>
                  <input
                    :value="toModelsString(providers.openai.models)"
                    @input="
                      setModels(
                        'openai',
                        ($event.target as HTMLInputElement).value
                      )
                    "
                    class="w-full h-9 border border-gray-300 rounded-md px-3"
                  />
                </div>
                <div class="lg:col-span-2 flex justify-end">
                   <button
                     class="px-3 py-1 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300"
                     type="button"
                     @click="removeProvider('openai')"
                   >
                    {{ t('remove') }}
                  </button>
                </div>
              </div>
            </details>

            <template v-for="key in openaiCustomKeys" :key="key">
              <details :id="key" class="glass p-4 rounded-xl shadow-sm self-start">
                <summary class="cursor-pointer font-medium">
                  {{ providers[key].title || t('openai_title') }}（{{ key }}）
                </summary>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label class="block text-xs text-gray-600 mb-1"
                      >API Key</label
                    >
                    <input
                      v-model="providers[key].apiKey"
                      class="w-full h-9 border border-gray-300 rounded-md px-3"
                      placeholder="sk-..."
                    />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1"
                      >BaseUrl</label
                    >
                    <input
                      v-model="providers[key].baseUrl"
                      class="w-full h-9 border border-gray-300 rounded-md px-3"
                      placeholder="https://api.example.com"
                    />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">标题</label>
                    <input
                      v-model="providers[key].title"
                      class="w-full h-9 border border-gray-300 rounded-md px-3"
                    />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1"
                      >头像URL</label
                    >
                    <input
                      v-model="providers[key].avatar"
                      class="w-full h-9 border border-gray-300 rounded-md px-3"
                    />
                  </div>
                  <div class="lg:col-span-2">
                    <label class="block text-xs text-gray-600 mb-1"
                      >模型列表（逗号分隔）</label
                    >
                    <input
                      :value="toModelsString(providers[key].models)"
                      @input="
                        setModels(
                          key,
                          ($event.target as HTMLInputElement).value
                        )
                      "
                      class="w-full h-9 border border-gray-300 rounded-md px-3"
                    />
                  </div>
                  <div class="lg:col-span-2 flex justify-end">
                    <button
                      class="px-3 py-1 border rounded-md"
                      type="button"
                      @click="removeProvider(key)"
                    >
                    {{ t('remove') }}
                    </button>
                  </div>
                </div>
              </details>
            </template>

            <template v-for="key in dashscopeCustomKeys" :key="key">
              <details :id="key" class="glass p-4 rounded-xl shadow-sm self-start">
                <summary class="cursor-pointer font-medium">
                  {{ providers[key].title || t('dashscope_title') }}（{{ key }}）
                </summary>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label class="block text-xs text-gray-600 mb-1"
                      >API Key</label
                    >
                    <input
                      v-model="providers[key].apiKey"
                      class="w-full h-9 border border-gray-300 rounded-md px-3"
                      placeholder="ak_..."
                    />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1"
                      >BaseUrl</label
                    >
                    <input
                      v-model="providers[key].baseUrl"
                      class="w-full h-9 border border-gray-300 rounded-md px-3"
                      placeholder="https://dashscope.aliyuncs.com/compatible-mode/v1"
                    />
                  </div>
                  <div class="lg:col-span-2">
                    <label class="block text-xs text-gray-600 mb-1"
                      >模型列表（逗号分隔）</label
                    >
                    <input
                      :value="toModelsString(providers[key].models)"
                      @input="
                        setModels(
                          key,
                          ($event.target as HTMLInputElement).value
                        )
                      "
                      class="w-full h-9 border border-gray-300 rounded-md px-3"
                    />
                  </div>
                  <div class="lg:col-span-2 flex justify-end">
                    <button
                      class="px-3 py-1 border rounded-md"
                      type="button"
                      @click="removeProvider(key)"
                    >
                      移除
                    </button>
                  </div>
                </div>
              </details>
            </template>

            <template v-for="key in deepseekCustomKeys" :key="key">
              <details :id="key" class="glass p-4 rounded-xl shadow-sm self-start">
                <summary class="cursor-pointer font-medium">
                  {{ providers[key].title || t('deepseek_title') }}（{{ key }}）
                </summary>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label class="block text-xs text-gray-600 mb-1"
                      >API Key</label
                    >
                    <input
                      v-model="providers[key].apiKey"
                      class="w-full h-9 border border-gray-300 rounded-md px-3"
                      placeholder="ds_..."
                    />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1"
                      >BaseUrl</label
                    >
                    <input
                      v-model="providers[key].baseUrl"
                      class="w-full h-9 border border-gray-300 rounded-md px-3"
                      placeholder="https://api.deepseek.com"
                    />
                  </div>
                  <div class="lg:col-span-2">
                    <label class="block text-xs text-gray-600 mb-1"
                      >模型列表（逗号分隔）</label
                    >
                    <input
                      :value="toModelsString(providers[key].models)"
                      @input="
                        setModels(
                          key,
                          ($event.target as HTMLInputElement).value
                        )
                      "
                      class="w-full h-9 border border-gray-300 rounded-md px-3"
                    />
                  </div>
                  <div class="lg:col-span-2 flex justify-end">
                    <button
                      class="px-3 py-1 border rounded-md"
                      type="button"
                      @click="removeProvider(key)"
                    >
                      移除
                    </button>
                  </div>
                </div>
              </details>
            </template>

            <template v-for="key in qianfanCustomKeys" :key="key">
              <details :id="key" class="glass p-4 rounded-xl shadow-sm self-start">
                <summary class="cursor-pointer font-medium">
                  {{ providers[key].title || t('qianfan_title') }}（{{ key }}）
                </summary>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label class="block text-xs text-gray-600 mb-1"
                      >Access Key</label
                    >
                    <input
                      v-model="providers[key].accessKey"
                      class="w-full h-9 border border-gray-300 rounded-md px-3"
                      placeholder="ak_..."
                    />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1"
                      >Secret Key</label
                    >
                    <input
                      v-model="providers[key].secretKey"
                      class="w-full h-9 border border-gray-300 rounded-md px-3"
                      placeholder="sk_..."
                    />
                  </div>
                  <div class="lg:col-span-2">
                    <label class="block text-xs text-gray-600 mb-1"
                      >模型列表（逗号分隔）</label
                    >
                    <input
                      :value="toModelsString(providers[key].models)"
                      @input="
                        setModels(
                          key,
                          ($event.target as HTMLInputElement).value
                        )
                      "
                      class="w-full h-9 border border-gray-300 rounded-md px-3"
                    />
                  </div>
                  <div class="lg:col-span-2 flex justify-end">
                    <button
                      class="px-3 py-1 border rounded-md"
                      type="button"
                      @click="removeProvider(key)"
                    >
                      移除
                    </button>
                  </div>
                </div>
              </details>
            </template>

            <details
              v-if="hasProvider('deepseek')"
              id="deepseek"
              class="glass p-4 rounded-xl shadow-sm self-start"
            >
              <summary class="cursor-pointer font-medium">{{ t('deepseek_title') }}</summary>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">{{ t('api_key') }}</label>
                  <input
                    v-model="providers.deepseek.apiKey"
                    class="w-full h-9 border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-[#34C759]/30"
                    placeholder="ds_..."
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">{{ t('base_url') }}</label>
                  <input
                    v-model="providers.deepseek.baseUrl"
                    class="w-full h-9 border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-[#34C759]/30"
                    placeholder="https://api.deepseek.com"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">{{ t('title_label') }}</label>
                  <input
                    v-model="providers.deepseek.title"
                    class="w-full h-9 border border-gray-300 rounded-md px-3"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">{{ t('avatar_label') }}</label>
                  <input
                    v-model="providers.deepseek.avatar"
                    class="w-full h-9 border border-gray-300 rounded-md px-3"
                  />
                </div>
                <div class="lg:col-span-2">
                  <label class="block text-xs text-gray-600 mb-1">{{ t('models_label') }}</label>
                  <input
                    :value="toModelsString(providers.deepseek.models)"
                    @input="
                      setModels(
                        'deepseek',
                        ($event.target as HTMLInputElement).value
                      )
                    "
                    class="w-full h-9 border border-gray-300 rounded-md px-3"
                  />
                </div>
                <div class="lg:col-span-2 flex justify-end">
                   <button
                     class="px-3 py-1 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300"
                     type="button"
                     @click="removeProvider('deepseek')"
                   >
                    {{ t('remove') }}
                  </button>
                </div>
              </div>
            </details>

            <details
              v-if="hasProvider('claude')"
              id="claude"
              class="glass p-4 rounded-xl shadow-sm self-start"
            >
              <summary class="cursor-pointer font-medium">{{ t('claude_title') }}</summary>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">{{ t('api_key') }}</label>
                  <input
                    v-model="providers.claude.apiKey"
                    class="w-full h-9 border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-[#34C759]/30"
                    placeholder="..."
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">{{ t('base_url') }}</label>
                  <input
                    v-model="providers.claude.baseUrl"
                    class="w-full h-9 border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-[#34C759]/30"
                    placeholder="https://api.anthropic.com"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">{{ t('title_label') }}</label>
                  <input
                    v-model="providers.claude.title"
                    class="w-full h-9 border border-gray-300 rounded-md px-3"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">{{ t('avatar_label') }}</label>
                  <input
                    v-model="providers.claude.avatar"
                    class="w-full h-9 border border-gray-300 rounded-md px-3"
                  />
                </div>
                <div class="lg:col-span-2">
                  <label class="block text-xs text-gray-600 mb-1">{{ t('models_label') }}</label>
                  <input
                    :value="toModelsString(providers.claude.models)"
                    @input="
                      setModels(
                        'claude',
                        ($event.target as HTMLInputElement).value
                      )
                    "
                    class="w-full h-9 border border-gray-300 rounded-md px-3"
                  />
                </div>
                <div class="lg:col-span-2 flex justify-end">
                   <button
                     class="px-3 py-1 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300"
                     type="button"
                     @click="removeProvider('claude')"
                   >
                    {{ t('remove') }}
                  </button>
                </div>
              </div>
            </details>
          </div>

        <div class="flex gap-3 justify-end mt-4">
          <button class="btn-primary px-4 py-2" @click="save">
            {{ t("save") }}
          </button>
          <button class="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300" @click="reset">
            {{ t("reset") }}
          </button>
        </div>
        </div>
      </section>

      <aside class="hidden lg:block lg:col-span-3 xl:col-span-3">
        <div class="glass rounded-2xl p-6 space-y-4 h-full">
          <details class="glass p-4 rounded-xl shadow-sm self-start" open>
            <summary class="cursor-pointer font-medium">{{ t('quick_nav') }}</summary>
            <ul class="text-sm text-gray-600 space-y-2 mt-3">
              <li><a class="hover:text-black" href="#dashscope">通义千问</a></li>
              <li><a class="hover:text-black" href="#qianfan">文心一言</a></li>
              <li><a class="hover:text-black" href="#openai">OpenAI</a></li>
              <li><a class="hover:text-black" href="#deepseek">DeepSeek</a></li>
              <li><a class="hover:text-black" href="#claude">Claude</a></li>
            </ul>
          </details>
          <details class="glass p-4 rounded-xl shadow-sm self-start" open>
            <summary class="cursor-pointer font-medium">{{ t('tips_title') }}</summary>
            <ul class="text-sm text-gray-600 space-y-2 mt-3">
              <li>{{ t('tip_local_only') }}</li>
              <li>{{ t('tip_baseurl') }}</li>
              <li>{{ t('tip_apply_immediately') }}</li>
            </ul>
          </details>
          <details class="glass p-4 rounded-xl shadow-sm self-start" open>
            <summary class="cursor-pointer font-medium">{{ t('config_docs') }}</summary>
            <ul class="text-sm text-gray-600 space-y-2 mt-3">
              <li><a class="hover:text-black" href="#" @click.prevent="openDoc('openai')">{{ t('docs_openai') }}</a></li>
              <li><a class="hover:text-black" href="#" @click.prevent="openDoc('deepseek')">{{ t('docs_deepseek') }}</a></li>
              <li><a class="hover:text-black" href="#" @click.prevent="openDoc('claude')">{{ t('docs_claude') }}</a></li>
              <li><a class="hover:text-black" href="#" @click.prevent="openDoc('qianfan')">{{ t('docs_qianfan') }}</a></li>
              <li><a class="hover:text-black" href="#" @click.prevent="openDoc('dashscope')">{{ t('docs_dashscope') }}</a></li>
              <li><a class="hover:text-black" href="#" @click.prevent="openDoc('openai_compat')">{{ t('docs_openai_compat') }}</a></li>
            </ul>
          </details>
        </div>
      </aside>
    </div>
  </div>
</template>
<script setup lang="ts">
// 说明：
// - 所有配置通过 preload 暴露的 electronAPI 与主进程交互进行持久化；
// - providers 支持标准键（dashscope/qianfan/openai/deepseek/claude）与自定义键（带别名后缀），用于同一类型多套配置；
// - 保存时主进程会将用户配置写入系统用户目录，并对模板进行脱敏写回。
import { ref, onMounted, computed } from "vue";
import {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogClose,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectItem,
  SelectItemText,
} from "radix-vue";
import { t, setLang } from "@/locales";
// 当前 UI 语言（影响文案与方向）：来自配置并可保存
const language = ref("zh-CN");
// 全局字号：通过 applyFont 应用到根元素，影响整体缩放
const fontSize = ref(14);
// Provider 配置聚合：标准键 + 自定义别名键（如 openai_lab）
// 保存时写入用户目录；模板文件始终脱敏
const providers = ref<any>({
  dashscope: {},
  qianfan: {},
  openai: {},
  deepseek: {},
  claude: {},
});
// 新增对话框显隐
const showAdd = ref(false);
// 新增的 Provider 类型：控制表单字段显示
const newType = ref<"dashscope" | "qianfan" | "openai" | "deepseek" | "claude">(
  "openai"
);
// 新增/编辑 Provider 的表单数据：
// - OpenAI/DeepSeek/Claude 使用 apiKey/baseUrl
// - Qianfan 使用 accessKey/secretKey
// - models/title/avatar/desc/alias 用于展示与多实例区分
const form = ref<{
  apiKey?: string;
  baseUrl?: string;
  accessKey?: string;
  secretKey?: string;
  models?: string;
  title?: string;
  avatar?: string;
  desc?: string;
  alias?: string;
}>({});
// 初始化：从主进程读取配置并应用到页面
async function load() {
  const cfg = await (window as any).electronAPI.getConfig();
  language.value = cfg.language;
  fontSize.value = cfg.fontSize;
  providers.value = normalizeProviders(cfg.providers);
  applyFont();
}
// 应用字号到根元素，统一缩放
function applyFont() {
  document.documentElement.style.fontSize = `${fontSize.value}px`;
}
// 保存配置到主进程，并刷新本地状态与语言包
async function save() {
  const safeProviders = JSON.parse(JSON.stringify(providers.value));
  const next = await (window as any).electronAPI.setConfig({
    language: language.value,
    fontSize: fontSize.value,
    providers: safeProviders,
  });
  // 更新本地状态与语言，并应用字号
  language.value = next.language;
  fontSize.value = next.fontSize;
  providers.value = normalizeProviders(next.providers);
  applyFont();
  setLang(next.language);
}
// 重置为默认配置并保存
async function reset() {
  language.value = "zh-CN";
  fontSize.value = 14;
  providers.value = normalizeProviders({});
  applyFont();
  await save();
}
function openDoc(type: string) {
  // 文档链接映射：统一在系统浏览器中打开，避免应用内导航
  const map: Record<string, string> = {
    openai: 'https://platform.openai.com/docs/overview',
    deepseek: 'https://api-docs.deepseek.com/',
    claude: 'https://docs.anthropic.com/claude',
    qianfan: 'https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html',
    dashscope: 'https://dashscope.aliyun.com/',
    openai_compat: 'https://help.aliyun.com/zh/model-studio/install-sdk?spm=a2c4g.11186623.help-menu-2400256.d_2_0_2.2f7d11fcn5ArWa&scm=20140722.H_2712193._.OR_help-T_cn~zh-V_1#77db53c233mol',
  }
  const url = map[type] || 'https://dashscope.aliyun.com/'
  ;(window as any).electronAPI.openExternal(url)
}
// 规范化 providers：保留标准键并收集自定义键（pattern: <type>_<alias>）
function normalizeProviders(p: any) {
  // 规范化：保证标准键存在，收集所有 <type>_<alias> 的自定义实例
  const base = {
    dashscope: (p && p.dashscope) || {},
    qianfan: (p && p.qianfan) || {},
    openai: (p && p.openai) || {},
    deepseek: (p && p.deepseek) || {},
    claude: (p && p.claude) || {},
  } as any
  if (p && typeof p === 'object') {
    Object.keys(p).forEach((k) => {
      if (/^(dashscope|qianfan|openai|deepseek|claude)_/.test(k)) base[k] = p[k]
    })
  }
  return base
}
// 打开新增配置对话框，并自动选择尚未存在的类型
function openAdd() {
  showAdd.value = true;
  const order = ["dashscope", "qianfan", "openai", "deepseek", "claude"];
  if (hasProvider(newType.value)) {
    const nextType = order.find((t) => !hasProvider(t));
    if (nextType) newType.value = nextType as any;
  }
}
// 取消新增并清理表单
function cancelAdd() {
  showAdd.value = false;
  form.value = {};
}
// 新增 Provider 配置：按类型生成别名键并写入 providers
async function addProvider() {
  const k = newType.value;
  const p: any = providers.value;
  const modelsList = (form.value.models || "")
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
  if (k === "qianfan") {
    p.qianfan = {
      ...(p.qianfan || {}),
      accessKey: form.value.accessKey || p.qianfan?.accessKey,
      secretKey: form.value.secretKey || p.qianfan?.secretKey,
      models: modelsList.length ? modelsList : p.qianfan?.models,
      title: form.value.title || p.qianfan?.title,
      avatar: form.value.avatar || p.qianfan?.avatar,
      desc: form.value.desc || p.qianfan?.desc,
    };
  } else if (k === "dashscope") {
    const alias = (form.value.alias || `${Date.now()}`).replace(/\s+/g, "-");
    const key = `dashscope_${alias}`;
    const cur = p[key] || {};
    p[key] = {
      ...cur,
      apiKey: form.value.apiKey || cur.apiKey,
      baseUrl: form.value.baseUrl || cur.baseUrl,
      models: modelsList.length ? modelsList : (cur.models || ["qwen-turbo"]),
      title: form.value.title || cur.title || "通义千问",
      avatar: form.value.avatar || cur.avatar,
      desc: form.value.desc || cur.desc,
    };
  } else if (k === "deepseek") {
    const alias = (form.value.alias || `${Date.now()}`).replace(/\s+/g, "-");
    const key = `deepseek_${alias}`;
    const cur = p[key] || {};
    p[key] = {
      ...cur,
      apiKey: form.value.apiKey || cur.apiKey,
      baseUrl: form.value.baseUrl || cur.baseUrl,
      models: modelsList.length ? modelsList : (cur.models || ["deepseek-chat"]),
      title: form.value.title || cur.title || "DeepSeek",
      avatar: form.value.avatar || cur.avatar,
      desc: form.value.desc || cur.desc,
    };
  } else if (k === "openai") {
    const alias = (form.value.alias || `${Date.now()}`).replace(/\s+/g, "-");
    const key = `openai_${alias}`;
    const cur = p[key] || {};
    p[key] = {
      ...cur,
      apiKey: form.value.apiKey || cur.apiKey,
      baseUrl: form.value.baseUrl || cur.baseUrl,
      models: modelsList.length
        ? modelsList
        : cur.models || ["gpt-4o-mini", "gpt-4o"],
      title: form.value.title || cur.title || "OpenAI",
      avatar: form.value.avatar || cur.avatar,
      desc: form.value.desc || cur.desc,
    };
  } else if (k === "claude") {
    const alias = (form.value.alias || `${Date.now()}`).replace(/\s+/g, "-");
    const key = `claude_${alias}`;
    const cur = p[key] || {};
    p[key] = {
      ...cur,
      apiKey: form.value.apiKey || cur.apiKey,
      baseUrl: form.value.baseUrl || cur.baseUrl,
      models: modelsList.length ? modelsList : (cur.models || ["claude-3-5-sonnet-latest"]),
      title: form.value.title || cur.title || "Claude",
      avatar: form.value.avatar || cur.avatar,
      desc: form.value.desc || cur.desc,
    };
  }
  providers.value = { ...p };
  await save();
  showAdd.value = false;
  form.value = {};
}
// 将模型数组序列化为逗号分隔字符串
function toModelsString(arr?: string[]) {
  return Array.isArray(arr) ? arr.join(",") : "";
}
// 更新指定键的模型列表
function setModels(key: string, s: string) {
  const list = s
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
  const p: any = providers.value;
  if (!p[key]) p[key] = {};
  p[key].models = list;
  providers.value = { ...p };
}
// 移除指定键的 Provider 配置
async function removeProvider(key: string) {
  const p: any = providers.value;
  p[key] = {};
  providers.value = { ...p };
  await save();
}
// 判断某 Provider 是否已有配置
function hasProvider(key: string) {
  const p: any = providers.value;
  const v = p[key];
  return !!(v && Object.keys(v).length > 0);
}
const openaiCustomKeys = computed(() => {
  const p: any = providers.value;
  return Object.keys(p).filter(
    (k) => k.startsWith("openai_") && Object.keys(p[k] || {}).length > 0
  );
});
const dashscopeCustomKeys = computed(() => {
  const p: any = providers.value;
  return Object.keys(p).filter(
    (k) => k.startsWith("dashscope_") && Object.keys(p[k] || {}).length > 0
  );
});
const deepseekCustomKeys = computed(() => {
  const p: any = providers.value;
  return Object.keys(p).filter(
    (k) => k.startsWith("deepseek_") && Object.keys(p[k] || {}).length > 0
  );
});
const qianfanCustomKeys = computed(() => {
  const p: any = providers.value;
  return Object.keys(p).filter(
    (k) => k.startsWith("qianfan_") && Object.keys(p[k] || {}).length > 0
  );
});
const typeExists = computed(() => false);
const validAdd = computed(() => {
  if (newType.value === "qianfan")
    return !!form.value.accessKey && !!form.value.secretKey;
  return !!form.value.apiKey;
});
onMounted(load);
</script>
