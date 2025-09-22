<script setup lang="ts">
import { onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { gsap } from 'gsap'

// 在几何体表面均匀采样点的函数
function samplePoints(geometry: THREE.BufferGeometry, count: number) {
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
function createAnimatedPoints(surfaceGeo: THREE.BufferGeometry, globalMinY: number, globalMaxY: number, type: 'before' | 'after') {
  const surfacePositions = surfaceGeo.attributes.position.array;
  const sampledCount = surfacePositions.length / 3;

  const initialPositions = new Float32Array(sampledCount * 3);
  const randomPositions = new Float32Array(sampledCount * 3);
  const colors = new Float32Array(sampledCount * 4);

  const yRange = globalMaxY - globalMinY;

  // 颜色控制：降低饱和度并稍微变暗，避免刺眼
  const SATURATION = 0.65; // 0..1，越小越灰
  const GRAY = 0.4;       // 0..1，混合用的灰度值（偏暗更柔和）

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

    // 初始颜色：统一为“去饱和红”，仅 alpha 按阶段不同
    const r0 = GRAY * (1 - SATURATION) + 1.0 * SATURATION;
    const g0 = GRAY * (1 - SATURATION) + 0.0 * SATURATION;
    const b0 = GRAY * (1 - SATURATION) + 0.0 * SATURATION;
    colors[i * 4] = r0;
    colors[i * 4 + 1] = g0;
    colors[i * 4 + 2] = b0;
    colors[i * 4 + 3] = (type === 'before') ? 1.0 : 0.0;
  }

  // 创建 geometry
  const geo = new THREE.BufferGeometry();
  if (type === 'before') {
    geo.setAttribute("position", new THREE.BufferAttribute(initialPositions.slice(), 3));
  } else {
    geo.setAttribute("position", new THREE.BufferAttribute(randomPositions.slice(), 3));
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 4));

  const material = new THREE.PointsMaterial({
    size: 0.03,
    vertexColors: true,
    transparent: true,
    alphaTest: 0.01,
    depthWrite: false,
  });

  const points = new THREE.Points(geo, material);

  let startTime = 0; // 动画开始时间
  const layerDelay = 1.0 + Math.random() * 0.25; // 每层的延迟时间（秒）
  const phaseDuration = 1.0 + Math.random() * 0.25; // 每个阶段持续时间（秒）
  const estimatedDuration = (type === 'before')
    ? (layerDelay + phaseDuration * 2)
    : (layerDelay + phaseDuration * 3);

  function update(_delta: number) {
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

      if (type === 'before') {
        if (localElapsed < 0) {
          progress = 0;
        } else if (localElapsed < phaseDuration * 2) {
          progress = localElapsed / (phaseDuration * 2);
          progress = easeInOutQuad(progress);
        } else {
          progress = 1;
        }
        // 从initial到random
        const targetX = THREE.MathUtils.lerp(initialPositions[i * 3], randomPositions[i * 3], progress);
        const targetY = THREE.MathUtils.lerp(initialPositions[i * 3 + 1], randomPositions[i * 3 + 1], progress);
        const targetZ = THREE.MathUtils.lerp(initialPositions[i * 3 + 2], randomPositions[i * 3 + 2], progress);
        posAttr.setXYZ(i, targetX, targetY, targetZ);
        // 颜色：红 -> 绿（去饱和），alpha: 1 -> 0
        {
          const baseR = 1 - progress;
          const baseG = progress;
          const baseB = 0;
          const r = GRAY * (1 - SATURATION) + baseR * SATURATION;
          const g = GRAY * (1 - SATURATION) + baseG * SATURATION;
          const b = GRAY * (1 - SATURATION) + baseB * SATURATION;
          colAttr.setXYZ(i, r, g, b);
          colAttr.setW(i, 1 - progress);
        }
      } else {
        if (localElapsed < phaseDuration) {
          progress = 0;
        } else {
          const afterElapsed = localElapsed - phaseDuration;
          if (afterElapsed < 0) {
            progress = 0;
          } else if (afterElapsed < phaseDuration * 2) {
            progress = afterElapsed / (phaseDuration * 2);
            progress = easeInOutQuad(progress);
          } else {
            progress = 1;
          }
        }
        // 从random到initial
        const targetX = THREE.MathUtils.lerp(randomPositions[i * 3], initialPositions[i * 3], progress);
        const targetY = THREE.MathUtils.lerp(randomPositions[i * 3 + 1], initialPositions[i * 3 + 1], progress);
        const targetZ = THREE.MathUtils.lerp(randomPositions[i * 3 + 2], initialPositions[i * 3 + 2], progress);
        posAttr.setXYZ(i, targetX, targetY, targetZ);
        // 颜色：红 -> 绿（去饱和），alpha: 0 -> 1
        {
          const baseR = 1 - progress;
          const baseG = progress;
          const baseB = 0;
          const r = GRAY * (1 - SATURATION) + baseR * SATURATION;
          const g = GRAY * (1 - SATURATION) + baseG * SATURATION;
          const b = GRAY * (1 - SATURATION) + baseB * SATURATION;
          colAttr.setXYZ(i, r, g, b);
          colAttr.setW(i, progress);
        }
      }
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  }

  function restart() {
    startTime = 0;
  }

  return { points, update, restart, estimatedDuration };
}

