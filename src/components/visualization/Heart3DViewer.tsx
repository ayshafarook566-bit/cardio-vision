/**
 * CardioVision 3D - Interactive 3D Coronary Artery & Heart Model
 * Built using Three.js procedural geometries.
 * Complies with Three.js skill: zero external asset dependencies, PBR materials,
 * unified bottom dock, and zero viewport occlusion.
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { VesselRiskPrediction, RiskLevel } from '../../types/cardio';
import { Eye, RotateCcw, Maximize2, ShieldAlert, Activity, ChevronUp, ChevronDown } from 'lucide-react';

interface Heart3DViewerProps {
  vesselRisks?: {
    LAD: VesselRiskPrediction;
    LCX: VesselRiskPrediction;
    RCA: VesselRiskPrediction;
  };
  selectedVessel: 'LAD' | 'LCX' | 'RCA' | 'ALL';
  onSelectVessel: (vessel: 'LAD' | 'LCX' | 'RCA' | 'ALL') => void;
  interactiveStenosis?: {
    LAD: number;
    LCX: number;
    RCA: number;
  };
  className?: string;
}

export const Heart3DViewer: React.FC<Heart3DViewerProps> = ({
  vesselRisks,
  selectedVessel,
  onSelectVessel,
  interactiveStenosis,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isZenMode, setIsZenMode] = useState(false);
  const [heartBeatActive, setHeartBeatActive] = useState(true);
  const [transparencyMode, setTransparencyMode] = useState(false);
  const [cameraPreset, setCameraPreset] = useState<'AP' | 'PA' | 'LAO' | 'RAO'>('AP');
  const [hoveredVessel, setHoveredVessel] = useState<string | null>(null);

  // References to keep track of Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const heartGroupRef = useRef<THREE.Group | null>(null);
  const vesselsGroupRef = useRef<THREE.Group | null>(null);
  const targetCameraPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 7.5));
  const currentCameraPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 7.5));
  const heartMeshRef = useRef<THREE.Mesh | null>(null);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  // Resolve stenosis levels (from props or default synthetic)
  const stenosisLAD = interactiveStenosis?.LAD ?? vesselRisks?.LAD.stenosisEstimatePercent ?? 75;
  const stenosisLCX = interactiveStenosis?.LCX ?? vesselRisks?.LCX.stenosisEstimatePercent ?? 35;
  const stenosisRCA = interactiveStenosis?.RCA ?? vesselRisks?.RCA.stenosisEstimatePercent ?? 50;

  const getColorByStenosis = (stenosis: number, isSelected: boolean) => {
    if (isSelected) return '#38BDF8'; // bright cyan highlight for selected
    if (stenosis >= 70) return '#F43F5E'; // Severe/Critical coral
    if (stenosis >= 40) return '#F59E0B'; // Moderate amber
    return '#14B8A6'; // Normal teal
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060c18);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xecfeff, 1.8);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x0284c7, 1.2);
    rimLight.position.set(-6, -4, -5);
    scene.add(rimLight);

    const softFill = new THREE.PointLight(0x0f766e, 1.0, 15);
    softFill.position.set(0, -3, 3);
    scene.add(softFill);

    // 4. Main Anatomical Group
    const mainGroup = new THREE.Group();
    heartGroupRef.current = mainGroup;
    scene.add(mainGroup);

    // 4a. Procedural Stylized Myocardium (Cardiac Ventricles & Atria)
    const heartGeo = new THREE.SphereGeometry(1.65, 32, 28);
    // Deform sphere into organic heart cone shape
    const pos = heartGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Taper bottom to apex
      if (y < 0) {
        const factor = 1 + y * 0.28;
        x *= factor;
        z *= factor;
      }
      // Indentation for left/right ventricle sulcus
      if (y > -0.5 && y < 0.8) {
        if (Math.abs(x) < 0.3 && z > 0) {
          z *= 0.88;
        }
      }
      pos.setXYZ(i, x, y * 1.18, z * 0.95);
    }
    heartGeo.computeVertexNormals();

    const heartMat = new THREE.MeshStandardMaterial({
      color: 0x4a121a,
      roughness: 0.45,
      metalness: 0.1,
      transparent: true,
      opacity: transparencyMode ? 0.35 : 0.92,
      wireframe: false,
    });
    const heartMesh = new THREE.Mesh(heartGeo, heartMat);
    heartMesh.rotation.z = -0.15;
    heartMesh.rotation.x = 0.1;
    heartMesh.position.y = -0.2;
    mainGroup.add(heartMesh);
    heartMeshRef.current = heartMesh;

    // 4b. Ascending Aorta & Arch
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.1, 1.1, 0.1),
      new THREE.Vector3(-0.05, 1.8, 0.2),
      new THREE.Vector3(0.4, 2.3, 0.0),
      new THREE.Vector3(0.7, 2.1, -0.4),
      new THREE.Vector3(0.75, 1.4, -0.6),
    ]);
    const aortaGeo = new THREE.TubeGeometry(aortaCurve, 32, 0.42, 16, false);
    const aortaMat = new THREE.MeshStandardMaterial({
      color: 0x881337,
      roughness: 0.35,
      metalness: 0.15,
    });
    const aortaMesh = new THREE.Mesh(aortaGeo, aortaMat);
    mainGroup.add(aortaMesh);

    // Arch branch vessels (Brachiocephalic, Carotid, Subclavian)
    const branches = [
      { start: new THREE.Vector3(0.15, 2.1, 0.1), end: new THREE.Vector3(0.18, 2.7, 0.15), r: 0.11 },
      { start: new THREE.Vector3(0.35, 2.25, 0.0), end: new THREE.Vector3(0.42, 2.8, 0.05), r: 0.09 },
      { start: new THREE.Vector3(0.55, 2.2, -0.2), end: new THREE.Vector3(0.68, 2.75, -0.2), r: 0.08 },
    ];
    branches.forEach((b) => {
      const curve = new THREE.LineCurve3(b.start, b.end);
      const geo = new THREE.TubeGeometry(curve, 8, b.r, 12, false);
      const mesh = new THREE.Mesh(geo, aortaMat);
      mainGroup.add(mesh);
    });

    // Pulmonary Trunk (Blueish-purple venous trunk crossing aorta)
    const pulmoCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.2, 0.9, 0.6),
      new THREE.Vector3(0.0, 1.5, 0.5),
      new THREE.Vector3(-0.4, 1.8, 0.2),
      new THREE.Vector3(-0.9, 1.7, -0.2),
    ]);
    const pulmoGeo = new THREE.TubeGeometry(pulmoCurve, 24, 0.34, 16, false);
    const pulmoMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.4,
      metalness: 0.1,
    });
    const pulmoMesh = new THREE.Mesh(pulmoGeo, pulmoMat);
    mainGroup.add(pulmoMesh);

    // 4c. Coronary Arterial Tree Group
    const vesselsGroup = new THREE.Group();
    vesselsGroupRef.current = vesselsGroup;
    mainGroup.add(vesselsGroup);

    // -- Left Main & LAD (Left Anterior Descending) --
    const ladCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.15, 1.15, 0.4),  // LMCA origin
      new THREE.Vector3(-0.35, 1.05, 0.7),  // LAD proximal
      new THREE.Vector3(-0.38, 0.55, 1.15), // LAD mid (common stenosis site)
      new THREE.Vector3(-0.35, -0.2, 1.25), // LAD distal
      new THREE.Vector3(-0.25, -0.9, 1.05), // Pre-apex
      new THREE.Vector3(-0.12, -1.55, 0.6), // Apex wrap
    ]);
    const ladGeo = new THREE.TubeGeometry(ladCurve, 48, 0.095, 14, false);
    const ladMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(getColorByStenosis(stenosisLAD, selectedVessel === 'LAD')),
      roughness: 0.25,
      metalness: 0.3,
      emissive: new THREE.Color(getColorByStenosis(stenosisLAD, selectedVessel === 'LAD')),
      emissiveIntensity: selectedVessel === 'LAD' ? 0.45 : 0.15,
    });
    const ladMesh = new THREE.Mesh(ladGeo, ladMat);
    ladMesh.userData = { vesselId: 'LAD', name: 'Left Anterior Descending' };
    vesselsGroup.add(ladMesh);

    // Diagonal branch (D1)
    const d1Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.38, 0.55, 1.15),
      new THREE.Vector3(-0.75, 0.3, 1.1),
      new THREE.Vector3(-1.05, -0.2, 0.85),
    ]);
    const d1Geo = new THREE.TubeGeometry(d1Curve, 16, 0.05, 10, false);
    const d1Mesh = new THREE.Mesh(d1Geo, ladMat);
    vesselsGroup.add(d1Mesh);

    // LAD Stenosis Plaque Marker (Proximal-to-mid LAD)
    if (stenosisLAD >= 50) {
      const plaqueGeo = new THREE.TorusGeometry(0.12, 0.045, 12, 24);
      const plaqueMat = new THREE.MeshStandardMaterial({
        color: 0xffe4e6,
        emissive: 0xf43f5e,
        emissiveIntensity: 0.8,
        roughness: 0.3,
      });
      const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
      plaque.position.set(-0.38, 0.55, 1.15);
      plaque.rotation.x = Math.PI / 3;
      vesselsGroup.add(plaque);
    }

    // -- LCX (Left Circumflex Artery) --
    const lcxCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.25, 1.1, 0.45),
      new THREE.Vector3(-0.65, 0.95, 0.5),
      new THREE.Vector3(-1.15, 0.65, 0.2),
      new THREE.Vector3(-1.35, 0.2, -0.2),
      new THREE.Vector3(-1.25, -0.4, -0.6),
    ]);
    const lcxGeo = new THREE.TubeGeometry(lcxCurve, 40, 0.08, 14, false);
    const lcxMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(getColorByStenosis(stenosisLCX, selectedVessel === 'LCX')),
      roughness: 0.25,
      metalness: 0.3,
      emissive: new THREE.Color(getColorByStenosis(stenosisLCX, selectedVessel === 'LCX')),
      emissiveIntensity: selectedVessel === 'LCX' ? 0.45 : 0.15,
    });
    const lcxMesh = new THREE.Mesh(lcxGeo, lcxMat);
    lcxMesh.userData = { vesselId: 'LCX', name: 'Left Circumflex' };
    vesselsGroup.add(lcxMesh);

    // Obtuse Marginal (OM1) branch
    const omCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.15, 0.65, 0.2),
      new THREE.Vector3(-1.3, 0.1, 0.25),
      new THREE.Vector3(-1.35, -0.5, 0.15),
    ]);
    const omGeo = new THREE.TubeGeometry(omCurve, 16, 0.045, 10, false);
    const omMesh = new THREE.Mesh(omGeo, lcxMat);
    vesselsGroup.add(omMesh);

    // LCX Plaque Marker if significant
    if (stenosisLCX >= 50) {
      const plaqueGeo = new THREE.TorusGeometry(0.11, 0.04, 12, 24);
      const plaqueMat = new THREE.MeshStandardMaterial({
        color: 0xffe4e6,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.8,
      });
      const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
      plaque.position.set(-1.15, 0.65, 0.2);
      vesselsGroup.add(plaque);
    }

    // -- RCA (Right Coronary Artery) --
    const rcaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.2, 1.15, 0.45),
      new THREE.Vector3(0.65, 0.95, 0.6),
      new THREE.Vector3(1.15, 0.5, 0.55),
      new THREE.Vector3(1.35, -0.1, 0.2),
      new THREE.Vector3(1.25, -0.7, -0.2),
      new THREE.Vector3(0.85, -1.1, -0.5),
    ]);
    const rcaGeo = new THREE.TubeGeometry(rcaCurve, 48, 0.09, 14, false);
    const rcaMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(getColorByStenosis(stenosisRCA, selectedVessel === 'RCA')),
      roughness: 0.25,
      metalness: 0.3,
      emissive: new THREE.Color(getColorByStenosis(stenosisRCA, selectedVessel === 'RCA')),
      emissiveIntensity: selectedVessel === 'RCA' ? 0.45 : 0.15,
    });
    const rcaMesh = new THREE.Mesh(rcaGeo, rcaMat);
    rcaMesh.userData = { vesselId: 'RCA', name: 'Right Coronary Artery' };
    vesselsGroup.add(rcaMesh);

    // Acute Marginal branch
    const amCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.15, 0.5, 0.55),
      new THREE.Vector3(1.1, -0.1, 0.85),
      new THREE.Vector3(0.8, -0.6, 0.95),
    ]);
    const amGeo = new THREE.TubeGeometry(amCurve, 16, 0.05, 10, false);
    const amMesh = new THREE.Mesh(amGeo, rcaMat);
    vesselsGroup.add(amMesh);

    // RCA Plaque Marker
    if (stenosisRCA >= 50) {
      const plaqueGeo = new THREE.TorusGeometry(0.12, 0.045, 12, 24);
      const plaqueMat = new THREE.MeshStandardMaterial({
        color: 0xffe4e6,
        emissive: 0xf43f5e,
        emissiveIntensity: 0.8,
      });
      const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
      plaque.position.set(1.15, 0.5, 0.55);
      vesselsGroup.add(plaque);
    }

    // 5. Ground Contact Shadow Disc
    const groundGeo = new THREE.CircleGeometry(3.0, 32);
    const groundMat = new THREE.MeshBasicMaterial({
      color: 0x020617,
      transparent: true,
      opacity: 0.5,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2.2;
    scene.add(ground);

    // 6. Raycasting Setup for Vessel Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e: MouseEvent) => {
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Rotate model on drag
      if (isDragging.current && mainGroup) {
        const deltaX = e.clientX - previousMousePosition.current.x;
        const deltaY = e.clientY - previousMousePosition.current.y;
        mainGroup.rotation.y += deltaX * 0.009;
        mainGroup.rotation.x += deltaY * 0.009;
        previousMousePosition.current = { x: e.clientX, y: e.clientY };
      } else {
        // Raycast hover check
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(vesselsGroup.children);
        if (intersects.length > 0 && intersects[0].object.userData.vesselId) {
          setHoveredVessel(intersects[0].object.userData.name);
          container.style.cursor = 'pointer';
        } else {
          setHoveredVessel(null);
          container.style.cursor = isDragging.current ? 'grabbing' : 'grab';
        }
      }
    };

    const handlePointerUp = (e: MouseEvent) => {
      if (isDragging.current) {
        // If not dragged far, treat as click selection
        const deltaX = Math.abs(e.clientX - previousMousePosition.current.x);
        const deltaY = Math.abs(e.clientY - previousMousePosition.current.y);
        if (deltaX < 4 && deltaY < 4) {
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(vesselsGroup.children);
          if (intersects.length > 0 && intersects[0].object.userData.vesselId) {
            onSelectVessel(intersects[0].object.userData.vesselId);
          }
        }
      }
      isDragging.current = false;
      container.style.cursor = 'grab';
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.0035;
      const newZ = Math.min(12, Math.max(4.2, camera.position.z + zoomFactor));
      camera.position.z = newZ;
    };

    container.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    container.addEventListener('wheel', handleWheel, { passive: false });

    // 7. Animation Loop with Cardiac Rhythm
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera interpolation towards target
      camera.position.lerp(targetCameraPos.current, 0.06);

      // Heartbeat pulse calculation (simulated systolic/diastolic dual peak)
      if (heartBeatActive && heartMeshRef.current) {
        const beatFreq = 1.1; // ~66 bpm
        const phase = (elapsedTime * beatFreq) % 1.0;
        let scalePulse = 1.0;
        if (phase < 0.15) {
          scalePulse = 1.0 + Math.sin((phase / 0.15) * Math.PI) * 0.038;
        } else if (phase >= 0.18 && phase < 0.32) {
          scalePulse = 1.0 + Math.sin(((phase - 0.18) / 0.14) * Math.PI) * 0.022;
        }
        heartMeshRef.current.scale.set(scalePulse, scalePulse * 1.02, scalePulse);
      }

      // Gentle continuous ambient drift when not dragging
      if (!isDragging.current && mainGroup) {
        mainGroup.rotation.y += 0.0015;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      container.removeEventListener('wheel', handleWheel);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      heartGeo.dispose();
      heartMat.dispose();
      aortaGeo.dispose();
      aortaMat.dispose();
      pulmoGeo.dispose();
      pulmoMat.dispose();
      ladGeo.dispose();
      ladMat.dispose();
      lcxGeo.dispose();
      lcxMat.dispose();
      rcaGeo.dispose();
      rcaMat.dispose();
    };
  }, [stenosisLAD, stenosisLCX, stenosisRCA, selectedVessel, transparencyMode, heartBeatActive]);

  // Handle Camera Presets
  const setViewPreset = (preset: 'AP' | 'PA' | 'LAO' | 'RAO') => {
    setCameraPreset(preset);
    if (!heartGroupRef.current) return;
    switch (preset) {
      case 'AP': // Anterior view
        heartGroupRef.current.rotation.set(0.1, 0, 0);
        targetCameraPos.current.set(0, 0, 7.5);
        break;
      case 'PA': // Posterior view
        heartGroupRef.current.rotation.set(0.1, Math.PI, 0);
        targetCameraPos.current.set(0, 0, 7.5);
        break;
      case 'LAO': // Left Anterior Oblique 45° (ideal for LAD/LCX bifurcation)
        heartGroupRef.current.rotation.set(0.15, -Math.PI / 4, 0);
        targetCameraPos.current.set(0, 0, 7.2);
        break;
      case 'RAO': // Right Anterior Oblique 30° (ideal for RCA)
        heartGroupRef.current.rotation.set(0.15, Math.PI / 6, 0);
        targetCameraPos.current.set(0, 0, 7.2);
        break;
    }
  };

  const resetOrientation = () => {
    if (heartGroupRef.current) {
      heartGroupRef.current.rotation.set(0.1, 0, 0);
    }
    targetCameraPos.current.set(0, 0, 7.5);
    setCameraPreset('AP');
  };

  return (
    <div className={`relative w-full h-[580px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 ${className}`}>
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left: Model HUD Badge & Telemetry */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-mono tracking-widest text-teal-400 font-semibold bg-slate-900/80 px-2.5 py-1 rounded border border-teal-500/30 backdrop-blur">
            Interactive 3D Anatomical Stage
          </span>
          <span className="text-xs font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 backdrop-blur">
            WebGL PBR Canvas
          </span>
        </div>
        {hoveredVessel && (
          <div className="text-sm font-medium text-white bg-slate-900/90 px-3 py-1 rounded border border-cyan-500/40 backdrop-blur shadow-lg">
            Target: <span className="text-cyan-400 font-semibold">{hoveredVessel}</span>
          </div>
        )}
      </div>

      {/* Top Right: Viewport Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={resetOrientation}
          title="Reset Camera Orientation"
          className="p-2 text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors backdrop-blur"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => setHeartBeatActive(!heartBeatActive)}
          title="Toggle Cardiac Rhythm Animation"
          className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors backdrop-blur flex items-center gap-1.5 ${
            heartBeatActive
              ? 'bg-teal-950/60 border-teal-500/40 text-teal-300'
              : 'bg-slate-900/80 border-slate-800 text-slate-400'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>{heartBeatActive ? 'Pulse: Active' : 'Pulse: Paused'}</span>
        </button>
        <button
          onClick={() => setTransparencyMode(!transparencyMode)}
          title="Toggle Myocardial Translucency to Inspect Subendocardial Arteries"
          className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors backdrop-blur flex items-center gap-1.5 ${
            transparencyMode
              ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
              : 'bg-slate-900/80 border-slate-800 text-slate-400'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{transparencyMode ? 'X-Ray Myocardium' : 'Solid Heart'}</span>
        </button>
      </div>

      {/* Vessel Quick Legend Overlay (Top Center) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-900/85 backdrop-blur border border-slate-800 rounded-full text-xs">
        <span className="text-slate-400 text-[11px] font-mono mr-1">TERRITORIES:</span>
        <button
          onClick={() => onSelectVessel('LAD')}
          className={`px-2 py-0.5 rounded transition-colors ${
            selectedVessel === 'LAD' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold' : 'text-slate-300 hover:text-white'
          }`}
        >
          LAD ({stenosisLAD}%)
        </button>
        <span className="text-slate-600">·</span>
        <button
          onClick={() => onSelectVessel('LCX')}
          className={`px-2 py-0.5 rounded transition-colors ${
            selectedVessel === 'LCX' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold' : 'text-slate-300 hover:text-white'
          }`}
        >
          LCX ({stenosisLCX}%)
        </button>
        <span className="text-slate-600">·</span>
        <button
          onClick={() => onSelectVessel('RCA')}
          className={`px-2 py-0.5 rounded transition-colors ${
            selectedVessel === 'RCA' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold' : 'text-slate-300 hover:text-white'
          }`}
        >
          RCA ({stenosisRCA}%)
        </button>
        <span className="text-slate-600">·</span>
        <button
          onClick={() => onSelectVessel('ALL')}
          className={`px-2 py-0.5 rounded transition-colors ${
            selectedVessel === 'ALL' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          All
        </button>
      </div>

      {/* Unified Bottom Control Dock (per Three.js skill: pinned to bottom center, zero occlusion) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-3xl">
        <div className="relative bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-2xl transition-all">
          {/* Collapse/Expand Toggle Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Coronary Angiographic Stage Controls
              </span>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                Drag to orbit · Scroll to zoom
              </span>
            </div>
            <button
              onClick={() => setIsZenMode(!isZenMode)}
              className="text-xs font-medium text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <span>{isZenMode ? 'Show Controls' : 'Zen View'}</span>
              {isZenMode ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Collapsible Content */}
          {!isZenMode && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1 text-xs">
              {/* Projection Presets */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Projection Angles</span>
                <div className="flex items-center gap-1">
                  {(['AP', 'PA', 'LAO', 'RAO'] as const).map((view) => (
                    <button
                      key={view}
                      onClick={() => setViewPreset(view)}
                      className={`flex-1 py-1 px-1.5 rounded text-center font-mono font-medium transition-colors ${
                        cameraPreset === view
                          ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {view}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stenosis Color Code Standard */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Stenosis Severity Grade</span>
                <div className="flex items-center justify-between bg-slate-950/70 p-1.5 rounded border border-slate-800 text-[11px]">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-400 shrink-0" />
                    <span className="text-slate-300">&lt;40% Mild</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                    <span className="text-slate-300">40-69% Mod</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                    <span className="text-rose-300 font-medium">&ge;70% Crit</span>
                  </div>
                </div>
              </div>

              {/* Selected Vessel Inspector Snapshot */}
              <div className="flex flex-col gap-1 sm:col-span-2 md:col-span-1 justify-center bg-slate-950/70 p-2 rounded border border-slate-800">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">SELECTED:</span>
                  <span className="font-semibold text-cyan-300">{selectedVessel}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">EST. STENOSIS:</span>
                  <span className="font-mono font-bold text-white">
                    {selectedVessel === 'LAD'
                      ? `${stenosisLAD}%`
                      : selectedVessel === 'LCX'
                      ? `${stenosisLCX}%`
                      : selectedVessel === 'RCA'
                      ? `${stenosisRCA}%`
                      : 'Multivessel'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
