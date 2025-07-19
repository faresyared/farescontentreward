// src/App.tsx

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp'; // <-- Import the new page

function App() {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} /> {/* <-- Add the new route */}
    </Routes>
  );
}

export default App;