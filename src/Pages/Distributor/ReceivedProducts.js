import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Services/Contexts/AuthContext';
import { useContract } from '../../Services/Contexts/ContractContext';
import './Distributor.css';

/**
 * Received Products Page
 * Shows products in InTransit state that need to be marked as stored
 */
const ReceivedProducts = () => {
  const { isConnected } = useAuth();
  const { isDistributor, getReceivedProducts, updateStatus } = useContract();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadProducts = async () => {
    setIsLoading(true);
    const result = await getReceivedProducts();
    if (result.success) {
      setProducts(result.received);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isConnected && isDistributor) {
      loadProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, isDistributor]);

  const handleMarkAsStored = async (productId) => {
    setActionLoading({ ...actionLoading, [productId]: true });
    setMessage({ type: '', text: '' });

    const result = await updateStatus(productId, 3, 'Product received and stored in warehouse');
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Product marked as stored successfully!' });
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
      <h1 className="mb-4">Received Products</h1>
      <p className="text-muted mb-4">
        Products that have been shipped to you and are in transit. Mark them as stored once received.
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
          <p className="mt-3">Loading received products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-inbox"></i>
          <h4>No Products In Transit</h4>
          <p>You don't have any products currently in transit.</p>
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
                <span className="state-badge state-intransit">
                  <i className="bi bi-truck"></i>
                  In Transit
                </span>
              </div>

              <div className="product-details">
                <div className="detail-item">
                  <span className="detail-label">Origin</span>
                  <span className="detail-value">{product.origin}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Ordered By</span>
                  <span className="detail-value address-value">
                    {product.orderedBy === '0x0000000000000000000000000000000000000000' 
                      ? 'Not ordered' 
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
                  className="btn btn-info"
                  onClick={() => handleMarkAsStored(product.id)}
                  disabled={actionLoading[product.id]}
                >
                  {actionLoading[product.id] ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-archive me-2"></i>
                      Mark as Stored
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReceivedProducts;

