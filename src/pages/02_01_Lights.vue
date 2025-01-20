<script setup lang="ts">
import { onMounted } from 'vue'
import GUI from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

onMounted(() => {

  // Debug
  const gui = new GUI()

  // Canvas
  const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement

  // Scene
  const scene = new THREE.Scene()

  /**
   * Lights
   */

  // 环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5)
  gui.add(ambientLight, 'intensity').min(0).max(3).step(0.001).name('ambientLightIntensity')
  scene.add(ambientLight)

  // 平行光
  const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.9)
  gui.add(directionalLight, 'intensity').min(0).max(3).step(0.001).name('directionalLightIntensity')
  gui.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001).name('directionalLightX')
  gui.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001).name('directionalLightY')
  gui.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001).name('directionalLightZ')
  // scene.add(directionalLight)

  // 半球光
  const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.9)
  scene.add(hemisphereLight)

  const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 0.2)
  scene.add(hemisphereLightHelper)

  // 点光源 颜色 光强 范围 衰减
  const pointLight = new THREE.PointLight(0xffffff, 1.5, 10, 2)
  // scene.add(pointLight)

  // 矩形面光源 颜色 光强 宽 高
  const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 2, 1, 1)
  rectAreaLight.position.set(- 1.5, 0, 1.5)
  rectAreaLight.lookAt(new THREE.Vector3())
  // scene.add(rectAreaLight)

  // SpotLight 颜色 光强 距离 宽度 半影（光线边缘模糊程度） 衰减
  const spotLight = new THREE.SpotLight(0x78ff00, 4.5, 10, Math.PI * 0.1, 0.25, 1)
  spotLight.position.set(0, 2, 3)
  scene.add(spotLight)

  // 修改聚光灯位置
  spotLight.target.position.x = - 1.5
  scene.add(spotLight.target)

  const spotLightHelper = new THREE.SpotLightHelper(spotLight, 0.2)
  scene.add(spotLightHelper)

  /**
   * Objects
   */
  // Material
  const material = new THREE.MeshStandardMaterial()
  material.roughness = 0.4

  // Objects
  const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      material
  )
  sphere.position.x = - 1.5

  const cube = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.75, 0.75),
      material
  )

  const torus = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.2, 32, 64),
      material
  )
  torus.position.x = 1.5

  const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5),
      material
  )
  plane.rotation.x = - Math.PI * 0.5
  plane.position.y = - 0.65

  scene.add(sphere, cube, torus, plane)

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
  const clock = new THREE.Clock()
  const tick = () =>{
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    sphere.rotation.y = 0.1 * elapsedTime
    cube.rotation.y = 0.1 * elapsedTime
    torus.rotation.y = 0.1 * elapsedTime

    sphere.rotation.x = 0.15 * elapsedTime
    cube.rotation.x = 0.15 * elapsedTime
    torus.rotation.x = 0.15 * elapsedTime
    
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
