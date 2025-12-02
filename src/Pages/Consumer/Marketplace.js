import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Services/Contexts/AuthContext';
import { useContract } from '../../Services/Contexts/ContractContext';
import './Consumer.css';

/**
 * Marketplace Page
 * Shows all available products (in Created state) that consumers can order
 */
const Marketplace = () => {
  const { isConnected } = useAuth();
  const { getAvailableProducts, placeOrder } = useContract();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadProducts = async () => {
    setIsLoading(true);
    const result = await getAvailableProducts();
    if (result.success) {
      setProducts(result.products);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isConnected) {
      loadProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  const handleOrder = async (productId) => {
    if (!window.confirm('Are you sure you want to order this product?')) {
      return;
    }

    setActionLoading({ ...actionLoading, [productId]: true });
    setMessage({ type: '', text: '' });

    const result = await placeOrder(productId);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Order placed successfully! Check "My Orders" to track it.' });
      await loadProducts();
    } else {
      setMessage({ type: 'danger', text: result.error });
    }

    setActionLoading({ ...actionLoading, [productId]: false });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const getStateLabel = (state) => {
    const states = ['Created', 'Ordered', 'InTransit', 'Stored', 'Delivered'];
    return states[state] || 'Unknown';
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
        <h1>Marketplace</h1>
        <button className="btn btn-outline-primary" onClick={loadProducts}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}

      {isLoading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="alert alert-info text-center">
          <h4>No products available</h4>
          <p>Check back later for new products!</p>
        </div>
      ) : (
        <div className="row">
          {products.map((product) => (
            <div key={product.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="bi bi-box-seam text-primary me-2"></i>
                    {product.name}
                  </h5>
                  <hr />
                  <div className="product-details">
                    <p className="mb-2">
                      <strong>ID:</strong> {product.id}
                    </p>
                    <p className="mb-2">
                      <strong>Origin:</strong> {product.origin}
                    </p>
                    <p className="mb-2">
                      <strong>Farmer:</strong>
                      <br />
                      <small className="text-muted font-monospace">
                        {product.currentOwner}
                      </small>
                    </p>
                    <p className="mb-2">
                      <strong>Status:</strong>{' '}
                      <span className="badge bg-success">
                        {getStateLabel(product.state)}
                      </span>
                    </p>
                    <p className="mb-2">
                      <strong>Authentic:</strong>{' '}
                      {product.isAuthentic ? (
                        <span className="badge bg-success">
                          <i className="bi bi-check-circle me-1"></i>
                          Verified
                        </span>
                      ) : (
                        <span className="badge bg-warning">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          Pending
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="card-footer bg-transparent">
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => handleOrder(product.id)}
                    disabled={actionLoading[product.id]}
                  >
                    {actionLoading[product.id] ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Ordering...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-cart-plus me-2"></i>
                        Order Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;

