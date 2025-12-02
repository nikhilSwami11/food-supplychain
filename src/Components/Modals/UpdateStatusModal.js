import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useSupplyChain, ProductState, ProductStateLabels } from '../../Services/Contexts/SupplyChainContext';


const UpdateStatusModal = ({ show, onHide, productId, currentState }) => {
  const { contract, account } = useSupplyChain();
  const [newState, setNewState] = useState(currentState || 0);
  const [ipfsData, setIpfsData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const stateOptions = Object.entries(ProductState).map(([key, value]) => ({
    value,
    label: ProductStateLabels[value]
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ipfsData) {
      setMessage({ type: 'danger', text: 'Please enter IPFS data for this status update' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await contract.methods.updateStatus(parseInt(productId), parseInt(newState), ipfsData).send({ from: account });
      setMessage({ type: 'success', text: 'Status updated successfully!' });
      setIpfsData('');
      setTimeout(() => {
        onHide();
        setMessage({ type: '', text: '' });
      }, 2000);
    } catch (err) {
      setMessage({ type: 'danger', text: err.message });
    }

    setIsLoading(false);
  };

  const handleClose = () => {
    setNewState(currentState || 0);
    setIpfsData('');
    setMessage({ type: '', text: '' });
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Update Product Status</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Product ID</Form.Label>
            <Form.Control
              type="text"
              value={productId}
              disabled
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>New Status</Form.Label>
            <Form.Select
              value={newState}
              onChange={(e) => setNewState(e.target.value)}
              disabled={isLoading}
            >
              {stateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              Select the new status for this product
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>IPFS Data</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter IPFS hash or data for this status update"
              value={ipfsData}
              onChange={(e) => setIpfsData(e.target.value)}
              disabled={isLoading}
            />
            <Form.Text className="text-muted">
              IPFS hash containing details about this status update (location, timestamp, etc.)
            </Form.Text>
          </Form.Group>

          {message.text && (
            <div className={`alert alert-${message.type}`} role="alert">
              {message.text}
            </div>
          )}

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateStatusModal;

