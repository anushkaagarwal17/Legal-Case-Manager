import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Layout Components
import Sidebar from './components/Sidebar';

// Import Page Views
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import AddCase from './pages/AddCase';
import CaseDetail from './pages/CaseDetail';
import CauseList from './pages/CauseList';
import Upcoming from './pages/Upcoming';

export default function App() {
  // Sets default to false (Light Mode) for a clean white workspace layout
  const [darkMode, setDarkMode] = useState(false);

  return (
    <Router>
      <div className={`flex min-h-screen font-sans transition-colors duration-200 ${
        darkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'
      }`}>
        {/* Pass down theme controls to the navigation sidebar */}
        <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} />

        {/* Main dynamic view wrapper panel */}
        <div className="flex-1 min-w-0 h-screen overflow-y-auto p-8 lg:p-12">
          <div className="max-w-6xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard darkMode={darkMode} />} />
              <Route path="/cases" element={<Cases darkMode={darkMode} />} />
              <Route path="/add-case" element={<AddCase darkMode={darkMode} />} />
              <Route path="/case/:id" element={<CaseDetail darkMode={darkMode} />} />
              <Route path="/cause-list" element={<CauseList darkMode={darkMode} />} />
              <Route path="/hearings" element={<Upcoming darkMode={darkMode} />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}