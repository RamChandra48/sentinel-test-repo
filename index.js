'use strict';

require('dotenv').config();

const express = require('express');
const scoringRouter = require('./routes/scoring');
const fraudModelConfig = require('./config/fraudModel');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health-check endpoint – useful for liveness probes.
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', modelVersion: fraudModelConfig.modelVersion });
});

// Fraud scoring routes.
app.use('/api/fraud', scoringRouter);

// Generic error handler – catches anything not handled by route middleware.
// This prevents unhandled errors from returning an empty 500 with no body.
app.use((err, _req, res, _next) => {
  console.error('[fraud-scoring] Unhandled error:', err.message);
  res.status(500).json({ error: 'Unexpected server error.' });
});

app.listen(PORT, () => {
  console.log(
    `[fraud-scoring] Server started on port ${PORT} using model version ${fraudModelConfig.modelVersion}`
  );
});

module.exports = app;
