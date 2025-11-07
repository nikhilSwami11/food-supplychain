import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useContract } from '../../Services/Contexts/ContractContext';


const TransferOwnershipModal = ({ show, onHide, productId }) => {
  const { transferOwnership } = useContract();
  const [newOwner, setNewOwner] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newOwner) {
      setMessage({ type: 'danger', text: 'Please enter new owner address' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const result = await transferOwnership(parseInt(productId), newOwner);

    if (result.success) {
      setMessage({ type: 'success', text: 'Ownership transferred successfully!' });
      setNewOwner('');
      setTimeout(() => {
        onHide();
        setMessage({ type: '', text: '' });
      }, 2000);
    } else {
      setMessage({ type: 'danger', text: result.error });
    }

    setIsLoading(false);
  };

  const handleClose = () => {
    setNewOwner('');
    setMessage({ type: '', text: '' });
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Transfer Ownership</Modal.Title>
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
            <Form.Label>New Owner Address</Form.Label>
            <Form.Control
              type="text"
              placeholder="0x..."
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
              disabled={isLoading}
            />
            <Form.Text className="text-muted">
              Enter the Ethereum address of the new owner
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
                  Transferring...
                </>
              ) : (
                'Transfer'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default TransferOwnershipModal;

