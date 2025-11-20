import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Services/Contexts/AuthContext';
import { useContract } from '../../Services/Contexts/ContractContext';
import { Link } from 'react-router-dom';
import './Distributor.css';

/**
 * Distributor Dashboard Page
 * Shows overview of distributor's inventory and operations
 */
const Distributor = () => {
  const { account, isConnected } = useAuth();
  const { isDistributor, getDistributorInventory, getDeliveryQueue, getReceivedProducts, getDeliveryHistory } = useContract();
  const [stats, setStats] = useState({
    totalInventory: 0,
    inTransit: 0,
    stored: 0,
    delivered: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (isConnected && isDistributor) {
        setIsLoading(true);
        try {
          const [inventoryResult, queueResult, receivedResult, historyResult] = await Promise.all([
            getDistributorInventory(),
            getDeliveryQueue(),
            getReceivedProducts(),
            getDeliveryHistory()
          ]);

          setStats({
            totalInventory: inventoryResult.success ? inventoryResult.inventory.length : 0,
            inTransit: receivedResult.success ? receivedResult.received.length : 0,
            stored: queueResult.success ? queueResult.queue.length : 0,
            delivered: historyResult.success ? historyResult.history.length : 0
          });
        } catch (error) {
          console.error('Error loading stats:', error);
        }
        setIsLoading(false);
      }
    };

    loadStats();
  }, [isConnected, isDistributor, getDistributorInventory, getDeliveryQueue, getReceivedProducts, getDeliveryHistory]);

  if (!isConnected) {
    return (
      <div className="container">
        <div className="alert alert-warning text-center">
          <h4>Please connect your wallet to access the distributor dashboard</h4>
          <p>Click "Connect Wallet" in the navigation bar to get started.</p>
        </div>
      </div>
    );
  }

  if (!isDistributor) {
    return (
      <div className="container">
        <div className="alert alert-danger text-center">
          <h4>Access Denied</h4>
          <p>Only authorized distributors can access this page.</p>
          <p className="small">Contact the admin to get distributor access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="mb-4">Distributor Dashboard</h1>

      {/* Account Info */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Distributor Information</h5>
          <p className="card-text">
            <strong>Address:</strong> {account}
          </p>
          <p className="card-text">
            <span className="badge bg-info">Distributor</span>
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="stat-card">
            <div className="stat-icon bg-primary">
              <i className="bi bi-box-seam fs-1"></i>
            </div>
            <div className="stat-content">
              <h3>{isLoading ? '...' : stats.totalInventory}</h3>
              <p>Total Inventory</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="stat-card">
            <div className="stat-icon bg-warning">
              <i className="bi bi-truck fs-1"></i>
            </div>
            <div className="stat-content">
              <h3>{isLoading ? '...' : stats.inTransit}</h3>
              <p>In Transit</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="stat-card">
            <div className="stat-icon bg-info">
              <i className="bi bi-archive fs-1"></i>
            </div>
            <div className="stat-content">
              <h3>{isLoading ? '...' : stats.stored}</h3>
              <p>In Storage</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="stat-card">
            <div className="stat-icon bg-success">
              <i className="bi bi-check-circle fs-1"></i>
            </div>
            <div className="stat-content">
              <h3>{isLoading ? '...' : stats.delivered}</h3>
              <p>Delivered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h3 className="mb-3">Quick Actions</h3>
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <i className="bi bi-box-seam fs-1 text-primary"></i>
              <h5 className="card-title mt-3">My Inventory</h5>
              <p className="card-text">View all products currently in your possession</p>
              <Link to="/distributor/inventory" className="btn btn-primary">
                View Inventory
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <i className="bi bi-inbox fs-1 text-warning"></i>
              <h5 className="card-title mt-3">Received Products</h5>
              <p className="card-text">Products received from farmers (In Transit)</p>
              <Link to="/distributor/received" className="btn btn-warning">
                View Received
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <i className="bi bi-send fs-1 text-info"></i>
              <h5 className="card-title mt-3">Delivery Queue</h5>
              <p className="card-text">Products ready to deliver to consumers</p>
              <Link to="/distributor/delivery-queue" className="btn btn-info">
                View Queue
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <i className="bi bi-clock-history fs-1 text-success"></i>
              <h5 className="card-title mt-3">Delivery History</h5>
              <p className="card-text">View all products you've delivered</p>
              <Link to="/distributor/history" className="btn btn-success">
                View History
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-3">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Distributor Workflow</h5>
              <ol className="workflow-list">
                <li>Receive products from farmers (InTransit state)</li>
                <li>Mark products as received and stored</li>
                <li>Prepare products for delivery</li>
                <li>Deliver products to consumers</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Distributor;

