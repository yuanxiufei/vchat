<!-- 消息列表组件：渲染问题与答案，增强 mermaid 流程图与 Monaco 代码块，支持图片预览与自动滚动到底部 -->
<template>
    <!-- 消息列表：包含问题与答案，答案使用 Markdown 渲染并增强 mermaid/代码显示 -->
    <div class="message-list" ref="root">
        <div class="message-item mb-3" v-for="message in messages" :key="message.id">
            <div class="flex" :class="{ 'justify-end': message.type === 'question' }">
                <div class="w-full max-w-2xl">
                    <div class="text-sm text-gray-500 mb-2" :class="{ 'text-right': message.type === 'question' }">
                        {{ message.createdAt }}
                    </div>
                    <div class="message-question bg-[#34C759] text-white px-3 py-2 rounded-2xl shadow-sm"
                        v-if="message.type === 'question'">
                        <img v-if="message.imagePath" :src="`safe-file://${encodeURIComponent(message.imagePath)}`" alt="图片" class="w-12 h-12 object-cover cursor-zoom-in" @click="openImage(message.imagePath)" />
                        {{ message.content }}
                    </div>
                    <div class="message-answer surface text-gray-800 px-3 py-2" v-else>
                        <!-- 加载中：显示三点动画 -->
                        <template v-if="message.status === 'loading'">
                            <Icon icon="eos-icons:three-dots-loading" class="w-6 h-6"></Icon>
                        </template>
                        <!-- 非加载：prose 排版 + Markdown 渲染；mermaid/monaco 由脚本增强 -->
                        <div v-else class="prose prose-slate max-w-none w-full prose-headings:my-1 prose-li:my-0 prose-ul:my-1 prose-pre:p-0">
                            <img v-if="message.imagePath" :src="`safe-file://${encodeURIComponent(message.imagePath)}`" alt="图片" class="max-w-full rounded-md my-2 cursor-zoom-in" @click="openImage(message.imagePath)" />
                            <MarkdownRender :content="renderContent(message)" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-if="previewSrc" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" @click="previewSrc=null">
      <img :src="previewSrc" class="max-w-[90vw] max-h-[90vh] rounded shadow-lg" @click.stop />
    </div>
