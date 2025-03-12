import React, { useState, useEffect, useCallback } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWalletClient, useChainId, useWaitForTransaction, useBalance } from 'wagmi';
import { ethers } from 'ethers';
import wethABI from './weth_abi_pulsechain.json';
import './index.css';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import pulsexABI from './pulsex_router_abi.json';
import { getPublicClient } from 'wagmi/actions';
import plsIcon from './pls_icon.png';
import wethIcon from './weth_icon.png';

import PairData from './PairData';

const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
const PULSEX_ROUTER_ADDRESS = '0x165C3410fC91EF562C50559f7d2289fEbed552d9';
const PLS_ADDRESS = '0xA1077a294dDE1B09bB078844df40758a5D0f9a27';
const PAIR_ADDRESS = '0x6b7a5b3754c15b8948f8c100b626b844ab6b44b5';

function App({ toggleDarkMode, darkMode }) {
  const pulsechain = 369;
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [wrapAmount, setWrapAmount] = useState('');
  const [unwrapAmount, setUnwrapAmount] = useState('');
  const [wrapTxHash, setWrapTxHash] = useState(null);
  const [unwrapTxHash, setUnwrapTxHash] = useState(null);
  const chainId = useChainId();
  const [wrapStatus, setWrapStatus] = useState(null);
  const [unwrapStatus, setUnwrapStatus] = useState(null);
  const addRecentTransaction = useAddRecentTransaction();
  const [errorModal, setErrorModal] = useState({ open: false, message: '' });
  const [plsPrice, setPlsPrice] = useState(0);
  const [wethPrice, setWethPrice] = useState(0);
  const [txHashModal, setTxHashModal] = useState({ open: false, hash: '', type: '' });
  const [wrapButtonText, setWrapButtonText] = useState('Wrap');
  const [unwrapButtonText, setUnwrapButtonText] = useState('Unwrap');
  const [isWrapButtonDisabled, setIsWrapButtonDisabled] = useState(false);
  const [isUnwrapButtonDisabled, setIsUnwrapButtonDisabled] = useState(false);

  const { data: plsBalanceData, isLoading: isPlsBalanceLoading } = useBalance({
    address: address,
    chainId: pulsechain,
    watch: true,
  });

  const { data: wethBalanceData, isLoading: isWethBalanceLoading } = useBalance({
    address: address,
    token: WETH_ADDRESS,
    chainId: pulsechain,
    watch: true,
  });

  const plsBalance = plsBalanceData ? formatBalance(ethers.formatEther(plsBalanceData.value)) : '0';
  const wethBalance = wethBalanceData ? formatBalance(ethers.formatEther(wethBalanceData.value)) : '0';

  function formatBalance(balance) {
    const balanceNum = parseFloat(balance);
    if (balanceNum >= 1000) {
      return (balanceNum / 1000).toFixed(1) + 'k';
    }
    return balanceNum.toFixed(2);
  }

  const {
    isLoading: isWrapLoading,
    isSuccess: isWrapSuccess,
    isError: isWrapError,
    error: wrapError,
  } = useWaitForTransaction({
    hash: wrapTxHash,
    onSuccess: (receipt) => {
      console.log('Wrap transaction successful', receipt);
      if (receipt && receipt.transactionHash && isValidTransactionHash(receipt.transactionHash)) {
        setWrapButtonText('Wrap');
        setIsWrapButtonDisabled(false);
        setWrapAmount('');
      } else {
        console.error("Invalid transaction hash:", receipt);
        setWrapButtonText('Wrap');
        setIsWrapButtonDisabled(false);
        setErrorModal({ open: true, message: `Failed to wrap ETH: Invalid transaction hash` });
        setWrapTxHash(null);
      }
    },
    onError: (error) => {
      console.error('Wrap transaction failed:', error);
      setWrapButtonText('Wrap');
      setIsWrapButtonDisabled(false);
      setErrorModal({ open: true, message: `Wrap failed: ${error?.message || 'Unknown error'}` });
      setWrapTxHash(null);
    }
  });

  const {
    isLoading: isUnwrapLoading,
    isSuccess: isUnwrapSuccess,
    isError: isUnwrapError,
    error: unwrapError,
  } = useWaitForTransaction({
    hash: unwrapTxHash,
    onSuccess: (receipt) => {
      console.log('Unwrap transaction successful', receipt);
      if (receipt && receipt.transactionHash && isValidTransactionHash(receipt.transactionHash)) {
        setUnwrapButtonText('Unwrap');
        setIsUnwrapButtonDisabled(false);
        setUnwrapAmount('');
      } else {
        console.error("Invalid transaction hash:", receipt);
        setUnwrapButtonText('Unwrap');
        setIsUnwrapButtonDisabled(false);
        setErrorModal({ open: true, message: `Failed to unwrap ETH: Invalid transaction hash` });
        setUnwrapTxHash(null);
      }
    },
    onError: (error) => {
      console.error('Unwrap transaction failed:', error);
      setUnwrapButtonText('Unwrap');
      setIsUnwrapButtonDisabled(false);
      setErrorModal({ open: true, message: `Unwrap failed: ${unwrapError?.message || 'Unknown error'}` });
      setUnwrapTxHash(null);
    }
  });

  const fetchPrices = useCallback(async () => {
    if (walletClient) {
      try {
        console.log('Fetching prices...');
        const provider = new ethers.BrowserProvider(walletClient, 'any');
        const routerContract = new ethers.Contract(PULSEX_ROUTER_ADDRESS, pulsexABI, provider);
        const amountIn = ethers.parseUnits('1', 'ether'); // 1 WETH
        const path = [WETH_ADDRESS, PLS_ADDRESS];
        const amountsOut = await routerContract.getAmountsOut(amountIn, path);
        const plsAmount = ethers.formatEther(amountsOut[1]);
        setPlsPrice(parseFloat(plsAmount));
        setWethPrice(1); // WETH is the base
        console.log('PLS price fetched:', plsAmount);
      } catch (error) {
        console.error("Error fetching prices:", error);
      }
    }
  }, [walletClient]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  useEffect(() => {
    if (isWrapLoading) {
      setWrapButtonText('Wrapping...');
      setIsWrapButtonDisabled(true);
    }
  }, [isWrapLoading]);

  useEffect(() => {
    if (isUnwrapLoading) {
      setUnwrapButtonText('Unwrapping...');
      setIsUnwrapButtonDisabled(true);
    }
  }, [isUnwrapLoading]);

  const isValidTransactionHash = (hash) => {
    return typeof hash === 'string' && hash.length === 66 && hash.startsWith('0x');
  };

  const handleWrap = async () => {
    if (!isConnected || !walletClient) {
      alert("Please connect your wallet.");
      return;
    }
    if (chainId !== pulsechain) {
      alert("Please switch to PulseChain.");
      return;
    }
    setWrapButtonText('Wrapping...');
    setIsWrapButtonDisabled(true);
    console.log('Starting wrap transaction...');
    try {
      const provider = new ethers.BrowserProvider(walletClient, 'any');
      const wethContract = new ethers.Contract(WETH_ADDRESS, wethABI, provider);
      const amount = ethers.parseEther(wrapAmount);
      console.log('Wrap amount:', amount);
      const transaction = {
        to: WETH_ADDRESS,
        value: amount,
        data: wethContract.interface.encodeFunctionData('deposit', [])
      };
      console.log('Sending wrap transaction:', transaction);
      const tx = await walletClient.sendTransaction(transaction);
      console.log('Wrap transaction sent, hash:', tx);
      if (tx) {
        const publicClient = getPublicClient({ chainId: pulsechain });
        const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log('Wrap transaction receipt:', receipt);
        if (receipt && receipt.transactionHash && isValidTransactionHash(receipt.transactionHash)) {
          setWrapTxHash(receipt.transactionHash);
          addRecentTransaction({
            hash: receipt.transactionHash,
            description: `Wrap ${wrapAmount} ETH`,
          });
          //setTxHashModal({ open: true, hash: receipt.transactionHash, type: 'wrap' });
        } else {
          console.error("Invalid transaction hash:", tx);
          setWrapButtonText('Wrap');
          setIsWrapButtonDisabled(false);
          setErrorModal({ open: true, message: `Failed to wrap ETH: Invalid transaction hash` });
          setWrapTxHash(null);
        }
      } else {
        console.error("Transaction hash is undefined:", tx);
        setWrapButtonText('Wrap');
        setIsWrapButtonDisabled(false);
        setErrorModal({ open: true, message: `Failed to wrap ETH: Transaction hash is undefined` });
        setWrapTxHash(null);
      }
    } catch (error) {
      console.error("Error wrapping ETH:", error);
      setWrapButtonText('Wrap');
      setIsWrapButtonDisabled(false);
      setErrorModal({ open: true, message: `Failed to wrap ETH: ${error?.message || 'Unknown error'}` });
      setWrapTxHash(null);
    }
  };

  const handleUnwrap = async () => {
    if (!isConnected || !walletClient) {
      alert("Please connect your wallet.");
      return;
    }
    if (chainId !== pulsechain) {
      alert("Please switch to PulseChain.");
      return;
    }
    setUnwrapButtonText('Unwrapping...');
    setIsUnwrapButtonDisabled(true);
    console.log('Starting unwrap transaction...');
    try {
      const provider = new ethers.BrowserProvider(walletClient, 'any');
      const wethContract = new ethers.Contract(WETH_ADDRESS, wethABI, provider);
      const amount = ethers.parseEther(unwrapAmount);
      console.log('Unwrap amount:', amount);
      if (!amount) {
        console.error('Unwrap amount is invalid:', unwrapAmount);
        setUnwrapButtonText('Unwrap');
        setIsUnwrapButtonDisabled(false);
        setErrorModal({ open: true, message: `Failed to unwrap ETH: Invalid amount` });
        setUnwrapTxHash(null);
        return;
      }
      const transaction = {
        to: WETH_ADDRESS,
        data: wethContract.interface.encodeFunctionData('withdraw', [amount])
      };
      console.log('Sending unwrap transaction:', transaction);
      const tx = await walletClient.sendTransaction(transaction);
      console.log('Unwrap transaction sent, hash:', tx);
      if (tx) {
        const publicClient = getPublicClient({ chainId: pulsechain });
        const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log('Unwrap transaction receipt:', receipt);
        if (receipt && receipt.transactionHash && isValidTransactionHash(receipt.transactionHash)) {
          setUnwrapTxHash(receipt.transactionHash);
          addRecentTransaction({
            hash: receipt.transactionHash,
            description: `Unwrap ${unwrapAmount} ETH`,
          });
          //setTxHashModal({ open: true, hash: receipt.transactionHash, type: 'unwrap' });
        } else {
          console.error("Invalid transaction hash:", tx);
          setUnwrapButtonText('Unwrap');
          setIsUnwrapButtonDisabled(false);
          setErrorModal({ open: true, message: `Failed to unwrap ETH: Invalid transaction hash` });
          setUnwrapTxHash(null);
        }
      } else {
        console.error("Transaction hash is undefined:", tx);
        setUnwrapButtonText('Unwrap');
        setIsUnwrapButtonDisabled(false);
        setErrorModal({ open: true, message: `Failed to unwrap ETH: Transaction hash is undefined` });
        setUnwrapTxHash(null);
      }
    } catch (error) {
      console.error("Error unwrapping ETH:", error);
      setUnwrapButtonText('Unwrap');
      setIsUnwrapButtonDisabled(false);
      setErrorModal({ open: true, message: `Failed to unwrap ETH: ${error?.message || 'Unknown error'}` });
      setUnwrapTxHash(null);
    }
  };

  const closeModal = () => {
    setErrorModal({ open: false, message: '' });
    setTxHashModal({ open: false, hash: '', type: '' });
  };

  const openInNewTab = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className={`container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="header">
        <div className="connect-button-container">
          <ConnectButton />
        </div>
        <label className="dark-mode-toggle">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={toggleDarkMode}
          />
          <span className="slider"></span>
        </label>
      </div>
      {isConnected && (
        <>
          <h1>Pulse Wrapper</h1>
          <div className="chart-container">
            <div>
              <PairData />
            </div>
          </div>
          <div className="input-group">
            <label>
              <img src={plsIcon} alt="PLS Icon" />
              PLS ({plsBalance})
            </label>
            <input
              type="number"
              placeholder="Amount to wrap"
              value={wrapAmount}
              onChange={(e) => setWrapAmount(e.target.value)}
            />
            <button onClick={handleWrap} disabled={isWrapButtonDisabled}>
              {isWrapButtonDisabled ? <span className="loader"></span> : wrapButtonText}
            </button>
          </div>

          <div className="input-group">
            <label>
              <img src={wethIcon} alt="WETH Icon" />
              WETH ({wethBalance})
            </label>
            <input
              type="number"
              placeholder="Amount to unwrap"
              value={unwrapAmount}
              onChange={(e) => setUnwrapAmount(e.target.value)}
            />
            <button onClick={handleUnwrap} disabled={isUnwrapButtonDisabled}>
              {isUnwrapButtonDisabled ? <span className="loader"></span> : unwrapButtonText}
            </button>
          </div>
        </>
      )}
      {errorModal.open && (
        <div className="modal">
          <div className="modal-content">
            <p>{errorModal.message}</p>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
      {txHashModal.open && (
        <div className="modal">
          <div className="modal-content">
            <p>Transaction Hash ({txHashModal.type}):</p>
            <p>{txHashModal.hash}</p>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
