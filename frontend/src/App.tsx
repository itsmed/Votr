import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

/**
 * Root application component.
 * Sets up routing for the PollUs application.
 */
function App(): React.ReactElement {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<div>PollUs Home</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
