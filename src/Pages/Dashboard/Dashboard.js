import React from 'react';
import { useAuth } from '../../Services/Contexts/AuthContext';
import { useContract } from '../../Services/Contexts/ContractContext';
import { Link } from 'react-router-dom';
import './Dashboard.css';

/**
 * Dashboard Page
 */
const Dashboard = () => {
  const { account, isConnected } = useAuth();
  const { isAdmin, isFarmer } = useContract();

  if (!isConnected) {
    return (
      <div className="container">
        <div className="alert alert-warning text-center">
          <h4>Please connect your wallet to access the dashboard</h4>
          <p>Click "Connect Wallet" in the navigation bar to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="mb-4">Dashboard</h1>

      {/* User Info Card */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Account Information</h5>
          <p className="card-text">
            <strong>Address:</strong> {account}
          </p>
          <p className="card-text">
            <strong>Role:</strong>{' '}
            {isAdmin && <span className="badge bg-danger">Admin</span>}
            {isFarmer && <span className="badge bg-success ms-2">Farmer</span>}
            {!isAdmin && !isFarmer && <span className="badge bg-secondary">Consumer</span>}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <i className="bi bi-box-seam fs-1 text-primary"></i>
              <h5 className="card-title mt-3">View Products</h5>
              <p className="card-text">Browse and trace all registered products</p>
              <Link to="/products" className="btn btn-primary">
                Go to Products
              </Link>
            </div>
          </div>
        </div>

        {isFarmer && (
          <div className="col-md-4 mb-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <i className="bi bi-plus-circle fs-1 text-success"></i>
                <h5 className="card-title mt-3">Register Product</h5>
                <p className="card-text">Register a new product to the blockchain</p>
                <Link to="/products" className="btn btn-success">
                  Register Now
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="col-md-4 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <i className="bi bi-people fs-1 text-info"></i>
              <h5 className="card-title mt-3">View Farmers</h5>
              <p className="card-text">See all verified farmers in the network</p>
              <Link to="/farmers" className="btn btn-info">
                View Farmers
              </Link>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="col-md-4 mb-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <i className="bi bi-shield-check fs-1 text-danger"></i>
                <h5 className="card-title mt-3">Admin Panel</h5>
                <p className="card-text">Verify farmers and manage the system</p>
                <Link to="/admin" className="btn btn-danger">
                  Admin Panel
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="row mt-4">
        <div className="col-12">
          <h3>Platform Features</h3>
        </div>
        <div className="col-md-3 mb-3">
          <div className="feature-card">
            <i className="bi bi-shield-lock fs-2 text-primary"></i>
            <h6 className="mt-2">Secure & Transparent</h6>
            <p className="small">Blockchain-based tamper-proof records</p>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="feature-card">
            <i className="bi bi-graph-up fs-2 text-success"></i>
            <h6 className="mt-2">Full Traceability</h6>
            <p className="small">Track products from origin to consumer</p>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="feature-card">
            <i className="bi bi-check-circle fs-2 text-info"></i>
            <h6 className="mt-2">Authenticity Verification</h6>
            <p className="small">Verify product authenticity instantly</p>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="feature-card">
            <i className="bi bi-people-fill fs-2 text-warning"></i>
            <h6 className="mt-2">Role-Based Access</h6>
            <p className="small">Different permissions for each stakeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

