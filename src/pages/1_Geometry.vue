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
  camera.position.z = 120

  // 创建场景
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xAAAAAA)

  // 创建几何体
  const objects: THREE.Object3D[] = []
  const spread = 15
  // 添加对象
  function addObject(x: number, y: number, obj: THREE.Object3D) {
    obj.position.x = x * spread
    obj.position.y = y * spread
    scene.add(obj)
    objects.push(obj)
  }
  // 创建材质
  function createMaterial() {
    const material = new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
    })
    const hue = Math.random()
    const saturation = 1
    const luminance = 0.5
    material.color.setHSL(hue, saturation, luminance)
    return material
  }
  // 添加几何体
  function addSolidGeometry(x: number, y: number, geometry: THREE.BufferGeometry) {
    const mesh = new THREE.Mesh(geometry, createMaterial())
    addObject(x, y, mesh)
  }
  addSolidGeometry(-2, 0, new THREE.BoxGeometry(8, 8, 8))
  addSolidGeometry(-1, 0, new THREE.CircleGeometry(6, 24))
  addSolidGeometry(0, 0, new THREE.ConeGeometry(6, 8, 24))
  addSolidGeometry(1, 0, new THREE.CylinderGeometry(6, 6, 8, 24))
  addSolidGeometry(2, 0, new THREE.DodecahedronGeometry(7))
  // const pointsMaterial = new THREE.PointsMaterial({
  //   color: 'red',
  //   size: 2,
  // })
  // const points = new THREE.Points(new THREE.BoxGeometry(8, 8, 8, 2, 2, 2), pointsMaterial)
  // addObject(0, 0, points)

  // 创建灯光
  const color = 0xFFFFFF
  const intensity = 3
  const light = new THREE.DirectionalLight(color, intensity)
  light.position.set(-1, 2, 4)
  scene.add(light)

  // 渲染场景
  renderer.render(scene, camera)
  function render(time: number) {
    time *= 0.001
    objects.forEach((object, index) => {
      const speed = 1 + index * 0.1
      const rot = time * speed
      object.rotation.x = rot
      object.rotation.y = rot
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