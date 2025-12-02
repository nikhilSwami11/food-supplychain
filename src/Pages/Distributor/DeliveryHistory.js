import React, { useState, useEffect } from 'react';
import { useSupplyChain } from '../../Services/Contexts/SupplyChainContext';
import './Distributor.css';

/**
 * Delivery History Page
 * Shows products that have been delivered by the distributor
 */
const DeliveryHistory = () => {
  const { isConnected, isDistributor, distributor } = useSupplyChain();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const history = await distributor.getDeliveryHistory();
      setProducts(history);
    } catch (err) {
      console.error('Error loading delivery history:', err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isConnected && isDistributor) {
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, isDistributor]);

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
      <h1 className="mb-4">Delivery History</h1>
      <p className="text-muted mb-4">
        Products that you have successfully delivered to consumers.
      </p>

      {isLoading ? (
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading delivery history...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-clock-history"></i>
          <h4>No Delivery History</h4>
          <p>You haven't delivered any products yet.</p>
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
                <span className="state-badge state-delivered">
                  <i className="bi bi-check-circle"></i>
                  Delivered
                </span>
              </div>

              <div className="product-details">
                <div className="detail-item">
                  <span className="detail-label">Origin</span>
                  <span className="detail-value">{product.origin}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Delivered To</span>
                  <span className="detail-value address-value">
                    {product.currentOwner === '0x0000000000000000000000000000000000000000' 
                      ? 'Unknown' 
                      : `${product.currentOwner.substring(0, 10)}...${product.currentOwner.substring(product.currentOwner.length - 4)}`}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Originally Ordered By</span>
                  <span className="detail-value address-value">
                    {product.orderedBy === '0x0000000000000000000000000000000000000000' 
                      ? 'Not ordered' 
                      : `${product.orderedBy.substring(0, 10)}...${product.orderedBy.substring(product.orderedBy.length - 4)}`}
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
                <span className="text-success">
                  <i className="bi bi-check-circle me-2"></i>
                  Successfully delivered
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && products.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-muted">
            Total deliveries: <strong>{products.length}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default DeliveryHistory;

