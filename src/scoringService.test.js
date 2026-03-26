'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createScoringService } = require('./scoringService');
const { DEFAULT_FRAUD_MODEL_VERSION } = require('./config');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function withEnv(key, value, fn) {
  const original = process.env[key];
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
  try {
    return fn();
  } finally {
    if (original === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = original;
    }
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('config — getFraudModelVersion', () => {
  it('returns the env variable when FRAUD_MODEL_VERSION is set', () => {
    withEnv('FRAUD_MODEL_VERSION', 'v3', () => {
      // Re-require so the module picks up the updated env.
      delete require.cache[require.resolve('./config')];
      const { getFraudModelVersion } = require('./config');
      assert.equal(getFraudModelVersion(), 'v3');
    });
  });

  it('falls back to DEFAULT_FRAUD_MODEL_VERSION when env variable is absent', () => {
    withEnv('FRAUD_MODEL_VERSION', undefined, () => {
      delete require.cache[require.resolve('./config')];
      const { getFraudModelVersion } = require('./config');
      assert.equal(getFraudModelVersion(), DEFAULT_FRAUD_MODEL_VERSION);
      assert.ok(DEFAULT_FRAUD_MODEL_VERSION, 'default must be a non-empty string');
    });
  });
});

describe('createScoringService — initialization', () => {
  after(() => {
    // Restore modules.
    delete require.cache[require.resolve('./config')];
    delete require.cache[require.resolve('./scoringService')];
  });

  it('initialises successfully without FRAUD_MODEL_VERSION set (uses fallback)', () => {
    withEnv('FRAUD_MODEL_VERSION', undefined, () => {
      delete require.cache[require.resolve('./config')];
      delete require.cache[require.resolve('./scoringService')];
      const { createScoringService: create } = require('./scoringService');
      const service = create();
      assert.equal(service.modelVersion, DEFAULT_FRAUD_MODEL_VERSION);
    });
  });

  it('uses the explicitly configured model version', () => {
    withEnv('FRAUD_MODEL_VERSION', 'v2', () => {
      delete require.cache[require.resolve('./config')];
      delete require.cache[require.resolve('./scoringService')];
      const { createScoringService: create } = require('./scoringService');
      const service = create();
      assert.equal(service.modelVersion, 'v2');
    });
  });
});

describe('createScoringService — score()', () => {
  let service;

  before(() => {
    withEnv('FRAUD_MODEL_VERSION', 'v1', () => {
      service = createScoringService();
    });
  });

  it('returns a score object with the expected shape', () => {
    const result = service.score({ amount: 100, currency: 'USD' });
    assert.ok(typeof result.score === 'number', 'score must be a number');
    assert.ok(result.score >= 0 && result.score <= 1, 'score must be in [0, 1]');
    assert.ok(['LOW', 'MEDIUM', 'HIGH'].includes(result.riskLevel), 'riskLevel must be LOW/MEDIUM/HIGH');
    assert.equal(result.modelVersion, 'v1');
  });

  it('throws when transaction is null', () => {
    assert.throws(() => service.score(null), /transaction must be a non-null object/);
  });

  it('throws when transaction is not an object', () => {
    assert.throws(() => service.score('bad-input'), /transaction must be a non-null object/);
  });
});
