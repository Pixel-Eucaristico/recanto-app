export { DEFAULT_ROLE_PERMISSIONS } from './rolePermissions';
export { FEATURE_CATEGORIES, FEATURES_INFO, type FeatureInfo } from './featuresInfo';

import { FEATURES_INFO } from './featuresInfo';

export function getFeatureInfo(featureId: string) {
  return FEATURES_INFO.find(f => f.id === featureId);
}

export function getFeaturesByCategory() {
  const grouped: Record<string, typeof FEATURES_INFO> = {};
  for (const feature of FEATURES_INFO) {
    if (!grouped[feature.category]) grouped[feature.category] = [];
    grouped[feature.category].push(feature);
  }
  return grouped;
}

export const AVAILABLE_FEATURES = FEATURES_INFO.map(f => f.id);
export type Feature = typeof AVAILABLE_FEATURES[number];
