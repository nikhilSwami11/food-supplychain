import React, { useState } from 'react';
import { useAuth } from '../../Services/Contexts/AuthContext';
import { useContract } from '../../Services/Contexts/ContractContext';
import './Admin.css';

/**
 * Verify farmers 
 */
const Admin = () => {
  const { isConnected } = useAuth();
  const { isAdmin, setFarmerRole, setEntityRole } = useContract();
  const [farmerAddress, setFarmerAddress] = useState('');
  const [entityAddress, setEntityAddress] = useState('');
  const [farmerMessage, setFarmerMessage] = useState({ type: '', text: '' });
  const [entityMessage, setEntityMessage] = useState({ type: '', text: '' });
  const [isFarmerLoading, setIsFarmerLoading] = useState(false);
  const [isEntityLoading, setIsEntityLoading] = useState(false);

  const handleVerifyFarmer = async (e) => {
    e.preventDefault();

    if (!farmerAddress) {
      setFarmerMessage({ type: 'danger', text: 'Please enter a farmer address' });
      return;
    }

    setIsFarmerLoading(true);
    setFarmerMessage({ type: '', text: '' });

    const result = await setFarmerRole(farmerAddress);

    if (result.success) {
      setFarmerMessage({ type: 'success', text: 'Farmer verified successfully!' });
      setFarmerAddress('');
    } else {
      setFarmerMessage({ type: 'danger', text: result.error });
    }

    setIsFarmerLoading(false);
  };

  const handleVerifyEntity = async (e) => {
    e.preventDefault();

    if (!entityAddress) {
      setEntityMessage({ type: 'danger', text: 'Please enter an entity address' });
      return;
    }

    setIsEntityLoading(true);
    setEntityMessage({ type: '', text: '' });

    const result = await setEntityRole(entityAddress);

    if (result.success) {
      setEntityMessage({ type: 'success', text: 'Entity authorized successfully!' });
      setEntityAddress('');
    } else {
      setEntityMessage({ type: 'danger', text: result.error });
    }

    setIsEntityLoading(false);
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
                disabled={isFarmerLoading}
              />
            </div>

            {farmerMessage.text && (
              <div className={`alert alert-${farmerMessage.type}`} role="alert">
                {farmerMessage.text}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isFarmerLoading}
            >
              {isFarmerLoading ? (
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

      {/* Authorize Entity Card */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Authorize Entity</h5>
          <p className="card-text">
            Grant entity role to a user address. Authorized entities can receive products in the supply chain (distributors, retailers, etc.).
          </p>

          <form onSubmit={handleVerifyEntity}>
            <div className="mb-3">
              <label htmlFor="entityAddress" className="form-label">
                Entity Address
              </label>
              <input
                type="text"
                className="form-control"
                id="entityAddress"
                placeholder="0x..."
                value={entityAddress}
                onChange={(e) => setEntityAddress(e.target.value)}
                disabled={isEntityLoading}
              />
            </div>

            {entityMessage.text && (
              <div className={`alert alert-${entityMessage.type}`} role="alert">
                {entityMessage.text}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-success"
              disabled={isEntityLoading}
            >
              {isEntityLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Authorizing...
                </>
              ) : (
                <>
                  <i className="bi bi-building-check me-2"></i>
                  Authorize Entity
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Admin Info */}
      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="info-card">
            <i className="bi bi-shield-check fs-1 text-success"></i>
            <h5 className="mt-3">Farmer Verification</h5>
            <p>Verify trusted farmers to allow them to register products</p>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="info-card">
            <i className="bi bi-building-check fs-1 text-info"></i>
            <h5 className="mt-3">Entity Authorization</h5>
            <p>Authorize entities to participate in the supply chain</p>
          </div>
        </div>
        <div className="col-md-4 mb-3">
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

