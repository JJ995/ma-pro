import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import ButtonCounter from "../components/ButtonCounter";
import Entries from '../data/manifest'

Vue.use(VueRouter);

const routes = Object.keys(Entries).map(section => {
    const children = Entries[section].map(child => ({
        path: child.id,
        name: child.id,
        component: () => import(`../../content/${section}/${child.id}.md`).then((markdownComponent) => {
            markdownComponent.vue.component.components = {
                ButtonCounter
            };
            return markdownComponent.vue.component;
        })
    }));
    return {
        path: `/${section}`,
        name: section,
        component: () => import('../views/Content.vue'),
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
        ...routes
    ]
});

export default router
