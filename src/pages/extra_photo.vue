<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// 场景相关变量
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: CSS3DRenderer
let controls: OrbitControls
let cylinderGroup: THREE.Group
let clock: THREE.Clock

// 示例图片数组
const images1 = [
  'https://picsum.photos/id/1/300/400',
  'https://picsum.photos/id/10/300/400',
  'https://picsum.photos/id/100/300/400',
  'https://picsum.photos/id/1000/300/400',
  'https://picsum.photos/id/1001/300/400',
  'https://picsum.photos/id/1002/300/400',
  'https://picsum.photos/id/1003/300/400',
  'https://picsum.photos/id/1004/300/400',
  'https://picsum.photos/id/1005/300/400',
  'https://picsum.photos/id/1006/300/400',
  'https://picsum.photos/id/1008/300/400',
  'https://picsum.photos/id/1009/300/400',
]

const images2 = [
  'https://picsum.photos/id/1/300/400',
  'https://picsum.photos/id/10/300/400',
  'https://picsum.photos/id/100/300/400',
  'https://picsum.photos/id/1000/300/400',
  'https://picsum.photos/id/1001/300/400',
  'https://picsum.photos/id/1002/300/400',
  'https://picsum.photos/id/1003/300/400',
  'https://picsum.photos/id/1004/300/400',
  'https://picsum.photos/id/1005/300/400',
  'https://picsum.photos/id/1006/300/400',
  'https://picsum.photos/id/1008/300/400',
  'https://picsum.photos/id/1009/300/400',
]

const images3 = [
  'https://picsum.photos/id/1/300/400',
  'https://picsum.photos/id/10/300/400',
  'https://picsum.photos/id/100/300/400',
  'https://picsum.photos/id/1000/300/400',
  'https://picsum.photos/id/1001/300/400',
  'https://picsum.photos/id/1002/300/400',
  'https://picsum.photos/id/1003/300/400',
  'https://picsum.photos/id/1004/300/400',
  'https://picsum.photos/id/1005/300/400',
  'https://picsum.photos/id/1006/300/400',
  'https://picsum.photos/id/1008/300/400',
  'https://picsum.photos/id/1009/300/400',
]

// 初始化场景
function initScene() {
  // 创建场景
  scene = new THREE.Scene()
  
  // 设置相机
  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 5000)
  camera.position.set(0, 0, 500)
  
  // 创建CSS3D渲染器
  renderer = new CSS3DRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  const container = document.querySelector('.webgl')
  if (container) {
    container.appendChild(renderer.domElement)
  }
  
  // 添加轨道控制
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  
  // 创建图片圆柱
  createCylinderGallery()
  
  // 创建时钟用于帧率独立的动画
  clock = new THREE.Clock()
  
  // 监听窗口大小变化
  window.addEventListener('resize', onWindowResize)
  
  // 开始动画循环
  animate()
}

// 创建圆柱形图片墙
function createCylinderGallery() {
  cylinderGroup = new THREE.Group()
  
  const radius = 500 // 圆柱半径
  const imageWidth = 200
  const imageHeight = 150
  
  // 计算图片间的角度
  const angleStep = (2 * Math.PI) / images1.length
  
  images1.forEach((imageUrl, index) => {
    // 创建DOM元素
    const element = document.createElement('div')
    element.style.width = `${imageWidth}px`
    element.style.height = `${imageHeight}px`
    element.style.backgroundImage = `url(${imageUrl})`
    element.style.backgroundSize = 'cover'
    element.style.border = '2px solid #f3f4f6'
    element.style.borderRadius = '4px'
    // element.style.boxShadow = '0 0 15px rgba(0,0,0,0.5)'
    
    // 创建CSS3D对象
    const object = new CSS3DObject(element)
    
    // 计算位置
    const angle = angleStep * index + Math.PI * 0.25 // 让图片从顶部开始
    const x = radius * Math.sin(angle)
    const z = radius * Math.cos(angle)
    
    // 设置位置
    object.position.set(x, 200, z)
    
    // 让图片面向圆心
    object.lookAt(0, 200, 0)
    
    // 添加到圆柱组
    cylinderGroup.add(object)
  })

  images2.forEach((imageUrl, index) => {
    // 创建DOM元素
    const element = document.createElement('div')
    element.style.width = `${imageWidth}px`
    element.style.height = `${imageHeight}px`
    element.style.backgroundImage = `url(${imageUrl})`
    element.style.backgroundSize = 'cover'
    element.style.border = '1px solid white'
    element.style.borderRadius = '4px'
    // element.style.boxShadow = '0 0 15px rgba(0,0,0,0.5)'
    
    // 创建CSS3D对象
    const object = new CSS3DObject(element)
    
    // 计算位置
    const angle = angleStep * index
    const x = radius * Math.sin(angle)
    const z = radius * Math.cos(angle)
    
    // 设置位置
    object.position.set(x, 0, z)
    
    // 让图片面向圆心
    object.lookAt(0, 0, 0)
    
    // 添加到圆柱组
    cylinderGroup.add(object)
  })

  images3.forEach((imageUrl, index) => {
    // 创建DOM元素
    const element = document.createElement('div')
    element.style.width = `${imageWidth}px`
    element.style.height = `${imageHeight}px`
    element.style.backgroundImage = `url(${imageUrl})`
    element.style.backgroundSize = 'cover'
    element.style.border = '1px solid white'
    element.style.borderRadius = '4px'
    // element.style.boxShadow = '0 0 15px rgba(0,0,0,0.5)'
    
    // 创建CSS3D对象
    const object = new CSS3DObject(element)
    
    // 计算位置
    const angle = angleStep * index + Math.PI * 0.75 // 让图片从底部开始
    const x = radius * Math.sin(angle)
    const z = radius * Math.cos(angle)
    
    // 设置位置
    object.position.set(x, -200, z)
    
    // 让图片面向圆心
    object.lookAt(0, -200, 0)
    
    // 添加到圆柱组
    cylinderGroup.add(object)
  })
  
  // 添加到场景
  const cylinderGroupWitchRotation = new THREE.Group()
  cylinderGroupWitchRotation.add(cylinderGroup)
  cylinderGroupWitchRotation.rotation.z = Math.PI * 0.05 // 轻微倾斜
  scene.add(cylinderGroupWitchRotation)
}

// 窗口大小变化处理
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

// 动画循环
function animate() {
  requestAnimationFrame(animate)
  
  // 获取两帧之间的时间差
  const deltaTime = clock.getDelta()
  
  // 旋转圆柱体 - 使用时间差乘以旋转速率
  if (cylinderGroup) {
    const rotationSpeed = 0.2 // 每秒旋转速度（弧度）
    cylinderGroup.rotation.y += rotationSpeed * deltaTime
  }
  
  // 更新控制器
  controls.update()
  
  // 渲染场景
  renderer.render(scene, camera)
}

onMounted(() => {
  initScene()
})

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
  if (controls) {
    controls.dispose()
  }
})
</script>

<template>
  <div class="webgl"></div>
</template>

<style scoped>
.webgl {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  outline: none;
  background-color: #F9FAFB;
}
</style>
