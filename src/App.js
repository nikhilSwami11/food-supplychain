import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './Services/Contexts/AuthContext';
import { ContractProvider } from './Services/Contexts/ContractContext';
import MainLayout from './Layouts/Main/MainLayout';
import Dashboard from './Pages/Dashboard/Dashboard';
import Products from './Pages/Products/Products';
import Farmers from './Pages/Farmers/Farmers';
import Admin from './Pages/Admin/Admin';
import Profile from './Pages/Profile';
import Debug from './Pages/Debug';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

/**
 * Main App Component
 * Sets up routing and context providers
 */
function App() {
  return (
    <AuthProvider>
      <ContractProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="farmers" element={<Farmers />} />
              <Route path="admin" element={<Admin />} />
              <Route path="profile" element={<Profile />} />
              <Route path="debug" element={<Debug />} />
            </Route>
          </Routes>
        </Router>
      </ContractProvider>
    </AuthProvider>
  );
}

export default App;

