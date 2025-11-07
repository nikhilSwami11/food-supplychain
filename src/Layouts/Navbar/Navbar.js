import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../Services/Contexts/AuthContext';
import { useContract } from '../../Services/Contexts/ContractContext';
import './Navbar.css';


const Navbar = () => {
  const { account, isConnected, connectWallet, disconnectWallet } = useAuth();
  const { isAdmin, isFarmer } = useContract();

  const handleConnect = async () => {
    if (isConnected) {
      disconnectWallet();
    } else {
      await connectWallet();
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          Supply Chain Blockchain
        </Link>
        
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/products">
                Products
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/farmers">
                Farmers
              </Link>
            </li>
            {isAdmin && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin">
                  Admin
                </Link>
              </li>
            )}
            <li className="nav-item">
              <Link className="nav-link" to="/profile">
                Profile
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center">
            {isConnected && (
              <div className="me-3">
                {isAdmin && <span className="badge bg-danger me-2">Admin</span>}
                {isFarmer && <span className="badge bg-success me-2">Farmer</span>}
                <span className="text-light">{formatAddress(account)}</span>
              </div>
            )}
            <button
              className={`btn ${isConnected ? 'btn-outline-danger' : 'btn-outline-success'}`}
              onClick={handleConnect}
            >
              {isConnected ? 'Disconnect' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

