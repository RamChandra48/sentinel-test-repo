'use strict';

/**
 * Fraud model configuration.
 * Reads model version from the FRAUD_MODEL_VERSION environment variable so
 * deployments can switch model versions without a code change.
 */

const DEFAULT_MODEL_VERSION = '2.0.0';

const fraudModelConfig = {
  modelVersion: process.env.FRAUD_MODEL_VERSION || DEFAULT_MODEL_VERSION,
  scoreThreshold: parseFloat(process.env.FRAUD_SCORE_THRESHOLD) || 0.75,
  maxFeaturesCount: parseInt(process.env.FRAUD_MAX_FEATURES, 10) || 50,
  timeoutMs: parseInt(process.env.FRAUD_MODEL_TIMEOUT_MS, 10) || 3000,
};

module.exports = fraudModelConfig;
