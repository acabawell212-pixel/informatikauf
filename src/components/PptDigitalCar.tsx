import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const MODEL_URL = `${import.meta.env.BASE_URL}models/lamborghini-aventador-svj.glb`;

const disposeMaterial = (material: THREE.Material | undefined) => {
  if (!material) return;
  const standard = material as THREE.MeshStandardMaterial;
  standard.map?.dispose();
  standard.normalMap?.dispose();
  standard.roughnessMap?.dispose();
  standard.metalnessMap?.dispose();
  standard.alphaMap?.dispose();
  material.dispose();
};

/**
 * Cinema-style turntable of the Lamborghini Aventador SVJ (real GLB geometry)
 * used as the intro visual of the presentation.
 */
export function PptDigitalCar() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setFailed(true);
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmall = window.matchMedia('(max-width: 760px)').matches;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);

    // Procedural studio HDR so metallic paint, glass and rims get real reflections.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment;
    scene.environmentIntensity = 1.1;

    let disposed = false;
    let frame = 0;
    let lastFrame = 0;
    let startTime = 0;
    let visible = true;
    let pointerX = 0;
    let pointerY = 0;
    let pointerTargetX = 0;
    let pointerTargetY = 0;
    let car: THREE.Group | null = null;
    let carRadius = 2.3;
    const carCenter = new THREE.Vector3(0, 0.42, 0);
    let shadowSize = 4.5;

    // ---------- Studio floor + soft contact shadow ----------
    const glowTexture = (() => {
      const size = 256;
      const surface = document.createElement('canvas');
      surface.width = size;
      surface.height = size;
      const ctx = surface.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, 'rgba(232, 202, 131, 0.30)');
        gradient.addColorStop(0.42, 'rgba(113, 196, 165, 0.12)');
        gradient.addColorStop(1, 'rgba(7, 17, 15, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
      }
      const texture = new THREE.CanvasTexture(surface);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    })();

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.6 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(11, 11),
      new THREE.MeshBasicMaterial({
        map: glowTexture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 0.004;
    scene.add(glow);

    // ---------- Cinematic lighting ----------
    scene.add(new THREE.HemisphereLight(0xf3f7f4, 0x0b1713, 0.5));

    const keyLight = new THREE.DirectionalLight(0xfff4dc, 3.4);
    keyLight.position.set(-4.6, 6, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 26;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);
    scene.add(keyLight.target);

    const rimLight = new THREE.DirectionalLight(0x71c4a5, 2.6);
    rimLight.position.set(4.8, 2.6, -6);
    scene.add(rimLight);

    const warmRim = new THREE.DirectionalLight(0xe8ca83, 1.7);
    warmRim.position.set(-5.4, 1.4, -4);
    scene.add(warmRim);

    const frontFill = new THREE.DirectionalLight(0xdfe9ff, 0.8);
    frontFill.position.set(3, 1.4, 7);
    scene.add(frontFill);

    // ---------- Load the GLB ----------
    const paintColor = new THREE.Color('#1f8f66');
    const detailGold = new THREE.Color('#e8ca83');
    const glass = new THREE.Color('#050b09');

    const loader = new GLTFLoader();
    loader.load(
      MODEL_URL,
      (gltf) => {
        if (disposed) return;
        const root = gltf.scene;

        root.traverse((object) => {
          const mesh = object as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          const recreate = (material: THREE.Material): THREE.Material => {
            const standard = material as THREE.MeshStandardMaterial;
            if (!standard.isMeshStandardMaterial) return material;
            const name = standard.name.toLowerCase();
            const physical = new THREE.MeshPhysicalMaterial({
              name: standard.name,
              color: standard.color,
              map: standard.map,
              normalMap: standard.normalMap,
              normalScale: standard.normalScale,
              roughness: standard.roughness,
              metalness: standard.metalness,
              alphaMap: standard.alphaMap,
              transparent: standard.transparent,
              opacity: standard.opacity,
              side: standard.side,
              envMapIntensity: 1.15,
            });

            if (name.includes('paint') && !name.includes('black') && !name.includes('red')) {
              // Premium metallic paint with a hard clearcoat.
              physical.color = paintColor;
              physical.metalness = 0.88;
              physical.roughness = 0.2;
              physical.clearcoat = 1;
              physical.clearcoatRoughness = 0.04;
              physical.envMapIntensity = 1.4;
            } else if (name.includes('carbon')) {
              physical.metalness = 0.55;
              physical.roughness = 0.3;
              physical.clearcoat = 0.9;
              physical.clearcoatRoughness = 0.1;
              physical.envMapIntensity = 1.2;
            } else if (name.includes('window') || name.includes('glass')) {
              physical.color = glass;
              physical.metalness = 0.12;
              physical.roughness = 0.03;
              physical.transparent = true;
              physical.opacity = name.includes('window') ? 0.66 : 0.55;
              physical.clearcoat = 1;
              physical.clearcoatRoughness = 0.02;
              physical.envMapIntensity = 1.7;
              physical.depthWrite = false;
            } else if (name.includes('wheel') || name.includes('rim')) {
              physical.metalness = 0.92;
              physical.roughness = 0.26;
              physical.envMapIntensity = 1.25;
            } else if (name.includes('light')) {
              physical.emissive = new THREE.Color('#cfe9ff');
              physical.emissiveIntensity = 1.4;
              physical.emissiveMap = standard.map;
              physical.metalness = 0.4;
              physical.roughness = 0.16;
            } else if (name.includes('plate') || name.includes('badge')) {
              physical.metalness = 0.8;
              physical.roughness = 0.28;
              physical.color = detailGold;
            }
            physical.needsUpdate = true;
            material.dispose();
            return physical;
          };

          mesh.material = Array.isArray(mesh.material)
            ? mesh.material.map(recreate)
            : recreate(mesh.material);
        });

        // Normalize: centre on origin and sit the wheels exactly on the studio floor.
        root.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        root.position.sub(center);
        root.position.y += size.y / 2;

        const longSide = Math.max(size.x, size.z);
        const scale = 4.6 / longSide;
        const scaled = new THREE.Group();
        scaled.add(root);
        scaled.scale.setScalar(scale);
        // Source model is Z-long: turn it across the frame, then on to a front 3/4.
        if (size.z > size.x) scaled.rotation.y = Math.PI / 2;
        scaled.rotation.y += Math.PI * 0.24;
        scene.add(scaled);

        car = scaled;
        carRadius = longSide * scale * 0.5;
        carCenter.set(0, (size.y * scale) * 0.5, 0);
        shadowSize = longSide * scale * 0.62;

        keyLight.shadow.camera.left = -shadowSize;
        keyLight.shadow.camera.right = shadowSize;
        keyLight.shadow.camera.top = shadowSize;
        keyLight.shadow.camera.bottom = -shadowSize;
        keyLight.shadow.camera.updateProjectionMatrix();
        keyLight.target.position.copy(carCenter);
        glow.scale.setScalar((longSide * scale) / 4.6);
      },
      undefined,
      () => {
        if (!disposed) setFailed(true);
      },
    );

    const resize = () => {
      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      pointerTargetX = Math.max(-1, Math.min(1, (event.clientX / window.innerWidth - 0.5) * 2));
      pointerTargetY = Math.max(-1, Math.min(1, (event.clientY / window.innerHeight - 0.5) * 2));
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    const resizeObserver = new ResizeObserver(resize);

    resize();
    observer.observe(canvas);
    resizeObserver.observe(canvas);
    window.addEventListener('pointermove', onPointerMove);

    const cameraPosition = new THREE.Vector3();
    const lookAt = new THREE.Vector3();

    const render = (now: number) => {
      frame = window.requestAnimationFrame(render);
      if (!visible || document.hidden) return;
      const throttle = isSmall || reducedMotion ? 30 : 45;
      if (now - lastFrame < 1000 / throttle) return;
      lastFrame = now;
      if (!startTime) startTime = now;

      const elapsed = (now - startTime) / 1000;
      pointerX += (pointerTargetX - pointerX) * 0.05;
      pointerY += (pointerTargetY - pointerY) * 0.05;

      if (reducedMotion) {
        camera.position.set(carRadius * 1.05, carRadius * 0.42, carRadius * 1.42);
      } else {
        // Slow low-angle cinematic orbit around the front three-quarter.
        const yaw = elapsed * 0.2 + pointerX * 0.5;
        const lift = Math.sin(elapsed * 0.45) * 0.03 + pointerY * 0.06;
        const radius = carRadius * 1.9;
        cameraPosition.set(
          Math.sin(yaw) * radius,
          radius * (0.21 + lift),
          Math.cos(yaw) * radius,
        );
        camera.position.lerp(cameraPosition, 0.1);
      }
      lookAt.set(0, carCenter.y * 0.72, 0);
      camera.lookAt(lookAt);
      renderer.render(scene, camera);
    };

    camera.position.set(carRadius * 1.05, carRadius * 0.42, carRadius * 1.42);
    camera.lookAt(0, carCenter.y * 0.72, 0);
    frame = window.requestAnimationFrame(render);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      car?.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry?.dispose();
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach(disposeMaterial);
      });
      glowTexture.dispose();
      floor.geometry.dispose();
      disposeMaterial(floor.material as THREE.Material);
      glow.geometry.dispose();
      disposeMaterial(glow.material as THREE.Material);
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <figure className="ppt-digital-car" aria-hidden="true">
      <canvas className="ppt-digital-car-canvas" ref={canvasRef} aria-hidden="true" />
      {failed && <span className="ppt-digital-car-error" />}
    </figure>
  );
}
