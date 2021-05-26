import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from 'vue-auto-routing'
import { createRouterLayout } from 'vue-router-layout'

const RouterLayout = createRouterLayout((layout) => import(`@/layouts/${layout}.vue`))

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  scrollBehavior () {
    const el = document.querySelector('body')
    if (el) {
      document.body.scrollTop = 0 // For Safari
      el.scrollTop = 0
    } else {
      // return
    }
  },
  routes: [
    {
      path: '/',
      component: RouterLayout,
      children: routes
    }
  ]
})

export default router
