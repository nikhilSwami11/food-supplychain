import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import './MainLayout.css';


const MainLayout = () => {
  return (
    <div className="main-layout">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer bg-dark text-light text-center py-3">
        <p className="mb-0">© 2024 Supply Chain Blockchain. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default MainLayout;