// 辅助：收集模型中所有材质
function collectMaterials(model: THREE.Group): THREE.Material[] {
  const materials: THREE.Material[] = [];
  model.traverse((child) => {
    if ((child as any).isMesh) {
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.Material | THREE.Material[];
      if (Array.isArray(mat)) {
        mat.forEach(m => materials.push(m));
      } else if (mat) {
        materials.push(mat);
      }
    }
  });
  return materials;
}

// 辅助：设置整模透明度（并开启透明）
function setModelOpacity(model: THREE.Group, opacity: number) {
  model.traverse((child) => {
    if ((child as any).isMesh) {
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.Material | THREE.Material[];
      const handle = (m: THREE.Material) => {
        m.transparent = true;
        (m as any).opacity = opacity;
        // 可按需：m.depthWrite = opacity >= 1; // 避免半透明排序问题
        m.needsUpdate = true;
      };
      if (Array.isArray(mat)) {
        mat.forEach(handle);
      } else if (mat) {
        handle(mat);
      }
    }
  });
}


onMounted(() => {

  const clock = new THREE.Clock();
  // 点云动画集合与控制
  const animatedPoints: { points: THREE.Points, update: (delta: number) => void, restart: () => void, estimatedDuration: number }[] = [];
  let pointsActive = false;

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
  let beforeModel: THREE.Group | null = null;
  let afterModel: THREE.Group | null = null;

  const loader = new GLTFLoader();

  function processModels(beforeModel: THREE.Group, afterModel: THREE.Group) {
    // 分别计算每个模型的包围盒并居中
    const beforeBox = new THREE.Box3().setFromObject(beforeModel);
    const beforeCenter = beforeBox.getCenter(new THREE.Vector3());
    beforeModel.position.sub(beforeCenter);

    const afterBox = new THREE.Box3().setFromObject(afterModel);
    const afterCenter = afterBox.getCenter(new THREE.Vector3());
    afterModel.position.sub(afterCenter);

    // 计算联合包围盒用于相机和视锥调整
    const combinedBox = new THREE.Box3().union(beforeBox).union(afterBox);

    // 计算包围盒大小并调整相机
    const size = combinedBox.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const cameraDistance = maxDim * 1.2; // 缓冲系数
    camera.position.z = cameraDistance;

    // 调整正交相机视锥大小
    const aspect = sizes.width / sizes.height;
    frustumSize = maxDim * 1.2;
    camera.left = -frustumSize * aspect / 2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = -frustumSize / 2;
    camera.updateProjectionMatrix();

    // 更新控件
    controls.update();

    // 先遍历所有mesh，计算全局Y轴范围
    let globalMinY = Infinity, globalMaxY = -Infinity;
    [beforeModel, afterModel].forEach(model => {
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // 确保几何为非索引
          const geo = child.geometry.index ? child.geometry.toNonIndexed() : child.geometry.clone();
          // 应用世界矩阵
          child.updateWorldMatrix(true, false);
          const worldGeo = geo.clone();
          worldGeo.applyMatrix4(child.matrixWorld);
          // 采样点
          const sampledGeo = samplePoints(worldGeo, 1500);
          const positions = sampledGeo.attributes.position.array;
          const sampledCount = positions.length / 3;
          for (let i = 0; i < sampledCount; i++) {
            const y = positions[i * 3 + 1];
            if (y < globalMinY) globalMinY = y;
            if (y > globalMaxY) globalMaxY = y;
          }
        }
      });
    });

    // 生成点云
    [beforeModel, afterModel].forEach((model, index) => {
      const type = index === 0 ? 'before' : 'after';
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // 确保几何为非索引
          const geo = child.geometry.index ? child.geometry.toNonIndexed() : child.geometry.clone();

          // 把世界矩阵应用到几何，使顶点成为世界坐标
          child.updateWorldMatrix(true, false);
          const worldGeo = geo.clone();
          worldGeo.applyMatrix4(child.matrixWorld);

          // 在 worldGeo 上采样点
          const sampledGeo = samplePoints(worldGeo, 1500);

          // 使用 createAnimatedPoints 创建动画点云
          const { points, update, restart, estimatedDuration } = createAnimatedPoints(sampledGeo, globalMinY, globalMaxY, type);

          // 重要：点已经是世界坐标，不要让 Three 再对它进行父级变换
          points.matrixAutoUpdate = false;
          // 将 points 加到 scene
          points.visible = false; // 初始隐藏，按时间线显示
          scene.add(points);

          // 收集点云动画控制
          animatedPoints.push({ points, update, restart, estimatedDuration });
        }
      });
    });

    scene.add(beforeModel);
    scene.add(afterModel);

    // 初始：仅显示 before 模型，after 隐藏且透明
    setModelOpacity(beforeModel, 1);
    beforeModel.visible = true;
    setModelOpacity(afterModel, 0);
    afterModel.visible = false;

    // 计算点云动画估计总时长（取最大，并加少量缓冲）
    const pointsAnimDuration = (animatedPoints.length > 0)
      ? Math.max(...animatedPoints.map(p => p.estimatedDuration)) + 0.25
      : 0;

    // 时间线：展示 before -> 淡出 -> 点云 -> 淡入 after
    const tl = gsap.timeline();
    // 稍作停顿
    tl.to({}, { duration: 0.5 });

    // 淡出 before
    tl.to(collectMaterials(beforeModel), {
      opacity: 0,
      duration: 1.0,
      onStart: () => {
        beforeModel.visible = true;
      },
      onComplete: () => {
        beforeModel.visible = false;
      }
    });

    // 点云阶段：淡入 -> 播放 -> 淡出
    if (pointsAnimDuration > 0) {
      // 收集所有点云材质
      const pointsMaterials = animatedPoints.map(p => p.points.material as THREE.PointsMaterial);
      const fadeInDur = 0.6;
      const fadeOutDur = 0.6;
      const coreWait = Math.max(0, pointsAnimDuration - (fadeInDur + fadeOutDur));

      // 开始点云并将不透明度置 0
      tl.add(() => {
        animatedPoints.forEach(p => {
          p.points.visible = true;
          p.restart();
        });
        pointsActive = true;
        pointsMaterials.forEach(m => {
          m.transparent = true;
          m.opacity = 0;
          m.needsUpdate = true;
        });
      });

      // 淡入点云
      tl.to(pointsMaterials, { opacity: 1, duration: fadeInDur, ease: 'power2.out' });

      // 点云主体播放
      if (coreWait > 0) {
        tl.to({}, { duration: coreWait });
      }

      // 淡出点云
      tl.to(pointsMaterials, { opacity: 0, duration: fadeOutDur, ease: 'power2.in' });

      // 结束点云，显示 after 并淡入
      tl.add(() => {
        pointsActive = false;
        animatedPoints.forEach(p => p.points.visible = false);
        afterModel.visible = true;
        setModelOpacity(afterModel, 0);
      });
      tl.to(collectMaterials(afterModel), { opacity: 1, duration: 1.0 });
    } else {
      // 若无点云动画，直接切到 after
      tl.add(() => {
        afterModel.visible = true;
        setModelOpacity(afterModel, 0);
      });
      tl.to(collectMaterials(afterModel), { opacity: 1, duration: 1.0 });
    }
  }

  loader.load('before.glb', (gltf) => {
    beforeModel = gltf.scene;
    if (afterModel) processModels(beforeModel, afterModel);
  });

  loader.load('after.glb', (gltf) => {
    afterModel = gltf.scene;
    if (beforeModel) processModels(beforeModel, afterModel);
  });

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
    // 点云阶段时更新点云动画
    if (pointsActive) {
      animatedPoints.forEach(p => p.update(delta));
    }
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
