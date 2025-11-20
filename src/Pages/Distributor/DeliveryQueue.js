import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Services/Contexts/AuthContext';
import { useContract } from '../../Services/Contexts/ContractContext';
import './Distributor.css';

/**
 * Delivery Queue Page
 * Shows products in Stored state ready to be delivered to consumers
 */
const DeliveryQueue = () => {
  const { isConnected } = useAuth();
  const { isDistributor, getDeliveryQueue, updateStatus } = useContract();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadProducts = async () => {
    setIsLoading(true);
    const result = await getDeliveryQueue();
    if (result.success) {
      setProducts(result.queue);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isConnected && isDistributor) {
      loadProducts();
    }
  }, [isConnected, isDistributor]);

  const handleDeliver = async (productId) => {
    if (!window.confirm('Are you sure you want to mark this product as delivered? This will transfer ownership to the consumer.')) {
      return;
    }

    setActionLoading({ ...actionLoading, [productId]: true });
    setMessage({ type: '', text: '' });

    const result = await updateStatus(productId, 4, 'Product delivered to consumer');
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Product delivered successfully! Ownership transferred to consumer.' });
      await loadProducts();
    } else {
      setMessage({ type: 'danger', text: result.error });
    }

    setActionLoading({ ...actionLoading, [productId]: false });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
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

  if (!isDistributor) {
    return (
      <div className="container">
        <div className="alert alert-danger text-center">
          <h4>Access Denied</h4>
          <p>Only authorized distributors can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="mb-4">Delivery Queue</h1>
      <p className="text-muted mb-4">
        Products stored in your warehouse ready to be delivered to consumers.
      </p>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}

      {isLoading ? (
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading delivery queue...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-inbox"></i>
          <h4>No Products Ready for Delivery</h4>
          <p>You don't have any products in storage ready to be delivered.</p>
        </div>
      ) : (
        <div className="products-list">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-header">
                <div>
                  <h3 className="product-title">{product.name}</h3>
                  <p className="product-id">ID: {product.id}</p>
                </div>
                <span className="state-badge state-stored">
                  <i className="bi bi-archive"></i>
                  Stored
                </span>
              </div>

              <div className="product-details">
                <div className="detail-item">
                  <span className="detail-label">Origin</span>
                  <span className="detail-value">{product.origin}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Deliver To</span>
                  <span className="detail-value address-value">
                    {product.orderedBy === '0x0000000000000000000000000000000000000000' 
                      ? 'No buyer' 
                      : `${product.orderedBy.substring(0, 10)}...${product.orderedBy.substring(product.orderedBy.length - 4)}`}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Current Owner</span>
                  <span className="detail-value address-value">
                    {`${product.currentOwner.substring(0, 10)}...${product.currentOwner.substring(product.currentOwner.length - 4)}`}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Authentic</span>
                  <span className="detail-value">
                    {product.isAuthentic ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
              </div>

              <div className="product-actions">
                <button
                  className="btn btn-success"
                  onClick={() => handleDeliver(product.id)}
                  disabled={actionLoading[product.id] || product.orderedBy === '0x0000000000000000000000000000000000000000'}
                >
                  {actionLoading[product.id] ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Delivering...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2"></i>
                      Deliver to Consumer
                    </>
                  )}
                </button>
                {product.orderedBy === '0x0000000000000000000000000000000000000000' && (
                  <small className="text-muted ms-2">No buyer assigned</small>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryQueue;

