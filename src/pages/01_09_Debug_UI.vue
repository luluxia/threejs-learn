<script setup lang="ts">
import { onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import gsap from 'gsap'
import GUI from 'lil-gui'

onMounted(() => {

  // Debug
  const gui = new GUI({
    width: 300,
    title: 'Debug',
    // 默认折叠文件夹
    closeFolders: true,
  })
  // 默认折叠 GUI
  gui.close()
  // 隐藏 GUI
  gui.hide()
  // 切换
  window.addEventListener('keydown', (event) => {
    if (event.key === 'h') {
      gui.show(gui._hidden)
    }
  })
  const debugObject: { [key: string]: any } = {}

  // Canvas
  const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement

  // Scene
  const scene = new THREE.Scene()

  // Object
  debugObject.color = '#3aaecb'
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1, 5, 5, 5),
    new THREE.MeshBasicMaterial({ color: debugObject.color })
  )
  scene.add(mesh)

  const cubeTweaks = gui.addFolder('Cube')
  // cubeTweaks.close()
  cubeTweaks.add(mesh.position, 'x').min(-3).max(3).step(0.01).name('position x')
  cubeTweaks.add(mesh, 'visible')
  cubeTweaks.add(mesh.material, 'wireframe')
  cubeTweaks
    .addColor(debugObject, 'color')
    .onChange(() => {
      mesh.material.color.set(debugObject.color)
    })

  debugObject.spin = () => {
    gsap.to(mesh.rotation, { duration: 1, y: mesh.rotation.y + Math.PI * 2 })
  }
  cubeTweaks.add(debugObject, 'spin')

  debugObject.subdivision = 2
  cubeTweaks.add(debugObject, 'subdivision').min(0).max(10).step(1).onFinishChange(() => {
    mesh.geometry.dispose()
    mesh.geometry = new THREE.BoxGeometry(1, 1, 1, debugObject.subdivision, debugObject.subdivision, debugObject.subdivision)
  })

  // Sizes
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  })

  // Camera
  // PerspectiveCamera
  // 场视角 宽高比 近截面 远截面
  const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
  camera.position.z = 3
  camera.lookAt(mesh.position)
  scene.add(camera)

  // Controls
  const controls = new OrbitControls(camera, canvas)
  // 启用阻尼
  controls.enableDamping = true
  // 更新控件
  controls.update()

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
  })
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.render(scene, camera)

  // Animate
  const tick = () =>{
    
    // Update controls
    controls.update()
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
