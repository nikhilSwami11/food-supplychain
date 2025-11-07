import React, { createContext, useState, useEffect, useContext } from 'react';
import { initWeb3, getCurrentAccount, onAccountChange, onNetworkChange } from '../Utils/web3Utils';

/**
 * Authentication Context
 * Manages user authentication and wallet connection
 */

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  
  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { web3: web3Instance, account: userAccount, networkId: netId } = await initWeb3();
      
      setWeb3(web3Instance);
      setAccount(userAccount);
      setNetworkId(netId);
      setIsConnected(true);
      
     
      localStorage.setItem('walletConnected', 'true');
      
      return { success: true, account: userAccount };
    } catch (err) {
      setError(err.message);
      setIsConnected(false);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  
  const disconnectWallet = () => {
    setAccount(null);
    setWeb3(null);
    setNetworkId(null);
    setIsConnected(false);
    localStorage.removeItem('walletConnected');
  };

  
  const handleAccountChange = (newAccount) => {
    if (newAccount) {
      setAccount(newAccount);
    } else {
      disconnectWallet();
    }
  };

  
  const handleNetworkChange = (chainId) => {
    
    window.location.reload();
  };

  
  useEffect(() => {
    const wasConnected = localStorage.getItem('walletConnected');
    if (wasConnected === 'true') {
      connectWallet();
    }
  }, []);

 
  useEffect(() => {
    if (isConnected) {
      onAccountChange(handleAccountChange);
      onNetworkChange(handleNetworkChange);
    }
  }, [isConnected]);

  const value = {
    account,
    web3,
    networkId,
    isConnected,
    isLoading,
    error,
    connectWallet,
    disconnectWallet
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

