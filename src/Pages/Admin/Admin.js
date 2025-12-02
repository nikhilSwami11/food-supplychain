import React, { useState } from 'react';
import { useSupplyChain } from '../../Services/Contexts/SupplyChainContext';
import './Admin.css';

/**
 * Verify farmers
 */
const Admin = () => {
  const { isConnected, isAdmin, admin } = useSupplyChain();
  const [farmerAddress, setFarmerAddress] = useState('');
  const [distributorAddress, setDistributorAddress] = useState('');
  const [farmerMessage, setFarmerMessage] = useState({ type: '', text: '' });
  const [distributorMessage, setDistributorMessage] = useState({ type: '', text: '' });
  const [isFarmerLoading, setIsFarmerLoading] = useState(false);
  const [isDistributorLoading, setIsDistributorLoading] = useState(false);

  const handleVerifyFarmer = async (e) => {
    e.preventDefault();

    if (!farmerAddress) {
      setFarmerMessage({ type: 'danger', text: 'Please enter a farmer address' });
      return;
    }

    setIsFarmerLoading(true);
    setFarmerMessage({ type: '', text: '' });

    try {
      await admin.verifyFarmer(farmerAddress);
      setFarmerMessage({ type: 'success', text: 'Farmer verified successfully!' });
      setFarmerAddress('');
    } catch (err) {
      setFarmerMessage({ type: 'danger', text: err.message });
    }

    setIsFarmerLoading(false);
  };

  const handleVerifyDistributor = async (e) => {
    e.preventDefault();

    if (!distributorAddress) {
      setDistributorMessage({ type: 'danger', text: 'Please enter a distributor address' });
      return;
    }

    setIsDistributorLoading(true);
    setDistributorMessage({ type: '', text: '' });

    try {
      await admin.authorizeDistributor(distributorAddress);
      setDistributorMessage({ type: 'success', text: 'Distributor authorized successfully!' });
      setDistributorAddress('');
    } catch (err) {
      setDistributorMessage({ type: 'danger', text: err.message });
    }

    setIsDistributorLoading(false);
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

      {/* Authorize Distributor Card */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Authorize Distributor</h5>
          <p className="card-text">
            Grant distributor role to a user address. Distributors can receive products from farmers and deliver them to consumers.
          </p>

          <form onSubmit={handleVerifyDistributor}>
            <div className="mb-3">
              <label htmlFor="distributorAddress" className="form-label">
                Distributor Address
              </label>
              <input
                type="text"
                className="form-control"
                id="distributorAddress"
                placeholder="0x..."
                value={distributorAddress}
                onChange={(e) => setDistributorAddress(e.target.value)}
                disabled={isDistributorLoading}
              />
            </div>

            {distributorMessage.text && (
              <div className={`alert alert-${distributorMessage.type}`} role="alert">
                {distributorMessage.text}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-info"
              disabled={isDistributorLoading}
            >
              {isDistributorLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Authorizing...
                </>
              ) : (
                <>
                  <i className="bi bi-truck me-2"></i>
                  Authorize Distributor
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
            <i className="bi bi-truck fs-1 text-info"></i>
            <h5 className="mt-3">Distributor Authorization</h5>
            <p>Authorize distributors to handle product delivery</p>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="info-card">
            <i className="bi bi-gear fs-1 text-primary"></i>
            <h5 className="mt-3">Role Management</h5>
            <p>All users start as consumers. Promote them to farmers or distributors as needed.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;

