<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
const routes = router.getRoutes()
</script>

<template>
  <router-link
    class="router-link"
    v-for="route in routes.splice(1)"
    :key="route.path"
    :to="route.path"
  >
    {{ route.name }}
  </router-link>
</template>

<style>
.router-link {
  display: block;
  color: #333;
  padding: 0.25rem;
  margin: 0.5rem;
  text-decoration: none;
}
.router-link:hover {
  background: #f0f0f0;
}
</style>