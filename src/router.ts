import { createRouter, createWebHistory } from 'vue-router'
import Home from './Home.vue'

const modules = import.meta.glob('./pages/*.vue')

const routes = Object.keys(modules).map((path) => {
  const match = path.match(/\.\/pages\/(.*)\.vue$/)
  const name = match ? match[1] : ''
  return {
    path: `/${name}`,
    name,
    component: modules[path]
  }
})

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    ...routes,
  ]
})

export default router
