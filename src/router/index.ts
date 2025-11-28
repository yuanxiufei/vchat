import { createRouter, createMemoryHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import Conversation from '@/views/Conversation.vue';
import Settings from '@/views/Settings.vue';
import { useConversationStore } from '@/stores/conversation';

const routes = [
  { path: '/', component: Home },
  { path: '/conversation', component: Conversation },
  { path: '/settings', component: Settings }
]
const router = createRouter({
  history: createMemoryHistory(),
  routes
})

// 路由守卫
// 当路由切换时，判断是否是对话路由
// 如果不是，则将选中的对话ID设置为-1
// 如果是，则将选中的对话ID设置为路由中的ID
router.beforeEach((to) => {
    const store = useConversationStore()
    if(!to.path.startsWith('/conversation')){
        store.selectedId = -1
    }
})


export default router
