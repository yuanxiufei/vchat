import { createRouter, createMemoryHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import Conversation from '@/views/Conversation.vue';
import Settings from '@/views/Settings.vue';
const routes = [
  { path: '/', component: Home },
  { path: '/conversation', component: Conversation },
  { path: '/settings', component: Settings }
]
const router = createRouter({
  history: createMemoryHistory(),
  routes
})

// router.beforeEach((to) => {
//   const store = useConversationStore()
//   console.log('path', to.path)
//   if (!to.path.startsWith('/conversation/')) {
//     store.selectedId = -1
//   }
// })


export default router