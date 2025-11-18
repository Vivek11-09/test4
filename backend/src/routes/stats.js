const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

const DATA_PATH = process.env.DATA_PATH || path.join(__dirname, '../../data/items.json');

// simple cache to avoid recomputing on every request
let cache = { mtime: 0, value: null };

async function computeStatsIfNeeded() {
  const stat = await fs.stat(DATA_PATH);
  const mtime = stat.mtimeMs || stat.mtime.getTime();
  if (cache.value && cache.mtime === mtime) {
    return cache.value;
  }

  const raw = await fs.readFile(DATA_PATH, 'utf8');
  const items = JSON.parse(raw);
  const total = Array.isArray(items) ? items.length : 0;
  const averagePrice = total === 0 ? 0 : (items.reduce((acc, cur) => acc + (cur.price || 0), 0) / total);

  cache = { mtime, value: { total, averagePrice } };
  return cache.value;
}

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    const stats = await computeStatsIfNeeded();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;