import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Services/Contexts/AuthContext';
import { useContract } from '../../Services/Contexts/ContractContext';
import './Consumer.css';

/**
 * My Orders Page
 * Shows all products ordered by the current user
 */
const MyOrders = () => {
  const { isConnected } = useAuth();
  const { getMyOrders, getProductHistory } = useContract();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [history, setHistory] = useState([]);

  const loadOrders = async () => {
    setIsLoading(true);
    const result = await getMyOrders();
    if (result.success) {
      setOrders(result.orders);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isConnected) {
      loadOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  const handleViewHistory = async (product) => {
    setSelectedProduct(product);
    const result = await getProductHistory(product.id);
    if (result.success) {
      setHistory(result.history);
      setShowHistoryModal(true);
    }
  };

  const getStateLabel = (state) => {
    const states = ['Created', 'Ordered', 'InTransit', 'Stored', 'Delivered'];
    return states[state] || 'Unknown';
  };

  const getStateBadgeClass = (state) => {
    const classes = {
      0: 'bg-secondary',
      1: 'bg-warning',
      2: 'bg-info',
      3: 'bg-primary',
      4: 'bg-success'
    };
    return classes[state] || 'bg-secondary';
  };

  const getStateIcon = (state) => {
    const icons = {
      0: 'bi-box',
      1: 'bi-cart-check',
      2: 'bi-truck',
      3: 'bi-building',
      4: 'bi-check-circle'
    };
    return icons[state] || 'bi-question-circle';
  };

  if (!isConnected) {
    return (
      <div className="container">
        <div className="alert alert-warning text-center">
          <h4>Please connect your wallet</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Orders</h1>
        <button className="btn btn-outline-primary" onClick={loadOrders}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="alert alert-info text-center">
          <h4>No orders yet</h4>
          <p>Visit the Marketplace to order products!</p>
        </div>
      ) : (
        <div className="row">
          {orders.map((order) => (
            <div key={order.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="bi bi-box-seam text-primary me-2"></i>
                    {order.name}
                  </h5>
                  <hr />
                  <div className="product-details">
                    <p className="mb-2">
                      <strong>ID:</strong> {order.id}
                    </p>
                    <p className="mb-2">
                      <strong>Origin:</strong> {order.origin}
                    </p>
                    <p className="mb-2">
                      <strong>Current Owner:</strong>
                      <br />
                      <small className="text-muted font-monospace">
                        {order.currentOwner}
                      </small>
                    </p>
                    <p className="mb-2">
                      <strong>Status:</strong>{' '}
                      <span className={`badge ${getStateBadgeClass(order.state)}`}>
                        <i className={`${getStateIcon(order.state)} me-1`}></i>
                        {getStateLabel(order.state)}
                      </span>
                    </p>
                    {order.state === 4 && (
                      <div className="alert alert-success mt-2 mb-0">
                        <i className="bi bi-check-circle me-2"></i>
                        <strong>Delivered!</strong> You now own this product.
                      </div>
                    )}
                  </div>
                </div>
                <div className="card-footer bg-transparent">
                  <button
                    className="btn btn-outline-primary w-100"
                    onClick={() => handleViewHistory(order)}
                  >
                    <i className="bi bi-clock-history me-2"></i>
                    View History
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-clock-history me-2"></i>
                  Ownership History
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowHistoryModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <h6>{selectedProduct?.name}</h6>
                <p className="text-muted">Product ID: {selectedProduct?.id}</p>
                <hr />
                <div className="timeline">
                  {history.map((owner, index) => (
                    <div key={index} className="timeline-item mb-3">
                      <div className="d-flex align-items-center">
                        <div className="timeline-marker bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px', minWidth: '30px' }}>
                          {index + 1}
                        </div>
                        <div className="ms-3 flex-grow-1">
                          <small className="text-muted">
                            {index === 0 ? 'Created by' : index === history.length - 1 ? 'Current Owner' : 'Transferred to'}
                          </small>
                          <div className="font-monospace small text-break">
                            {owner}
                          </div>
                        </div>
                      </div>
                      {index < history.length - 1 && (
                        <div className="timeline-line ms-3" style={{ borderLeft: '2px solid #dee2e6', height: '20px', marginLeft: '14px' }}></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowHistoryModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;

