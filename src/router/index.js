import {createRouter, createWebHistory, createWebHashHistory} from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AuthView from '@/views/AuthView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue' 
import UserSettings from '@/views/UserSettings.vue'
import UserProfile from '@/views/UserProfile.vue'
import UserList from '@/views/UserList.vue'
import NotFound from '@/views/NotFound.vue'

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
        },
        {
            path: '/login',
            name: 'login',
            component: AuthView,
            children: [
                { 
                    path: '', 
                    name: 'loginDefault', 
                    component: LoginView 
                },
                { 
                    path: 'register', 
                    name: 'register', 
                    component: RegisterView 
                }
            ]
        },
        {
            path: '/settings',
            name: 'settings',
            component: UserSettings,
        },
        {
            path: '/user/:userId',
            name: 'userProfile',
            props: true, 
            component: UserProfile,
        },
        {
            path: '/userlist',
            name: 'userlist',
            component: UserList,
        },
        {
          path: '/:pathMatch(.*)*',
          name: 'NotFound',
          component: NotFound,
        },
    ],
})

export default router
