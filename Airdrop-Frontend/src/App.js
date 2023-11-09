import { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import airdropContract from "./components/Airdrop";

const merkle = require("./merkleproof.json");
const userDetails = require("./claimlist.json");

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [signer, setSigner] = useState();
  const [lumosairdropContract, setlumosairdropContract] = useState();
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");
  const [transactionData, setTransactionData] = useState("");


  const CHAIN_ID = 80001;
  const NETWORK_NAME = "Mumbai";


  useEffect(() => {
    getCurrentWalletConnected();
    addWalletListener();
  }, [walletAddress]);
  

  const connectWallet = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        const accounts = await provider.send("eth_requestAccounts", []);

        const { chainId } = await provider.getNetwork();
        
       console.log( setSigner(provider.getSigner()));
        if (chainId !== CHAIN_ID) {
          window.alert(`Please switch to the ${NETWORK_NAME} network!`);
              throw new Error(`Please switch to the ${NETWORK_NAME} network`);
          }
        setlumosairdropContract(airdropContract(provider));
        setWalletAddress(accounts[0]);
      } catch (err) {
        console.error(err.message);
      }
    } else {
      console.log("Please install MetaMask");
    }
  };
  

  const getCurrentWalletConnected = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_accounts", []);
        if (accounts.length > 0) {

          setSigner(provider.getSigner());
          setlumosairdropContract(airdropContract(provider));
          setWalletAddress(accounts[0]);
        } else {
          console.log("Connect to MetaMask using the Connect Wallet button");
        }
      } catch (err) {
        console.error(err.message);
      }
    } else {
      console.log("Please install MetaMask");
    }
  };


  const addWalletListener = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      window.ethereum.on("accountsChanged", (accounts) => {
        setWalletAddress(accounts[0]);
      });
    } else {
      setWalletAddress("");
      console.log("Please install MetaMask");
    }
  };

  const handleClaimTokens = async () => {
    setWithdrawError("");
    setWithdrawSuccess("");
  
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
  
      const { chainId } = await provider.getNetwork();
  
      setSigner(provider.getSigner());
      if (chainId !== CHAIN_ID) {
        window.alert(`Please switch to the ${NETWORK_NAME} network!`);
        throw new Error(`Please switch to the ${NETWORK_NAME} network`);
      }
      
      // Connect the signer to the contract
      const connectedContract = lumosairdropContract.connect(signer);
  
      let prof = merkle[ethers.utils.getAddress(walletAddress)].proof;
      let amt = userDetails[ethers.utils.getAddress(walletAddress)].amount;
      
      // Use the connected contract with the signer
      const tx = await connectedContract.claimToken(prof, amt); 
      await tx.wait();
      setWithdrawSuccess("Claim successful!");
      setTransactionData(tx.hash);
    } catch (error) {
      if(error.message === "Cannot read properties of undefined (reading 'proof')"){
        setWithdrawError("You are not eligible to claim!");
      }else{
        setWithdrawError("Claim failed: " + error.error.data.message);
        console.log(error.error.data.message);
      }
    }
  };
  

  return (
    <div>
      <nav className="navbar">
        <div className="container">
          <div className="navbar-brand">
          </div>
          <div id="navbarMenu" className="navbar-menu">
            <div className="navbar-end is-align-items-center">
              <button
                className="button is-white connect-wallet"
                onClick={connectWallet}
              >
                <span className="is-link has-text-weight-bold">
                  {walletAddress && walletAddress.length > 0
                    ? `Connected: ${walletAddress.substring(
                        0,
                        6
                      )}...${walletAddress.substring(38)}`
                    : "Connect Wallet"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <section className="hero is-fullheight">
        <div className="airdrop-hero-body">
          <div className="container has-text-centered main-content">
            <h1 className="title is-1">Lumos Airdrop</h1>
            <p>Check to see if you are eligible and Claim Tokens</p>
            <div className="box address-box">
              <div className="columns">
                
              <div className="column is-four-fifths">
                    <input
                    className="input is-medium"
                    type="text"
                    placeholder="Enter your wallet address (0x...)"
                    defaultValue={walletAddress}
                  />
                </div>
                <div className="column">
                  <button className="button is-medium" disabled={!walletAddress} onClick={handleClaimTokens}>
                    CLAIM TOKENS
                  </button>
                </div>
              </div>
              <div>
                {withdrawError && <div className="withdraw-error">{withdrawError}</div>}
                {withdrawSuccess && <div className="withdraw-success">{withdrawSuccess}</div>}
                </div>
              <article className="panel is-grey-darker">
                <p className="panel-heading">Transaction Data</p>
                <div className="panel-block">
                  <p>{transactionData ? `Transaction hash: ${transactionData}` : "Your Transactions"}</p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;

