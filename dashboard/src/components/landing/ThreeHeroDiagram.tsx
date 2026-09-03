import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LandingTranslation } from '../../i18n/landing';
import { RotateCw, Eye } from 'lucide-react';

interface ThreeHeroDiagramProps {
  lang: 'th' | 'en';
  onSelectEquipment: (id: string) => void;
  selectedEquipmentId?: string | null;
  t: LandingTranslation;
}

type CameraViewMode = 'iso' | 'cold' | 'hot' | 'top';

export const ThreeHeroDiagram: React.FC<ThreeHeroDiagramProps> = ({
  lang,
  onSelectEquipment,
  t,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const onSelectRef = useRef(onSelectEquipment);
  onSelectRef.current = onSelectEquipment;

  const [autoRotate, setAutoRotate] = useState(false);
  const [activeView, setActiveView] = useState<CameraViewMode>('iso');
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 540;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b12);
    scene.fog = new THREE.FogExp2(0x070b12, 0.022);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(11, 8.5, 14);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls (Smooth & Stable)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.75;
    controls.zoomSpeed = 0.8;
    controls.panSpeed = 0.5;
    controls.maxPolarAngle = Math.PI / 2 - 0.06; // Prevent diving under floor
    controls.minPolarAngle = Math.PI / 12;
    controls.minDistance = 6;
    controls.maxDistance = 26;
    controls.target.set(0.5, 1.8, 0); // Focus center of the equipment row
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.8;
    controlsRef.current = controls;

    // Stop auto-rotate immediately when user touches / drags
    const onPointerDown = () => {
      if (controls.autoRotate) {
        controls.autoRotate = false;
        setAutoRotate(false);
      }
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    // 5. Lighting Setup (Bright, clean, enterprise data center look)
    const ambientLight = new THREE.AmbientLight(0x1e293b, 2.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.8);
    mainLight.position.set(12, 22, 14);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    fillLight.position.set(-14, 15, -10);
    scene.add(fillLight);

    // Cold Aisle Cyan Light
    const coldAisleLight = new THREE.PointLight(0x06b6d4, 3.5, 12);
    coldAisleLight.position.set(0, 3.0, 2.5);
    scene.add(coldAisleLight);

    // Hot Aisle Rose Light
    const hotAisleLight = new THREE.PointLight(0xf43f5e, 3.0, 12);
    hotAisleLight.position.set(0, 3.0, -2.5);
    scene.add(hotAisleLight);

    // UPS Area Amber Light
    const upsLight = new THREE.PointLight(0x10b981, 2.2, 10);
    upsLight.position.set(4.8, 3.0, 0);
    scene.add(upsLight);

    // 6. Data Center Raised Floor Platform (Clean, High-Tech Tiles)
    const platformGeo = new THREE.BoxGeometry(15, 0.4, 11);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.7,
      metalness: 0.3,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -0.2;
    scene.add(platform);

    // Grid on top of floor
    const gridHelper = new THREE.GridHelper(14, 14, 0x0284c7, 0x1e293b);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Floor Marker: COLD AISLE (Blue Zone in front)
    const coldZoneGeo = new THREE.PlaneGeometry(8.5, 3.0);
    const coldZoneMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.18,
    });
    const coldZone = new THREE.Mesh(coldZoneGeo, coldZoneMat);
    coldZone.rotation.x = -Math.PI / 2;
    coldZone.position.set(0, 0.02, 2.2);
    scene.add(coldZone);

    // Floor Marker: HOT AISLE (Red Zone in back)
    const hotZoneGeo = new THREE.PlaneGeometry(8.5, 3.0);
    const hotZoneMat = new THREE.MeshBasicMaterial({
      color: 0xbe123c,
      transparent: true,
      opacity: 0.16,
    });
    const hotZone = new THREE.Mesh(hotZoneGeo, hotZoneMat);
    hotZone.rotation.x = -Math.PI / 2;
    hotZone.position.set(0, 0.02, -2.2);
    scene.add(hotZone);

    // Glowing Power Busway Conduits Underfloor
    const makeConduit = (points: THREE.Vector3[], colorHex: number) => {
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.07, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({ color: colorHex });
      scene.add(new THREE.Mesh(tubeGeo, tubeMat));
    };

    // Feed A (Cyan)
    makeConduit([
      new THREE.Vector3(-6.5, 0.03, 3.2),
      new THREE.Vector3(-2.2, 0.03, 1.2),
      new THREE.Vector3(4.8, 0.03, 1.2),
    ], 0x06b6d4);

    // Feed B (Emerald)
    makeConduit([
      new THREE.Vector3(-6.5, 0.03, -3.2),
      new THREE.Vector3(2.2, 0.03, -1.2),
      new THREE.Vector3(4.8, 0.03, -1.2),
    ], 0x10b981);

    // Clickable interactive objects
    const clickableObjects: THREE.Object3D[] = [];

    // Helper: Build a 42U Server Rack (Clean Enterprise NetShelter Style)
    const createRack = (id: string, posX: number, primaryColor: number) => {
      const rackGroup = new THREE.Group();
      rackGroup.name = id;

      // Dark Matte Frame
      const frameGeo = new THREE.BoxGeometry(1.9, 4.2, 2.2);
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.4,
        metalness: 0.8,
      });
      const rackFrame = new THREE.Mesh(frameGeo, frameMat);
      rackFrame.position.y = 2.1;
      rackGroup.add(rackFrame);

      // 8x 2U Server Blades inside
      for (let i = 0; i < 8; i++) {
        const bladeGeo = new THREE.BoxGeometry(1.65, 0.36, 2.15);
        const bladeMat = new THREE.MeshStandardMaterial({
          color: 0x1f2937,
          roughness: 0.3,
          metalness: 0.9,
        });
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.set(0, 0.65 + i * 0.44, 0.02);
        rackGroup.add(blade);

        // Front HDD Bays / Grille line
        const grilleGeo = new THREE.BoxGeometry(1.2, 0.12, 0.02);
        const grilleMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
        const grille = new THREE.Mesh(grilleGeo, grilleMat);
        grille.position.set(0.1, 0.65 + i * 0.44, 1.11);
        rackGroup.add(grille);

        // Front Status LEDs (Green, Cyan, Blue)
        const ledGeo = new THREE.SphereGeometry(0.028, 6, 6);
        const ledMat1 = new THREE.MeshBasicMaterial({ color: 0x10b981 });
        const ledMat2 = new THREE.MeshBasicMaterial({ color: primaryColor });
        const led1 = new THREE.Mesh(ledGeo, ledMat1);
        const led2 = new THREE.Mesh(ledGeo, ledMat2);
        led1.position.set(-0.62, 0.65 + i * 0.44, 1.11);
        led2.position.set(-0.52, 0.65 + i * 0.44, 1.11);
        rackGroup.add(led1);
        rackGroup.add(led2);
      }

      // Vertical 0U PDU on Rear Post
      const pduGeo = new THREE.BoxGeometry(0.1, 3.6, 0.1);
      const pduMat = new THREE.MeshStandardMaterial({
        color: primaryColor,
        emissive: primaryColor,
        emissiveIntensity: 0.6,
      });
      const pdu = new THREE.Mesh(pduGeo, pduMat);
      pdu.position.set(0.85, 2.1, -1.05);
      rackGroup.add(pdu);

      rackGroup.position.set(posX, 0, 0);
      scene.add(rackGroup);
      clickableObjects.push(rackFrame);
      return rackGroup;
    };

    // 1. Compute Rack A (Left, x = -2.2)
    createRack('rack-a', -2.2, 0x06b6d4);

    // 2. In-Row Precision Cooling Unit (Center, x = 0.0)
    const coolerGroup = new THREE.Group();
    coolerGroup.name = 'cooling';

    const coolerGeo = new THREE.BoxGeometry(1.3, 4.2, 2.2);
    const coolerMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.25,
      metalness: 0.75,
      emissive: 0x0369a1,
      emissiveIntensity: 0.25,
    });
    const coolerMesh = new THREE.Mesh(coolerGeo, coolerMat);
    coolerMesh.position.y = 2.1;
    coolerGroup.add(coolerMesh);

    // Rotating EC Fan Turbine on Front
    const fanGroup = new THREE.Group();
    fanGroup.position.set(0, 2.1, 1.11);
    for (let b = 0; b < 6; b++) {
      const bladeGeo = new THREE.BoxGeometry(0.08, 0.5, 0.02);
      const bladeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.rotation.z = (b * Math.PI) / 3;
      fanGroup.add(blade);
    }
    coolerGroup.add(fanGroup);

    // Fan Outer Ring
    const ringGeo = new THREE.RingGeometry(0.48, 0.54, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(0, 2.1, 1.115);
    coolerGroup.add(ring);

    // Digital Temperature Display on Chiller
    const screenGeo = new THREE.PlaneGeometry(0.7, 0.3);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x0c4a6e });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 3.6, 1.11);
    coolerGroup.add(screen);

    coolerGroup.position.set(0, 0, 0);
    scene.add(coolerGroup);
    clickableObjects.push(coolerMesh);

    // 3. Compute Rack B (Right, x = 2.2)
    createRack('rack-b', 2.2, 0x10b981);

    // 4. Modular 2N UPS & Battery Bank (Power Bay, x = 4.8)
    const upsGroup = new THREE.Group();
    upsGroup.name = 'ups';

    const upsGeo = new THREE.BoxGeometry(1.8, 3.9, 2.2);
    const upsMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.5,
      metalness: 0.7,
    });
    const upsMesh = new THREE.Mesh(upsGeo, upsMat);
    upsMesh.position.y = 1.95;
    upsGroup.add(upsMesh);

    // Battery LED bar meters
    for (let l = 0; l < 5; l++) {
      const barG = new THREE.BoxGeometry(0.5, 0.07, 0.02);
      const barM = new THREE.MeshBasicMaterial({ color: l === 4 ? 0xf59e0b : 0x10b981 });
      const bar = new THREE.Mesh(barG, barM);
      bar.position.set(0, 1.3 + l * 0.28, 1.11);
      upsGroup.add(bar);
    }

    upsGroup.position.set(4.8, 0, 0);
    scene.add(upsGroup);
    clickableObjects.push(upsMesh);

    // 5. Containment Pod (Glass Doors and Clear Ceiling)
    const containmentGroup = new THREE.Group();
    containmentGroup.name = 'containment';

    // Translucent ceiling over cold aisle
    const roofGeo = new THREE.BoxGeometry(7.0, 0.06, 3.2);
    const roofMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      transmission: 0.85,
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 4.25, 0);
    containmentGroup.add(roof);

    // Left and Right Glass Sliding Doors
    const doorGeo = new THREE.BoxGeometry(1.6, 4.2, 0.05);
    const doorMat = new THREE.MeshPhysicalMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.3,
      roughness: 0.1,
      transmission: 0.9,
    });
    const doorLeft = new THREE.Mesh(doorGeo, doorMat);
    const doorRight = new THREE.Mesh(doorGeo, doorMat);
    doorLeft.position.set(-3.4, 2.1, 1.5);
    doorRight.position.set(3.4, 2.1, 1.5);
    containmentGroup.add(doorLeft);
    containmentGroup.add(doorRight);

    scene.add(containmentGroup);
    clickableObjects.push(roof);

    // 6. Airflow Dynamic Particles
    // Cold Air Particles (Cyan, flowing out of In-Row Cooler into Cold Aisle)
    const coldCount = 100;
    const coldGeo = new THREE.BufferGeometry();
    const coldPos = new Float32Array(coldCount * 3);
    const coldVel: THREE.Vector3[] = [];

    for (let p = 0; p < coldCount; p++) {
      coldPos[p * 3] = (Math.random() - 0.5) * 0.8;
      coldPos[p * 3 + 1] = 1.0 + Math.random() * 2.4;
      coldPos[p * 3 + 2] = 1.1 + Math.random() * 0.3;
      coldVel.push(new THREE.Vector3((Math.random() - 0.5) * 0.015, (Math.random() - 0.5) * 0.008, 0.025 + Math.random() * 0.02));
    }
    coldGeo.setAttribute('position', new THREE.BufferAttribute(coldPos, 3));
    const coldMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.13,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const coldParticles = new THREE.Points(coldGeo, coldMat);
    scene.add(coldParticles);

    // Hot Exhaust Particles (Rose/Red, rising out of server rears into Hot Aisle)
    const hotCount = 100;
    const hotGeo = new THREE.BufferGeometry();
    const hotPos = new Float32Array(hotCount * 3);
    const hotVel: THREE.Vector3[] = [];

    for (let h = 0; h < hotCount; h++) {
      hotPos[h * 3] = (Math.random() - 0.5) * 4.4;
      hotPos[h * 3 + 1] = 0.8 + Math.random() * 2.6;
      hotPos[h * 3 + 2] = -1.2 - Math.random() * 0.3;
      hotVel.push(new THREE.Vector3((Math.random() - 0.5) * 0.01, 0.018 + Math.random() * 0.02, -0.018 - Math.random() * 0.015));
    }
    hotGeo.setAttribute('position', new THREE.BufferAttribute(hotPos, 3));
    const hotMat = new THREE.PointsMaterial({
      color: 0xf43f5e,
      size: 0.14,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const hotParticles = new THREE.Points(hotGeo, hotMat);
    scene.add(hotParticles);

    // 7. Raycasting for Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableObjects, true);

      if (intersects.length > 0) {
        renderer.domElement.style.cursor = 'pointer';
        let parentGroup: THREE.Object3D | null = intersects[0].object;
        while (parentGroup && !parentGroup.name && parentGroup.parent) {
          parentGroup = parentGroup.parent;
        }
        if (parentGroup && parentGroup.name) {
          const item = t.equipment.items[parentGroup.name];
          setHoveredName(item ? item.name : parentGroup.name.toUpperCase());
        }
      } else {
        renderer.domElement.style.cursor = 'default';
        setHoveredName(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableObjects, true);

      if (intersects.length > 0) {
        let parentGroup: THREE.Object3D | null = intersects[0].object;
        while (parentGroup && !parentGroup.name && parentGroup.parent) {
          parentGroup = parentGroup.parent;
        }
        if (parentGroup && parentGroup.name) {
          onSelectRef.current(parentGroup.name);
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', handlePointerMove);
    renderer.domElement.addEventListener('click', handleClick);

    // 8. Animation Loop (Rock-solid 60 FPS)
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Spin fan turbine smoothly
      fanGroup.rotation.z += 0.09;

      // Animate cold air particles
      const cArr = coldParticles.geometry.attributes.position.array as Float32Array;
      for (let p = 0; p < coldCount; p++) {
        cArr[p * 3] += coldVel[p].x;
        cArr[p * 3 + 1] += coldVel[p].y;
        cArr[p * 3 + 2] += coldVel[p].z;
        if (cArr[p * 3 + 2] > 3.4) {
          cArr[p * 3] = (Math.random() - 0.5) * 0.8;
          cArr[p * 3 + 1] = 1.0 + Math.random() * 2.4;
          cArr[p * 3 + 2] = 1.1;
        }
      }
      coldParticles.geometry.attributes.position.needsUpdate = true;

      // Animate hot exhaust particles
      const hArr = hotParticles.geometry.attributes.position.array as Float32Array;
      for (let h = 0; h < hotCount; h++) {
        hArr[h * 3] += hotVel[h].x;
        hArr[h * 3 + 1] += hotVel[h].y;
        hArr[h * 3 + 2] += hotVel[h].z;
        if (hArr[h * 3 + 2] < -3.4 || hArr[h * 3 + 1] > 4.2) {
          hArr[h * 3] = (Math.random() - 0.5) * 4.4;
          hArr[h * 3 + 1] = 0.8 + Math.random() * 2.6;
          hArr[h * 3 + 2] = -1.2;
        }
      }
      hotParticles.geometry.attributes.position.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 540;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('mousemove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []); // Run ONCE on mount for absolute 60 FPS performance!

  // Camera Presets
  const handleCameraPreset = (mode: CameraViewMode) => {
    if (!cameraRef.current || !controlsRef.current) return;
    setActiveView(mode);
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    switch (mode) {
      case 'iso':
        camera.position.set(11, 8.5, 14);
        controls.target.set(0.5, 1.8, 0);
        break;
      case 'cold':
        camera.position.set(0.5, 2.5, 9.5);
        controls.target.set(0.5, 2.0, 0);
        break;
      case 'hot':
        camera.position.set(0.5, 2.5, -9.5);
        controls.target.set(0.5, 2.0, 0);
        break;
      case 'top':
        camera.position.set(0.5, 18, 0.05);
        controls.target.set(0.5, 0, 0);
        break;
    }
  };

  const toggleAutoRotate = () => {
    if (controlsRef.current) {
      const next = !autoRotate;
      controlsRef.current.autoRotate = next;
      setAutoRotate(next);
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-3xl bg-slate-950/90 border border-ip-line shadow-2xl overflow-hidden backdrop-blur-xl">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={mountRef} className="w-full h-[480px] sm:h-[540px] relative select-none cursor-grab active:cursor-grabbing">
        {/* Top Control Bar with Camera Presets */}
        <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
          {/* Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/85 border border-slate-700/80 backdrop-blur-md pointer-events-auto font-mono text-xs shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-200">
              {lang === 'th' ? 'แบบจำลอง 3D Data Center (หมุนอิสระ 360°)' : '3D Data Center Pod (360° Free Orbit)'}
            </span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-cyan-400 font-bold">PUE 1.205</span>
          </div>

          {/* Camera View Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950/85 border border-slate-700/80 p-1 rounded-xl backdrop-blur-md pointer-events-auto shadow-lg font-mono text-xs">
            <button
              onClick={() => handleCameraPreset('iso')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeView === 'iso'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Isometric 45°"
            >
              📐 ISO
            </button>
            <button
              onClick={() => handleCameraPreset('cold')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeView === 'cold'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Cold Aisle Front"
            >
              ❄️ COLD
            </button>
            <button
              onClick={() => handleCameraPreset('hot')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeView === 'hot'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Hot Aisle Rear"
            >
              🔥 HOT
            </button>
            <button
              onClick={() => handleCameraPreset('top')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeView === 'top'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Top-Down NOC Plan"
            >
              🏢 TOP
            </button>
            <button
              onClick={toggleAutoRotate}
              className={`p-1.5 rounded-lg border transition-all ${
                autoRotate
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}
              title={autoRotate ? 'Stop Auto-Rotate' : 'Start Auto-Rotate'}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Hover Equipment Badge */}
        {hoveredName && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-fadeIn">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/95 border border-cyan-500/60 shadow-2xl backdrop-blur-md text-xs font-mono text-cyan-300">
              <Eye className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="font-bold">{hoveredName}</span>
              <span className="text-[11px] text-slate-400 font-sans">
                ({lang === 'th' ? 'คลิกดูภาพถ่ายจริงและสเปก' : 'Click to inspect real photo & specs'})
              </span>
            </div>
          </div>
        )}

        {/* Visual Legend Tags Floating at Bottom */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
          <div className="flex items-center gap-2 bg-slate-950/85 border border-slate-800 px-3.5 py-1.5 rounded-xl backdrop-blur-md pointer-events-auto text-[11px] font-mono text-slate-300 shadow-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>
              {lang === 'th'
                ? 'คลิกลากเพื่อหมุนกล้อง • ลูกกลิ้งซูมเข้า-ออก • แตะที่ตู้เพื่อดูภาพถ่ายอุปกรณ์จริง'
                : 'Drag to rotate 360° • Scroll to zoom • Click equipment to inspect real photographs'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              onClick={() => onSelectEquipment('rack-a')}
              className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-cyan-300 transition-all shadow-sm"
            >
              🖥️ Rack A
            </button>
            <button
              onClick={() => onSelectEquipment('cooling')}
              className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-sky-300 transition-all shadow-sm"
            >
              ❄️ In-Row Chiller
            </button>
            <button
              onClick={() => onSelectEquipment('rack-b')}
              className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-emerald-300 transition-all shadow-sm"
            >
              🖥️ Rack B
            </button>
            <button
              onClick={() => onSelectEquipment('ups')}
              className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-amber-300 transition-all shadow-sm"
            >
              ⚡ 2N UPS
            </button>
            <button
              onClick={() => onSelectEquipment('pdu')}
              className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-cyan-300 transition-all shadow-sm"
            >
              🔌 Smart PDU
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
