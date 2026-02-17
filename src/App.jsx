import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BoardProvider } from './context/BoardContext'; // <--- Import Provider
import { KanbanBoard } from './components/board/KanbanBoard';
import { SettingsPage } from './pages/SettingsPage';
import { ArchivedPage } from './pages/ArchivedPage';
import { Navbar } from './components/layout/Navbar';

function App() {
  return (
    <Router>
      {/* Wrap everything in the Provider */}
      <BoardProvider>
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden font-sans">
          <Navbar />
          
          <main className="flex-1 overflow-hidden relative">
            <Routes>
              <Route path="/" element={<KanbanBoard />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/archive" element={<ArchivedPage />} />
            </Routes>
          </main>
        </div>
      </BoardProvider>
    </Router>
  );
}

export default App;