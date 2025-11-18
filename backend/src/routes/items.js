const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// Allow tests to override the data path via env
const DATA_PATH = process.env.DATA_PATH || path.join(__dirname, '../../../data/items.json');

// Helper: load JSON file asynchronously
async function loadData() {
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  return JSON.parse(raw);
}

// Helper: write JSON file asynchronously
async function saveData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// GET /api/items
// supports: q (search), page (1-based), limit
router.get('/', async (req, res, next) => {
  try {
    const data = await loadData();
    const { q, page = 1, limit = 50 } = req.query;

    let results = Array.isArray(data) ? data : [];

    if (q) {
      const term = q.toLowerCase();
      results = results.filter(item => String(item.name || '').toLowerCase().includes(term));
    }

    // Pagination (page is 1-based)
    const l = Math.max(1, parseInt(limit, 10) || 50);
    const p = Math.max(1, parseInt(page, 10) || 1);
    const start = (p - 1) * l;
    const paged = results.slice(start, start + l);

    // Provide metadata for client-side paging
    res.json({
      items: paged,
      meta: { total: results.length, page: p, limit: l }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await loadData();
    const id = parseInt(req.params.id, 10);
    const item = data.find(i => i.id === id);
    if (!item) {
      const error = new Error('Item not found');
      error.status = 404;
      throw error;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload.name !== 'string' || typeof payload.price !== 'number') {
      const err = new Error('Invalid payload: name (string) and price (number) required');
      err.status = 400;
      throw err;
    }

    const data = await loadData();
    const newItem = { ...payload, id: Date.now() };
    data.push(newItem);
    await saveData(data);
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

module.exports = router;