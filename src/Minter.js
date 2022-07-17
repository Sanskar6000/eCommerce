//Frontend file
import { useEffect, useState } from 'react';
import {
  connectWallet,
  getCurrentWalletConnected,
  mintNFT,
} from './utils/interact.js';

import './Minter.css';

const Minter = (props) => {
  //State variables
  const [walletAddress, setWallet] = useState('');
  const [status, setStatus] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setURL] = useState('');

  //wallet listener so our UI updates when our wallet's state changes
  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus('👆🏽 Write a message in the text-field above.');
        } else {
          setWallet('');
          setStatus('🦊 Connect to Metamask using the top right button.');
        }
      });
    } else {
      setStatus(
        <p>
          {' '}
          🦊{' '}
          <a target="blank" href={`https://metamask.io/download.html`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      );
    }
  }

  useEffect(() => {
    async function fetchData() {
      const { address, status } = await getCurrentWalletConnected();
      setWallet(address);
      setStatus(status);

      addWalletListener();
    }
    fetchData();
  }, []);

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  const onMintPressed = async () => {
    const { status } = await mintNFT(url, name, description);
    setStatus(status);
  };

  return (
    <div className="Minter">
      <button id="walletButton" onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          'Connected: ' +
          String(walletAddress).substring(0, 6) +
          '...' +
          String(walletAddress).substring(38)
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>

      <br></br>
      <h1 id="title">🧙‍♂️ Alchemy NFT Minter</h1>
      <p>
        Simply add your asset's link, name, and description, then press "Mint."
      </p>
      <div className="product">
        <img
          src="https://m.media-amazon.com/images/I/41eC3XfDtjL._AC_SR160,160_.jpg"
          alt="asics-mens-badminton-shoes"
        />
        <p>ASIC'S Men's Badminton Shoes</p>
        <span>⭐⭐⭐⭐</span>
        <span className="ratingNumber"> (24,451)</span>
        <p className="productPrice">
          <span>₹ </span>
          3740.00
        </p>

        <button id="mintButton" onClick={onMintPressed}>
          Buy Now
        </button>
      </div>

      <p id="status">{status}</p>
    </div>
  );
};

export default Minter;
