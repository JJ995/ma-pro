import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Entries from '../data/sites'

Vue.use(VueRouter);

const routes = Object.keys(Entries).map(section => {
    const children = Entries[section].map(child => ({
        path: child.id,
        name: child.title,
        component: () => import(`../../content/${section}/${child.id}.md`).then((markdownComponent) => {
            markdownComponent.vue.component.components = {};
            for (let i = 0; i < child.components.length; i++) {
                /**
                 * import path cannot be prebuilt for some reason:
                 * 1. make path relative to router index.js file location
                 * 2. remove first 4 chars ('src/')
                 * 3. replace backslashes with forward slashes
                 */
                markdownComponent.vue.component.components[child.components[i].name] = () => import('../' + (`${child.components[i].path}.vue`).substr(4).replace(/\\/g,"/"));
            }
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
