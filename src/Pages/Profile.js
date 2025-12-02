import React from 'react';
import { useSupplyChain } from '../Services/Contexts/SupplyChainContext';

/**
 * Profile Page
 */
const Profile = () => {
  const { account, isConnected, networkId, isAdmin, isFarmer, isDistributor, contractOwner, role } = useSupplyChain();

  if (!isConnected) {
    return (
      <div className="container">
        <div className="alert alert-warning text-center">
          <h4>Please connect your wallet to view your profile</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="mb-4">Profile</h1>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Account Information</h5>
          <div className="row">
            <div className="col-md-6">
              <p><strong>Address:</strong></p>
              <p className="text-break">{account}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Network ID:</strong></p>
              <p>{networkId}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Roles & Permissions</h5>
          <div className="mb-3">
            <strong>Current Role:</strong>
            <div className="mt-2">
              {isAdmin && <span className="badge bg-danger me-2">Admin</span>}
              {isFarmer && <span className="badge bg-success me-2">Verified Farmer</span>}
              {isDistributor && <span className="badge bg-info me-2">Distributor</span>}
              {!isAdmin && !isFarmer && !isDistributor && <span className="badge bg-secondary">Consumer</span>}
              <small className="text-muted ms-2">(Role: {role})</small>
            </div>
          </div>
          
          <div className="mt-3">
            <strong>Permissions:</strong>
            <ul className="mt-2">
              <li>View products and their history</li>
              <li>Verify product authenticity</li>
              {isFarmer && <li>Register new products</li>}
              {isFarmer && <li>Transfer product ownership</li>}
              {isAdmin && <li>Verify farmers</li>}
              {isAdmin && <li>Manage system settings</li>}
            </ul>
          </div>
        </div>
      </div>

      {contractOwner && (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Contract Information</h5>
            <p><strong>Contract Owner:</strong></p>
            <p className="text-break">{contractOwner}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

