<script setup lang="ts">
import { onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

// 在几何体表面均匀采样点的函数
function samplePoints(geometry, count) {
  const nonIndexed = geometry.toNonIndexed()
  const pos = nonIndexed.attributes.position.array
  const triCount = pos.length / 9

  // 计算每个三角形的面积
  const areas = []
  let totalArea = 0
  for (let i = 0; i < triCount; i++) {
    const a = new THREE.Vector3(pos[i*9], pos[i*9+1], pos[i*9+2])
    const b = new THREE.Vector3(pos[i*9+3], pos[i*9+4], pos[i*9+5])
    const c = new THREE.Vector3(pos[i*9+6], pos[i*9+7], pos[i*9+8])
    const area = new THREE.Vector3().subVectors(b,a).cross(new THREE.Vector3().subVectors(c,a)).length() * 0.5
    areas.push(area)
    totalArea += area
  }

  // 按面积加权采样
  const sampled = []
  for (let i = 0; i < count; i++) {
    let r = Math.random() * totalArea
    let triIndex = 0
    while (r > areas[triIndex]) {
      r -= areas[triIndex]
      triIndex++
    }

    const a = new THREE.Vector3(pos[triIndex*9], pos[triIndex*9+1], pos[triIndex*9+2])
    const b = new THREE.Vector3(pos[triIndex*9+3], pos[triIndex*9+4], pos[triIndex*9+5])
    const c = new THREE.Vector3(pos[triIndex*9+6], pos[triIndex*9+7], pos[triIndex*9+8])

    let u = Math.random(), v = Math.random()
    if (u + v > 1) { u = 1-u; v = 1-v }
    const p = new THREE.Vector3().addScaledVector(a, 1-u-v).addScaledVector(b, u).addScaledVector(c, v)

    sampled.push(p.x, p.y, p.z)
  }

  const buffer = new Float32Array(sampled)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(buffer, 3))
  return geo
}

// 创建动画点云的函数
function createAnimatedPoints(surfaceGeo, count = 5000, globalMinY: number, globalMaxY: number) {
  const surfacePositions = surfaceGeo.attributes.position.array;
  const sampledCount = surfacePositions.length / 3;

  const initialPositions = new Float32Array(sampledCount * 3);
  const randomPositions = new Float32Array(sampledCount * 3);
  const colors = new Float32Array(sampledCount * 3);

  const yRange = globalMaxY - globalMinY;

  // Ease in out 函数
  function easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  // 初始化
  for (let i = 0; i < sampledCount; i++) {
    const x = surfacePositions[i * 3];
    const y = surfacePositions[i * 3 + 1];
    const z = surfacePositions[i * 3 + 2];

    // 初始位置：模型表面
    initialPositions[i * 3] = x;
    initialPositions[i * 3 + 1] = y;
    initialPositions[i * 3 + 2] = z;

    // 随机位置：加随机偏移
    const randomOffset = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    );
    randomPositions[i * 3] = x + randomOffset.x;
    randomPositions[i * 3 + 1] = y + randomOffset.y;
    randomPositions[i * 3 + 2] = z + randomOffset.z;

    // 初始颜色：蓝
    colors[i * 3] = 0.0;
    colors[i * 3 + 1] = 0.0;
    colors[i * 3 + 2] = 1.0;
  }

  // 创建 geometry
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(initialPositions.slice(), 3)); // 一开始用 initial
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.03,
    vertexColors: true,
  });

  const points = new THREE.Points(geo, material);

  let startTime = 0; // 动画开始时间
  const layerDelay = 1.0 + Math.random() * 0.25; // 每层的延迟时间（秒）
  const phaseDuration = 1.0 + Math.random() * 0.25; // 每个阶段持续时间（秒）

  function update(delta: number) {
    if (startTime === 0) startTime = performance.now() / 1000; // 初始化开始时间
    const currentTime = performance.now() / 1000;
    const elapsed = currentTime - startTime;

    const posAttr = geo.attributes.position;
    const colAttr = geo.attributes.color;

    for (let i = 0; i < sampledCount; i++) {
      const y = initialPositions[i * 3 + 1];
      const delay = ((y - globalMinY) / yRange) * layerDelay; // 基于全局Y轴的延迟
      const localElapsed = elapsed - delay;

      let progress = 0;
      let phase = 0; // 0: initial to random, 1: random to initial

      if (localElapsed < 0) {
        // 还未开始，保持初始位置
        progress = 0;
        phase = 0;
      } else if (localElapsed < phaseDuration) {
        // 第一阶段：initial to random
        progress = localElapsed / phaseDuration;
        progress = easeInOutQuad(progress); // 应用缓动
        phase = 0;
      } else if (localElapsed < phaseDuration * 2) {
        // 第二阶段：random to initial
        progress = (localElapsed - phaseDuration) / phaseDuration;
        progress = easeInOutQuad(progress); // 应用缓动
        phase = 1;
      } else {
        // 动画结束，保持初始位置
        progress = 1;
        phase = 1;
      }

      let targetX, targetY, targetZ;
      if (phase === 0) {
        // 从initial到random
        targetX = THREE.MathUtils.lerp(initialPositions[i * 3], randomPositions[i * 3], progress);
        targetY = THREE.MathUtils.lerp(initialPositions[i * 3 + 1], randomPositions[i * 3 + 1], progress);
        targetZ = THREE.MathUtils.lerp(initialPositions[i * 3 + 2], randomPositions[i * 3 + 2], progress);
        // 颜色：蓝 -> 红
        colAttr.setXYZ(i, progress, 0, 1 - progress);
      } else {
        // 从random到initial
        targetX = THREE.MathUtils.lerp(randomPositions[i * 3], initialPositions[i * 3], progress);
        targetY = THREE.MathUtils.lerp(randomPositions[i * 3 + 1], initialPositions[i * 3 + 1], progress);
        targetZ = THREE.MathUtils.lerp(randomPositions[i * 3 + 2], initialPositions[i * 3 + 2], progress);
        // 颜色：红 -> 绿
        colAttr.setXYZ(i, 1 - progress, progress, 0);
      }

      posAttr.setXYZ(i, targetX, targetY, targetZ);
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  }

  return { points, update };
}


