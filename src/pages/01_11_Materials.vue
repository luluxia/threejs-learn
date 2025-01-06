<script setup lang="ts">
import { onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import GUI from 'lil-gui'

onMounted(() => {

  // Debug
  const gui = new GUI()

  // Canvas
  const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement

  // Scene
  const scene = new THREE.Scene()

  // Texture
  const textureLoader = new THREE.TextureLoader()
  const doorColorTexture = textureLoader.load('/textures/door/color.jpg')
  const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg')
  const doorAmbientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg')
  const doorHeightTexture = textureLoader.load('/textures/door/height.jpg')
  const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg')
  const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg')
  const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.jpg')
  const matcapTexture = textureLoader.load('/textures/matcaps/1.png')
  const gradientTexture = textureLoader.load('/textures/gradients/3.jpg')

  doorColorTexture.colorSpace = THREE.SRGBColorSpace
  matcapTexture.colorSpace = THREE.SRGBColorSpace

  // Object

  // MeshBasicMaterial
  // const material = new THREE.MeshBasicMaterial()
  // 贴图
  // material.map = doorColorTexture
  // 颜色
  // material.color = new THREE.Color(0x00ff00)
  // 线框
  // material.wireframe = true
  // 透明度
  // material.transparent = true
  // material.opacity = 0.5
  // 透明贴图
  // material.alphaMap = doorAlphaTexture
  /**
   * side
   * THREE.FrontSide 默认
   * THREE.BackSide 反面
   * THREE.DoubleSide 双面
   */
  // material.side = THREE.DoubleSide

  /**
   * MeshNormalMaterial
   * 用于调试法线
   */
  // const material = new THREE.MeshNormalMaterial()
  // FlatShading
  // material.flatShading = true

  /**
   * MeshMatcapMaterial
   * 材质球
   */
  // const material = new THREE.MeshMatcapMaterial()
  // material.matcap = matcapTexture

  /**
   * MeshDepthMaterial
   * 深度材质，根据深度渲染颜色，越深越暗
   */
  // const material = new THREE.MeshDepthMaterial()

  /**
   * MeshLambertMaterial
   * 兰伯特材质，需要光源
   * 在需要光源的材质中性能最好
   * 但真实性较差
   */
  // const material = new THREE.MeshLambertMaterial()

  /**
   * MeshPhongMaterial
   * 冯氏材质，需要光源
   */
  // const material = new THREE.MeshPhongMaterial()
  // 光泽度
  // material.shininess = 100
  // 颜色
  // material.specular = new THREE.Color(0x1188ff)

  /**
   * MeshToonMaterial
   * 卡通材质
   */
  // const material = new THREE.MeshToonMaterial()
  // gradientTexture.minFilter = THREE.NearestFilter
  // gradientTexture.magFilter = THREE.NearestFilter
  // gradientTexture.generateMipmaps = false
  // material.gradientMap = gradientTexture

  /**
   * MeshStandardMaterial
   * 标准材质
   */
  // const material = new THREE.MeshStandardMaterial()
  // // 金属度
  // material.metalness = 1
  // gui.add(material, 'metalness').min(0).max(1).step(0.0001)
  // // 粗糙度
  // material.roughness = 1
  // gui.add(material, 'roughness').min(0).max(1).step(0.0001)
  // // 贴图
  // material.map = doorColorTexture
  // // 环境光遮蔽贴图
  // material.aoMap = doorAmbientOcclusionTexture
  // // 环境光遮蔽贴图强度
  // material.aoMapIntensity = 1
  // // 高度贴图
  // material.displacementMap = doorHeightTexture
  // // 高度贴图缩放
  // material.displacementScale = 0.1
  // // 金属度贴图
  // material.metalnessMap = doorMetalnessTexture
  // // 粗糙度贴图
  // material.roughnessMap = doorRoughnessTexture
  // // 法线贴图
  // material.normalMap = doorNormalTexture
  // // 法线贴图强度
  // material.normalScale.set(0.5, 0.5)
  // // 透明度贴图
  // material.transparent = true
  // material.alphaMap = doorAlphaTexture

  /**
   * MeshPhysicalMaterial
   * 物理材质
   */
   const material = new THREE.MeshPhysicalMaterial()
  // 金属度
  material.metalness = 1
  gui.add(material, 'metalness').min(0).max(1).step(0.0001)
  // 粗糙度
  material.roughness = 1
  gui.add(material, 'roughness').min(0).max(1).step(0.0001)
  // 贴图
  material.map = doorColorTexture
  // 环境光遮蔽贴图
  material.aoMap = doorAmbientOcclusionTexture
  // 环境光遮蔽贴图强度
  material.aoMapIntensity = 1
  // 高度贴图
  material.displacementMap = doorHeightTexture
  // 高度贴图缩放
  material.displacementScale = 0.1
  // 金属度贴图
  material.metalnessMap = doorMetalnessTexture
  // 粗糙度贴图
  material.roughnessMap = doorRoughnessTexture
  // 法线贴图
  material.normalMap = doorNormalTexture
  // 法线贴图强度
  material.normalScale.set(0.5, 0.5)
  // 透明度贴图
  material.transparent = true
  material.alphaMap = doorAlphaTexture
  // 清漆
  // material.clearcoat = 1
  // gui.add(material, 'clearcoat').min(0).max(1).step(0.0001)
  // 清漆粗糙度
  // material.clearcoatRoughness = 1
  // gui.add(material, 'clearcoatRoughness').min(0).max(1).step(0.0001)
  // 光泽 适用于布料
  // material.sheen = 1
  // gui.add(material, 'sheen').min(0).max(1).step(0.0001)
  // 光泽粗糙度
  // material.sheenRoughness = 0.25
  // gui.add(material, 'sheenRoughness').min(0).max(1).step(0.0001)
  // 光泽颜色
  // material.sheenColor = new THREE.Color(0xffffff)
  // gui.addColor(material, 'sheenColor')
  // 彩虹色
  // material.iridescence = 1
  // gui.add(material, 'iridescence').min(0).max(1).step(0.0001)
  // material.iridescenceIOR = 1
  // gui.add(material, 'iridescenceIOR').min(1).max(2.333).step(0.0001)
  // material.iridescenceThicknessRange = [100, 800]
  // gui.add(material.iridescenceThicknessRange, '0').min(1).max(1000).step(1)
  // gui.add(material.iridescenceThicknessRange, '1').min(1).max(1000).step(1)
  // 半透明
  material.transmission = 1
  gui.add(material, 'transmission').min(0).max(1).step(0.0001)
  // 折射率
  material.ior = 1.5
  gui.add(material, 'ior').min(1).max(10).step(0.0001)
  // 厚度
  material.thickness = 0.5
  gui.add(material, 'thickness').min(0).max(1).step(0.0001)

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 64, 64),
    material
  )
  sphere.position.x = -1.5
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1, 100, 100),
    material
  )
  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 64, 128),
    material
  )
  torus.position.x = 1.5

  scene.add(sphere, plane, torus)

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 1)
  scene.add(ambientLight)
  const pointLight = new THREE.PointLight(0xffffff, 30)
  pointLight.position.set(2, 3, 4)
  scene.add(pointLight)

  // Environment Map
  const rgbeLoader = new RGBELoader()
  rgbeLoader.load('/textures/environmentMap/2k.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping
    scene.background = texture
    scene.environment = texture
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

  const clock = new THREE.Clock()
  // Animate
  const tick = () =>{
    
    // Update controls
    controls.update()
    // Update Object
    const elapsedTime = clock.getElapsedTime()
    sphere.rotation.y = 0.1 * elapsedTime
    plane.rotation.y = 0.1 * elapsedTime
    torus.rotation.y = 0.1 * elapsedTime
    sphere.rotation.x = -0.15 * elapsedTime
    plane.rotation.x = -0.15 * elapsedTime
    torus.rotation.x = -0.15 * elapsedTime
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
