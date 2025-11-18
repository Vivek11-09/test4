import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);

  // fetchItems accepts { page, limit, q, signal }
  const API_BASE = process.env.REACT_APP_API_URL || '';
  const fetchItems = useCallback(async ({ page = 1, limit = 50, q, signal } = {}) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (page) params.set('page', String(page));
    if (limit) params.set('limit', String(limit));

    const url = API_BASE + '/api/items?' + params.toString();
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error('Failed to load items');
    const json = await res.json();
    // API returns { items, meta }
    setItems(json.items || []);
    return json;
  }, []);

  return (
    <DataContext.Provider value={{ items, fetchItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);