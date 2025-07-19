// src/App.tsx

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import SignIn from './pages/SignIn';
// We will create the Dashboard page later
// import Dashboard from './pages/Dashboard'; 

function App() {
  return (
    <Routes>
      {/* The "/" path will now show our new SignIn page */}
      <Route path="/" element={<SignIn />} /> 
      
      {/* We can add more routes here later, e.g.: */}
      {/* <Route path="/dashboard" element={<Dashboard />} /> */}
    </Routes>
  );
}

export default App;