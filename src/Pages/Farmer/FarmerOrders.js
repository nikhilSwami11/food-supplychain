import React, { useState, useEffect } from 'react';
import { useSupplyChain, ProductStateLabels } from '../../Services/Contexts/SupplyChainContext';
import './FarmerOrders.css';

/**
 * Farmer Orders Page
 * Shows orders placed by consumers for the farmer's products
 * Allows farmer to transfer products to distributors
 */
const FarmerOrders = () => {
  const { farmer, isFarmer, isAdmin, isConnected, account } = useSupplyChain();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [distributorAddresses, setDistributorAddresses] = useState({});
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isConnected && (isFarmer || isAdmin)) {
      loadOrders();
    } else {
      setIsLoading(false);
    }
  }, [isConnected, isFarmer, isAdmin]);

  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const farmerOrders = await farmer.getOrders();
      setOrders(farmerOrders);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDistributorAddressChange = (productId, address) => {
    setDistributorAddresses(prev => ({
      ...prev,
      [productId]: address
    }));
  };

  const handleTransferToDistributor = async (productId) => {
    const distributorAddress = distributorAddresses[productId];
    if (!distributorAddress || !distributorAddress.trim()) {
      setMessage({ type: 'danger', text: 'Please enter a distributor address' });
      return;
    }

    // Basic address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(distributorAddress)) {
      setMessage({ type: 'danger', text: 'Invalid Ethereum address format' });
      return;
    }

    setProcessingId(productId);
    setMessage({ type: '', text: '' });

    try {
      await farmer.transferToDistributor(productId, distributorAddress);
      setMessage({ type: 'success', text: `Product #${productId} transferred to distributor!` });
      // Reload orders
      await loadOrders();
      // Clear the address input
      setDistributorAddresses(prev => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });
    } catch (err) {
      console.error('Error transferring to distributor:', err);
      setMessage({ type: 'danger', text: err.message });
    } finally {
      setProcessingId(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">
          Please connect your wallet to view orders.
        </div>
      </div>
    );
  }

  if (!isFarmer && !isAdmin) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          Access denied. Only farmers can view this page.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">
        <i className="bi bi-cart-check me-2"></i>
        Farmer Orders
      </h2>
      <p className="text-muted mb-4">
        View orders placed by consumers and transfer products to distributors.
      </p>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`}>
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="alert alert-info">
          <h5>No orders yet</h5>
          <p className="mb-0">When consumers order your products, they will appear here.</p>
        </div>
      ) : (
        <div className="row">
          {orders.map((order) => (
            <div key={order.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 order-card">
                <div className="card-header bg-warning text-dark">
                  <strong>Order #{order.id}</strong>
                </div>
                <div className="card-body">
                  <h5 className="card-title">{order.name}</h5>
                  <p className="mb-2"><strong>Origin:</strong> {order.origin}</p>
                  <p className="mb-2">
                    <strong>Status:</strong>{' '}
                    <span className="badge bg-info">{ProductStateLabels[order.state]}</span>
                  </p>
                  <p className="mb-2">
                    <strong>Ordered By:</strong><br />
                    <small className="text-muted font-monospace">{order.orderedBy}</small>
                  </p>
                  <hr />
                  <div className="mb-3">
                    <label className="form-label">Distributor Address:</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="0x..."
                      value={distributorAddresses[order.id] || ''}
                      onChange={(e) => handleDistributorAddressChange(order.id, e.target.value)}
                      disabled={processingId === order.id}
                    />
                  </div>
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => handleTransferToDistributor(order.id)}
                    disabled={processingId === order.id}
                  >
                    {processingId === order.id ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Transferring...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-truck me-2"></i>
                        Transfer to Distributor
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

export default FarmerOrders;

