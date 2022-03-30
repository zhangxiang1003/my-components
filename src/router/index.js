import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/button',
    name: 'Button',
    component: () => import(/* webpackChunkName: "about" */ '../views/Button.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
