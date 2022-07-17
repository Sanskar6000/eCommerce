import { pinJSONToIPFS } from './pinata.js';
require('dotenv').config();

const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const { createAlchemyWeb3 } = require('@alch/alchemy-web3');
const web3 = createAlchemyWeb3(alchemyKey);

const contractABI = require('../contract-abi.json');
const contractAddress = '0xE40077D0740a742ddf5cA30bab5752D8a2A9e6ec';

export const connectWallet = async () => {
  /* window.ethereum is a global API injected by Metamask and other wallet providers 
    that allows websites to request users' Ethereum accounts. */
  if (window.ethereum) {
    try {
      // Calling this function will open up Metamask in the browser, whereby the user will be prompted to connect their wallet to your dApp.
      const addressArray = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      //   method: "eth_requestAccounts" will return an array that contains all of the user's account addresses that are connected to the dApp
      const obj = {
        status: '👆🏽 Write a message in the text-field above.',
        address: addressArray[0],
      };
      return obj;
    } catch (err) {
      return {
        address: '',
        status: '😥 ' + err.message,
      };
    }
  } else {
    return {
      address: '',
      status: (
        <span>
          <p>
            {' '}
            🦊{' '}
            <a target="blank" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

/*****IMP!!! *****/
//check if an address is already connected to our dApp and update our UI accordingly!
//Refresh
export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: 'eth_accounts',
      });
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: '👆🏽 Write a message in the text-field above.',
        };
      } else {
        return {
          address: '',
          status: '🦊 Connect to Metamask using the top right button.',
        };
      }
    } catch (err) {
      return {
        address: '',
        status: '😥 ' + err.message,
      };
    }
  } else {
    return {
      address: '',
      status: (
        <span>
          <p>
            {' '}
            🦊{' '}
            <a target="blank" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const mintNFT = async (url, name, description) => {
  //error handling
  //   if (url.trim() === '' || name.trim() === '' || description.trim() === '') {
  //     return {
  //       success: false,
  //       status: '❗Please make sure all fields are completed before minting.',
  //     };
  //   }

  //make metadata
  const metadata = {};
  metadata.name = 'Pawmi';
  metadata.image =
    'https://sportshub.cbsistatic.com/i/2022/06/01/809f7b46-557b-4e6c-b55a-867f207ca223/pokemon-sv-pawmi-key-art.png?auto=webp&width=2018&height=1752&crop=1.152:1,smart';
  metadata.description = 'Cute';

  //make pinata call
  const pinataResponse = await pinJSONToIPFS(metadata);
  if (!pinataResponse.success) {
    return {
      success: false,
      status: '😢 Something went wrong while uploading your tokenURI.',
    };
  }
  const tokenURI = pinataResponse.pinataUrl;
  //load smart contract
  window.contract = await new web3.eth.Contract(contractABI, contractAddress);
  //set up your Ethereum transaction
  const transactionParameters = {
    to: contractAddress, // Required except during contract publications.
    from: window.ethereum.selectedAddress, // must match user's active address.
    data: window.contract.methods
      .mintNFT(window.ethereum.selectedAddress, tokenURI)
      .encodeABI(), //make call to NFT smart contract
  };

  //sign the transaction via Metamask
  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });
    return {
      success: true,
      status:
        '✅ Check out your transaction on Etherscan: https://rinkeby.etherscan.io/tx/' +
        txHash,
    };
  } catch (error) {
    return {
      success: false,
      status: '😥 Something went wrong: ' + error.message,
    };
  }
};
