import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../Services/Contexts/AuthContext';
import { useContract } from '../../Services/Contexts/ContractContext';
import './Navbar.css';


const Navbar = () => {
  const { account, isConnected, connectWallet, disconnectWallet, error } = useAuth();
  const { isAdmin, isFarmer, isDistributor } = useContract();
  const [showError, setShowError] = useState(false);

  const handleConnect = async () => {
    if (isConnected) {
      disconnectWallet();
      setShowError(false);
    } else {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        alert('MetaMask is not installed!\n\nPlease install MetaMask browser extension to connect your wallet.\n\nVisit: https://metamask.io/download/');
        return;
      }

      const result = await connectWallet();
      if (!result.success) {
        setShowError(true);
        setTimeout(() => setShowError(false), 5000); // Hide error after 5 seconds
      }
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <>
      {showError && error && (
        <div className="alert alert-danger alert-dismissible fade show m-0" role="alert">
          <strong>Connection Error:</strong> {error}
          <button type="button" className="btn-close" onClick={() => setShowError(false)}></button>
        </div>
      )}
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
              <li className="nav-item">
                <Link className="nav-link" to="/marketplace">
                  Marketplace
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/my-orders">
                  {isFarmer ? 'Orders' : 'My Orders'}
                </Link>
              </li>
              {isDistributor && (
                <li className="nav-item">
                  <Link className="nav-link" to="/distributor">
                    Distributor
                  </Link>
                </li>
              )}
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
              <li className="nav-item">
                <Link className="nav-link text-warning" to="/debug">
                  🔍 Debug
                </Link>
              </li>
            </ul>

            <div className="d-flex align-items-center">
              {isConnected && (
                <div className="me-3">
                  {isAdmin && <span className="badge bg-danger me-2">Admin</span>}
                  {isFarmer && <span className="badge bg-success me-2">Farmer</span>}
                  {isDistributor && <span className="badge bg-info me-2">Distributor</span>}
                  {!isAdmin && !isFarmer && !isDistributor && <span className="badge bg-secondary me-2">Consumer</span>}
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
    </>
  );
};

export default Navbar;

