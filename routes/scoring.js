'use strict';

const express = require('express');
const { scoreTransaction } = require('../services/scoringService');

const router = express.Router();

/**
 * POST /score
 *
 * Accepts a transaction payload and returns a fraud score.
 *
 * Request body (JSON):
 *   {
 *     amount: number,
 *     hour: number,
 *     dayOfWeek: number,
 *     merchantRiskScore: number,
 *     userHistoryScore: number,
 *     ipRiskScore: number,
 *     deviceRiskScore: number,
 *     velocityScore: number,
 *     additionalFeatures?: number[]
 *   }
 *
 * Response (200):
 *   { score: number, isFraud: boolean, modelVersion: string }
 *
 * Response (400): invalid request body
 * Response (500): unexpected inference error
 */
router.post('/score', async (req, res) => {
  try {
    const result = await scoreTransaction(req.body);
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof TypeError) {
      return res.status(400).json({ error: err.message });
    }

    // Log and return a structured 500 instead of crashing the process.
    console.error('[fraud-scoring] Scoring error:', err.message);
    return res.status(500).json({ error: 'Internal scoring error. Please retry.' });
  }
});

module.exports = router;
