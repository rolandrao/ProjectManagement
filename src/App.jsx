import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { KanbanBoard } from './components/board/KanbanBoard';
import { SettingsPage } from './pages/SettingsPage';
import { ArchivedPage } from './pages/ArchivedPage'; // Ensure this file exists from previous step
import { Navbar } from './components/layout/Navbar';

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;