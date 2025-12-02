import React, { useState, useEffect } from 'react';
import { useSupplyChain, ProductStateLabels } from '../../Services/Contexts/SupplyChainContext';
import TransferOwnershipModal from '../../Components/Modals/TransferOwnershipModal';
import UpdateStatusModal from '../../Components/Modals/UpdateStatusModal';
import './Consumer.css';

/**
 * My Orders Page
 * Shows all products ordered by the current user
 */
const MyOrders = () => {
  const { isConnected, consumer, common, isFarmer, account, getMyOrders, getProductHistory } = useSupplyChain();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [history, setHistory] = useState([]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const myOrders = await consumer.getMyOrders();
      const uniqueOrders = Array.from(new Map(myOrders.orders.map(item => [item.id, item])).values());
      setOrders(uniqueOrders);
    } catch (err) {
      console.error('Error loading orders:', err);
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
      const productHistory = await common.getProductHistory(product.id);
      setHistory(productHistory);
      setShowHistoryModal(true);
  };

  const handleTransfer = (product) => {
    setSelectedProduct(product);
    setShowTransferModal(true);
  };

  const handleUpdateStatus = (product) => {
    setSelectedProduct(product);
    setShowUpdateStatusModal(true);
  };

  const handleModalClose = () => {
    setShowTransferModal(false);
    setShowUpdateStatusModal(false);
    loadOrders(); // Refresh list after action
  };

  const getStateLabel = (state) => {
    return ProductStateLabels[parseInt(state)] || 'Unknown';
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
        <h1>{isFarmer ? 'Orders' : 'My Orders'}</h1>
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
                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => handleViewHistory(order)}
                    >
                      <i className="bi bi-clock-history me-2"></i>
                      View History
                    </button>
                    {isFarmer && order.currentOwner.toLowerCase() === account.toLowerCase() && (
                      <>
                        <button
                          className="btn btn-outline-success"
                          onClick={() => handleUpdateStatus(order)}
                        >
                          <i className="bi bi-pencil-square me-2"></i>
                          Update Status
                        </button>
                        <button
                          className="btn btn-outline-warning"
                          onClick={() => handleTransfer(order)}
                        >
                          <i className="bi bi-arrow-right-circle me-2"></i>
                          Transfer Ownership
                        </button>
                      </>
                    )}
                  </div>
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
                  {history.map((event, index) => (
                    <div key={index} className="timeline-item mb-3">
                      <div className="d-flex align-items-center">
                        <div className={`timeline-marker text-white rounded-circle d-flex align-items-center justify-content-center ${event.type === 'Registered' ? 'bg-success' :
                          event.type === 'Transferred' ? 'bg-warning' : 'bg-primary'
                          }`} style={{ width: '30px', height: '30px', minWidth: '30px' }}>
                          <i className={`bi ${event.type === 'Registered' ? 'bi-star-fill' :
                            event.type === 'Transferred' ? 'bi-arrow-right' : 'bi-arrow-repeat'
                            } small`}></i>
                        </div>
                        <div className="ms-3 flex-grow-1">
                          <div className="d-flex justify-content-between">
                            <strong>{event.type}</strong>
                            <small className="text-muted">Block: {event.blockNumber}</small>
                          </div>
                          <p className="mb-1 small">{event.details}</p>
                          <small className="text-muted d-block">
                            Actor: <span className="font-monospace">{event.user}</span>
                          </small>
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

      <TransferOwnershipModal
        show={showTransferModal}
        onHide={handleModalClose}
        productId={selectedProduct?.id}
      />

      <UpdateStatusModal
        show={showUpdateStatusModal}
        onHide={handleModalClose}
        productId={selectedProduct?.id}
        currentState={selectedProduct?.state}
        currentIpfsHash={selectedProduct?.ipfsHash}
      />
    </div>
  );
};

export default MyOrders;

