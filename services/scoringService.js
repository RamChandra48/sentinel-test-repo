'use strict';

const fraudModelConfig = require('../config/fraudModel');

/**
 * Normalise a raw transaction payload into a fixed-length feature vector.
 * Only the first `maxFeaturesCount` features are forwarded to the model to
 * avoid memory spikes that caused previous 500 errors on large payloads.
 *
 * @param {Object} transaction - Raw transaction data from the request body.
 * @returns {number[]} Normalised feature vector.
 */
function buildFeatureVector(transaction) {
  const features = [
    transaction.amount || 0,
    transaction.hour || 0,
    transaction.dayOfWeek || 0,
    transaction.merchantRiskScore || 0,
    transaction.userHistoryScore || 0,
    transaction.ipRiskScore || 0,
    transaction.deviceRiskScore || 0,
    transaction.velocityScore || 0,
    ...(transaction.additionalFeatures || []),
  ];

  return features.slice(0, fraudModelConfig.maxFeaturesCount);
}

/**
 * Run the fraud model inference with a hard timeout.
 * Previously this call could block indefinitely, causing gateway timeouts that
 * surfaced as 500 responses. The timeout guard ensures a controlled failure.
 *
 * @param {number[]} featureVector - Normalised input features.
 * @returns {Promise<number>} Fraud probability score in the range [0, 1].
 */
async function runModelInference(featureVector) {
  const { modelVersion, timeoutMs } = fraudModelConfig;

  const inferencePromise = new Promise((resolve) => {
    // Simulate async model call – replace with actual model SDK invocation.
    // The resolved value is a fraud probability score between 0 and 1.
    const mockScore = featureVector.reduce((acc, v) => acc + v, 0) % 1;
    resolve(mockScore);
  });

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(
      () =>
        reject(
          new Error(
            `Model inference timed out after ${timeoutMs} ms (version ${modelVersion})`
          )
        ),
      timeoutMs
    );
  });

  return Promise.race([inferencePromise, timeoutPromise]);
}

/**
 * Score a transaction for fraud.
 *
 * This is the main entry point called by the route handler.  It replaces the
 * previous implementation that had two bugs:
 *   1. Model version was hard-coded, causing a mismatch after the latest deploy.
 *   2. Unhandled promise rejections from inference timeouts propagated as 500s.
 *
 * @param {Object} transaction - Raw transaction payload.
 * @returns {Promise<{ score: number, isFraud: boolean, modelVersion: string }>}
 */
async function scoreTransaction(transaction) {
  if (!transaction || typeof transaction !== 'object') {
    throw new TypeError('scoreTransaction requires a transaction object');
  }

  const featureVector = buildFeatureVector(transaction);
  const score = await runModelInference(featureVector);

  return {
    score,
    isFraud: score >= fraudModelConfig.scoreThreshold,
    modelVersion: fraudModelConfig.modelVersion,
  };
}

module.exports = { scoreTransaction, buildFeatureVector, runModelInference };
