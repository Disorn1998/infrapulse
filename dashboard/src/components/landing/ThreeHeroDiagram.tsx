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

type CameraViewMode = 'iso' | 'racks' | 'power' | 'top';

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
    const height = container.clientHeight || 560;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e17);
    scene.fog = new THREE.FogExp2(0x0a0e17, 0.018);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 120);
    camera.position.set(16, 13, 19);
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
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.75;
    controls.zoomSpeed = 0.8;
    controls.panSpeed = 0.5;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent diving under floor
    controls.minPolarAngle = Math.PI / 12;
    controls.minDistance = 8;
    controls.maxDistance = 35;
    controls.target.set(0, 1.8, 0);
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.8;
    controlsRef.current = controls;

    // Auto-pause auto-rotate when user drags
    const onPointerDown = () => {
      if (controls.autoRotate) {
        controls.autoRotate = false;
        setAutoRotate(false);
      }
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    // 5. Lighting (Clean Data Center White & Neon Highlights)
    const ambientLight = new THREE.AmbientLight(0x334155, 2.6);
    scene.add(ambientLight);

    const mainSun = new THREE.DirectionalLight(0xffffff, 2.5);
    mainSun.position.set(15, 25, 18);
    scene.add(mainSun);

    const rearSun = new THREE.DirectionalLight(0x94a3b8, 1.2);
    rearSun.position.set(-15, 18, -15);
    scene.add(rearSun);

    // Cold Aisle Blue Point Light
    const coldLight = new THREE.PointLight(0x0284c7, 4.0, 15);
    coldLight.position.set(0, 3.2, 0);
    scene.add(coldLight);

    // Hot Aisle Rose Light
    const hotLight = new THREE.PointLight(0xf43f5e, 3.0, 14);
    hotLight.position.set(0, 3.2, -3.2);
    scene.add(hotLight);

    // Clickable interactive objects
    const clickableObjects: THREE.Object3D[] = [];

    // 6. Data Center Raised Floor (18m x 14m)
    const floorGeo = new THREE.BoxGeometry(19, 0.4, 15);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.6,
      metalness: 0.3,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.2;
    scene.add(floor);

    // Floor Tile Grid Lines
    const floorGrid = new THREE.GridHelper(18, 18, 0x0284c7, 0x1e293b);
    floorGrid.position.y = 0.01;
    scene.add(floorGrid);

    // 7. Cutaway Room Walls (Rear wall, Right wall, and Left partition)
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.1,
    });

    // Rear Wall
    const rearWallGeo = new THREE.BoxGeometry(19, 4.8, 0.3);
    const rearWall = new THREE.Mesh(rearWallGeo, wallMat);
    rearWall.position.set(0, 2.4, -7.4);
    scene.add(rearWall);

    // Right Wall
    const rightWallGeo = new THREE.BoxGeometry(0.3, 4.8, 15);
    const rightWall = new THREE.Mesh(rightWallGeo, wallMat);
    rightWall.position.set(9.4, 2.4, 0);
    scene.add(rightWall);

    // Left UPS Room Partition Wall (with doorway)
    const leftWallGeo = new THREE.BoxGeometry(0.2, 4.8, 9);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.position.set(-4.8, 2.4, -2.8);
    scene.add(leftWall);

    // Helper: Create Floating 3D Number Pin (❶ to ❽)
    const createPin = (_number: number, posX: number, posY: number, posZ: number, zoneId: string, colorHex: number) => {
      const pinGroup = new THREE.Group();
      pinGroup.name = zoneId;

      // Pin Disc
      const discGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.12, 24);
      const discMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.6,
        roughness: 0.2,
      });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.rotation.x = Math.PI / 2;
      pinGroup.add(disc);

      // Pin Glow Ring
      const ringGeo = new THREE.RingGeometry(0.48, 0.58, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      pinGroup.add(ring);

      // Pin Vertical Pointer Stalk
      const stalkGeo = new THREE.CylinderGeometry(0.04, 0.02, 1.2, 8);
      const stalkMat = new THREE.MeshBasicMaterial({ color: colorHex });
      const stalk = new THREE.Mesh(stalkGeo, stalkMat);
      stalk.position.y = -0.7;
      pinGroup.add(stalk);

      pinGroup.position.set(posX, posY, posZ);
      scene.add(pinGroup);
      clickableObjects.push(disc);
      return pinGroup;
    };

    // Helper: Server Rack Row (Zone 1: Server Rack Area & Zone 4: Hot/Cold Aisle)
    const serverGroup = new THREE.Group();
    serverGroup.name = 'server-rack';

    const createRackCabinet = (posX: number, posZ: number, rotY: number) => {
      const rack = new THREE.Group();
      // Cabinet Frame
      const boxGeo = new THREE.BoxGeometry(1.6, 4.0, 1.8);
      const boxMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4, metalness: 0.8 });
      const box = new THREE.Mesh(boxGeo, boxMat);
      box.position.y = 2.0;
      rack.add(box);

      // Server Blade Slots & LEDs
      for (let s = 0; s < 7; s++) {
        const bladeG = new THREE.BoxGeometry(1.4, 0.35, 1.75);
        const bladeM = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.3, metalness: 0.9 });
        const blade = new THREE.Mesh(bladeG, bladeM);
        blade.position.set(0, 0.6 + s * 0.45, 0.02);
        rack.add(blade);

        // Blinking LED Points
        const ledG = new THREE.SphereGeometry(0.025, 6, 6);
        const ledM1 = new THREE.MeshBasicMaterial({ color: s % 2 === 0 ? 0x10b981 : 0x06b6d4 });
        const led1 = new THREE.Mesh(ledG, ledM1);
        led1.position.set(-0.55, 0.6 + s * 0.45, 0.91);
        rack.add(led1);
      }

      rack.position.set(posX, 0, posZ);
      rack.rotation.y = rotY;
      serverGroup.add(rack);
      clickableObjects.push(box);
    };

    // Row 1 (Front, facing into aisle)
    for (let i = -1; i <= 1; i++) {
      createRackCabinet(i * 1.9, 1.3, 0);
    }
    // Row 2 (Rear, facing into aisle)
    for (let i = -1; i <= 1; i++) {
      createRackCabinet(i * 1.9, -1.3, Math.PI);
    }
    scene.add(serverGroup);

    // ZONE 4: Hot/Cold Aisle Containment Canopy over the rack aisle
    const containmentGroup = new THREE.Group();
    containmentGroup.name = 'containment';
    // Polycarbonate Roof
    const roofGeo = new THREE.BoxGeometry(6.2, 0.06, 2.8);
    const roofMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.38,
      transmission: 0.85,
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 4.05, 0);
    containmentGroup.add(roof);

    // Aisle End Sliding Glass Doors
    const doorGeo = new THREE.BoxGeometry(0.06, 4.0, 1.3);
    const doorMat = new THREE.MeshPhysicalMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.35 });
    const door1 = new THREE.Mesh(doorGeo, doorMat);
    const door2 = new THREE.Mesh(doorGeo, doorMat);
    door1.position.set(-3.05, 2.0, 0);
    door2.position.set(3.05, 2.0, 0);
    containmentGroup.add(door1);
    containmentGroup.add(door2);
    scene.add(containmentGroup);
    clickableObjects.push(roof);

    // ZONE 2: UPS & Battery Room (Enclosed Left Bay, x = -6.8)
    const upsGroup = new THREE.Group();
    upsGroup.name = 'ups-battery';
    for (let u = 0; u < 3; u++) {
      const uGeo = new THREE.BoxGeometry(1.6, 3.8, 1.8);
      const uMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.5, metalness: 0.7 });
      const uMesh = new THREE.Mesh(uGeo, uMat);
      uMesh.position.set(-6.8, 1.9, -4.5 + u * 2.2);
      upsGroup.add(uMesh);
      clickableObjects.push(uMesh);

      // Battery LED Bars
      for (let b = 0; b < 5; b++) {
        const barG = new THREE.BoxGeometry(0.4, 0.06, 0.02);
        const barM = new THREE.MeshBasicMaterial({ color: 0x10b981 });
        const bar = new THREE.Mesh(barG, barM);
        bar.position.set(-6.8, 1.2 + b * 0.28, -3.58 + u * 2.2);
        upsGroup.add(bar);
      }
    }
    scene.add(upsGroup);

    // ZONE 3: Precision Air Conditioning (Perimeter CRAH on Right Wall, x = 7.8)
    const crahGroup = new THREE.Group();
    crahGroup.name = 'cooling';
    const fanBlades: THREE.Group[] = [];

    for (let c = 0; c < 2; c++) {
      const cGeo = new THREE.BoxGeometry(1.6, 4.2, 2.4);
      const cMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.3,
        metalness: 0.7,
        emissive: 0x0369a1,
        emissiveIntensity: 0.2,
      });
      const cMesh = new THREE.Mesh(cGeo, cMat);
      cMesh.position.set(7.8, 2.1, -3.0 + c * 4.2);
      crahGroup.add(cMesh);
      clickableObjects.push(cMesh);

      // Rotating Fan on CRAH
      const fanG = new THREE.Group();
      fanG.position.set(7.0, 2.1, -3.0 + c * 4.2);
      fanG.rotation.y = Math.PI / 2;
      for (let fb = 0; fb < 6; fb++) {
        const fBlade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.02), new THREE.MeshBasicMaterial({ color: 0x7dd3fc }));
        fBlade.rotation.z = (fb * Math.PI) / 3;
        fanG.add(fBlade);
      }
      crahGroup.add(fanG);
      fanBlades.push(fanG);
    }
    scene.add(crahGroup);

    // ZONE 5: Fire Suppression System (Red Novec/FM-200 Cylinders & Red Pipe along Rear Wall)
    const fireGroup = new THREE.Group();
    fireGroup.name = 'fire-suppression';

    // Red Overhead Pipe Manifold
    const pipeGeo = new THREE.CylinderGeometry(0.08, 0.08, 16, 12);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.8, roughness: 0.2 });
    const firePipe = new THREE.Mesh(pipeGeo, pipeMat);
    firePipe.rotation.z = Math.PI / 2;
    firePipe.position.set(0, 4.4, -6.8);
    fireGroup.add(firePipe);

    // 4x Red & Green Cylinders mounted to wall
    for (let cyl = 0; cyl < 4; cyl++) {
      const cylGeo = new THREE.CylinderGeometry(0.28, 0.28, 2.2, 16);
      const cylMat = new THREE.MeshStandardMaterial({
        color: cyl === 0 ? 0x16a34a : 0xdc2626,
        roughness: 0.3,
        metalness: 0.7,
      });
      const tank = new THREE.Mesh(cylGeo, cylMat);
      tank.position.set(-2.4 + cyl * 0.8, 1.3, -7.0);
      fireGroup.add(tank);
      clickableObjects.push(tank);

      // Top Brass Valve
      const valveG = new THREE.CylinderGeometry(0.06, 0.06, 0.3, 8);
      const valveM = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 });
      const valve = new THREE.Mesh(valveG, valveM);
      valve.position.set(-2.4 + cyl * 0.8, 2.5, -7.0);
      fireGroup.add(valve);
    }
    scene.add(fireGroup);

    // ZONE 6: Monitoring & DCIM (NOC Command Desk & Monitor Wall, Front Left, x = -5.8, z = 4.2)
    const nocGroup = new THREE.Group();
    nocGroup.name = 'dcim-noc';
    // Desk
    const deskGeo = new THREE.BoxGeometry(2.8, 0.8, 1.2);
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.set(-5.8, 0.4, 4.2);
    nocGroup.add(desk);
    clickableObjects.push(desk);

    // Multi-Monitor Array on Desk (3 glowing curved monitors)
    for (let m = -1; m <= 1; m++) {
      const scrGeo = new THREE.BoxGeometry(0.7, 0.45, 0.04);
      const scrMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      const scr = new THREE.Mesh(scrGeo, scrMat);
      scr.position.set(-5.8 + m * 0.8, 1.1, 4.2);
      scr.rotation.y = m * -0.2;
      nocGroup.add(scr);
    }
    scene.add(nocGroup);

    // ZONE 7: Network Room / Core Switch Cabinets (Rear Right, x = 6.2, z = -5.2)
    const netGroup = new THREE.Group();
    netGroup.name = 'network-room';
    const netRackGeo = new THREE.BoxGeometry(1.6, 4.0, 1.8);
    const netRackMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5, metalness: 0.8 });
    const netRack = new THREE.Mesh(netRackGeo, netRackMat);
    netRack.position.set(6.2, 2.0, -5.2);
    netGroup.add(netRack);
    clickableObjects.push(netRack);

    // Glowing Fiber Optic Port Arrays
    for (let f = 0; f < 5; f++) {
      const fpGeo = new THREE.BoxGeometry(1.4, 0.1, 0.02);
      const fpMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const fp = new THREE.Mesh(fpGeo, fpMat);
      fp.position.set(6.2, 1.5 + f * 0.4, -4.29);
      netGroup.add(fp);
    }

    // Overhead Yellow Fiber Raceway (FiberGuide) from Racks to Network Room
    const trayGeo = new THREE.BoxGeometry(0.3, 0.1, 6.0);
    const trayMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.4 });
    const tray = new THREE.Mesh(trayGeo, trayMat);
    tray.position.set(3.2, 4.2, -2.5);
    netGroup.add(tray);

    scene.add(netGroup);

    // ZONE 8: Access Control & Security Entrance (Front Center, z = 6.8)
    const secGroup = new THREE.Group();
    secGroup.name = 'security-access';

    // Front Sliding Glass Airlock Doors
    const secDoorGeo = new THREE.BoxGeometry(2.4, 4.0, 0.1);
    const secDoorMat = new THREE.MeshPhysicalMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.4,
      metalness: 0.8,
      roughness: 0.1,
    });
    const secDoor = new THREE.Mesh(secDoorGeo, secDoorMat);
    secDoor.position.set(0, 2.0, 7.0);
    secGroup.add(secDoor);
    clickableObjects.push(secDoor);

    // Biometric Scanner Terminal next to Door
    const bioGeo = new THREE.BoxGeometry(0.2, 0.4, 0.08);
    const bioMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const bio = new THREE.Mesh(bioGeo, bioMat);
    bio.position.set(1.5, 1.6, 7.0);
    secGroup.add(bio);

    // Ceiling Dome CCTV Camera
    const camGeo = new THREE.SphereGeometry(0.12, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const camMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
    const camMesh = new THREE.Mesh(camGeo, camMat);
    camMesh.position.set(0, 4.4, 6.5);
    camMesh.rotation.x = Math.PI;
    secGroup.add(camMesh);

    scene.add(secGroup);

    // 8. Interactive Numbered 3D Floating Pins (❶ to ❽ matching reference poster)
    createPin(1, 0, 5.0, 0, 'server-rack', 0x0284c7);      // ❶ Blue: Server Rack Area
    createPin(2, -6.8, 4.8, -3.5, 'ups-battery', 0x16a34a); // ❷ Green: UPS & Battery Room
    createPin(3, 7.8, 5.2, -1.0, 'cooling', 0x0284c7);       // ❸ Light Blue: Precision Cooling
    createPin(4, 0, 5.0, 1.8, 'containment', 0xf97316);     // ❹ Orange: Hot/Cold Aisle
    createPin(5, -1.2, 4.8, -6.8, 'fire-suppression', 0xdc2626); // ❺ Red: Fire Suppression
    createPin(6, -5.8, 2.8, 4.2, 'dcim-noc', 0x9333ea);     // ❻ Purple: Monitoring & DCIM
    createPin(7, 6.2, 4.8, -5.2, 'network-room', 0xb45309);  // ❼ Brown: Network Room
    createPin(8, 0, 4.6, 6.8, 'security-access', 0x64748b);  // ❽ Grey: Access Control & Security

    // 9. Airflow Dynamic Particles in Cold Aisle
    const coldCount = 100;
    const coldGeo = new THREE.BufferGeometry();
    const coldPos = new Float32Array(coldCount * 3);
    const coldVel: THREE.Vector3[] = [];

    for (let p = 0; p < coldCount; p++) {
      coldPos[p * 3] = (Math.random() - 0.5) * 5.0;
      coldPos[p * 3 + 1] = 0.5 + Math.random() * 3.2;
      coldPos[p * 3 + 2] = (Math.random() - 0.5) * 2.0;
      coldVel.push(new THREE.Vector3((Math.random() - 0.5) * 0.012, 0.015 + Math.random() * 0.015, (Math.random() - 0.5) * 0.012));
    }
    coldGeo.setAttribute('position', new THREE.BufferAttribute(coldPos, 3));
    const coldMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.12,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const coldParticles = new THREE.Points(coldGeo, coldMat);
    scene.add(coldParticles);

    // 10. Raycasting for Interaction
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
          setHoveredName(item ? item.zoneTitle : parentGroup.name.toUpperCase());
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

    // 11. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Spin CRAH fans
      fanBlades.forEach((fb) => {
        fb.rotation.z += 0.08;
      });

      // Animate Cold Air particles
      const cArr = coldParticles.geometry.attributes.position.array as Float32Array;
      for (let p = 0; p < coldCount; p++) {
        cArr[p * 3] += coldVel[p].x;
        cArr[p * 3 + 1] += coldVel[p].y;
        cArr[p * 3 + 2] += coldVel[p].z;
        if (cArr[p * 3 + 1] > 3.8) {
          cArr[p * 3] = (Math.random() - 0.5) * 5.0;
          cArr[p * 3 + 1] = 0.5;
          cArr[p * 3 + 2] = (Math.random() - 0.5) * 2.0;
        }
      }
      coldParticles.geometry.attributes.position.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 560;
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
  }, []);

  // Camera Presets
  const handleCameraPreset = (mode: CameraViewMode) => {
    if (!cameraRef.current || !controlsRef.current) return;
    setActiveView(mode);
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    switch (mode) {
      case 'iso':
        camera.position.set(16, 13, 19);
        controls.target.set(0, 1.8, 0);
        break;
      case 'racks':
        camera.position.set(0, 4.5, 9.5);
        controls.target.set(0, 2.0, 0);
        break;
      case 'power':
        camera.position.set(-6.5, 5.0, 4.0);
        controls.target.set(-6.5, 2.0, -3.5);
        break;
      case 'top':
        camera.position.set(0, 24, 0.05);
        controls.target.set(0, 0, 0);
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
      <div ref={mountRef} className="w-full h-[500px] sm:h-[580px] relative select-none cursor-grab active:cursor-grabbing">
        {/* Top Control Bar with Camera Presets */}
        <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
          {/* Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/85 border border-slate-700/80 backdrop-blur-md pointer-events-auto font-mono text-xs shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-200">
              {lang === 'th' ? 'แบบจำลอง 3D Data Center เต็มห้อง (8 โซนหลัก)' : '3D Data Center Facility (8 Core Zones)'}
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
              title="Isometric 3D Room"
            >
              📐 ISO ROOM
            </button>
            <button
              onClick={() => handleCameraPreset('racks')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeView === 'racks'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Focus Server Racks"
            >
              🖥️ RACKS
            </button>
            <button
              onClick={() => handleCameraPreset('power')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeView === 'power'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Focus UPS Room"
            >
              ⚡ POWER
            </button>
            <button
              onClick={() => handleCameraPreset('top')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeView === 'top'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Top-Down Floorplan"
            >
              🏢 TOP-DOWN
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
                ({lang === 'th' ? 'คลิกดูภาพถ่ายจริงและสเปก' : 'Click to inspect photo & specs'})
              </span>
            </div>
          </div>
        )}

        {/* Bottom Interactive Quick-Select Bar for all 8 Zones */}
        <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="hidden lg:flex items-center gap-2 bg-slate-950/85 border border-slate-800 px-3 py-1 rounded-xl backdrop-blur-md pointer-events-auto text-[11px] font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>
              {lang === 'th'
                ? 'คลิกที่หมุดตัวเลข ❶-❽ เพื่อดูรูปภาพจริงและสเปก'
                : 'Click numbered pins ❶-❽ to inspect real photographs & specs'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
            {[
              { id: 'server-rack', num: '❶', label: 'Racks', color: 'text-blue-400' },
              { id: 'ups-battery', num: '❷', label: 'UPS', color: 'text-emerald-400' },
              { id: 'cooling', num: '❸', label: 'Cooling', color: 'text-sky-400' },
              { id: 'containment', num: '❹', label: 'Aisle', color: 'text-orange-400' },
              { id: 'fire-suppression', num: '❺', label: 'Fire', color: 'text-rose-400' },
              { id: 'dcim-noc', num: '❻', label: 'DCIM', color: 'text-purple-400' },
              { id: 'network-room', num: '❼', label: 'Network', color: 'text-amber-400' },
              { id: 'security-access', num: '❽', label: 'Security', color: 'text-slate-400' },
            ].map((z) => (
              <button
                key={z.id}
                onClick={() => onSelectEquipment(z.id)}
                className="px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono font-bold transition-all shadow-sm flex items-center gap-1"
              >
                <span className={z.color}>{z.num}</span>
                <span className="text-slate-300">{z.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
