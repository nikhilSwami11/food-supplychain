import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Services/Contexts/AuthContext';
import { useContract } from '../../Services/Contexts/ContractContext';
import './Distributor.css';

/**
 * Distributor Inventory Page
 * Shows all products currently owned by the distributor
 */
const Inventory = () => {
  const { isConnected } = useAuth();
  const { isDistributor, getDistributorInventory, updateStatus } = useContract();
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadInventory = async () => {
    setIsLoading(true);
    const result = await getDistributorInventory();
    if (result.success) {
      setInventory(result.inventory);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isConnected && isDistributor) {
      loadInventory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, isDistributor]);

  const getStateLabel = (state) => {
    const states = ['Created', 'Ordered', 'InTransit', 'Stored', 'Delivered'];
    return states[parseInt(state)] || 'Unknown';
  };

  const getStateBadgeClass = (state) => {
    const classes = {
      '0': 'state-created',
      '1': 'state-ordered',
      '2': 'state-intransit',
      '3': 'state-stored',
      '4': 'state-delivered'
    };
    return classes[state] || '';
  };

  const handleMarkAsStored = async (productId) => {
    setActionLoading({ ...actionLoading, [productId]: true });
    setMessage({ type: '', text: '' });

    const result = await updateStatus(productId, 3, 'Product stored in warehouse');
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Product marked as stored successfully!' });
      await loadInventory();
    } else {
      setMessage({ type: 'danger', text: result.error });
    }

    setActionLoading({ ...actionLoading, [productId]: false });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleDeliver = async (productId) => {
    if (!window.confirm('Are you sure you want to mark this product as delivered? This will transfer ownership to the consumer.')) {
      return;
    }

    setActionLoading({ ...actionLoading, [productId]: true });
    setMessage({ type: '', text: '' });

    const result = await updateStatus(productId, 4, 'Product delivered to consumer');
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Product delivered successfully! Ownership transferred to consumer.' });
      await loadInventory();
    } else {
      setMessage({ type: 'danger', text: result.error });
    }

    setActionLoading({ ...actionLoading, [productId]: false });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const filteredInventory = inventory.filter(product => {
    if (filter === 'all') return true;
    if (filter === 'intransit') return product.state === '2';
    if (filter === 'stored') return product.state === '3';
    return true;
  });

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
      <h1 className="mb-4">My Inventory</h1>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="filter-buttons">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({inventory.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'intransit' ? 'active' : ''}`}
          onClick={() => setFilter('intransit')}
        >
          In Transit ({inventory.filter(p => p.state === '2').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'stored' ? 'active' : ''}`}
          onClick={() => setFilter('stored')}
        >
          Stored ({inventory.filter(p => p.state === '3').length})
        </button>
      </div>

      {isLoading ? (
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading inventory...</p>
        </div>
      ) : filteredInventory.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-inbox"></i>
          <h4>No Products Found</h4>
          <p>You don't have any products in your inventory matching this filter.</p>
        </div>
      ) : (
        <div className="products-list">
          {filteredInventory.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-header">
                <div>
                  <h3 className="product-title">{product.name}</h3>
                  <p className="product-id">ID: {product.id}</p>
                </div>
                <span className={`state-badge ${getStateBadgeClass(product.state)}`}>
                  {getStateLabel(product.state)}
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
                      : `${product.orderedBy.substring(0, 10)}...`}
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
                {product.state === '2' && (
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
                )}
                {product.state === '3' && (
                  <button
                    className="btn btn-success"
                    onClick={() => handleDeliver(product.id)}
                    disabled={actionLoading[product.id]}
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
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inventory;

