import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import constants from './constants';
import {
  Container,
  Row,
  Col,
} from 'reactstrap';

function PickWinner() {
  const [isHovered, setIsHovered] = useState(false);
  const [owner, setOwner] = useState('');
  const [contractInstance, setContractInstance] = useState('');
  const [currentAccount, setCurrentAccount] = useState('');
  const [isOwnerConnected, setIsOwnerConnected] = useState(false);
  const [winner, setWinner] = useState('');
  const [status, setStatus] = useState(false);
  const [participantsCount, setParticipantsCount] = useState(0);
  const [refreshFlag, setRefreshFlag] = useState(false); // State variable for triggering auto refresh

  useEffect(() => {
    const loadBlockchainData = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        try {
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          setCurrentAccount(address);
          window.ethereum.on('accountsChanged', (accounts) => {
            setCurrentAccount(accounts[0]);
          });
        } catch (err) {
          console.error(err);
        }
      } else {
        alert('Please install Metamask to use this application');
      }
    };

    const loadContractData = async () => {
      if (currentAccount) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractIns = new ethers.Contract(
          constants.contractAddress,
          constants.contractAbi,
          signer
        );
        setContractInstance(contractIns);
        const status = await contractIns.isComplete();
        setStatus(status);
        const winner = await contractIns.getWinner();
        setWinner(winner);
        const owner = await contractIns.getManager();
        setOwner(owner);
        setIsOwnerConnected(owner === currentAccount);
        const participants = await contractIns.getTotalParticipants();
        setParticipantsCount(participants.toNumber());
      }
    };

    loadBlockchainData();
    loadContractData();
  }, [currentAccount, refreshFlag]); // Include refreshFlag as a dependency

  const pickWinner = async () => {
    try {
      const tx = await contractInstance.pickWinner();
      await tx.wait();
      setRefreshFlag(prevFlag => !prevFlag); // Toggle refreshFlag to trigger auto refresh
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className="landing-page"
      style={{
        backgroundImage: "url('/wallpaper.png')",
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div>
        <Container>
          <Row>
            <Col lg="6" className="mt-5">
              <h1 className="display-4" style={{ fontSize: '50px', color: 'white' }}>
                Result Page
              </h1>
              <p className="lead" style={{ fontSize: '30px', color: 'gold' }}>
                Pick the lucky Winner!
              </p>
            </Col>
          </Row>
        </Container>

        <div className="button-container" style={{ marginTop: 'auto', marginBottom: '20px' }}>
          {status ? (
            <p style={{ fontSize: '30px', color: 'gold' }}>🏆Lottery Winner is: {winner}🏆</p>
          ) : (
            isOwnerConnected ? (
              participantsCount >= 2 ? (
                <button
                  className="enter-button"
                  onClick={pickWinner}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  style={{
                    display: 'block',
                    margin: 'auto',
                    width: '200px',
                    height: '50px',
                    backgroundColor: isHovered ? 'transparent' : 'gold',
                    color: isHovered ? '#fff' : '#000',
                    fontSize: '20px',
                    border: isHovered ? '3px solid gold' : 'none',
                    borderRadius: '10px',
                    transition: 'background-color 0.3s, border-color 0.3s, color 0.3s',
                    cursor: 'pointer',
                  }}
                >
                  Pick Winner
                </button>
              ) : (
                <p style={{ fontSize: '20px', color: 'red', backgroundColor: "gold", padding: "10px", borderRadius: "15px" }}>Minimum 2 participants required to pick a winner</p>
              )
            ) : (
              <p style={{ fontSize: '30px', color: 'red' }}>You are not the owner!</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default PickWinner;
