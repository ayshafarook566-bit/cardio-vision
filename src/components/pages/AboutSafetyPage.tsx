/**
 * CardioVision 3D - About & Clinical Safety Page
 * Features transparent architecture roadmap (Part 1, 2, 3),
 * prominent regulatory & medical disclaimers, guideline citations, and data safety notes.
 */

import React from 'react';
import {
  ShieldAlert,
  Layers,
  Cpu,
  Database,
  FileCheck2,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Clock,
  Code2,
} from 'lucide-react';

export const AboutSafetyPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Prominent Medical Disclaimer Banner */}
      <div className="bg-rose-950/40 border-2 border-rose-800/80 rounded-2xl p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-rose-300 bg-rose-900/60 px-2.5 py-0.5 rounded border border-rose-700/50">
                Mandatory Safety Notice
              </span>
              <span className="text-xs text-rose-300/80 font-mono">IRB Research Prototype</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Educational research prototype only. Not a substitute for professional medical assessment or diagnostic testing.
            </h2>
            <p className="text-xs text-rose-200/90 leading-relaxed">
              CardioVision 3D is developed strictly as a technical and clinical decision-support research demonstration for medical hackathons. It is neither cleared nor approved by the U.S. FDA, EMA, or any national health authority. Clinical diagnoses and coronary intervention decisions must always be made by board-certified cardiologists utilizing standard diagnostic modalities (e.g. 12-lead ECG, high-sensitivity cardiac biomarkers, invasive coronary angiography, CCTA, or stress myocardial perfusion imaging).
            </p>
          </div>
        </div>
      </div>

      {/* Project Mission & Scientific Overview */}
      <div className="bg-[#0D1829] border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <BookOpen className="w-4 h-4 text-teal-400" />
          <h3 className="text-base font-bold text-white">Project Overview & Clinical Motivation</h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Coronary Artery Disease (CAD) remains the single leading cause of mortality worldwide. Conventional risk calculators (such as the Framingham Risk Score and ASCVD pooled cohort equations) predict 10-year systemic cardiovascular risk but cannot pinpoint vessel-specific anatomical stenosis in the Left Anterior Descending (LAD), Left Circumflex (LCX), or Right Coronary Artery (RCA).
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white">CardioVision 3D</strong> introduces a spatial, multimodal framework that unifies patient demographics, 12-lead ECG stress findings, circulating cardiac biomarkers (hs-Troponin T, hs-CRP, atherogenic lipids), and echocardiographic regional wall motion abnormalities (RWMA) to visually estimate ischemic probability directly mapped onto an interactive 3D coronary anatomy model.
        </p>
      </div>

      {/* 3-Part Hackathon Architecture Roadmap */}
      <div className="bg-[#0D1829] border border-slate-800 rounded-xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Architecture & Development Roadmap</h3>
            <p className="text-xs text-slate-400">Structured modular implementation stages</p>
          </div>
          <span className="text-xs font-mono text-teal-400 bg-teal-950/60 px-2.5 py-1 rounded border border-teal-500/30">
            Phase 1 of 3
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Part 1: Current */}
          <div className="p-4 bg-teal-950/30 border border-teal-500/40 rounded-xl space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-teal-400 font-bold uppercase">Part 1 (Current)</span>
              <span className="text-[10px] bg-teal-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                COMPLETE
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">Frontend UI/UX & 3D Stage</h4>
            <ul className="text-xs text-slate-300 space-y-1.5">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                <span>Responsive clinical dashboard for desktop, tablet, and mobile.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                <span>Standalone Three.js interactive 3D coronary artery canvas.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                <span>Multimodal clinical intake form with field validation and presets.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                <span>Synthetic clinical heuristic engine & cohort repository.</span>
              </li>
            </ul>
          </div>

          {/* Part 2: Firebase Firestore */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">Part 2 (Next)</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-1.5 py-0.5 rounded flex items-center gap-1">
                <Clock className="w-3 h-3" />
                PLANNED
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">Firebase & Persistence</h4>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li className="flex items-start gap-1.5">
                <span className="text-teal-400">•</span>
                <span>Firestore database persistence for patient records and cohorts.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-teal-400">•</span>
                <span>Firebase Authentication with Role-Based Access Control (Clinician/Researcher).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-teal-400">•</span>
                <span>Cloud sync of simulated angiographic 3D annotations across devices.</span>
              </li>
            </ul>
          </div>

          {/* Part 3: Python ML API */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">Part 3</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-1.5 py-0.5 rounded flex items-center gap-1">
                <Clock className="w-3 h-3" />
                PLANNED
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">Python ML Microservice</h4>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li className="flex items-start gap-1.5">
                <span className="text-teal-400">•</span>
                <span>FastAPI microservice running real trained XGBoost & PyTorch models.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-teal-400">•</span>
                <span>Pre-trained on benchmark clinical coronary datasets.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-teal-400">•</span>
                <span>Live SHAP explainability calculations returned over HTTP/JSON.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Guidelines & Scientific References */}
      <div className="bg-[#0D1829] border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <FileCheck2 className="w-4 h-4 text-teal-400" />
          <h3 className="text-base font-bold text-white">Clinical Guidelines & Foundations</h3>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
            <span className="font-semibold text-white">1. 2021 ACC/AHA/SCAI Guideline for Coronary Artery Revascularization</span>
            <p className="text-slate-400">
              Invasive vs non-invasive criteria for revascularization; anatomical lesion significance defined at &ge;70% diameter stenosis or FFR &le; 0.80.
            </p>
          </div>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
            <span className="font-semibold text-white">2. Diamond-Forrester Pre-Test Likelihood of Obstructive CAD</span>
            <p className="text-slate-400">
              Categorization based on age, sex, and typicality of chest pain symptoms (Typical Angina, Atypical Angina, Non-Anginal, Asymptomatic).
            </p>
          </div>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
            <span className="font-semibold text-white">3. ESC 2019 Guidelines for the Diagnosis and Management of Chronic Coronary Syndromes</span>
            <p className="text-slate-400">
              Multimodality evaluation utilizing stress testing, biomarkers (high-sensitivity troponins), and anatomical imaging (CCTA).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
