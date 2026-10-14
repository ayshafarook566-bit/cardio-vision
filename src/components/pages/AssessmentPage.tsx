/**
 * CardioVision 3D - Patient Assessment Intake Page
 * Multi-section diagnostic intake: Demographics, Clinical, ECG, Labs, Echocardiography.
 * Validates required inputs, supports quick presets, simulates model calculation,
 * and saves assessment to history.
 */

import React, { useState } from 'react';
import {
  PatientRecordData,
  ChestPainType,
  RestingECG,
  STSlope,
  WallMotionAbnormality,
  ValvularDefect,
  AssessmentRecord,
  AssessmentPredictionResult,
} from '../../types/cardio';
import { PRESET_PATIENT_PROFILES } from '../../data/mockData';
import { calculateCoronaryRisk } from '../../services/predictionService';
import { NavPage } from '../layout/Sidebar';
import {
  Stethoscope,
  Heart,
  Activity,
  TestTube2,
  ScanHeart,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface AssessmentPageProps {
  onSaveAssessment: (record: AssessmentRecord) => void;
  onNavigate: (page: NavPage) => void;
  onSelectVesselIn3D: (vessel: 'LAD' | 'LCX' | 'RCA') => void;
}

export const AssessmentPage: React.FC<AssessmentPageProps> = ({
  onSaveAssessment,
  onNavigate,
  onSelectVesselIn3D,
}) => {
  // Active Section Tab
  const [activeTab, setActiveTab] = useState<'demo' | 'clinical' | 'ecg' | 'labs' | 'echo'>('demo');

  // Form State
  const [formData, setFormData] = useState<PatientRecordData>({
    demographics: {
      patientId: `PT-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      age: 56,
      sex: 'male',
      chestPainType: 'typical_angina',
      smokingStatus: 'never',
      familyHistoryCAD: true,
      bmi: 27.2,
    },
    clinical: {
      restingBP: 138,
      restingHeartRate: 76,
      hypertension: true,
      diabetes: false,
    },
    ecg: {
      restingECG: 'st_t_abnormality',
      maxHeartRateAchieved: 142,
      exerciseInducedAngina: true,
      stDepression: 1.5,
      stSlope: 'flat',
      hasArrhythmia: false,
    },
    labs: {
      totalCholesterol: 220,
      ldlCholesterol: 152,
      hdlCholesterol: 42,
      triglycerides: 190,
      fastingBloodSugar: 112,
      hsCRP: 3.2,
      troponinT: 16.5,
    },
    echo: {
      lvef: 50,
      wallMotionAbnormality: 'anterior',
      aorticStenosis: 'none',
      mitralRegurgitation: 'none',
    },
  });

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [latestResult, setLatestResult] = useState<AssessmentPredictionResult | null>(null);

  // Field validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.demographics.name.trim()) {
      newErrors.name = 'Patient name is required.';
    }
    if (formData.demographics.age < 18 || formData.demographics.age > 100) {
      newErrors.age = 'Age must be between 18 and 100 years.';
    }
    if (formData.clinical.restingBP < 80 || formData.clinical.restingBP > 240) {
      newErrors.restingBP = 'Resting BP must be between 80 and 240 mmHg.';
    }
    if (formData.labs.ldlCholesterol < 40 || formData.labs.ldlCholesterol > 350) {
      newErrors.ldlCholesterol = 'LDL must be between 40 and 350 mg/dL.';
    }
    if (formData.echo.lvef < 15 || formData.echo.lvef > 85) {
      newErrors.lvef = 'LVEF must be between 15% and 85%.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Profile Preset Loader
  const handleLoadPreset = (index: number) => {
    const preset = PRESET_PATIENT_PROFILES[index];
    if (preset) {
      setFormData(JSON.parse(JSON.stringify(preset.data)));
      setErrors({});
      setLatestResult(null);
    }
  };

  // Form Submission & Calculation
  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      // Find which section has error
      if (errors.name || errors.age) setActiveTab('demo');
      else if (errors.restingBP) setActiveTab('clinical');
      else if (errors.ldlCholesterol) setActiveTab('labs');
      else if (errors.lvef) setActiveTab('echo');
      return;
    }

    setIsCalculating(true);
    try {
      const result = await calculateCoronaryRisk(formData);
      setLatestResult(result);

      // Create new assessment record
      const newRecord: AssessmentRecord = {
        id: `rec-usr-${Date.now()}`,
        createdAt: new Date().toISOString(),
        patientData: formData,
        prediction: result,
        notes: `Clinical intake generated on ${new Date().toLocaleDateString()}. Initial risk level assessed as ${result.overallRiskLevel.toUpperCase()}.`,
      };

      onSaveAssessment(newRecord);
    } catch (err) {
      console.error('Calculation error:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Title & Preset Bar */}
      <div className="bg-[#0D1829] border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-teal-400 font-semibold">
                Multimodal Assessment Protocol
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs font-mono text-slate-400">ACC/AHA Guideline Input Fields</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
              Comprehensive Coronary Risk Stratification
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter clinical parameters across demographics, resting & stress ECG, blood biomarkers, and echocardiography.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">Presets:</span>
            {PRESET_PATIENT_PROFILES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLoadPreset(idx)}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/40 rounded-lg text-xs font-medium text-slate-300 transition-colors"
                title={preset.description}
              >
                {preset.label.split(' ')[0]} {preset.label.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Form Left, Real-time Result / Guidance Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: 2 Columns on desktop */}
        <div className="lg:col-span-2 bg-[#0D1829] border border-slate-800 rounded-xl p-6 shadow-sm">
          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-lg border border-slate-800/80 mb-6 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('demo')}
              className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'demo'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>1. Demographics</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('clinical')}
              className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'clinical'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>2. Clinical</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ecg')}
              className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'ecg'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>3. 12-Lead ECG</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('labs')}
              className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'labs'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TestTube2 className="w-3.5 h-3.5" />
              <span>4. Biomarkers</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('echo')}
              className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'echo'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ScanHeart className="w-3.5 h-3.5" />
              <span>5. Echocardiography</span>
            </button>
          </div>

          <form onSubmit={handleCalculate} className="space-y-6">
            {/* TAB 1: Demographics */}
            {activeTab === 'demo' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Patient Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rachel Adams"
                      value={formData.demographics.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          demographics: { ...formData.demographics, name: e.target.value },
                        })
                      }
                      className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                        errors.name ? 'border-rose-500' : 'border-slate-800'
                      }`}
                    />
                    {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Patient Record ID
                    </label>
                    <input
                      type="text"
                      disabled
                      value={formData.demographics.patientId}
                      className="w-full bg-slate-950 border border-slate-800/80 rounded-lg px-3 py-2 text-xs font-mono text-slate-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Age (years) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      min={18}
                      max={100}
                      value={formData.demographics.age}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          demographics: { ...formData.demographics, age: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    {errors.age && <p className="text-[11px] text-rose-400 mt-1">{errors.age}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Biological Sex</label>
                    <select
                      value={formData.demographics.sex}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          demographics: { ...formData.demographics, sex: e.target.value as any },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Chest Pain Type (Diamond-Forrester)
                    </label>
                    <select
                      value={formData.demographics.chestPainType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          demographics: { ...formData.demographics, chestPainType: e.target.value as ChestPainType },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="typical_angina">Typical Angina (Retrosternal, exertional, relief with nitro)</option>
                      <option value="atypical_angina">Atypical Angina (2 of 3 classical criteria)</option>
                      <option value="non_anginal">Non-Anginal Chest Pain (1 criteria)</option>
                      <option value="asymptomatic">Asymptomatic (Silent ischemia screening)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Smoking History</label>
                    <select
                      value={formData.demographics.smokingStatus}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          demographics: { ...formData.demographics, smokingStatus: e.target.value as any },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="never">Never Smoked</option>
                      <option value="former">Former Smoker (&gt;1 yr cessation)</option>
                      <option value="current">Current Active Smoker</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Body Mass Index (BMI)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.demographics.bmi}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          demographics: { ...formData.demographics, bmi: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="familyHistoryCAD"
                      checked={formData.demographics.familyHistoryCAD}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          demographics: { ...formData.demographics, familyHistoryCAD: e.target.checked },
                        })
                      }
                      className="w-4 h-4 rounded border-slate-800 text-teal-500 focus:ring-teal-500 bg-slate-900"
                    />
                    <label htmlFor="familyHistoryCAD" className="text-xs text-slate-300 cursor-pointer">
                      Family History of Premature CAD (&lt;55 male, &lt;65 female)
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Clinical */}
            {activeTab === 'clinical' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Resting Systolic Blood Pressure (mmHg) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.clinical.restingBP}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          clinical: { ...formData.clinical, restingBP: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    {errors.restingBP && <p className="text-[11px] text-rose-400 mt-1">{errors.restingBP}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Resting Heart Rate (bpm)
                    </label>
                    <input
                      type="number"
                      value={formData.clinical.restingHeartRate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          clinical: { ...formData.clinical, restingHeartRate: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="hypertension"
                      checked={formData.clinical.hypertension}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          clinical: { ...formData.clinical, hypertension: e.target.checked },
                        })
                      }
                      className="w-4 h-4 rounded border-slate-800 text-teal-500 focus:ring-teal-500 bg-slate-900"
                    />
                    <label htmlFor="hypertension" className="text-xs text-slate-300 cursor-pointer">
                      Diagnosed Systemic Arterial Hypertension
                    </label>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="diabetes"
                      checked={formData.clinical.diabetes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          clinical: { ...formData.clinical, diabetes: e.target.checked },
                        })
                      }
                      className="w-4 h-4 rounded border-slate-800 text-teal-500 focus:ring-teal-500 bg-slate-900"
                    />
                    <label htmlFor="diabetes" className="text-xs text-slate-300 cursor-pointer">
                      Diagnosed Type 2 Diabetes Mellitus
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: 12-Lead ECG */}
            {activeTab === 'ecg' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Resting ECG Morphology
                    </label>
                    <select
                      value={formData.ecg.restingECG}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ecg: { ...formData.ecg, restingECG: e.target.value as RestingECG },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="normal">Normal Sinus Rhythm</option>
                      <option value="st_t_abnormality">ST-T Wave Abnormality (T-wave inversions)</option>
                      <option value="lvh">Definite Left Ventricular Hypertrophy (Sokolow-Lyon)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Maximum Heart Rate Achieved (bpm)
                    </label>
                    <input
                      type="number"
                      value={formData.ecg.maxHeartRateAchieved}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ecg: { ...formData.ecg, maxHeartRateAchieved: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      ST Segment Depression (Oldpeak in mm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      max={6.0}
                      value={formData.ecg.stDepression}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ecg: { ...formData.ecg, stDepression: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Peak Exercise ST Slope
                    </label>
                    <select
                      value={formData.ecg.stSlope}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ecg: { ...formData.ecg, stSlope: e.target.value as STSlope },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="upsloping">Upsloping (Typically lower ischemic risk)</option>
                      <option value="flat">Flat / Horizontal (Ischemic marker)</option>
                      <option value="downsloping">Downsloping (High probability transmural ischemia)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="exerciseInducedAngina"
                      checked={formData.ecg.exerciseInducedAngina}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ecg: { ...formData.ecg, exerciseInducedAngina: e.target.checked },
                        })
                      }
                      className="w-4 h-4 rounded border-slate-800 text-teal-500 focus:ring-teal-500 bg-slate-900"
                    />
                    <label htmlFor="exerciseInducedAngina" className="text-xs text-slate-300 cursor-pointer">
                      Exercise-Induced Angina during stress test
                    </label>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="hasArrhythmia"
                      checked={formData.ecg.hasArrhythmia}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ecg: { ...formData.ecg, hasArrhythmia: e.target.checked },
                        })
                      }
                      className="w-4 h-4 rounded border-slate-800 text-teal-500 focus:ring-teal-500 bg-slate-900"
                    />
                    <label htmlFor="hasArrhythmia" className="text-xs text-slate-300 cursor-pointer">
                      Conduction Arrhythmia / Ventricular Ectopy
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Laboratory Biomarkers */}
            {activeTab === 'labs' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      LDL Cholesterol (mg/dL) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.labs.ldlCholesterol}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          labs: { ...formData.labs, ldlCholesterol: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    {errors.ldlCholesterol && (
                      <p className="text-[11px] text-rose-400 mt-1">{errors.ldlCholesterol}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      HDL Cholesterol (mg/dL)
                    </label>
                    <input
                      type="number"
                      value={formData.labs.hdlCholesterol}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          labs: { ...formData.labs, hdlCholesterol: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Total Serum Cholesterol (mg/dL)
                    </label>
                    <input
                      type="number"
                      value={formData.labs.totalCholesterol}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          labs: { ...formData.labs, totalCholesterol: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Serum Triglycerides (mg/dL)
                    </label>
                    <input
                      type="number"
                      value={formData.labs.triglycerides}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          labs: { ...formData.labs, triglycerides: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      High-Sensitivity Troponin T (ng/L) - Normal &lt;14
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.labs.troponinT}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          labs: { ...formData.labs, troponinT: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      hs-CRP Inflammatory Marker (mg/L)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.labs.hsCRP}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          labs: { ...formData.labs, hsCRP: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Echocardiography */}
            {activeTab === 'echo' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Left Ventricular Ejection Fraction (LVEF %) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      min={15}
                      max={85}
                      value={formData.echo.lvef}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          echo: { ...formData.echo, lvef: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    {errors.lvef && <p className="text-[11px] text-rose-400 mt-1">{errors.lvef}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Regional Wall Motion Abnormality (RWMA)
                    </label>
                    <select
                      value={formData.echo.wallMotionAbnormality}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          echo: {
                            ...formData.echo,
                            wallMotionAbnormality: e.target.value as WallMotionAbnormality,
                          },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="none">None (Uniform Normokinetic Myocardium)</option>
                      <option value="anterior">Anterior / Septal Wall Hypokinesia (LAD territory)</option>
                      <option value="lateral">Posterolateral Wall Hypokinesia (LCX territory)</option>
                      <option value="inferior">Inferior / Posterior Hypokinesia (RCA territory)</option>
                      <option value="apical">Apical Hypokinesia / Aneurysm (Distal LAD)</option>
                      <option value="multisegment">Multi-Segment Severe Dyssynergy (Multivessel)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Aortic Valve Stenosis</label>
                    <select
                      value={formData.echo.aorticStenosis}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          echo: { ...formData.echo, aorticStenosis: e.target.value as ValvularDefect },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="none">None / Trace</option>
                      <option value="mild">Mild (AVA &gt; 1.5 cm²)</option>
                      <option value="moderate">Moderate (AVA 1.0 - 1.5 cm²)</option>
                      <option value="severe">Severe (AVA &lt; 1.0 cm²)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Mitral Regurgitation</label>
                    <select
                      value={formData.echo.mitralRegurgitation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          echo: { ...formData.echo, mitralRegurgitation: e.target.value as ValvularDefect },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="none">None / Trace</option>
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate (Ischemic MR)</option>
                      <option value="severe">Severe</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Form Footer Action Bar */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                <span>All 5 tabs inform the multivariate predictive assessment model.</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleLoadPreset(2); // Low risk default reset
                  }}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Values</span>
                </button>

                <button
                  type="submit"
                  disabled={isCalculating}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-teal-500/20"
                >
                  {isCalculating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Computing Heuristic Model...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Execute Risk Stratification</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Instant Prediction Preview or Clinical Guidance */}
        <div className="space-y-4">
          {latestResult ? (
            <div className="bg-[#0D1829] border border-teal-500/40 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <h3 className="text-sm font-bold text-white">Assessment Computed</h3>
                </div>
                <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                  SYNTHETIC DEMO
                </span>
              </div>

              {/* Overall CAD Score */}
              <div className="bg-slate-900/90 rounded-lg p-3.5 border border-slate-800">
                <div className="text-[11px] font-mono uppercase text-slate-400">Predicted Overall CAD Risk</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-mono font-bold text-white">
                    {Math.round(latestResult.overallCadProbability * 100)}%
                  </span>
                  <span className="text-xs font-semibold uppercase text-teal-400">
                    {latestResult.overallRiskLevel} Risk
                  </span>
                </div>
              </div>

              {/* Vessel Breakdown */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase text-slate-400">Vessel Localization</div>

                <div
                  onClick={() => {
                    onSelectVesselIn3D('LAD');
                    onNavigate('visualization');
                  }}
                  className="p-2.5 bg-slate-900/80 hover:bg-slate-800/80 rounded border border-slate-800 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="text-xs font-semibold text-white">LAD Artery</div>
                    <div className="text-[10px] text-slate-400">Anteroseptal myocardium</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-white">
                      {latestResult.vessels.LAD.stenosisEstimatePercent}% Stenosis
                    </div>
                    <div className="text-[10px] uppercase font-mono text-teal-400">
                      {latestResult.vessels.LAD.riskLevel}
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => {
                    onSelectVesselIn3D('LCX');
                    onNavigate('visualization');
                  }}
                  className="p-2.5 bg-slate-900/80 hover:bg-slate-800/80 rounded border border-slate-800 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="text-xs font-semibold text-white">LCX Artery</div>
                    <div className="text-[10px] text-slate-400">Posterolateral wall</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-white">
                      {latestResult.vessels.LCX.stenosisEstimatePercent}% Stenosis
                    </div>
                    <div className="text-[10px] uppercase font-mono text-teal-400">
                      {latestResult.vessels.LCX.riskLevel}
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => {
                    onSelectVesselIn3D('RCA');
                    onNavigate('visualization');
                  }}
                  className="p-2.5 bg-slate-900/80 hover:bg-slate-800/80 rounded border border-slate-800 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="text-xs font-semibold text-white">RCA Artery</div>
                    <div className="text-[10px] text-slate-400">Inferior wall / RV</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-white">
                      {latestResult.vessels.RCA.stenosisEstimatePercent}% Stenosis
                    </div>
                    <div className="text-[10px] uppercase font-mono text-teal-400">
                      {latestResult.vessels.RCA.riskLevel}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action: Open in 3D */}
              <button
                type="button"
                onClick={() => onNavigate('visualization')}
                className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/10"
              >
                <span>View Patient Heart in 3D</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="bg-[#0D1829] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <AlertCircle className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-semibold text-white">Intake Protocol Guidance</h3>
              </div>

              <div className="space-y-3 text-xs text-slate-400 leading-relaxed">
                <p>
                  1. <strong className="text-slate-300">Diamond-Forrester Score</strong>: Classic chest pain symptoms dramatically elevate pre-test probability of flow-limiting stenosis.
                </p>
                <p>
                  2. <strong className="text-slate-300">Electrophysiology</strong>: Horizontal or downsloping ST-segment depression during peak stress correlates with LAD and RCA ischemic territories.
                </p>
                <p>
                  3. <strong className="text-slate-300">Biomarker Integration</strong>: High-sensitivity Troponin T (&gt;14 ng/L) flags acute cardiomyocyte injury even prior to macroscopic necrosis.
                </p>
                <p>
                  4. <strong className="text-slate-300">Echocardiography</strong>: Regional wall motion hypokinesia directly informs coronary artery localization.
                </p>
              </div>

              <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                <span className="text-teal-400 font-semibold block mb-0.5">Need a quick case?</span>
                Select one of the preset buttons above to automatically populate high-risk LAD, multivessel, or low-risk screens.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
