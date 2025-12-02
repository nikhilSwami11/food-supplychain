import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useSupplyChain } from '../../Services/Contexts/SupplyChainContext';


const RegisterProductModal = ({ show, onHide }) => {
  const { farmer } = useSupplyChain();
  const [formData, setFormData] = useState({
    productId: '',
    productName: '',
    origin: '',
    ipfsHash: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.productId || !formData.productName || !formData.origin || !formData.ipfsHash) {
      setMessage({ type: 'danger', text: 'Please fill in all fields' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await farmer.registerProduct(
        parseInt(formData.productId),
        formData.productName,
        formData.origin,
        formData.ipfsHash
      );
      setMessage({ type: 'success', text: 'Product registered successfully!' });
      setFormData({ productId: '', productName: '', origin: '', ipfsHash: '' });
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
    setFormData({ productId: '', productName: '', origin: '', ipfsHash: '' });
    setMessage({ type: '', text: '' });
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Register New Product</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Product ID</Form.Label>
            <Form.Control
              type="number"
              name="productId"
              placeholder="Enter unique product ID"
              value={formData.productId}
              onChange={handleChange}
              disabled={isLoading}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Product Name</Form.Label>
            <Form.Control
              type="text"
              name="productName"
              placeholder="Enter product name"
              value={formData.productName}
              onChange={handleChange}
              disabled={isLoading}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Origin</Form.Label>
            <Form.Control
              type="text"
              name="origin"
              placeholder="Enter product origin"
              value={formData.origin}
              onChange={handleChange}
              disabled={isLoading}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>IPFS Hash</Form.Label>
            <Form.Control
              type="text"
              name="ipfsHash"
              placeholder="Enter IPFS hash for product data"
              value={formData.ipfsHash}
              onChange={handleChange}
              disabled={isLoading}
            />
            <Form.Text className="text-muted">
              IPFS hash for storing additional product information
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
                  Registering...
                </>
              ) : (
                'Register Product'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default RegisterProductModal;

