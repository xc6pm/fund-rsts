import { createRouter, createWebHistory } from "vue-router"
import ProjectsView from "../views/ProjectsView.vue"
import { useUserInfoStore } from "@/stores/userInfo"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "projects",
      component: ProjectsView,
      beforeEnter: (to, from, next) => {
        if (useUserInfoStore().connectedContract) next()
        else next("/unauthorized")
      }
    },
    {
      path: "/unauthorized",
      name: "unauthorized",
      component: () => import("../views/NoAccount.vue"),
      beforeEnter: (to, from, next) => {
        if (!useUserInfoStore().connectedContract) next()
        else next("/")
      }
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("../views/DashboardView.vue"),
      beforeEnter: (to, from, next) => {
        const userInfo = useUserInfoStore()
        if (userInfo.isOwner || userInfo.isRecipientSpecifier) {
          next()
        } else next("/")
      },
      redirect: (to) => {
        // Appearently redirect is called before beforeEnter so we
        // protect against uninitialized userInfoStore here.
        // Uninitialized userInfoStore may occur when the user enters
        // the address into dashboard which reloads everything due to change in provider.
        let userInfo
        try {
          userInfo = useUserInfoStore()
        } catch {
          // Redirect to home when
          return "/"
        }
        return userInfo.isOwner ? "/dashboard/addProject" : "/dashboard/changeRecipient"
      },
      children: [
        {
          path: "addProject",
          name: "addProject",
          component: () => import("../views/dashboard/AddProjectView.vue"),
          beforeEnter: (to, from, next) => {
            if (useUserInfoStore().isOwner) next()
            else next("/")
          }
        },
        {
          path: "changeRecipient",
          name: "changeRecipient",
          component: () => import("../views/dashboard/ChangeProjectRecipientView.vue"),
          beforeEnter: (to, from, next) => {
            if (useUserInfoStore().isRecipientSpecifier) next()
            else next("/")
          }
        }
      ]
    }
  ]
})

export default router
