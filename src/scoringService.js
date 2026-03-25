'use strict';

const { getFraudModelVersion } = require('./config');

/**
 * Initializes the scoring service and returns an object that can score
 * transactions.
 *
 * The model version is resolved once at start-up.  If the resolved version is
 * empty the service throws immediately with a clear message instead of
 * propagating a NullPointerException later during request handling (the root
 * cause of the 500 errors reported in production after PR #182).
 */
function createScoringService() {
  const modelVersion = getFraudModelVersion();

  if (!modelVersion) {
    throw new Error(
      'scoringService: modelVersion is not set. ' +
        'Configure the FRAUD_MODEL_VERSION environment variable or ensure a default is defined in config.js.'
    );
  }

  /**
   * Scores a transaction object and returns a risk assessment.
   * @param {object} transaction
   * @returns {{ score: number, modelVersion: string, riskLevel: string }}
   */
  function score(transaction) {
    if (!transaction || typeof transaction !== 'object') {
      throw new Error('scoringService: transaction must be a non-null object');
    }

    // Placeholder scoring logic — replace with real model call.
    const rawScore = Math.random();
    const riskLevel = rawScore > 0.7 ? 'HIGH' : rawScore > 0.3 ? 'MEDIUM' : 'LOW';

    return { score: rawScore, modelVersion, riskLevel };
  }

  return { score, modelVersion };
}

module.exports = { createScoringService };
