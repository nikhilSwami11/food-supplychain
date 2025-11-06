import React, { useState } from 'react';
import { useAuth } from '../../Services/Contexts/AuthContext';
import { useContract } from '../../Services/Contexts/ContractContext';
import './Admin.css';

/**
 * Admin Page
 * Verify farmers and manage the system (Admin only)
 */
const Admin = () => {
  const { isConnected } = useAuth();
  const { isAdmin, setFarmerRole } = useContract();
  const [farmerAddress, setFarmerAddress] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyFarmer = async (e) => {
    e.preventDefault();
    
    if (!farmerAddress) {
      setMessage({ type: 'danger', text: 'Please enter a farmer address' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const result = await setFarmerRole(farmerAddress);

    if (result.success) {
      setMessage({ type: 'success', text: 'Farmer verified successfully!' });
      setFarmerAddress('');
    } else {
      setMessage({ type: 'danger', text: result.error });
    }

    setIsLoading(false);
  };

  if (!isConnected) {
    return (
      <div className="container">
        <div className="alert alert-warning text-center">
          <h4>Please connect your wallet to access the admin panel</h4>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container">
        <div className="alert alert-danger text-center">
          <h4>Access Denied</h4>
          <p>Only the contract owner can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="mb-4">Admin Panel</h1>

      {/* Verify Farmer Card */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Verify Farmer</h5>
          <p className="card-text">
            Grant farmer role to a user address. Verified farmers can register products on the blockchain.
          </p>
          
          <form onSubmit={handleVerifyFarmer}>
            <div className="mb-3">
              <label htmlFor="farmerAddress" className="form-label">
                Farmer Address
              </label>
              <input
                type="text"
                className="form-control"
                id="farmerAddress"
                placeholder="0x..."
                value={farmerAddress}
                onChange={(e) => setFarmerAddress(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {message.text && (
              <div className={`alert alert-${message.type}`} role="alert">
                {message.text}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Verifying...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Verify Farmer
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Admin Info */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <div className="info-card">
            <i className="bi bi-shield-check fs-1 text-success"></i>
            <h5 className="mt-3">Farmer Verification</h5>
            <p>Verify trusted farmers to allow them to register products</p>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="info-card">
            <i className="bi bi-gear fs-1 text-primary"></i>
            <h5 className="mt-3">System Management</h5>
            <p>Manage the supply chain system and monitor activities</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;

