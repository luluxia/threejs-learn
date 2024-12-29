<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <router-link v-if="route.path !== '/'" class="go-back" to="/">返回</router-link>
  <router-view />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  overflow: hidden;
}
#canvas {
  width: 100%;
  height: 100vh;
  display: block;
}
.go-back {
  position: fixed;
  color: #333;
  background: #f0f0f0;
  padding: 0.5rem;
  margin: 0.5rem;
  text-decoration: none;
}
</style>
