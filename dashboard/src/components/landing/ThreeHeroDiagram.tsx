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
  const [autoRotate, setAutoRotate] = useState(true);
  const [activeView, setActiveView] = useState<CameraViewMode>('iso');
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 520;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e14);
    scene.fog = new THREE.FogExp2(0x0a0e14, 0.025);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(13, 9, 15);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Do not go under floor
    controls.minPolarAngle = Math.PI / 10;
    controls.minDistance = 6;
    controls.maxDistance = 28;
    controls.target.set(0, 1.8, 0);
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.6;
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0x1e293b, 2.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(12, 20, 15);
    scene.add(dirLight);

    // Cyan Cold Aisle light
    const cyanLight = new THREE.PointLight(0x06b6d4, 3.5, 16);
    cyanLight.position.set(0, 3.5, 3);
    scene.add(cyanLight);

    // Emerald Rack B light
    const emeraldLight = new THREE.PointLight(0x10b981, 2.5, 14);
    emeraldLight.position.set(3.5, 3.5, 0);
    scene.add(emeraldLight);

    // Rose Hot Aisle rear light
    const roseLight = new THREE.PointLight(0xf43f5e, 2.8, 16);
    roseLight.position.set(0, 3.5, -3.5);
    scene.add(roseLight);

    // 6. Floor & Underfloor Grid
    const floorGeo = new THREE.PlaneGeometry(24, 24, 24, 24);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2,
      wireframe: true,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    scene.add(floor);

    // Solid floor under grid
    const solidFloorGeo = new THREE.PlaneGeometry(24, 24);
    const solidFloorMat = new THREE.MeshBasicMaterial({ color: 0x070b11 });
    const solidFloor = new THREE.Mesh(solidFloorGeo, solidFloorMat);
    solidFloor.rotation.x = -Math.PI / 2;
    solidFloor.position.y = -0.05;
    scene.add(solidFloor);

    // Underfloor glowing power & fiber conduits
    const curvePointsA = [new THREE.Vector3(-6, -0.02, 4), new THREE.Vector3(0, -0.02, 1.5), new THREE.Vector3(6, -0.02, 4)];
    const curveA = new THREE.CatmullRomCurve3(curvePointsA);
    const tubeGeoA = new THREE.TubeGeometry(curveA, 20, 0.08, 8, false);
    const tubeMatA = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    scene.add(new THREE.Mesh(tubeGeoA, tubeMatA));

    const curvePointsB = [new THREE.Vector3(-6, -0.02, -4), new THREE.Vector3(0, -0.02, -1.5), new THREE.Vector3(6, -0.02, -4)];
    const curveB = new THREE.CatmullRomCurve3(curvePointsB);
    const tubeGeoB = new THREE.TubeGeometry(curveB, 20, 0.08, 8, false);
    const tubeMatB = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    scene.add(new THREE.Mesh(tubeGeoB, tubeMatB));

    // Interactive clickable objects mapping
    const clickableObjects: THREE.Object3D[] = [];

    // Helper: Create 42U Server Rack
    const createRack = (id: string, posX: number, primaryColor: number) => {
      const rackGroup = new THREE.Group();
      rackGroup.name = id;

      // Rack Frame
      const frameGeo = new THREE.BoxGeometry(2.0, 4.4, 2.4);
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.5,
        metalness: 0.85,
      });
      const rackFrame = new THREE.Mesh(frameGeo, frameMat);
      rackFrame.position.y = 2.2;
      rackGroup.add(rackFrame);

      // Server Blade Trays & LEDs
      for (let i = 0; i < 9; i++) {
        const bladeGeo = new THREE.BoxGeometry(1.7, 0.32, 2.3);
        const bladeMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.4,
          metalness: 0.9,
        });
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.set(0, 0.6 + i * 0.42, 0.05);
        rackGroup.add(blade);

        // Front LEDs
        const ledGeo = new THREE.SphereGeometry(0.03, 8, 8);
        const ledMat1 = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x10b981 : 0x06b6d4 });
        const ledMat2 = new THREE.MeshBasicMaterial({ color: primaryColor });
        const led1 = new THREE.Mesh(ledGeo, ledMat1);
        const led2 = new THREE.Mesh(ledGeo, ledMat2);
        led1.position.set(-0.65, 0.6 + i * 0.42, 1.21);
        led2.position.set(-0.55, 0.6 + i * 0.42, 1.21);
        rackGroup.add(led1);
        rackGroup.add(led2);
      }

      // Vertical 0U PDU on rear
      const pduGeo = new THREE.BoxGeometry(0.12, 3.8, 0.12);
      const pduMat = new THREE.MeshStandardMaterial({
        color: primaryColor,
        emissive: primaryColor,
        emissiveIntensity: 0.4,
      });
      const pdu = new THREE.Mesh(pduGeo, pduMat);
      pdu.position.set(0.85, 2.2, -1.15);
      rackGroup.add(pdu);

      rackGroup.position.set(posX, 0, 0);
      scene.add(rackGroup);
      clickableObjects.push(rackFrame);
      return rackGroup;
    };

    // Create Rack A & Rack B
    createRack('rack-a', -2.3, 0x06b6d4);
    createRack('rack-b', 2.3, 0x10b981);

    // Helper: Create In-Row Precision Cooling Unit (Center)
    const coolerGroup = new THREE.Group();
    coolerGroup.name = 'cooling';
    const coolerGeo = new THREE.BoxGeometry(1.4, 4.4, 2.4);
    const coolerMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      roughness: 0.3,
      metalness: 0.7,
      emissive: 0x0284c7,
      emissiveIntensity: 0.15,
    });
    const coolerMesh = new THREE.Mesh(coolerGeo, coolerMat);
    coolerMesh.position.y = 2.2;
    coolerGroup.add(coolerMesh);

    // Front Grille & Rotating Fan Blades
    const fanGroup = new THREE.Group();
    fanGroup.position.set(0, 2.2, 1.21);
    for (let b = 0; b < 6; b++) {
      const bladeG = new THREE.BoxGeometry(0.08, 0.55, 0.02);
      const bladeM = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const blade = new THREE.Mesh(bladeG, bladeM);
      blade.rotation.z = (b * Math.PI) / 3;
      fanGroup.add(blade);
    }
    coolerGroup.add(fanGroup);

    // Display screen on Cooler
    const screenGeo = new THREE.PlaneGeometry(0.6, 0.35);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 3.8, 1.21);
    coolerGroup.add(screen);

    coolerGroup.position.set(0, 0, 0);
    scene.add(coolerGroup);
    clickableObjects.push(coolerMesh);

    // Helper: Create Modular 2N UPS & Battery Cabinet (Right Side)
    const upsGroup = new THREE.Group();
    upsGroup.name = 'ups';
    const upsGeo = new THREE.BoxGeometry(1.8, 4.0, 2.2);
    const upsMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
      metalness: 0.6,
    });
    const upsMesh = new THREE.Mesh(upsGeo, upsMat);
    upsMesh.position.y = 2.0;
    upsGroup.add(upsMesh);

    // Battery LED bar meters
    for (let l = 0; l < 5; l++) {
      const barG = new THREE.BoxGeometry(0.4, 0.08, 0.02);
      const barM = new THREE.MeshBasicMaterial({ color: l === 4 ? 0xf59e0b : 0x10b981 });
      const bar = new THREE.Mesh(barG, barM);
      bar.position.set(0, 1.5 + l * 0.25, 1.11);
      upsGroup.add(bar);
    }

    upsGroup.position.set(5.2, 0, 0);
    scene.add(upsGroup);
    clickableObjects.push(upsMesh);

    // Helper: Containment Ceiling & Aisle Glass Canopy
    const containmentGroup = new THREE.Group();
    containmentGroup.name = 'containment';
    const glassRoofGeo = new THREE.BoxGeometry(6.6, 0.08, 3.6);
    const glassRoofMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      transmission: 0.8,
      thickness: 0.5,
    });
    const roof = new THREE.Mesh(glassRoofGeo, glassRoofMat);
    roof.position.set(0, 4.45, 0);
    containmentGroup.add(roof);

    // Aisle Entry Sliding Doors (Front)
    const doorGeo = new THREE.BoxGeometry(1.8, 4.4, 0.06);
    const doorMat = new THREE.MeshPhysicalMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.4,
      roughness: 0.1,
      transmission: 0.9,
    });
    const leftDoor = new THREE.Mesh(doorGeo, doorMat);
    const rightDoor = new THREE.Mesh(doorGeo, doorMat);
    leftDoor.position.set(-1.0, 2.2, 1.8);
    rightDoor.position.set(1.0, 2.2, 1.8);
    containmentGroup.add(leftDoor);
    containmentGroup.add(rightDoor);

    scene.add(containmentGroup);
    clickableObjects.push(roof);

    // 7. Dynamic Airflow Particles System
    // Cold Air Particles (Cyan, flowing out of Cooler into Cold Aisle)
    const coldParticleCount = 120;
    const coldGeo = new THREE.BufferGeometry();
    const coldPositions = new Float32Array(coldParticleCount * 3);
    const coldVelocities: THREE.Vector3[] = [];

    for (let p = 0; p < coldParticleCount; p++) {
      coldPositions[p * 3] = (Math.random() - 0.5) * 1.0;
      coldPositions[p * 3 + 1] = 1.0 + Math.random() * 2.8;
      coldPositions[p * 3 + 2] = 1.2 + Math.random() * 0.5;
      coldVelocities.push(new THREE.Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.01, 0.03 + Math.random() * 0.03));
    }
    coldGeo.setAttribute('position', new THREE.BufferAttribute(coldPositions, 3));
    const coldMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.15,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const coldParticles = new THREE.Points(coldGeo, coldMat);
    scene.add(coldParticles);

    // Hot Exhaust Particles (Rose/Red, rising out of rear into Hot Aisle)
    const hotParticleCount = 120;
    const hotGeo = new THREE.BufferGeometry();
    const hotPositions = new Float32Array(hotParticleCount * 3);
    const hotVelocities: THREE.Vector3[] = [];

    for (let h = 0; h < hotParticleCount; h++) {
      hotPositions[h * 3] = (Math.random() - 0.5) * 4.6;
      hotPositions[h * 3 + 1] = 0.8 + Math.random() * 3.0;
      hotPositions[h * 3 + 2] = -1.3 - Math.random() * 0.4;
      hotVelocities.push(new THREE.Vector3((Math.random() - 0.5) * 0.015, 0.02 + Math.random() * 0.025, -0.02 - Math.random() * 0.02));
    }
    hotGeo.setAttribute('position', new THREE.BufferAttribute(hotPositions, 3));
    const hotMat = new THREE.PointsMaterial({
      color: 0xf43f5e,
      size: 0.16,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const hotParticles = new THREE.Points(hotGeo, hotMat);
    scene.add(hotParticles);

    // 8. Raycasting for Click & Hover
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
        const hit = intersects[0].object;
        let parentGroup: THREE.Object3D | null = hit;
        while (parentGroup && !parentGroup.name && parentGroup.parent) {
          parentGroup = parentGroup.parent;
        }
        if (parentGroup && parentGroup.name) {
          const equip = t.equipment.items[parentGroup.name];
          setHoveredName(equip ? equip.name : parentGroup.name.toUpperCase());
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
        const hit = intersects[0].object;
        let parentGroup: THREE.Object3D | null = hit;
        while (parentGroup && !parentGroup.name && parentGroup.parent) {
          parentGroup = parentGroup.parent;
        }
        if (parentGroup && parentGroup.name) {
          onSelectEquipment(parentGroup.name);
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', handlePointerMove);
    renderer.domElement.addEventListener('click', handleClick);

    // 9. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Rotate EC cooler fan
      fanGroup.rotation.z += 0.08;

      // Update Cold Air particles
      const coldPos = coldParticles.geometry.attributes.position.array as Float32Array;
      for (let p = 0; p < coldParticleCount; p++) {
        coldPos[p * 3] += coldVelocities[p].x;
        coldPos[p * 3 + 1] += coldVelocities[p].y;
        coldPos[p * 3 + 2] += coldVelocities[p].z;
        if (coldPos[p * 3 + 2] > 3.8) {
          coldPos[p * 3] = (Math.random() - 0.5) * 1.0;
          coldPos[p * 3 + 1] = 1.0 + Math.random() * 2.8;
          coldPos[p * 3 + 2] = 1.2;
        }
      }
      coldParticles.geometry.attributes.position.needsUpdate = true;

      // Update Hot Exhaust particles
      const hotPos = hotParticles.geometry.attributes.position.array as Float32Array;
      for (let h = 0; h < hotParticleCount; h++) {
        hotPos[h * 3] += hotVelocities[h].x;
        hotPos[h * 3 + 1] += hotVelocities[h].y;
        hotPos[h * 3 + 2] += hotVelocities[h].z;
        if (hotPos[h * 3 + 2] < -3.8 || hotPos[h * 3 + 1] > 4.5) {
          hotPos[h * 3] = (Math.random() - 0.5) * 4.6;
          hotPos[h * 3 + 1] = 0.8 + Math.random() * 3.0;
          hotPos[h * 3 + 2] = -1.3;
        }
      }
      hotParticles.geometry.attributes.position.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 10. Resize handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 520;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onSelectEquipment, t]);

  // Handle camera view presets
  const handleCameraPreset = (mode: CameraViewMode) => {
    if (!cameraRef.current || !controlsRef.current) return;
    setActiveView(mode);
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    switch (mode) {
      case 'iso':
        camera.position.set(13, 9, 15);
        controls.target.set(0, 1.8, 0);
        break;
      case 'cold':
        camera.position.set(0, 3.2, 10);
        controls.target.set(0, 2.0, 0);
        break;
      case 'hot':
        camera.position.set(0, 3.2, -10);
        controls.target.set(0, 2.0, 0);
        break;
      case 'top':
        camera.position.set(0, 19, 0.1);
        controls.target.set(0, 0, 0);
        break;
    }
  };

  const toggleAutoRotate = () => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = !autoRotate;
      setAutoRotate(!autoRotate);
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-3xl bg-gradient-to-b from-ip-elev-2/90 to-ip-bg/95 border border-ip-line shadow-2xl overflow-hidden backdrop-blur-xl">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={mountRef} className="w-full h-[480px] sm:h-[560px] relative select-none">
        {/* Top Control Bar with Camera Presets */}
        <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
          {/* Status & Live Telemetry Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700/80 backdrop-blur-md pointer-events-auto font-mono text-xs shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-slate-200">
              {lang === 'th' ? 'แบบจำลอง 3 มิติหมุนได้ 360° (WebGL)' : 'Interactive 3D DC Room (360° Orbit)'}
            </span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-cyan-400">PUE 1.205</span>
            <span className="hidden sm:inline text-sky-300">Supply 21.5°C</span>
          </div>

          {/* Camera View Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-700/80 p-1 rounded-xl backdrop-blur-md pointer-events-auto shadow-lg font-mono text-xs">
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
              title="Toggle Auto-Rotation"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Hover Equipment Badge */}
        {hoveredName && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-fadeIn">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/50 shadow-xl backdrop-blur-md text-xs font-mono text-cyan-300">
              <Eye className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>{hoveredName}</span>
              <span className="text-[10px] text-slate-400 font-sans">
                ({lang === 'th' ? 'คลิกเพื่อดูรูปจริง' : 'Click to inspect photo'})
              </span>
            </div>
          </div>
        )}

        {/* Bottom Interactive Guidance Bar */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3.5 py-1.5 rounded-xl backdrop-blur-md pointer-events-auto text-[11px] font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>
              {lang === 'th'
                ? 'คลิกลากเมาส์หมุนดูได้ 360° • คลิกที่อุปกรณ์เพื่อเปิดดูภาพถ่ายฮาร์ดแวร์จริง'
                : 'Click & drag to rotate 360° • Click equipment to inspect real hardware photographs'}
            </span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => onSelectEquipment('rack-a')}
              className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-cyan-300 shadow-sm transition-all"
            >
              🖥️ Rack A
            </button>
            <button
              onClick={() => onSelectEquipment('cooling')}
              className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-sky-300 shadow-sm transition-all"
            >
              ❄️ In-Row Cooler
            </button>
            <button
              onClick={() => onSelectEquipment('ups')}
              className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-amber-300 shadow-sm transition-all"
            >
              ⚡ 2N UPS
            </button>
            <button
              onClick={() => onSelectEquipment('pdu')}
              className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-emerald-300 shadow-sm transition-all"
            >
              🔌 Smart PDU
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
