'use strict';

const DEFAULT_FRAUD_MODEL_VERSION = 'v1';

/**
 * Returns the fraud model version to use.
 *
 * FRAUD_MODEL_VERSION env variable is preferred. When it is not set the
 * service falls back to DEFAULT_FRAUD_MODEL_VERSION so that production
 * continues to function even if the variable is missing from the deployment
 * configuration (see issue: "Production: Fraud scoring API returning 500
 * errors" / PR #182).
 */
function getFraudModelVersion() {
  return process.env.FRAUD_MODEL_VERSION || DEFAULT_FRAUD_MODEL_VERSION;
}

module.exports = { getFraudModelVersion, DEFAULT_FRAUD_MODEL_VERSION };
