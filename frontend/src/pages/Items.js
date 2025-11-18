import React, { useEffect, useState, useRef } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';

function Items() {
  const { items, fetchItems } = useData();
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [q, setQ] = useState('');
  const [meta, setMeta] = useState({ total: 0 });
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    // cancel previous fetch when params change or on unmount
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    fetchItems({ page, limit, q, signal: ac.signal })
      .then(res => {
        setMeta(res.meta || { total: 0 });
      })
      .catch(err => {
        if (err.name !== 'AbortError') console.error(err);
      })
      .finally(() => setLoading(false));

    return () => {
      ac.abort();
    };
  }, [fetchItems, page, limit, q]);

  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / limit));

  const Row = ({ index, style }) => {
    const item = items[index];
    if (!item) return <div style={style}>Loading...</div>;
    return (
      <div style={style} className="item-row">
        <Link to={'/items/' + item.id}>{item.name}</Link>
        <span style={{ float: 'right' }}>${item.price}</span>
      </div>
    );
  };

  return (
    <div>
      <div className="card">
        <div className="controls">
          <input
            className="search"
            aria-label="Search items"
            placeholder="Search items by name..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <button className="btn" onClick={() => { setPage(1); }}>Search</button>
        </div>

        {loading && (
          <div style={{display:'grid',gap:8}}>
            <div className="skeleton" style={{width:'60%'}}></div>
            <div className="skeleton" style={{width:'80%'}}></div>
            <div className="skeleton" style={{width:'40%'}}></div>
          </div>
        )}

        {!loading && (
          <List
            height={400}
            itemCount={items.length}
            itemSize={56}
            width={'100%'}
          >
            {Row}
          </List>
        )}

        <div className="footer-controls" aria-live="polite">
          <button className="btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
          <div className="meta">Page {page} / {totalPages} — {meta.total} items</div>
          <button className="btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</button>
        </div>
      </div>
    </div>
  );
}

export default Items;