import React, { useState } from 'react';
import { useAuth } from '../../Services/Contexts/AuthContext';
import { useContract } from '../../Services/Contexts/ContractContext';
import RegisterProductModal from '../../Components/Modals/RegisterProductModal';
import ProductDetailsModal from '../../Components/Modals/ProductDetailsModal';
import './Products.css';

/**
 * Products Page
 */
const Products = () => {
  const { isConnected } = useAuth();
  const { isFarmer, getProduct, getDistributorInventory } = useContract();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [ownedProducts, setOwnedProducts] = useState([]);
  const [isLoadingOwned, setIsLoadingOwned] = useState(false);

  const loadOwnedProducts = async () => {
    setIsLoadingOwned(true);
    const result = await getDistributorInventory();
    if (result.success) {
      setOwnedProducts(result.inventory);
    }
    setIsLoadingOwned(false);
  };

  React.useEffect(() => {
    if (isConnected) {
      loadOwnedProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  const handleSearch = async () => {
    if (!searchId) {
      setSearchError('Please enter a product ID');
      return;
    }

    setSearchError('');
    const result = await getProduct(parseInt(searchId));

    if (result.success) {
      if (result.product.id === '0') {
        setSearchError('Product not found');
      } else {
        setSelectedProduct(result.product);
        setShowDetailsModal(true);
      }
    } else {
      setSearchError(result.error);
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
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


      {/* Owned Products Section */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Owned Products</h2>
          <button className="btn btn-outline-secondary btn-sm" onClick={loadOwnedProducts}>
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
          </button>
        </div>

        {isLoadingOwned ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : ownedProducts.length === 0 ? (
          <div className="alert alert-light text-center border">
            <p className="mb-0">You don't own any products yet.</p>
          </div>
        ) : (
          <div className="row">
            {ownedProducts.map((product) => (
              <div key={product.id} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100 shadow-sm product-card" onClick={() => handleProductClick(product)} style={{ cursor: 'pointer' }}>
                  <div className="card-body">
                    <h5 className="card-title text-primary">
                      <i className="bi bi-box-seam me-2"></i>
                      {product.name}
                    </h5>
                    <h6 className="card-subtitle mb-2 text-muted">ID: {product.id}</h6>
                    <p className="card-text">
                      <small className="text-muted">Origin: {product.origin}</small>
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="badge bg-info text-dark">
                        Owned
                      </span>
                      <button className="btn btn-sm btn-outline-primary">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
      />
    </div >
  );
};

export default Products;

