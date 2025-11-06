import React, { useState } from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';
import TransferOwnershipModal from './TransferOwnershipModal';

/**
 * Product Details Modal
 * Display complete product information and history
 */
const ProductDetailsModal = ({ show, onHide, product }) => {
  const [showTransferModal, setShowTransferModal] = useState(false);

  if (!product) return null;

  const handleTransferClick = () => {
    setShowTransferModal(true);
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
          <Button variant="primary" onClick={handleTransferClick}>
            Transfer Ownership
          </Button>
        </Modal.Footer>
      </Modal>

      <TransferOwnershipModal
        show={showTransferModal}
        onHide={() => setShowTransferModal(false)}
        productId={product.id}
      />
    </>
  );
};

export default ProductDetailsModal;

