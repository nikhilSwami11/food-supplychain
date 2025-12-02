import React, { useState } from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';
import { useAuth } from '../../Services/Contexts/AuthContext';
import { useContract } from '../../Services/Contexts/ContractContext';
import TransferOwnershipModal from './TransferOwnershipModal';
import UpdateStatusModal from './UpdateStatusModal';


const ProductDetailsModal = ({ show, onHide, product, history }) => {
  const { account } = useAuth();
  const { isFarmer, isDistributor } = useContract();
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);

  if (!product) return null;

  const handleTransferClick = () => {
    setShowTransferModal(true);
  };

  const handleUpdateStatusClick = () => {
    setShowUpdateStatusModal(true);
  };

  // Map state number to readable text
  const getStateText = (state) => {
    const states = ['Created', 'Ordered', 'InTransit', 'Stored', 'Delivered'];
    return states[state] || 'Unknown';
  };

  // Get badge color based on state
  const getStateBadgeColor = (state) => {
    const colors = ['secondary', 'info', 'primary', 'warning', 'success'];
    return colors[state] || 'secondary';
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Product Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <h5>Basic Information</h5>
            <table className="table">
              <tbody>
                <tr>
                  <th>Product ID:</th>
                  <td>{product.id}</td>
                </tr>
                <tr>
                  <th>Name:</th>
                  <td>{product.name}</td>
                </tr>
                <tr>
                  <th>Origin:</th>
                  <td>{product.origin}</td>
                </tr>
                <tr>
                  <th>Current Owner:</th>
                  <td className="text-break">{product.currentOwner}</td>
                </tr>
                <tr>
                  <th>Authenticity:</th>
                  <td>
                    {product.isAuthentic ? (
                      <Badge bg="success">Authentic</Badge>
                    ) : (
                      <Badge bg="danger">Not Verified</Badge>
                    )}
                  </td>
                </tr>
                <tr>
                  <th>Status:</th>
                  <td>
                    <Badge bg={getStateBadgeColor(product.state)}>
                      {getStateText(product.state)}
                    </Badge>
                  </td>
                </tr>
                <tr>
                  <th>IPFS Hash:</th>
                  <td className="text-break">
                    {product.ipfsHash || 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h5>Ownership History</h5>
            {history && history.length > 0 ? (
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
            ) : (
              <p className="text-muted">No history available</p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
          {account && product.currentOwner &&
            account.toLowerCase() === product.currentOwner.toLowerCase() &&
            (isFarmer || isDistributor) && (
              <>
                <Button variant="info" onClick={handleUpdateStatusClick}>
                  <i className="bi bi-arrow-repeat me-2"></i>
                  Update Status
                </Button>
                <Button variant="primary" onClick={handleTransferClick}>
                  <i className="bi bi-arrow-left-right me-2"></i>
                  Transfer Ownership
                </Button>
              </>
            )}
        </Modal.Footer>
      </Modal>

      <TransferOwnershipModal
        show={showTransferModal}
        onHide={() => setShowTransferModal(false)}
        productId={product.id}
      />

      <UpdateStatusModal
        show={showUpdateStatusModal}
        onHide={() => setShowUpdateStatusModal(false)}
        productId={product.id}
        currentState={product.state}
      />
    </>
  );
};

export default ProductDetailsModal;

