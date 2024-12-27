<script setup lang="ts">
import { onMounted } from 'vue'
import * as THREE from 'three'

function resizeRendererToDisplaySize(renderer: THREE.Renderer) {
  const canvas = renderer.domElement
  const pixelRatio = window.devicePixelRatio
  const width = Math.floor(canvas.clientWidth * pixelRatio)
  const height = Math.floor(canvas.clientHeight * pixelRatio)
  const needResize = canvas.width !== width || canvas.height !== height
  if (needResize) {
    renderer.setSize(width, height, false)
  }
  return needResize
}

function main() {

  // 创建渲染器
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas })

  // 创建相机
  const fov = 40
  const aspect = 2
  const near = 0.1
  const far = 1000
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
  camera.position.set(0, 50, 0)
  camera.up.set(0, 0, 1)
  camera.lookAt(0, 0, 0)

  // 创建场景
  const scene = new THREE.Scene()
  // scene.background = new THREE.Color(0xAAAAAA)

  // 创建几何体
  const objects: THREE.Object3D[] = []
  const radius = 1
  const widthSegments = 6
  const heightSegments = 6
  const sphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments)

  const solarSystem = new THREE.Object3D()
  scene.add(solarSystem)
  objects.push(solarSystem)

  const sunMaterial = new THREE.MeshPhongMaterial({ emissive: 0xFFFF00 })
  const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial)
  sunMesh.scale.set(5, 5, 5)
  solarSystem.add(sunMesh)
  objects.push(sunMesh)

  const earthOrbit = new THREE.Object3D()
  earthOrbit.position.x = 10
  solarSystem.add(earthOrbit)
  objects.push(earthOrbit)

  const earthMaterial = new THREE.MeshPhongMaterial({ color: 0x2233FF, emissive: 0x112244 })
  const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial)
  earthOrbit.add(earthMesh)
  objects.push(earthMesh)

  const moonOrbit = new THREE.Object3D()
  moonOrbit.position.x = 2
  earthOrbit.add(moonOrbit)

  const moonMaterial = new THREE.MeshPhongMaterial({ color: 0x888888, emissive: 0x222222 })
  const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial)
  moonMesh.scale.set(0.5, 0.5, 0.5)
  moonOrbit.add(moonMesh)
  objects.push(moonMesh)

  objects.forEach((node) => {
    const axes = new THREE.AxesHelper()
    axes.material.depthTest = false
    axes.renderOrder = 1
    node.add(axes)
  })

  // 创建灯光
  const color = 0xFFFFFF
  const intensity = 200
  const light = new THREE.PointLight(color, intensity)
  scene.add(light)

  // 渲染场景
  renderer.render(scene, camera)
  function render(time: number) {
    time *= 0.001
    objects.forEach((object) => {
      object.rotation.y = time
    })
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement
      camera.aspect = canvas.clientWidth / canvas.clientHeight
      camera.updateProjectionMatrix()
    }
    renderer.render(scene, camera)
    requestAnimationFrame(render)
  }
  requestAnimationFrame(render)
}
onMounted(() => {
  main()
})
</script>

<template>
  <canvas id="canvas"></canvas>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
#canvas {
  width: 100%;
  height: 100vh;
  display: block;
}
</style>