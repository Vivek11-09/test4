SOLUTION
========

Status Summary (by requirement)
--------------------------------

Backend — Refactor blocking I/O
- Status: DONE
- What changed: `src/routes/items.js` now uses async `fs.promises` (read/write helpers) instead of `readFileSync`/`writeFileSync`.
- Verification: code updated and exercised by tests and a manual script that POSTed items and persisted them to `data/items.json`.

Backend — Performance: cache `/api/stats`
- Status: DONE
- What changed: `src/routes/stats.js` caches stats keyed by the data file mtime and only recomputes when the file changes (async fs).
- Verification: logic implemented; tests for cache invalidation can be added on request.

Backend — Testing (Jest) for items routes
- Status: DONE
- What changed: `backend/__tests__/items.test.js` added (supertest). Tests cover:
  - GET /api/items (items + meta)
  - pagination (limit/page)
  - search (q)
  - GET /api/items/:id (success + 404)
  - POST /api/items (happy path + 400 invalid payload)
- Verification: ran `npm test` in `backend` — all tests passed.

Frontend — Memory leak in `Items.js`
- Status: DONE
- What changed: `frontend/src/pages/Items.js` uses an `AbortController` and cancels in-flight fetches on param changes and on unmount to prevent setState-after-unmount.

Frontend — Pagination & Search (client + server)
- Status: DONE
- What changed:
  - Server: `items` endpoint supports `q`, `page`, and `limit` and returns `{ items, meta }`.
  - Client: `frontend/src/state/DataContext.js` exposes `fetchItems({ page, limit, q, signal })`; `Items.js` drives search and paging params and requests server-side paging.
- Verification: manual POSTs to the backend were found via server-side search; frontend wiring requires the dev server to be running (see Integration below).

Frontend — Performance: virtualization
- Status: DONE
- What changed: `react-window` (FixedSizeList) integrated into `frontend/src/pages/Items.js` to virtualize long lists.

Frontend — UI/UX polish (styling + skeleton + accessibility)
- Status: DONE
- What changed: `frontend/src/styles.css` added (HUD/glass effect, vibrant background), search input and button styling, skeleton shimmer while loading, and better layout in `App.js` and `Items.js`.

Integration & Verification
--------------------------
- The backend is reachable at `http://localhost:3001` (server started via `npm start`).
- The frontend uses CRA proxy (added `proxy` entry in `frontend/package.json`) so relative `/api` fetches are forwarded to `http://localhost:3001` when running `npm start` in the frontend.
- `DataContext` supports `REACT_APP_API_URL` override if you prefer an explicit backend URL in `.env.local`.
- I created `scripts/add_and_check.js` and used it to POST a new item and confirm the API returns it; the new item appears in `data/items.json`.

Item CRUD (commands to verify)
------------------------------
Below are example commands you can run locally to verify item operations against the running backend (http://localhost:3001).

Create (POST)
```bash
curl -s -X POST http://localhost:3001/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"My Item","price":19.99}' | jq
```
PowerShell (equivalent):
```powershell
$body = @{ name = 'My Item'; price = 19.99 } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3001/api/items' -Method Post -Body $body -ContentType 'application/json'
```

Read (list) — supports pagination and search
```bash
# first page, limit 20
curl -s "http://localhost:3001/api/items?page=1&limit=20" | jq

# search by q (server-side search)
curl -s "http://localhost:3001/api/items?q=My&page=1&limit=20" | jq
```

Read (single item)
```bash
curl -s http://localhost:3001/api/items/123 | jq
```

Update / Delete
----------------
The current API implements Create (POST) and Read (GET list + GET by id). Update (PUT/PATCH) and Delete (DELETE) endpoints are not yet implemented in `src/routes/items.js`.

If you add update/delete, quick curl examples would be:
```bash
# Update (example)
curl -s -X PUT http://localhost:3001/api/items/123 -H "Content-Type: application/json" -d '{"name":"Updated","price":29.99}' | jq

# Delete (example)
curl -s -X DELETE http://localhost:3001/api/items/123 | jq
```


Quality gates
-------------
- Backend tests: PASS (Jest tests executed and passed).
- Frontend tests: none present by default; the UI compiles (you may need to run `npm install` in `frontend` then `npm start` to verify the dev server and proxy). If you want, I can add React Testing Library tests.

How to run locally
-------------------
1) Backend
```powershell
cd d:/task/test4/backend
npm install
npm test    # run Jest tests
npm start   # starts backend on port 3001
```

2) Frontend
```powershell
cd d:/task/test4/frontend
npm install
npm start   # starts CRA dev server on port 3000 (proxies /api -> 3001)
```
Notes: if the dev server doesn't pick up the proxy change, restart it after `package.json` edits. Alternatively create `frontend/.env.local` with `REACT_APP_API_URL=http://localhost:3001` and restart.

Next recommended improvements (optional)
--------------------------------------
- Add tests for `/api/stats` caching and invalidation behavior.
- Add React Testing Library tests for `Items` and `DataContext` (happy path + cancellation behavior).
- Replace file-backed storage with SQLite or a small DB for concurrent writes and better scaling.
- Add an in-app "Add Item" form and immediate UI feedback with optimistic updates.

If you'd like, I can implement any of the suggested next steps — tell me which and I'll add it to the plan and implement it.
