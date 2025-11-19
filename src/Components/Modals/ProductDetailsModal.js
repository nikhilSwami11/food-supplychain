import React, { useState } from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';
import TransferOwnershipModal from './TransferOwnershipModal';
import UpdateStatusModal from './UpdateStatusModal';


const ProductDetailsModal = ({ show, onHide, product }) => {
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
    const states = ['Created', 'InTransit', 'Stored', 'Delivered'];
    return states[state] || 'Unknown';
  };

  // Get badge color based on state
  const getStateBadgeColor = (state) => {
    const colors = ['secondary', 'primary', 'warning', 'success'];
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
            {product.ownershipHistory && product.ownershipHistory.length > 0 ? (
              <div className="timeline">
                {product.ownershipHistory.map((owner, index) => (
                  <div key={index} className="timeline-item mb-3">
                    <div className="d-flex align-items-center">
                      <div className="timeline-marker bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px', minWidth: '30px' }}>
                        {index + 1}
                      </div>
                      <div className="ms-3 flex-grow-1">
                        <p className="mb-0 text-break">{owner}</p>
                        <small className="text-muted">
                          {index === 0 ? 'Original Owner' : `Transfer ${index}`}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No ownership history available</p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
          <Button variant="info" onClick={handleUpdateStatusClick}>
            <i className="bi bi-arrow-repeat me-2"></i>
            Update Status
          </Button>
          <Button variant="primary" onClick={handleTransferClick}>
            <i className="bi bi-arrow-left-right me-2"></i>
            Transfer Ownership
          </Button>
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

