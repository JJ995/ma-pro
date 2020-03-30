<template>
  <div id="app">
    <header>
      <div class="wrap">
        <div
          id="hamburger"
          @click="displayMenu()"
        >
          <span />
          <span />
          <span />
        </div>
        <router-link to="/">
          <img
            src="./assets/logo.png"
            alt="Vue logo"
          >
        </router-link>
        <nav
          id="menu"
          class="group"
        >
          <li
            v-for="(section, index) in Object.keys(entries)"
            :key="index"
            class="drop"
          >
            <a @click="displayDropMenu()">{{ section }} <i class="icon-arrow" /></a>
            <ul class="drop-menu">
              <div
                v-for="entry in entries[section]"
                :key="entry.id"
              >
                <router-link :to="{name: entry.id}">
                  {{ entry.title }}
                </router-link>
              </div>
            </ul>
          </li>
        </nav>
      </div>
    </header>
    <router-view />
  </div>
</template>

<style src="./styles/base.less" lang="less"></style>
<style src="./styles/navigation.less" lang="less"></style>

<script>
    import entries from './data/sites'

    export default {
      name: 'App',
      computed: {
        entries() {
          return entries
        }
      },
      mounted: function () {
        this.$nextTick(function () {
          // Fire event when markdown content is rendered
          let int = setInterval(() => {
            if (document.querySelector('.markdown-body')) {
              console.log('Content rendered');
              window.document.dispatchEvent(new Event('content-rendered'));
              clearInterval(int);
            }
          }, 100);
          // Fire event anyway after 5 seconds in case no markdown content is on page
          window.setTimeout(() => {
            console.log('Content rendered (no markdown)');
            window.document.dispatchEvent(new Event('content-rendered'));
            clearInterval(int);
          }, 5000);
        });

        // Close all menus on resize
        window.addEventListener("resize", function () {
          let items = document.getElementById("menu").getElementsByTagName("li");
          Array.from(items).forEach(function (e) {
            e.style.marginTop = '0';
          });
          let dropMenus = document.getElementsByClassName("drop-menu");
          Array.from(dropMenus).forEach(function (e) {
            e.classList.remove("display");
          });
          document.getElementsByTagName("body")[0].classList.remove("display-menu");
        });
      },
      methods: {
        displayMenu: function () {
          let body = document.getElementsByTagName("body")[0];
          (!body.classList.contains("display-menu")) ? body.classList.add("display-menu") : body.classList.remove("display-menu");
        },
        displayDropMenu: function () {
          let dropMenu = event.target.parentElement.getElementsByClassName("drop-menu")[0];
          let dropMenus = document.getElementsByClassName("drop-menu");

          Array.from(dropMenus).forEach(function (e) {
            if (e !== dropMenu) {
              e.classList.remove("display");
            }
          });
          let lis = document.getElementById("menu").getElementsByTagName("li");
          Array.from(lis).forEach(function (e) {
            if (e !== undefined && e !== null) {
              e.style.marginTop = '0';
            }
          });
          if (dropMenu !== undefined && dropMenu !== null) {
            (!dropMenu.classList.contains("display")) ? dropMenu.classList.add("display") : dropMenu.classList.remove("display");
          }
          if (window.innerWidth < 660 && dropMenu.classList.contains("display")) {
            if (event.target.parentElement.nextSibling !== undefined && event.target.parentElement.nextSibling !== null) {
              event.target.parentElement.nextSibling.style.marginTop = dropMenu.clientHeight + "px";
            }
          }
        }
      }
    }
</script>
