import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Items from './Items';
import ItemDetail from './ItemDetail';
import { DataProvider } from '../state/DataContext';

function App() {
  return (
    <DataProvider>
      <div className="hud">
        <div className="app-container">
          <nav className="app-nav">
            <h1 style={{margin:0, fontSize:18}}>Items</h1>
            <Link to="/" style={{marginLeft:8, color:'var(--muted)'}}>Home</Link>
          </nav>

          <main>
            <Routes>
              <Route path="/" element={<Items />} />
              <Route path="/items/:id" element={<ItemDetail />} />
            </Routes>
          </main>
        </div>
      </div>
    </DataProvider>
  );
}

export default App;