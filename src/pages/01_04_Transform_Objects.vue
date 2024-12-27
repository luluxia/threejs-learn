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

  // Group
  const group = new THREE.Group()
  group.position.y = 1
  group.scale.y = 2
  group.rotation.y = 1
  scene.add(group)

  const cube1 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  )
  group.add(cube1)

  const cube2 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  )
  cube2.position.x = -2
  group.add(cube2)
    
  const cube3 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x0000ff })
  )
  cube3.position.x = 2
  group.add(cube3)

  // 位置
  mesh.position.x = 1
  mesh.position.y = -1
  mesh.position.z = 1
  mesh.position.set(1, -1, 1)
  // 位置距离场景中心的距离
  console.log(mesh.position.length())
  // 两个位置之间的距离
  console.log(mesh.position.distanceTo(new THREE.Vector3(0, 0, 0)))
  // 位置归一化
  mesh.position.normalize()

  // 缩放
  mesh.scale.x = 2
  mesh.scale.y = 0.5
  mesh.scale.z = 0.5
  mesh.scale.set(2, 0.5, 0.5)

  // 旋转
  // 改变旋转顺序
  mesh.rotation.reorder('YXZ')
  mesh.rotation.x = Math.PI * 0.25
  mesh.rotation.y = Math.PI * 0.25

  scene.add(mesh)

  // Axes Helper
  // 尺寸
  const axesHelper = new THREE.AxesHelper(2)
  scene.add(axesHelper)

  // Sizes
  const sizes = {
    width: 800,
    height: 600,
  }

  // Camera
  const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
  camera.position.z = 3

  // 指向位置
  camera.lookAt(mesh.position)
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
