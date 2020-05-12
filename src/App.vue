<template>
    <div id="app">
        <sidebar-menu :menu="menu"/>
        <router-view/>
    </div>
</template>

<style src="./styles/base.less" lang="less"></style>

<script>
    import tree from './data/siteTree'

    export default {
        name: 'App',
        computed: {
            menu: function () {
                let menu = [];
                menu.push({
                    header: true,
                    title: 'Example Blog',
                    hiddenOnCollapse: true
                });

                menu.push(tree);

                // Adjust object keys
                let str = JSON.stringify(menu);
                str = str.replace(/path/g, 'href');
                str = str.replace(/name/g, 'title');
                str = str.replace(/children/g, 'child');
                menu = JSON.parse(str);

                // Format router links and remove link from directory nodes
                this.formatHref(menu);
                this.removeHrefFromDirectoryNode(menu);

                return menu;
            }
        },
        methods: {
            formatHref: function (obj) {
                Object.keys(obj).forEach(key => {

                    if (key === 'href') {
                        obj[key] = obj[key].replace(/\\/g, "/");
                        obj[key] = obj[key].substring(7, obj[key].length - 3);
                    }

                    if (typeof obj[key] === 'object') {
                        this.formatHref(obj[key])
                    }
                })
            },
            removeHrefFromDirectoryNode: function (obj) {
                Object.keys(obj).forEach(key => {

                    if (obj['type'] === 'directory') {
                        delete obj['href'];
                    }

                    if (typeof obj[key] === 'object') {
                        this.removeHrefFromDirectoryNode(obj[key])
                    }
                })
            }
        }
    }
</script>
