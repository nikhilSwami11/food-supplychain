import React from 'react';
import { useSupplyChain } from '../../Services/Contexts/SupplyChainContext';
import './Farmers.css';

/**
 * Farmers Page
 */
const Farmers = () => {
  const { isConnected } = useSupplyChain();

  if (!isConnected) {
    return (
      <div className="container">
        <div className="alert alert-warning text-center">
          <h4>Please connect your wallet to view farmers</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="mb-4">Verified Farmers</h1>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">About Verified Farmers</h5>
          <p className="card-text">
            Verified farmers are trusted entities who have been approved by the system administrator
            to register products on the blockchain. This ensures that only legitimate producers can
            add products to the supply chain.
          </p>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="info-card">
            <i className="bi bi-person-check fs-1 text-success"></i>
            <h5 className="mt-3">Verified Status</h5>
            <p>All farmers listed here have been verified by the admin</p>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="info-card">
            <i className="bi bi-box-seam fs-1 text-primary"></i>
            <h5 className="mt-3">Product Registration</h5>
            <p>Verified farmers can register products to the blockchain</p>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="info-card">
            <i className="bi bi-shield-lock fs-1 text-info"></i>
            <h5 className="mt-3">Trusted Network</h5>
            <p>Building a network of trusted food producers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Farmers;

