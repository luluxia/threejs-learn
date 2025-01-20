<script setup lang="ts">
import { onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'

onMounted(() => {

  // Canvas
  const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement

  // Scene
  const scene = new THREE.Scene()

  // Texture
  const textureLoader = new THREE.TextureLoader()
  const matcapTexture = textureLoader.load('/textures/matcaps/1.png')
  matcapTexture.colorSpace = THREE.SRGBColorSpace

  // Font
  const fontLoader = new FontLoader()
  fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font) => {
      const textGeometry = new TextGeometry(
        'Hello Three.js',
        {
          font: font,
          size: 0.5,
          depth: 0.2,
          // 曲线细分
          curveSegments: 12,
          // 斜角
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelOffset: 0,
          // 斜角细分
          bevelSegments: 5,
        }
      )
      // textGeometry.computeBoundingBox()
      // textGeometry.translate(
      //   -(textGeometry.boundingBox.max.x - 0.02) * 0.5,
      //   -(textGeometry.boundingBox.max.y - 0.02) * 0.5,
      //   -(textGeometry.boundingBox.max.z - 0.03) * 0.5
      // )
      textGeometry.center()
      const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture })
      const text = new THREE.Mesh(textGeometry, material)
      scene.add(text)

      for (let i = 0; i <= 100; i++) {
        const dountGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45)
        const dount = new THREE.Mesh(dountGeometry, material)
        dount.position.x = (Math.random() - 0.5) * 10
        dount.position.y = (Math.random() - 0.5) * 10
        dount.position.z = (Math.random() - 0.5) * 10
        dount.rotation.x = Math.random() * Math.PI
        dount.rotation.y = Math.random() * Math.PI
        const scale = Math.random()
        dount.scale.set(scale, scale, scale)
        scene.add(dount)
      }
    }
  )

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