onMounted(() => {

  const clock = new THREE.Clock();
  let updates: ((delta: number) => void)[] = [];

  // Canvas
  const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement

  // Scene
  const scene = new THREE.Scene()

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(1, 1, 1)
  scene.add(directionalLight)

  // Object
  const loader = new GLTFLoader()
  loader.load(
    'UASB.glb',
    (gltf) => {
      console.log(gltf)
      const model = gltf.scene

      // 计算模型的包围盒
      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())

      // 将模型居中
      model.position.sub(center)

      // 计算包围盒大小并调整相机
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const cameraDistance = maxDim * 1.2 // 缓冲系数
      camera.position.z = cameraDistance

      // 调整正交相机视锥大小
      const aspect = sizes.width / sizes.height
      frustumSize = maxDim * 1.2
      camera.left = -frustumSize * aspect / 2
      camera.right = frustumSize * aspect / 2
      camera.top = frustumSize / 2
      camera.bottom = -frustumSize / 2
      camera.updateProjectionMatrix()

      // 更新控件
      controls.update()

      // 先遍历所有mesh，计算全局Y轴范围
      let globalMinY = Infinity, globalMaxY = -Infinity;
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // 确保几何为非索引
          const geo = child.geometry.index ? child.geometry.toNonIndexed() : child.geometry.clone();
          // 应用世界矩阵
          child.updateWorldMatrix(true, false);
          const worldGeo = geo.clone();
          worldGeo.applyMatrix4(child.matrixWorld);
          // 采样点
          const sampledGeo = samplePoints(worldGeo, 2500);
          const positions = sampledGeo.attributes.position.array;
          const sampledCount = positions.length / 3;
          for (let i = 0; i < sampledCount; i++) {
            const y = positions[i * 3 + 1];
            if (y < globalMinY) globalMinY = y;
            if (y > globalMaxY) globalMaxY = y;
          }
        }
      });

      // 4) 遍历 mesh，生成“世界坐标下”的点云，并把 Points 加到 scene
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // 确保几何为非索引（采样函数通常需要）
          const geo = child.geometry.index ? child.geometry.toNonIndexed() : child.geometry.clone();

          // 把世界矩阵应用到几何，使顶点成为世界坐标
          child.updateWorldMatrix(true, false); // 确保 matrixWorld 有效（会先更新 parent）
          const worldGeo = geo.clone();
          worldGeo.applyMatrix4(child.matrixWorld);

          // 在 worldGeo 上采样点
          const sampledGeo = samplePoints(worldGeo, 2500);

          // 使用 createAnimatedPoints 创建动画点云，传入全局Y轴范围
          const { points, update } = createAnimatedPoints(sampledGeo, 2500, globalMinY, globalMaxY);

          // 重要：点已经是世界坐标，不要让 Three 再对它进行父级变换
          points.matrixAutoUpdate = false; // 可选：防止自动更新矩阵
          // 将 points 加到 scene（而不是 model），避免重复变换
          scene.add(points);

          // 隐藏原 mesh（如果你只想看点云）
          child.visible = false;

          // 存储 update 函数
          updates.push(update);

        }
      });

      scene.add(model)
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
    const aspect = sizes.width / sizes.height
    camera.left = -frustumSize * aspect / 2
    camera.right = frustumSize * aspect / 2
    camera.top = frustumSize / 2
    camera.bottom = -frustumSize / 2
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  })

  window.addEventListener('dblclick', () => {
    if (!document.fullscreenElement) {
      if (canvas.requestFullscreen) {
        canvas.requestFullscreen()
      }
    } else {
      document.exitFullscreen()
    }
  })

  // Camera
  // OrthographicCamera
  let frustumSize = 5 // 初始视锥大小
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
    const delta = clock.getDelta();
    // Update updates
    updates.forEach(update => update(delta));
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
