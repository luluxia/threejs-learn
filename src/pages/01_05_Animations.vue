<script setup lang="ts">
import { onMounted } from 'vue'
import * as THREE from 'three'
import gsap from 'gsap'

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

  // Time
  // let time = Date.now()

  // Clock
  // const clock = new THREE.Clock()

  // GSAP
  gsap.to(mesh.position, { duration: 1, delay: 1, x: 2 })

  // Animations
  const tick = () => {
    // Time
    // const currentTime = Date.now()
    // const deltaTime = currentTime - time
    // time = currentTime

    // Clock
    // 时钟初始化后经过多少秒
    // const elapsedTime = clock.getElapsedTime()

    // 获取上一次调用后的时间差 不推荐使用
    // const deltaTime = clock.getDelta()

    // 每秒旋转一圈
    // mesh.rotation.y = elapsedTime * Math.PI * 2

    // Update objects
    // mesh.rotation.y += 0.01

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
  }
  tick()
})
</script>

<template>
  <canvas class="webgl"></canvas>
</template>
