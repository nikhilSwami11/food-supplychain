import React, { createContext, useState, useEffect, useContext } from 'react';
import { initWeb3, onAccountChange, onNetworkChange } from '../Utils/web3Utils';

/**
 * Authentication Context
 * Manages user authentication and wallet connection
 */

const AuthContext = createContext();

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
    console.log('Disconnecting wallet...');
    setAccount(null);
    setWeb3(null);
    setNetworkId(null);
    setIsConnected(false);
    setError(null);
    localStorage.removeItem('walletConnected');

    // Reload the page to clear all state
    window.location.reload();
  };


  const handleAccountChange = async (accounts) => {
    if (accounts && accounts.length > 0) {
      const newAccount = accounts[0];
      console.log('Account changed to:', newAccount);
      setAccount(newAccount);

      // Reload the page to refresh all contract data
      window.location.reload();
    } else {
      console.log('No accounts found, disconnecting');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

