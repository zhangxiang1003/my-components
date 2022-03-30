import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/home.vue')
  },
  {
    path: '/button',
    name: 'Button',
    component: () => import(/* webpackChunkName: "about" */ '../views/button.vue')
  },
  {
    path: '/num',
    name: 'Number',
    component: () => import('../views/number.vue')
  },
]

const router = new VueRouter({
  routes
})

export default router
