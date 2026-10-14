/**
 * CardioVision 3D - Model Performance & Validation Analytics Page
 * Displays Accuracy, Precision, Recall, F1-Score, and ROC-AUC across CAD, LAD, LCX, RCA.
 * Includes interactive Confusion Matrix, ROC curves, and SHAP feature importance.
 * Transparently labeled as Synthetic Benchmark Validation Data.
 */

import React, { useState } from 'react';
import { SYNTHETIC_MODEL_METRICS, FEATURE_IMPORTANCE_DATA } from '../../data/mockData';
import { VesselId } from '../../types/cardio';
import {
  LineChart,
  ShieldAlert,
  BarChart2,
  CheckCircle2,
  Cpu,
  Layers,
  Info,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { NavPage } from '../layout/Sidebar';

interface ModelPerformancePageProps {
  onNavigate: (page: NavPage) => void;
}

export const ModelPerformancePage: React.FC<ModelPerformancePageProps> = ({ onNavigate }) => {
  const [selectedTarget, setSelectedTarget] = useState<VesselId>('CAD');
  const metrics = SYNTHETIC_MODEL_METRICS[selectedTarget];
  const cm = metrics.confusionMatrix;

  return (
    <div className="space-y-6 pb-16">
      {/* Synthetic Benchmark Disclaimer Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-200">
                Synthetic Validation Metrics (Pre-Deployment Benchmark)
              </span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                MOCK BENCHMARK
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              These evaluation figures are synthetic placeholders demonstrating the planned evaluation schema for the upcoming Python ML model (XGBoost/LightGBM multi-output).
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('about')}
          className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-4 font-medium shrink-0"
        >
          View ML Architecture Roadmap
        </button>
      </div>

      {/* Target Selector Header */}
      <div className="bg-[#0D1829] border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-teal-400 font-semibold">
              Evaluation Target Class
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
              {metrics.targetName}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Sample Cohort Size: <strong className="text-slate-200 font-mono">{metrics.sampleCount}</strong> stratified cross-validation records.
            </p>
          </div>

          {/* Target Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-lg border border-slate-800">
            {(['CAD', 'LAD', 'LCX', 'RCA'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTarget(t)}
                className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-md transition-colors ${
                  selectedTarget === t
                    ? 'bg-teal-500 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'CAD' ? 'Global CAD' : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5 Core Metrics Cards: Accuracy, Precision, Recall, F1, ROC-AUC */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Accuracy */}
        <div className="bg-[#0D1829] border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Accuracy</span>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
            {(metrics.accuracy * 100).toFixed(1)}%
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1 mt-2.5 overflow-hidden">
            <div className="bg-teal-400 h-full" style={{ width: `${metrics.accuracy * 100}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Overall correctly classified cases</p>
        </div>

        {/* Precision */}
        <div className="bg-[#0D1829] border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Precision (PPV)</span>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-cyan-300 tabular-nums">
            {(metrics.precision * 100).toFixed(1)}%
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1 mt-2.5 overflow-hidden">
            <div className="bg-cyan-400 h-full" style={{ width: `${metrics.precision * 100}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Positive predictive value</p>
        </div>

        {/* Recall */}
        <div className="bg-[#0D1829] border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Recall (Sensitivity)</span>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-teal-300 tabular-nums">
            {(metrics.recall * 100).toFixed(1)}%
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1 mt-2.5 overflow-hidden">
            <div className="bg-teal-400 h-full" style={{ width: `${metrics.recall * 100}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">True ischemic lesion detection</p>
        </div>

        {/* F1-Score */}
        <div className="bg-[#0D1829] border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-mono text-slate-400 uppercase">F1-Score</span>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-amber-300 tabular-nums">
            {(metrics.f1Score * 100).toFixed(1)}%
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1 mt-2.5 overflow-hidden">
            <div className="bg-amber-400 h-full" style={{ width: `${metrics.f1Score * 100}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Harmonic mean of precision & recall</p>
        </div>

        {/* ROC-AUC */}
        <div className="bg-[#0D1829] border border-slate-800 rounded-xl p-4 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">ROC-AUC</span>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-emerald-400 tabular-nums">
            {metrics.rocAuc.toFixed(3)}
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1 mt-2.5 overflow-hidden">
            <div className="bg-emerald-400 h-full" style={{ width: `${metrics.rocAuc * 100}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Discrimination index across cutoffs</p>
        </div>
      </div>

      {/* Confusion Matrix & ROC Curve Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix */}
        <div className="bg-[#0D1829] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white">2x2 Confusion Matrix</h3>
              <p className="text-xs text-slate-400">Classification matrix for target: {metrics.vessel}</p>
            </div>
            <span className="text-xs font-mono text-slate-400">{metrics.sampleCount} Cases</span>
          </div>

          <div className="pt-2">
            <div className="grid grid-cols-2 gap-3">
              {/* True Positive */}
              <div className="p-4 bg-teal-950/40 border border-teal-500/40 rounded-xl text-center">
                <span className="text-[11px] font-mono uppercase tracking-wider text-teal-400 font-semibold block">
                  True Positive (TP)
                </span>
                <div className="text-3xl font-bold font-mono text-white mt-1 tabular-nums">
                  {cm.truePositive}
                </div>
                <p className="text-[10px] text-teal-300 mt-1">Stenosis correctly identified</p>
              </div>

              {/* False Positive */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl text-center">
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold block">
                  False Positive (FP)
                </span>
                <div className="text-3xl font-bold font-mono text-slate-200 mt-1 tabular-nums">
                  {cm.falsePositive}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Type I False Alarm</p>
              </div>

              {/* False Negative */}
              <div className="p-4 bg-rose-950/30 border border-rose-800/40 rounded-xl text-center">
                <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-semibold block">
                  False Negative (FN)
                </span>
                <div className="text-3xl font-bold font-mono text-rose-200 mt-1 tabular-nums">
                  {cm.falseNegative}
                </div>
                <p className="text-[10px] text-rose-300 mt-1">Type II Missed Lesions</p>
              </div>

              {/* True Negative */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl text-center">
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold block">
                  True Negative (TN)
                </span>
                <div className="text-3xl font-bold font-mono text-white mt-1 tabular-nums">
                  {cm.trueNegative}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Normal anatomy confirmed</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Specificity (TNR):</span>
            <span className="font-mono font-bold text-slate-200">
              {((cm.trueNegative / (cm.trueNegative + cm.falsePositive)) * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* ROC Curve Graph */}
        <div className="bg-[#0D1829] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white">ROC Curve (Receiver Operating Characteristic)</h3>
              <p className="text-xs text-slate-400">Sensitivity vs 1 - Specificity curve</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-500/30">
              AUC {metrics.rocAuc.toFixed(3)}
            </span>
          </div>

          {/* SVG ROC Plot */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex flex-col items-center">
            <svg width="280" height="220" viewBox="0 0 280 220" className="overflow-visible">
              {/* Axes */}
              <line x1="40" y1="20" x2="40" y2="180" stroke="#334155" strokeWidth="1.5" />
              <line x1="40" y1="180" x2="260" y2="180" stroke="#334155" strokeWidth="1.5" />

              {/* Grid Lines */}
              <line x1="40" y1="100" x2="260" y2="100" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="150" y1="20" x2="150" y2="180" stroke="#1e293b" strokeDasharray="3 3" />

              {/* Chance Diagonal (AUC 0.50) */}
              <line x1="40" y1="180" x2="260" y2="20" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" />

              {/* ROC Curve Path */}
              {(() => {
                const points = metrics.rocCurve
                  .map((pt) => {
                    const x = 40 + pt.fpr * 220;
                    const y = 180 - pt.tpr * 160;
                    return `${x},${y}`;
                  })
                  .join(' ');
                return (
                  <>
                    <polyline
                      points={points}
                      fill="none"
                      stroke="#14B8A6"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {metrics.rocCurve.map((pt, i) => (
                      <circle
                        key={i}
                        cx={40 + pt.fpr * 220}
                        cy={180 - pt.tpr * 160}
                        r="3.5"
                        fill="#0D9488"
                        stroke="#fff"
                        strokeWidth="1.5"
                      />
                    ))}
                  </>
                );
              })()}

              {/* Axis Labels */}
              <text x="150" y="205" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                False Positive Rate (1 - Specificity)
              </text>
              <text
                x="-100"
                y="18"
                transform="rotate(-90)"
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="10"
                fontFamily="monospace"
              >
                True Positive Rate
              </text>
            </svg>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mt-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-teal-400" />
                <span className="text-slate-300">Classifier (AUC {metrics.rocAuc})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t border-dashed border-slate-500" />
                <span>Random Guess (0.50)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Importance (SHAP Values) Ranking */}
      <div className="bg-[#0D1829] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-white">Feature Importance Ranking (SHAP Values)</h3>
            <p className="text-xs text-slate-400">
              Contribution weight of each biomarker in the gradient boosted decision forest
            </p>
          </div>
          <span className="text-xs font-mono text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-500/30">
            Multivariate Attribution
          </span>
        </div>

        <div className="space-y-3 pt-2">
          {FEATURE_IMPORTANCE_DATA.map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                <span className="font-semibold text-slate-200">
                  {idx + 1}. {item.featureName}
                </span>
                <span className="font-mono font-bold text-teal-400 tabular-nums">
                  SHAP +{(item.shapValue * 100).toFixed(0)}%
                </span>
              </div>

              {/* Weight bar */}
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-teal-500 h-full rounded-full"
                  style={{ width: `${item.shapValue * 100 * 3.5}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{item.clinicalDescription}</span>
                <span className="font-mono capitalize text-slate-400">{item.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Validation Methodology Note */}
      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed space-y-2">
        <h4 className="font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-teal-400" />
          <span>Planned ML Microservice Integration Architecture</span>
        </h4>
        <p>
          In Part 3 of the project, a standalone FastAPI / Python machine-learning service will replace this synthetic benchmark. The production model uses an ensemble combining an XGBoost classifier for tabular biomarker tabular data and a convolutional neural network for 12-lead raw ECG voltage tracings.
        </p>
      </div>
    </div>
  );
};
