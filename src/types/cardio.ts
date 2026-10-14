/**
 * CardioVision 3D - Types & Interfaces
 * Prepared for Firebase/Firestore persistence (Part 2)
 * and Python ML microservice integration (Part 3).
 */

export type ChestPainType = 'typical_angina' | 'atypical_angina' | 'non_anginal' | 'asymptomatic';
export type RestingECG = 'normal' | 'st_t_abnormality' | 'lvh';
export type STSlope = 'upsloping' | 'flat' | 'downsloping';
export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';
export type WallMotionAbnormality = 'none' | 'anterior' | 'inferior' | 'lateral' | 'apical' | 'multisegment';
export type ValvularDefect = 'none' | 'mild' | 'moderate' | 'severe';

export interface PatientDemographics {
  patientId: string;
  name: string;
  age: number;
  sex: 'male' | 'female' | 'other';
  chestPainType: ChestPainType;
  smokingStatus: 'never' | 'former' | 'current';
  familyHistoryCAD: boolean;
  bmi: number;
}

export interface PatientClinical {
  restingBP: number; // mmHg (e.g. 120-180)
  restingHeartRate: number; // bpm
  hypertension: boolean;
  diabetes: boolean;
}

export interface PatientECG {
  restingECG: RestingECG;
  maxHeartRateAchieved: number;
  exerciseInducedAngina: boolean;
  stDepression: number; // mm (e.g. 0.0 - 4.5)
  stSlope: STSlope;
  hasArrhythmia: boolean;
}

export interface PatientLabs {
  totalCholesterol: number; // mg/dL
  ldlCholesterol: number; // mg/dL
  hdlCholesterol: number; // mg/dL
  triglycerides: number; // mg/dL
  fastingBloodSugar: number; // mg/dL
  hsCRP: number; // mg/L (inflammatory marker)
  troponinT: number; // ng/L (cardiac injury marker)
}

export interface PatientEcho {
  lvef: number; // Left Ventricular Ejection Fraction % (e.g. 30 - 70)
  wallMotionAbnormality: WallMotionAbnormality;
  aorticStenosis: ValvularDefect;
  mitralRegurgitation: ValvularDefect;
}

export interface PatientRecordData {
  demographics: PatientDemographics;
  clinical: PatientClinical;
  ecg: PatientECG;
  labs: PatientLabs;
  echo: PatientEcho;
}

export type VesselId = 'CAD' | 'LAD' | 'LCX' | 'RCA';

export interface VesselRiskPrediction {
  vesselId: 'LAD' | 'LCX' | 'RCA';
  vesselName: string;
  probability: number; // 0 to 1
  stenosisEstimatePercent: number; // e.g. 75%
  riskLevel: RiskLevel;
  anatomicalTerritory: string;
  contributingFactors: string[];
  recommendedAction: string;
}

export interface AssessmentPredictionResult {
  overallCadProbability: number; // 0 to 1
  overallRiskLevel: RiskLevel;
  confidenceScore: number; // 0 to 1
  vessels: {
    LAD: VesselRiskPrediction;
    LCX: VesselRiskPrediction;
    RCA: VesselRiskPrediction;
  };
  keyRiskDrivers: string[];
  clinicalSummary: string;
  isSyntheticDemo: boolean;
  modelIdentifier: string;
  generatedAt: string;
}

export interface AssessmentRecord {
  id: string; // Document ID for future Firestore
  createdAt: string;
  patientData: PatientRecordData;
  prediction: AssessmentPredictionResult;
  notes?: string;
  physicianId?: string;
}

export interface ConfusionMatrix {
  truePositive: number;
  falsePositive: number;
  trueNegative: number;
  falseNegative: number;
}

export interface ModelMetricSet {
  vessel: VesselId;
  targetName: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  sampleCount: number;
  confusionMatrix: ConfusionMatrix;
  rocCurve: { fpr: number; tpr: number }[];
}

export interface FeatureImportanceItem {
  featureName: string;
  category: 'demographic' | 'clinical' | 'ecg' | 'laboratory' | 'echocardiography';
  shapValue: number; // 0 to 1 relative impact
  clinicalDescription: string;
}
