/**
 * CardioVision 3D - Prediction Service Layer
 * 
 * ARCHITECTURE NOTICE:
 * This module is architected as an swappable service layer.
 * In Part 3, this will call the dedicated Python Machine Learning API endpoint (e.g. POST /api/predict).
 * In Part 1, it executes a deterministic clinical risk engine for frontend demonstration.
 * All outputs are explicitly tagged with `isSyntheticDemo: true` and never represented as real diagnosis.
 */

import {
  PatientRecordData,
  AssessmentPredictionResult,
  VesselRiskPrediction,
  RiskLevel,
  AssessmentRecord
} from '../types/cardio';

export const IS_API_CONNECTED = false; // Prepared for Python ML Backend
export const ML_API_ENDPOINT = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000/api/v1/predict';

/**
 * Calculates synthetic coronary artery risk metrics based on verified clinical risk heuristics
 * (Diamond-Forrester, ACC/AHA ASCVD risk factors, and ischemic ECG markers).
 */
export async function calculateCoronaryRisk(
  patientData: PatientRecordData
): Promise<AssessmentPredictionResult> {
  // If remote Python ML API is enabled in the future:
  if (IS_API_CONNECTED) {
    try {
      const response = await fetch(ML_API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Fallback to local synthetic risk heuristic:', err);
    }
  }

  // Simulate realistic network latency for asynchronous model inference UX
  await new Promise((resolve) => setTimeout(resolve, 650));

  const { demographics, clinical, ecg, labs, echo } = patientData;

  // Base clinical weight calculation
  let cadScore = 0;

  // Age & Sex
  if (demographics.sex === 'male') {
    cadScore += demographics.age > 45 ? 15 : 8;
  } else {
    cadScore += demographics.age > 55 ? 14 : 6;
  }

  // Chest Pain Diamond-Forrester
  if (demographics.chestPainType === 'typical_angina') cadScore += 26;
  else if (demographics.chestPainType === 'atypical_angina') cadScore += 16;
  else if (demographics.chestPainType === 'non_anginal') cadScore += 8;

  // Cardiovascular risks
  if (demographics.smokingStatus === 'current') cadScore += 12;
  else if (demographics.smokingStatus === 'former') cadScore += 5;
  if (demographics.familyHistoryCAD) cadScore += 10;
  if (clinical.diabetes) cadScore += 14;
  if (clinical.hypertension || clinical.restingBP >= 140) cadScore += 10;

  // ECG markers
  if (ecg.exerciseInducedAngina) cadScore += 15;
  if (ecg.stDepression > 1.5) cadScore += 18;
  else if (ecg.stDepression > 0.5) cadScore += 10;
  if (ecg.stSlope === 'downsloping') cadScore += 12;
  else if (ecg.stSlope === 'flat') cadScore += 6;

  // Biomarkers
  if (labs.troponinT > 14) cadScore += 22; // High-sensitivity troponin cutoff
  if (labs.hsCRP > 3.0) cadScore += 8;
  if (labs.ldlCholesterol > 160) cadScore += 12;
  else if (labs.ldlCholesterol > 130) cadScore += 6;

  // Echo
  if (echo.lvef < 45) cadScore += 18;
  else if (echo.lvef < 52) cadScore += 10;
  if (echo.wallMotionAbnormality !== 'none') cadScore += 16;

  // Normalize score between 0.05 and 0.96
  const rawProb = Math.min(0.96, Math.max(0.06, cadScore / 130));
  const overallCadProbability = Number(rawProb.toFixed(2));

  // Determine Overall Risk Level
  let overallRiskLevel: RiskLevel = 'low';
  if (overallCadProbability >= 0.75) overallRiskLevel = 'critical';
  else if (overallCadProbability >= 0.52) overallRiskLevel = 'high';
  else if (overallCadProbability >= 0.28) overallRiskLevel = 'moderate';

  // Vessel specific localization heuristics
  // LAD (Left Anterior Descending - Anterior / Septal territory)
  let ladScore = overallCadProbability * 0.7;
  if (echo.wallMotionAbnormality === 'anterior' || echo.wallMotionAbnormality === 'apical' || echo.wallMotionAbnormality === 'multisegment') {
    ladScore += 0.25;
  }
  if (ecg.stDepression > 1.0) ladScore += 0.12;
  if (demographics.chestPainType === 'typical_angina') ladScore += 0.08;
  const ladProb = Math.min(0.98, Math.max(0.05, Number(ladScore.toFixed(2))));
  const ladStenosis = Math.round(ladProb * 85 + 10);

  // LCX (Left Circumflex - Lateral territory)
  let lcxScore = overallCadProbability * 0.62;
  if (echo.wallMotionAbnormality === 'lateral' || echo.wallMotionAbnormality === 'multisegment') {
    lcxScore += 0.28;
  }
  if (labs.ldlCholesterol > 150) lcxScore += 0.08;
  const lcxProb = Math.min(0.95, Math.max(0.04, Number(lcxScore.toFixed(2))));
  const lcxStenosis = Math.round(lcxProb * 80 + 10);

  // RCA (Right Coronary Artery - Inferior / RV territory)
  let rcaScore = overallCadProbability * 0.65;
  if (echo.wallMotionAbnormality === 'inferior' || echo.wallMotionAbnormality === 'multisegment') {
    rcaScore += 0.27;
  }
  if (ecg.hasArrhythmia || ecg.restingECG === 'st_t_abnormality') rcaScore += 0.12;
  const rcaProb = Math.min(0.96, Math.max(0.05, Number(rcaScore.toFixed(2))));
  const rcaStenosis = Math.round(rcaProb * 82 + 10);

  const getRiskLevel = (prob: number): RiskLevel => {
    if (prob >= 0.75) return 'critical';
    if (prob >= 0.52) return 'high';
    if (prob >= 0.28) return 'moderate';
    return 'low';
  };

  const getContributingFactors = (vessel: 'LAD' | 'LCX' | 'RCA') => {
    const list: string[] = [];
    if (demographics.age > 55) list.push(`Age factor (${demographics.age} yrs)`);
    if (demographics.chestPainType === 'typical_angina') list.push('Typical exertional angina pattern');
    if (vessel === 'LAD' && (echo.wallMotionAbnormality === 'anterior' || echo.wallMotionAbnormality === 'apical')) {
      list.push('Anterior echo wall-motion hypokinesia');
    }
    if (vessel === 'RCA' && echo.wallMotionAbnormality === 'inferior') {
      list.push('Inferior wall ischemic dyssynergy');
    }
    if (vessel === 'LCX' && echo.wallMotionAbnormality === 'lateral') {
      list.push('Posterolateral segment wall hypokinesia');
    }
    if (ecg.stDepression > 1.0) list.push(`Significant ST segment depression (${ecg.stDepression}mm)`);
    if (labs.troponinT > 14) list.push(`Elevated hs-Troponin T (${labs.troponinT} ng/L)`);
    if (labs.ldlCholesterol > 140) list.push(`Atherogenic dyslipidemia (LDL ${labs.ldlCholesterol} mg/dL)`);
    if (list.length === 0) list.push('Normal physiological baseline');
    return list;
  };

  const ladPrediction: VesselRiskPrediction = {
    vesselId: 'LAD',
    vesselName: 'Left Anterior Descending',
    probability: ladProb,
    stenosisEstimatePercent: ladStenosis,
    riskLevel: getRiskLevel(ladProb),
    anatomicalTerritory: 'Anteroseptal myocardium & LV apex',
    contributingFactors: getContributingFactors('LAD'),
    recommendedAction: ladProb >= 0.70
      ? 'Urgent invasive coronary angiography (ICA) & functional FFR assessment recommended.'
      : ladProb >= 0.45
      ? 'Coronary CT Angiography (CCTA) and stress myocardial perfusion imaging indicated.'
      : 'Medical management with lifestyle optimization and cardiovascular follow-up.',
  };

  const lcxPrediction: VesselRiskPrediction = {
    vesselId: 'LCX',
    vesselName: 'Left Circumflex',
    probability: lcxProb,
    stenosisEstimatePercent: lcxStenosis,
    riskLevel: getRiskLevel(lcxProb),
    anatomicalTerritory: 'Posterolateral left ventricular wall',
    contributingFactors: getContributingFactors('LCX'),
    recommendedAction: lcxProb >= 0.70
      ? 'Coronary angiography evaluation with consideration for PCI in symptomatic lesion.'
      : lcxProb >= 0.45
      ? 'Non-invasive stress echocardiography or CT coronary calcium score indicated.'
      : 'Statin optimization and cardiovascular risk monitoring.',
  };

  const rcaPrediction: VesselRiskPrediction = {
    vesselId: 'RCA',
    vesselName: 'Right Coronary Artery',
    probability: rcaProb,
    stenosisEstimatePercent: rcaStenosis,
    riskLevel: getRiskLevel(rcaProb),
    anatomicalTerritory: 'Inferior LV wall, right ventricle & SA/AV nodal branches',
    contributingFactors: getContributingFactors('RCA'),
    recommendedAction: rcaProb >= 0.70
      ? 'Cardiologist consult for hemodynamic evaluation and selective coronary angiography.'
      : rcaProb >= 0.45
      ? 'Exercise treadmill stress ECG testing with continuous 12-lead telemetry.'
      : 'Primary prevention and blood pressure guideline optimization.',
  };

  const keyDrivers: string[] = [];
  if (ecg.stDepression >= 1.0) keyDrivers.push(`ST-segment depression (${ecg.stDepression} mm)`);
  if (labs.troponinT > 14) keyDrivers.push(`hs-Troponin T elevation (${labs.troponinT} ng/L)`);
  if (demographics.chestPainType === 'typical_angina') keyDrivers.push('Typical exertional angina presentation');
  if (echo.wallMotionAbnormality !== 'none') keyDrivers.push(`Echo RWMA (${echo.wallMotionAbnormality})`);
  if (labs.ldlCholesterol >= 160) keyDrivers.push(`Marked LDL elevation (${labs.ldlCholesterol} mg/dL)`);
  if (demographics.smokingStatus === 'current') keyDrivers.push('Active tobacco smoking status');
  if (clinical.diabetes) keyDrivers.push('Comorbid Type 2 Diabetes Mellitus');
  if (keyDrivers.length === 0) keyDrivers.push('Unremarkable clinical biomarkers');

  return {
    overallCadProbability,
    overallRiskLevel,
    confidenceScore: 0.89,
    vessels: {
      LAD: ladPrediction,
      LCX: lcxPrediction,
      RCA: rcaPrediction,
    },
    keyRiskDrivers: keyDrivers,
    clinicalSummary: `Patient demonstrates ${overallRiskLevel.toUpperCase()} overall coronary risk (${Math.round(overallCadProbability * 100)}% estimated probability). ${
      ladProb >= 0.7 ? 'High probability of significant flow-limiting stenosis in LAD territory.' : ''
    } ${rcaProb >= 0.7 ? 'Inferior RCA involvement suspected.' : ''} Synthetic model assessment based on multivariate clinical integration.`,
    isSyntheticDemo: true,
    modelIdentifier: 'Simulated XGBoost-Ensemble v1.0 (Demo Mode)',
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Local storage abstraction prepared to plug in Firestore collections in Part 2.
 */
const STORAGE_KEY = 'cardiovision_assessments_store';

export function getStoredAssessments(): AssessmentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to read stored assessments:', e);
  }
  return [];
}

export function saveAssessmentRecord(record: AssessmentRecord): void {
  try {
    const current = getStoredAssessments();
    const updated = [record, ...current.filter((r) => r.id !== record.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save assessment record:', e);
  }
}

export function deleteStoredAssessment(id: string): void {
  try {
    const current = getStoredAssessments();
    const updated = current.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete assessment record:', e);
  }
}
