<script setup lang="ts">
import { onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'

onMounted(() => {

  // Textures
  const loadingManager = new THREE.LoadingManager()
  loadingManager.onStart = () => {
    console.log('loadingManager: loading started')
  }
  loadingManager.onLoad = () => {
    console.log('loadingManager: loading finished')
  }
  loadingManager.onProgress = () => {
    console.log('loadingManager: loading progressing')
  }
  loadingManager.onError = () => {
    console.log('loadingManager: loading error')
  }
  const textureLoader = new THREE.TextureLoader(loadingManager)
  const colorTexture = textureLoader.load(
    // '/textures/door/color.jpg',
    '/textures/minecraft.png',
    // () => {
    //   console.log('load')
    // },
    // () => {
    //   console.log('progress')
    // },
    // () => {
    //   console.log('error')
    // }
  )
  colorTexture.colorSpace = THREE.SRGBColorSpace
  // const alphaTexture = textureLoader.load('/textures/door/alpha.jpg')
  // const heightTexture = textureLoader.load('/textures/door/height.jpg')
  // const normalTexture = textureLoader.load('/textures/door/normal.jpg')
  // const ambientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg')
  // const metalnessTexture = textureLoader.load('/textures/door/metalness.jpg')
  // const roughnessTexture = textureLoader.load('/textures/door/roughness.jpg')

  // 重复纹理
  // colorTexture.repeat.x = 2
  // colorTexture.repeat.y = 3

  // 平铺纹理
  // colorTexture.wrapS = THREE.RepeatWrapping
  // colorTexture.wrapT = THREE.RepeatWrapping

  // 镜像平铺纹理
  // colorTexture.wrapS = THREE.MirroredRepeatWrapping
  // colorTexture.wrapT = THREE.MirroredRepeatWrapping

  // 移动纹理
  // colorTexture.offset.x = 0.5
  // colorTexture.offset.y = 0.5

  // 纹理中心
  // colorTexture.center.x = 0.5
  // colorTexture.center.y = 0.5

  // 旋转纹理
  // colorTexture.rotation = Math.PI * 0.25

  /**
   * 禁用 mipmap
   */
  // colorTexture.generateMipmaps = false

  /**
   * minFilter
   * 纹理缩小过滤器
   * 当纹理被缩小时，纹理像素的颜色如何被计算
   * 当设置为 THREE.NearestFilter 时，纹理像素更加清晰，但是会出现锯齿，此时不需要 mipmap
   */
  // colorTexture.minFilter = THREE.NearestFilter

  /**
   * magFilter
   * 纹理放大过滤器
   * 当纹理被放大时，纹理像素的颜色如何被计算
   * 默认值是 THREE.LinearFilter
   * 可以设置为 THREE.NearestFilter 使得纹理像素更加清晰
   */
  colorTexture.magFilter = THREE.NearestFilter

  // Debug
  const gui = new GUI({
    width: 300,
    title: 'Debug',
    // 默认折叠文件夹
    closeFolders: true,
  })
  // 默认折叠 GUI
  gui.close()

  // Canvas
  const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement

  // Scene
  const scene = new THREE.Scene()

  // Object
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1, 5, 5, 5),
    new THREE.MeshBasicMaterial({ map: colorTexture })
  )
  scene.add(mesh)

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