</template>
<script setup lang="ts">
// 类型与组件
import { MessageProps } from "@/types/appType";
import { Icon } from "@iconify/vue";
import MarkdownRender from "vue-renderer-markdown";
import { t } from '@/locales'
import "vue-renderer-markdown/index.css";
// 增强：生命周期与容器引用
import { onMounted, nextTick, ref, watch } from "vue";
// 增强：流程图与代码编辑器
import mermaid from "mermaid";
import * as monaco from "monaco-editor";
// 接收消息列表
const props = defineProps<{
    messages: MessageProps[];
}>();
// 根容器：渲染后用于选择内部 DOM 进行增强
const root = ref<HTMLElement | null>(null);
const previewSrc = ref<string | null>(null)
// mermaid 初始化为手动模式，避免抢占渲染流程
mermaid.initialize({ startOnLoad: false });
// 每次内容更新后：增强 mermaid 与 monaco 渲染
async function enhance() {
    const el = root.value;
    if (!el) return;
    // 查找 mermaid 代码块：支持 ```mermaid 与 .mermaid 容器
    const mermaidBlocks = el.querySelectorAll(".language-mermaid, .mermaid");
    if (mermaidBlocks.length) {
        await mermaid.run({ nodes: Array.from(mermaidBlocks) as HTMLElement[] });
    }
    // 查找需要用 Monaco 展示的代码块：语言前缀使用 language-monaco-<lang>
    const monacoBlocks = el.querySelectorAll(
        'pre > code[class*="language-monaco-"]'
    );
    monacoBlocks.forEach((code) => {
        const pre = code.parentElement as HTMLElement;
        if (!pre) return;
        // 从类名推断语言：如 language-monaco-ts / language-monaco-js
        const langClass =
            Array.from(code.classList).find((c) =>
                c.startsWith("language-monaco-")
            ) || "language-monaco-text";
        const language = langClass.replace("language-monaco-", "") || "text";
        const value = code.textContent || "";
        // 替换原 <pre> 为 Monaco 容器
        const mount = document.createElement("div");
        mount.style.height = "100%";
        mount.style.borderRadius = "0.375rem";
        mount.style.display = "block";
        mount.style.width = "100%";
        mount.style.boxSizing = "border-box";
        pre.replaceWith(mount);
        // 只读编辑器，自动布局，关闭迷你地图
        const editor = monaco.editor.create(mount, {
            value,
            language,
            readOnly: true,
            wordWrap: "on",
            automaticLayout: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
        });
        const updateHeight = () => {
            const h = editor.getContentHeight();
            const height = Math.max(200, Math.min(h, 800));
            mount.style.height = height + "px";
            editor.layout();
        };
    editor.onDidContentSizeChange(updateHeight);
    updateHeight();
  });

  const imgs = el.querySelectorAll('img')
  imgs.forEach((img) => {
    const src = img.getAttribute('src') || ''
    if (/^https?:\/\//i.test(src)) {
      img.addEventListener('error', async () => {
        try {
          const dataUrl = await (window as any).electronAPI.fetchImageAsDataUrl(src)
          img.setAttribute('src', dataUrl)
        } catch {}
      }, { once: true })
    }
  })
}
// 初次挂载：等待 DOM 完成后增强
onMounted(async () => {
    await nextTick();
    await enhance();
});
// 消息变更：等待渲染完成后再次增强
watch(
    () => props.messages,
    async () => {
        await nextTick();
        await enhance();
    }
);
// 滚动到消息列表底部
function scrollToBottom() {
    const el = root.value;
    if (!el) return;
    const doScroll = () => {
        el.scrollTop = el.scrollHeight;
        el.scrollTo({ top: el.scrollHeight, behavior: 'auto' });
        (el.lastElementChild as HTMLElement | null)?.scrollIntoView({ block: 'end' });
    };
    requestAnimationFrame(() => {
        doScroll();
        setTimeout(doScroll, 50);
    });
}
// 内容修整：
// - 数学公式中的中文冒号处理，避免渲染异常
// - 将外链图片替换为 safe-image 代理，普通链接保留可点击
function renderContent(message: any) {
  const src = String(message?.content ?? '')
  const fix = (s: string) => s.replace(/：/g, '\\text{：}')
  let out = src
    .replace(/\$\$([\s\S]*?)\$\$/g, (_m, inner) => `$$${fix(inner)}$$`)
    .replace(/\$([^$]+)\$/g, (_m, inner) => `$${fix(inner)}$`)

  out = out.replace(/!\[([^\]]*)\]\((https?:[^\s)]+)\)/g, (_m, alt, url) => {
    const isImg = /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(url)
    if (isImg) return `![${alt}](${`safe-image://${encodeURIComponent(url)}`})`
    return `[${alt || t('link')}](${url})`
  })

  out = out.replace(/!\s*`(https?:[^\s`]+)`/g, (_m, url) => `[链接](${url})`)
  out = out.replace(/!\s*(https?:[^\s)]+)(?!\))/g, (_m, url) => `[链接](${url})`)

  out = out.replace(/<img\s+([^>]*?)src=["'](https?:[^"']+)["']([^>]*?)>/g, (_m, pre, url, post) => {
    const isImg = /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(url)
    if (isImg) return `<img ${pre}src="${`safe-image://${encodeURIComponent(url)}`}"${post}>`
    return `<a href="${url}" target="_blank" rel="noopener">${t('link')}</a>`
  })

  return out
}
// 点击图片进入大图预览层
function openImage(p: string) {
  if (!p) return
  previewSrc.value = `safe-file://${encodeURIComponent(p)}`
}
defineExpose({ ref: root, scrollToBottom });
</script>
<style scoped>
.message-list {
    height: 100%;
    overflow-y: auto;
    scrollbar-width: none;
    /* Firefox */
    -ms-overflow-style: none;
    /* IE 10+ */
}

.message-list::-webkit-scrollbar {
    display: none;
    /* Chrome/Safari/Webkit */
}

/* 让代码块在答案容器中自适应宽度 */
:deep(pre) {
    width: 100%;
    overflow-x: auto;
}

:deep(.monaco-editor),
:deep(.monaco-editor-container) {
    width: 100% !important;
}
</style>

