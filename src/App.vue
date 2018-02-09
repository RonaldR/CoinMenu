<template>
  <div id="app">
    <coins />
  </div>
</template>

<script>
import coins from './components/coins/coins.vue'

export default {
  name: 'app',
  components: {
    coins
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 0;
}

a {
  color: #2c3e50;
  text-decoration: underline;
}
</style>
