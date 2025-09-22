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

  // Lights (match demo1)
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

  // Camera (Orthographic to match demo1)
  let frustumSize = 5 // initial frustum size
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

  // Keep references for transition + scan
  const baseMaterials: THREE.Material[] = []
  const wireframeMeshes: THREE.Mesh[] = []
  let scanMaterial: THREE.ShaderMaterial | null = null
  let modelBounds: THREE.Box3 | null = null
  let phase: 'fadeOutSolid' | 'fadeInWire' | 'scan' | 'fadeOutWire' | 'fadeInSolid' = 'fadeOutSolid'
  let transitionProgress = 0 // 0 -> 1 (reused per phase)
  let time = 0
  let scanOpacity = 0
  let scanCycles = 0 // completed back-and-forth cycles

  // Load after.glb and fit camera
  const loader = new GLTFLoader()
  loader.load(
    'after.glb',
    (gltf) => {
      const model = gltf.scene
      // center the model at origin
      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      model.position.sub(center)
      scene.add(model)

      // recompute bounds after centering
      const centeredBox = new THREE.Box3().setFromObject(model)
      modelBounds = centeredBox.clone()
      const size = centeredBox.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)

      // position camera and adjust orthographic frustum
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

      // Prepare materials for transition and scan overlays
      // Shared wireframe material (blue)
      const sharedWireframeMat = new THREE.MeshBasicMaterial({
        color: 0x00aaff,
        wireframe: true,
        transparent: true,
        opacity: 0,
        depthTest: false,
        depthWrite: false
      })

      // Shared scanline shader material (blue additive)
      const uniforms = {
        uTime: { value: 0 },
        uMinY: { value: modelBounds.min.y },
        uMaxY: { value: modelBounds.max.y },
        uLineWidth: { value: size.y * 0.03 }, // line thickness in world units
        uColor: { value: new THREE.Color(0x00aaff) },
        uGlobalOpacity: { value: 0 },
        uSpeed: { value: 0.25 } // smaller -> slower
      }
      scanMaterial = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: `
          varying vec3 vWorldPos;
          void main() {
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPos = worldPos.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPos;
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform float uMinY;
          uniform float uMaxY;
          uniform float uLineWidth;
          uniform vec3 uColor;
          uniform float uGlobalOpacity;
          uniform float uSpeed;
          varying vec3 vWorldPos;

          // Triangle wave progress 0..1..0 starting at 0 (bottom)
          float tri(float t){
            float f = fract(t);
            return 1.0 - abs(2.0 * f - 1.0);
          }

          void main() {
            float p = tri(uTime * uSpeed);
            float scanY = mix(uMinY, uMaxY, p);
            float d = abs(vWorldPos.y - scanY);
            // Soft line with smooth edge
            float alpha = 1.0 - smoothstep(0.0, uLineWidth, d);
            // Slight glow falloff
            float glow = 1.0 - smoothstep(uLineWidth, uLineWidth * 4.0, d);
            vec3 color = uColor * (0.8 + 0.2 * glow);
            gl_FragColor = vec4(color, alpha * uGlobalOpacity);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })

      // Snapshot original meshes, then add overlays to avoid modifying graph during traverse
      const originalMeshes: THREE.Mesh[] = []
      model.traverse((child) => {
        if ((child as any).isMesh) originalMeshes.push(child as THREE.Mesh)
      })

      for (const mesh of originalMeshes) {
        // Collect base materials and make them fade-able
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => {
            ;(mat as any).transparent = true
            ;(mat as any).opacity = 1
            baseMaterials.push(mat)
          })
        } else if (mesh.material) {
          const mat = mesh.material as THREE.Material & { transparent?: boolean; opacity?: number }
          mat.transparent = true
          ;(mat as any).opacity = 1
          baseMaterials.push(mat)
        }

        // Wireframe overlay
        const wire = new THREE.Mesh(mesh.geometry, sharedWireframeMat)
        wire.frustumCulled = mesh.frustumCulled
        wire.renderOrder = 10
        mesh.add(wire)
        wireframeMeshes.push(wire)

        // Scanline overlay
        if (scanMaterial) {
          const scan = new THREE.Mesh(mesh.geometry, scanMaterial)
          scan.frustumCulled = mesh.frustumCulled
          scan.renderOrder = 11
          mesh.add(scan)
        }
      }
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
    // Animation timings
    time += 0.02

    // Phase A: fade out solid first
    if (phase === 'fadeOutSolid') {
      transitionProgress = Math.min(1, transitionProgress + 0.02) // ~1s
      const baseOpacity = 1 - transitionProgress
      for (const mat of baseMaterials) {
        ;(mat as any).opacity = baseOpacity
      }
      // keep wireframe invisible during fade-out
      for (const wf of wireframeMeshes) {
        const mat = wf.material as THREE.MeshBasicMaterial
        mat.opacity = 0
      }
      if (transitionProgress >= 1) {
        phase = 'fadeInWire'
        transitionProgress = 0
      }
    }

    // Phase B: then fade in blue wireframe
    if (phase === 'fadeInWire') {
      transitionProgress = Math.min(1, transitionProgress + 0.02) // ~1s
      const wireOpacity = transitionProgress
      for (const wf of wireframeMeshes) {
        const mat = wf.material as THREE.MeshBasicMaterial
        mat.opacity = wireOpacity
      }
      if (transitionProgress >= 1) {
        phase = 'scan'
        // prepare scan start from bottom smoothly
        time = 0
        scanOpacity = 0
        if (scanMaterial) {
          scanMaterial.uniforms.uGlobalOpacity.value = 0
        }
      }
    }

    // Phase C: ping-pong scanline along Y, starting from bottom
    if (phase === 'scan') {
      if (scanMaterial && modelBounds) {
        // advance time & uniforms
        scanMaterial.uniforms.uTime.value = time
        scanOpacity = Math.min(1, scanOpacity + 0.03)
        scanMaterial.uniforms.uGlobalOpacity.value = scanOpacity

        // detect completed cycles: one cycle = uTime * uSpeed increases by 2.0
        const u = scanMaterial.uniforms
        const speed = (u.uSpeed as any).value as number
        const cyclesCompleted = Math.floor((time * speed) / 1.0)
        if (cyclesCompleted > scanCycles) {
          scanCycles = cyclesCompleted
        }
        // after two full cycles, move to fade-out wireframe
        if (scanCycles >= 2) {
          phase = 'fadeOutWire'
          transitionProgress = 0
        }
      }
    }

    // Phase D: fade out wireframe
    if (phase === 'fadeOutWire') {
      transitionProgress = Math.min(1, transitionProgress + 0.02)
      const wireOpacity = 1 - transitionProgress
      for (const wf of wireframeMeshes) {
        const mat = wf.material as THREE.MeshBasicMaterial
        mat.opacity = wireOpacity
      }
      // keep scan line following wireframe visibility
      if (scanMaterial) {
        scanMaterial.uniforms.uGlobalOpacity.value = wireOpacity
      }
      if (transitionProgress >= 1) {
        phase = 'fadeInSolid'
        transitionProgress = 0
      }
    }

    // Phase E: fade in solid mesh
    if (phase === 'fadeInSolid') {
      transitionProgress = Math.min(1, transitionProgress + 0.02)
      const baseOpacity = transitionProgress
      for (const mat of baseMaterials) {
        ;(mat as any).opacity = baseOpacity
      }
      // ensure overlays remain hidden
      for (const wf of wireframeMeshes) {
        const mat = wf.material as THREE.MeshBasicMaterial
        mat.opacity = 0
      }
      if (scanMaterial) {
        scanMaterial.uniforms.uGlobalOpacity.value = 0
      }
      // remain in this phase or stop updating; here we simply keep rendering with solid
    }

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
    // Best-effort dispose custom materials
    wireframeMeshes.forEach((wf) => {
      if (wf.material && (wf.material as any).dispose) {
        ;(wf.material as any).dispose()
      }
    })
    if (scanMaterial) scanMaterial.dispose()
  })
})
</script>

<template>
  <canvas class="webgl"></canvas>
</template>
