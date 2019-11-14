import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Entries from '../data/entries'

Vue.use(VueRouter);

const blogRoutes = Object.keys(Entries).map(section => {
    const children = Entries[section].map(child => ({
        path: child.id,
        name: child.id,
        component: () => import(`../../content/${section}/${child.id}.md`).then((markdownComponent) => {
            return markdownComponent.vue.component;
        })
    }));
    return {
        path: `/${section}`,
        name: section,
        component: () => import('../views/Blog.vue'),
        children
    }
});

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        ...blogRoutes
    ]
});

export default router
