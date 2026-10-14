/**
 * CardioVision 3D - Heart & Coronary Artery Visualization Page
 * Houses the dedicated 3D Three.js Heart model area, real-time stenosis simulation,
 * arterial cross-section lumen view, and vessel-specific clinical guidance.
 */

import React, { useState } from 'react';
import { Heart3DViewer } from '../visualization/Heart3DViewer';
import { AssessmentRecord } from '../../types/cardio';
import {
  Heart,
  Sliders,
  Maximize2,
  Info,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { NavPage } from '../layout/Sidebar';

interface VisualizationPageProps {
  records: AssessmentRecord[];
  activeRecord: AssessmentRecord;
  onSelectRecord: (record: AssessmentRecord) => void;
  selectedVessel: 'LAD' | 'LCX' | 'RCA' | 'ALL';
  onSelectVessel: (vessel: 'LAD' | 'LCX' | 'RCA' | 'ALL') => void;
  onNavigate: (page: NavPage) => void;
}

export const VisualizationPage: React.FC<VisualizationPageProps> = ({
  records,
  activeRecord,
  onSelectRecord,
  selectedVessel,
  onSelectVessel,
  onNavigate,
}) => {
  const prediction = activeRecord.prediction;
  const vessels = prediction.vessels;

  // Real-time interactive simulation overrides
  const [interactiveStenosis, setInteractiveStenosis] = useState({
    LAD: vessels.LAD.stenosisEstimatePercent,
    LCX: vessels.LCX.stenosisEstimatePercent,
    RCA: vessels.RCA.stenosisEstimatePercent,
  });

  const [activeSimulationMode, setActiveSimulationMode] = useState<'patient_actual' | 'custom_simulation'>('patient_actual');

  const handleStenosisChange = (vessel: 'LAD' | 'LCX' | 'RCA', val: number) => {
    setActiveSimulationMode('custom_simulation');
    setInteractiveStenosis((prev) => ({ ...prev, [vessel]: val }));
  };

  const handleResetToPatient = () => {
    setActiveSimulationMode('patient_actual');
    setInteractiveStenosis({
      LAD: vessels.LAD.stenosisEstimatePercent,
      LCX: vessels.LCX.stenosisEstimatePercent,
      RCA: vessels.RCA.stenosisEstimatePercent,
    });
  };

  // Get active vessel info
  const currentVesselKey = selectedVessel === 'ALL' ? 'LAD' : selectedVessel;
  const currentVessel = vessels[currentVesselKey];
  const currentStenosis = interactiveStenosis[currentVesselKey];

  return (
    <div className="space-y-6 pb-16">
      {/* Top Patient Bar & Mode Controller */}
      <div className="bg-[#0D1829] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-teal-400">
                  3D Anatomical Stage
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs font-mono text-slate-400">
                  Subject: {activeRecord.patientData.demographics.name} ({activeRecord.patientData.demographics.patientId})
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Interactive Coronary Tree & Hemodynamic Mapping
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              aria-label="Switch active patient in 3D view"
              value={activeRecord.id}
              onChange={(e) => {
                const found = records.find((r) => r.id === e.target.value);
                if (found) {
                  onSelectRecord(found);
                  setInteractiveStenosis({
                    LAD: found.prediction.vessels.LAD.stenosisEstimatePercent,
                    LCX: found.prediction.vessels.LCX.stenosisEstimatePercent,
                    RCA: found.prediction.vessels.RCA.stenosisEstimatePercent,
                  });
                  setActiveSimulationMode('patient_actual');
                }
              }}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-teal-500 focus:outline-none"
            >
              {records.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.patientData.demographics.name} ({r.patientData.demographics.patientId})
                </option>
              ))}
            </select>

            {activeSimulationMode === 'custom_simulation' && (
              <button
                onClick={handleResetToPatient}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>Reset to Case Values</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('assessment')}
              className="px-3 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors"
            >
              Adjust Intake Biomarkers
            </button>
          </div>
        </div>
      </div>

      {/* 3D Model Stage Canvas */}
      <div className="relative">
        <Heart3DViewer
          vesselRisks={vessels}
          selectedVessel={selectedVessel}
          onSelectVessel={onSelectVessel}
          interactiveStenosis={interactiveStenosis}
        />
      </div>

      {/* Interactive Simulation & Anatomical Analysis Tray */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Real-time Stenosis Scrubber Controls */}
        <div className="bg-[#0D1829] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-semibold text-white">Stenosis Simulator</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Interactive What-If</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Drag sliders to simulate progression or resolution of flow-limiting lesions in real-time on the 3D model:
          </p>

          {/* LAD Slider */}
          <div className="space-y-1.5 p-3 rounded-lg bg-slate-900/80 border border-slate-800/80">
            <div className="flex justify-between items-center text-xs">
              <button
                onClick={() => onSelectVessel('LAD')}
                className={`font-semibold transition-colors ${selectedVessel === 'LAD' ? 'text-cyan-400 underline' : 'text-slate-200'}`}
              >
                Left Anterior Descending (LAD)
              </button>
              <span className="font-mono font-bold text-white tabular-nums">{interactiveStenosis.LAD}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={99}
              value={interactiveStenosis.LAD}
              onChange={(e) => handleStenosisChange('LAD', Number(e.target.value))}
              className="w-full accent-teal-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>5% (Patent)</span>
              <span>50% (Ischemic Threshold)</span>
              <span>99% (Subtotal)</span>
            </div>
          </div>

          {/* LCX Slider */}
          <div className="space-y-1.5 p-3 rounded-lg bg-slate-900/80 border border-slate-800/80">
            <div className="flex justify-between items-center text-xs">
              <button
                onClick={() => onSelectVessel('LCX')}
                className={`font-semibold transition-colors ${selectedVessel === 'LCX' ? 'text-cyan-400 underline' : 'text-slate-200'}`}
              >
                Left Circumflex (LCX)
              </button>
              <span className="font-mono font-bold text-white tabular-nums">{interactiveStenosis.LCX}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={99}
              value={interactiveStenosis.LCX}
              onChange={(e) => handleStenosisChange('LCX', Number(e.target.value))}
              className="w-full accent-teal-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>5% (Patent)</span>
              <span>50% (Ischemic Threshold)</span>
              <span>99% (Subtotal)</span>
            </div>
          </div>

          {/* RCA Slider */}
          <div className="space-y-1.5 p-3 rounded-lg bg-slate-900/80 border border-slate-800/80">
            <div className="flex justify-between items-center text-xs">
              <button
                onClick={() => onSelectVessel('RCA')}
                className={`font-semibold transition-colors ${selectedVessel === 'RCA' ? 'text-cyan-400 underline' : 'text-slate-200'}`}
              >
                Right Coronary Artery (RCA)
              </button>
              <span className="font-mono font-bold text-white tabular-nums">{interactiveStenosis.RCA}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={99}
              value={interactiveStenosis.RCA}
              onChange={(e) => handleStenosisChange('RCA', Number(e.target.value))}
              className="w-full accent-teal-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>5% (Patent)</span>
              <span>50% (Ischemic Threshold)</span>
              <span>99% (Subtotal)</span>
            </div>
          </div>
        </div>

        {/* Center: Arterial Cross-Section Lumen Simulation */}
        <div className="bg-[#0D1829] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-semibold text-white">
                  Lumen Cross-Section ({currentVesselKey})
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-teal-300">
                {currentStenosis}% Occluded
              </span>
            </div>

            {/* SVG Cross-Section Illustration */}
            <div className="my-4 flex flex-col items-center justify-center p-4 bg-slate-950/70 rounded-xl border border-slate-800/80">
              <svg width="180" height="180" viewBox="0 0 180 180" className="drop-shadow">
                {/* External Arterial Adventitia */}
                <circle cx="90" cy="90" r="76" fill="#1e293b" stroke="#334155" strokeWidth="4" />
                {/* Media Muscularis Wall */}
                <circle cx="90" cy="90" r="68" fill="#3b0716" stroke="#4c0519" strokeWidth="3" />
                {/* Atheromatous Plaque Core (grows with stenosis %) */}
                {currentStenosis > 10 && (
                  <circle
                    cx="90"
                    cy="90"
                    r={64}
                    fill="#d97706"
                    opacity={0.85}
                  />
                )}
                {/* Patent Remaining Flow Lumen */}
                <circle
                  cx={90 + (currentStenosis > 30 ? 12 : 0)}
                  cy={90 - (currentStenosis > 30 ? 10 : 0)}
                  r={Math.max(8, 64 * (1 - currentStenosis / 100))}
                  fill="#f43f5e"
                  stroke="#fda4af"
                  strokeWidth="2"
                />
              </svg>

              <div className="flex items-center gap-4 text-[11px] font-mono mt-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#f43f5e] border border-rose-300" />
                  <span className="text-slate-300">Patent Flow Lumen</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#d97706]" />
                  <span className="text-slate-300">Atheroma Plaque</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Calculated Fractional Flow Reserve (FFR est):</span>
                <span className="font-mono font-bold text-slate-200">
                  {currentStenosis >= 75 ? '<0.75 (Ischemic)' : currentStenosis >= 50 ? '0.78 (Borderline)' : '0.92 (Preserved)'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] text-slate-300">
            <span className="font-semibold text-teal-300">Hemodynamic Significance: </span>
            {currentStenosis >= 70
              ? 'Meets standard angiographic criteria for critical flow-limiting lesion requiring intervention.'
              : currentStenosis >= 50
              ? 'Intermediate anatomical stenosis. Functional physiological evaluation (FFR/iFR) indicated.'
              : 'Non-obstructive coronary atheroma. Managed with medical secondary prevention.'}
          </div>
        </div>

        {/* Right: Selected Vessel Anatomy & Clinical Recommendation */}
        <div className="bg-[#0D1829] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white">Anatomical Profile</h3>
              <span className="text-xs font-mono text-cyan-400 font-semibold">{currentVesselKey}</span>
            </div>

            <div className="mt-3 space-y-3">
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase">Full Vessel Name</span>
                <p className="text-sm font-bold text-slate-100">{currentVessel.vesselName}</p>
              </div>

              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase">Myocardial Supply Territory</span>
                <p className="text-xs text-slate-300 mt-0.5">{currentVessel.anatomicalTerritory}</p>
              </div>

              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase">Contributing Biomarkers & Features</span>
                <ul className="mt-1 space-y-1">
                  {currentVessel.contributingFactors.map((fac, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                      <span className="text-teal-400 font-bold">•</span>
                      <span>{fac}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Clinical Recommendation</span>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-200 leading-relaxed">
              {currentVessel.recommendedAction}
            </div>

            <button
              onClick={() => onNavigate('model-performance')}
              className="w-full mt-2 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-teal-300 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Examine Model ROC & Metrics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
