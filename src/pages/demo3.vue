<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

onMounted(() => {
  // Canvas
  const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement

  // Scene
  const scene = new THREE.Scene()

  // Lights (一致于 demo2)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(1, 1, 1)
  scene.add(directionalLight)

  // Sizes
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  // Camera（与 demo2 保持一致：正交相机）
  let frustumSize = 5
  const aspect = sizes.width / sizes.height
  const camera = new THREE.OrthographicCamera(
    -frustumSize * aspect / 2,
    frustumSize * aspect / 2,
    frustumSize / 2,
    -frustumSize / 2,
    0.1,
    100
  )
  camera.position.z = 5
  scene.add(camera)

  // Controls
  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.update()

  // 加载并将模型置于场景中央（保留该部分）
  const loader = new GLTFLoader()
  loader.load(
    'after.glb',
    (gltf) => {
      const model = gltf.scene
      // 将模型中心移到原点
      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      model.position.sub(center)
      scene.add(model)

      // 重新计算包围盒并按 demo2 拟合相机/视椎体
      const centeredBox = new THREE.Box3().setFromObject(model)
      const size = centeredBox.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)

      // 调整相机距离和正交体尺寸
      const cameraDistance = maxDim * 1.2
      camera.position.z = cameraDistance

      const newAspect = sizes.width / sizes.height
      frustumSize = maxDim * 1.2
      camera.left = -frustumSize * newAspect / 2
      camera.right = frustumSize * newAspect / 2
      camera.top = frustumSize / 2
      camera.bottom = -frustumSize / 2
      camera.updateProjectionMatrix()

      controls.target.set(0, 0, 0)
      controls.update()
    },
    undefined,
    (error) => {
      console.error('Failed to load after.glb', error)
    }
  )

  const onResize = () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update orthographic camera
    const aspect = sizes.width / sizes.height
    camera.left = -frustumSize * aspect / 2
    camera.right = frustumSize * aspect / 2
    camera.top = frustumSize / 2
    camera.bottom = -frustumSize / 2
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }
  window.addEventListener('resize', onResize)

  const onDblClick = () => {
    if (!document.fullscreenElement) {
      if (canvas.requestFullscreen) {
        canvas.requestFullscreen()
      }
    } else {
      document.exitFullscreen()
    }
  }
  window.addEventListener('dblclick', onDblClick)

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
  })
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.render(scene, camera)

  // Animate
  let running = true
  const tick = () =>{
    // Update controls
    controls.update()
    // Render
    renderer.render(scene, camera)
    // Call tick again on the next frame
    if (running) window.requestAnimationFrame(tick)
  }
  tick()

  onUnmounted(() => {
    running = false
    window.removeEventListener('resize', onResize)
    window.removeEventListener('dblclick', onDblClick)
    controls.dispose()
    renderer.dispose()
  })
})
</script>

<template>
  <canvas class="webgl"></canvas>
</template>
