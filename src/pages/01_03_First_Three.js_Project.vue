<script setup lang="ts">
import { onMounted } from 'vue'
import * as THREE from 'three'

onMounted(() => {
  // Canvas
  const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement

  // Scene
  const scene = new THREE.Scene()

  // Object
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
  const mesh = new THREE.Mesh(geometry, material)

  scene.add(mesh)

  // Sizes
  const sizes = {
    width: 800,
    height: 600,
  }

  // Camera
  // 场视角 宽高比
  const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
  camera.position.z = 3
  scene.add(camera)

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
  })
  renderer.setSize(sizes.width, sizes.height)
  renderer.render(scene, camera)
})
</script>

<template>
  <canvas class="webgl"></canvas>
</template>
