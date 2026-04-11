import React from 'react';
import AnalyticsDashboard from './components/AnalyticsDashboard';

const App: React.FC = () => {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Project Management — Analytics Dashboard</h1>
        <p className="app-subtitle">Real-time project insights powered by AI</p>
      </header>
      <main className="app-main">
        <AnalyticsDashboard />
      </main>
    </div>
  );
};

export default App;
