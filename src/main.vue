<template>
  <div id="app">
    <transition name="fade" mode="out-in">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style lang="scss">
html,body {
  background: transparent;
}

body {
  margin: 0 8px;
}

* {
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #fff;
  margin-top: 0;
}

a {
  color: #fff;
  text-decoration: none;
}

th,
td {
  padding: 8px 8px 8px 0;
  text-align: left;
}

th {
  color: #888888;
  font-weight: normal;
}

.center {
  text-align: center;
}

.right {
  text-align: right !important;
}

.fright {
  float: right;
}

.fade-enter-active, .fade-leave-active {
  transition-property: opacity;
  transition-duration: .2s;
}

.fade-enter-active {
  transition-delay: .2s;
}

.fade-enter, .fade-leave-active {
  opacity: 0
}
</style>
