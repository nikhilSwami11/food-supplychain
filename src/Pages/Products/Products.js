import React, { useState } from 'react';
import { useSupplyChain } from '../../Services/Contexts/SupplyChainContext';
import RegisterProductModal from '../../Components/Modals/RegisterProductModal';
import ProductDetailsModal from '../../Components/Modals/ProductDetailsModal';
import './Products.css';

/**
 * Products Page
 */
const Products = () => {
  const { isConnected, isFarmer, common, getProduct, getProductHistory } = useSupplyChain();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productHistory, setProductHistory] = useState([]);
  const [searchError, setSearchError] = useState('');

  const handleSearch = async () => {
    if (!searchId) {
      setSearchError('Please enter a product ID');
      return;
    }

    setSearchError('');
    try {
      const product = await common.getProduct(parseInt(searchId));
      if (product.id === '0') {
        setSearchError('Product not found');
      } else {
        setSelectedProduct(product);
        const history = await getProductHistory(product.id);
        setProductHistory(history);
        setShowDetailsModal(true);
      }
    } catch (err) {
      setSearchError(err.message);
    }
  };

  if (!isConnected) {
    return (
      <div className="container">
        <div className="alert alert-warning text-center">
          <h4>Please connect your wallet to view products</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Products</h1>
        {isFarmer && (
          <button
            className="btn btn-success"
            onClick={() => setShowRegisterModal(true)}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Register Product
          </button>
        )}
      </div>

      {/* Search Section */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Search Product</h5>
          <div className="row">
            <div className="col-md-8">
              <input
                type="number"
                className="form-control"
                placeholder="Enter Product ID"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <button className="btn btn-primary w-100" onClick={handleSearch}>
                <i className="bi bi-search me-2"></i>
                Search
              </button>
            </div>
          </div>
          {searchError && (
            <div className="alert alert-danger mt-3 mb-0">{searchError}</div>
          )}
        </div>
      </div>




      {/* Info Section */}
      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="info-card">
            <i className="bi bi-search fs-1 text-primary"></i>
            <h5 className="mt-3">Search Products</h5>
            <p>Enter a product ID to view its complete history and verify authenticity</p>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="info-card">
            <i className="bi bi-shield-check fs-1 text-success"></i>
            <h5 className="mt-3">Verify Authenticity</h5>
            <p>Check if a product is genuine and registered on the blockchain</p>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="info-card">
            <i className="bi bi-clock-history fs-1 text-info"></i>
            <h5 className="mt-3">Track History</h5>
            <p>View the complete ownership history and journey of any product</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RegisterProductModal
        show={showRegisterModal}
        onHide={() => setShowRegisterModal(false)}
      />
      <ProductDetailsModal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        product={selectedProduct}
        history={productHistory}
      />
    </div >
  );
};

export default Products;

