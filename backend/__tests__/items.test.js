const path = require('path');
const fs = require('fs').promises;
const request = require('supertest');

const TEST_DATA_DIR = path.join(__dirname, '..', 'test-data');
const TEST_DATA_PATH = path.join(TEST_DATA_DIR, 'items.json');
const ORIGINAL_DATA_PATH = path.join(__dirname, '../../data/items.json');

let app;

beforeEach(async () => {
  // ensure test data dir
  await fs.mkdir(TEST_DATA_DIR, { recursive: true });
  // copy original dataset for isolation
  const original = await fs.readFile(ORIGINAL_DATA_PATH, 'utf8');
  await fs.writeFile(TEST_DATA_PATH, original, 'utf8');

  // set env so routes use test data
  process.env.DATA_PATH = TEST_DATA_PATH;

  // require app after env is set
  // eslint-disable-next-line global-require
  app = require('../src/index');
});

afterEach(async () => {
  // cleanup require cache so env changes take effect on next require
  delete require.cache[require.resolve('../src/index')];
  delete process.env.DATA_PATH;
});

test('GET /api/items returns items with meta', async () => {
  const res = await request(app).get('/api/items');
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('items');
  expect(res.body).toHaveProperty('meta');
  expect(Array.isArray(res.body.items)).toBe(true);
});

test('pagination works with limit and page', async () => {
  const res = await request(app).get('/api/items?limit=2&page=1');
  expect(res.status).toBe(200);
  expect(res.body.meta.limit).toBe(2);
  expect(res.body.items.length).toBeLessThanOrEqual(2);
});

test('search (q) filters results', async () => {
  // pick a term from first item
  const data = JSON.parse(await fs.readFile(TEST_DATA_PATH, 'utf8'));
  const term = data[0].name.split(' ')[0];
  const res = await request(app).get('/api/items').query({ q: term });
  expect(res.status).toBe(200);
  expect(res.body.items.length).toBeGreaterThanOrEqual(1);
});

test('GET /api/items/:id returns item or 404', async () => {
  const data = JSON.parse(await fs.readFile(TEST_DATA_PATH, 'utf8'));
  const id = data[0].id;
  const ok = await request(app).get('/api/items/' + id);
  expect(ok.status).toBe(200);
  expect(ok.body.id).toBe(id);

  const notFound = await request(app).get('/api/items/999999999999');
  expect(notFound.status).toBe(404);
});

test('POST /api/items creates item when valid', async () => {
  const payload = { name: 'Test Item', price: 12.5 };
  const post = await request(app).post('/api/items').send(payload);
  expect(post.status).toBe(201);
  expect(post.body).toHaveProperty('id');
  expect(post.body.name).toBe(payload.name);

  // ensure persisted
  const file = JSON.parse(await fs.readFile(TEST_DATA_PATH, 'utf8'));
  expect(file.find(i => i.id === post.body.id)).toBeTruthy();
});

test('POST /api/items returns 400 for invalid payload', async () => {
  const res = await request(app).post('/api/items').send({ name: 123 });
  expect(res.status).toBe(400);
});
