import React, { useState, useEffect } from "react";
import { ethers } from 'ethers';
import constants from './constants';

import {
  Button,
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
} from "reactstrap";

function Home() {
  const [isHovered, setIsHovered] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [contractInstance, setContractInstance] = useState(null);
  const [status, setStatus] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [totalPrizePool, setTotalPrizePool] = useState(0);
  const [winnerAddress, setWinnerAddress] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(false); // State variable for triggering auto refresh

  useEffect(() => {
    const loadBlockchainDataAndEnterLottery = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          if (!signer) {
            throw new Error("Unable to get signer");
          }
          const address = await signer.getAddress();
          setCurrentAccount(address);
          window.ethereum.on('accountsChanged', (accounts) => {
            setCurrentAccount(accounts[0]);
          });
          const contract = new ethers.Contract(constants.contractAddress, constants.contractAbi, signer);
          setContractInstance(contract);
          const status = await contract.isComplete();
          setStatus(status);
          const winner = await contract.getWinner();
          setIsWinner(winner === address);
          if (status && winner !== ethers.constants.AddressZero) {
            setWinnerAddress(winner);
          }
          const participants = await contract.getPlayers();
          setParticipants(participants);
          const count = await contract.getTotalParticipants();
          setParticipantCount(count.toNumber());
          const prizePool = await contract.getTotalPrizePool();
          setTotalPrizePool(ethers.utils.formatEther(prizePool));
        } catch (err) {
          console.error(err);
        }
      } else {
        alert('Please install Metamask to use this application');
      }
    };

    loadBlockchainDataAndEnterLottery();
  }, [refreshFlag]); // Only refresh when refreshFlag changes

  const enterLottery = async () => {
    if (!contractInstance) {
      console.error("Contract instance not set");
      return;
    }
    const amountToSend = ethers.utils.parseEther('0.001');
    const tx = await contractInstance.enter({ value: amountToSend });
    await tx.wait();
    setRefreshFlag(prevFlag => !prevFlag); // Toggle refreshFlag to trigger auto refresh
  }

  const claimPrize = async () => {
    if (!contractInstance) {
      console.error("Contract instance not set");
      return;
    }
    const tx = await contractInstance.claimPrize();
    await tx.wait();
    setRefreshFlag(prevFlag => !prevFlag); // Toggle refreshFlag to trigger auto refresh
  }

  return (
    <div>
      <div className="landing-page" style={{ backgroundImage: "url('/wallpaper.png')", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Container>
          <Row>
            <Col lg="6" className="mt-5">
              <h1 className="display-4" style={{fontSize: "50px", color:"white"}}>Welcome to the Lottery Page</h1>
              <p className="lead" style={{fontSize: "30px", color:"gold"}} >Enter the lottery and stand a chance to win the prize pool!</p>
            </Col>
            <Col lg="6" className="mt-5">
              <Card style={{ backgroundColor: "#272727", border: "3px solid #CE7871", borderRadius: "20px", width: "100%", height: "100%", margin: "auto", color: "white" }}>
                <CardBody className="text-center">
                  <div className="mt-4 text-center"> 
                    {status ? (
                      isWinner ? (
                        <Button id="claim" color="success" onClick={claimPrize} onMouseEnter={() => setIsHovered(true)}
                          onMouseLeave={() => setIsHovered(false)} style={{...buttonStyle, backgroundColor: isHovered ? "transparent" : "gold",
                          color: isHovered ? "#fff" : "#000",
                          border: isHovered ? "3px solid gold" : "none"}}>Claim Prize</Button>
                      ) : (
                        <p style={{color: "red"}}>You are not the winner</p>
                      )
                    ) : (
                      <Button id="enter" color="primary" onClick={enterLottery} onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)} style={{...buttonStyle, backgroundColor: isHovered ? "transparent" : "gold",
                        color: isHovered ? "#fff" : "#000",
                        border: isHovered ? "3px solid gold" : "none"}}>Enter Lottery</Button>
                    )}
                  </div>

                  <CardTitle tag="h4" style={{ textAlign: "center" }}>Participants 👨 </CardTitle>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <ul style={{ listStyle: "none", padding: 0, margin: "auto", textAlign: "center" }}>
                      {participants.map((participant, index) => (
                        <li key={index} style={{ display: "flex", alignItems: "center", paddingLeft: "1.5em", lineHeight: "1.5em", backgroundImage: `url('/gold.png')`, backgroundRepeat: "no-repeat", backgroundSize: "contain", marginBottom: "1em" }}>
                          <span>{participant.substring(0, 8)}...{participant.slice(-5)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p style={{ color: "white" }} >Total Participants: {participantCount}</p>
                  <p style={{ color: "white" }} >Total Prize Pool: {totalPrizePool} ETH 🟡</p>

                  {status && winnerAddress && (
                    <p style={{ color: "white" }}>🏆Winner: {winnerAddress.substring(0, 8)}... {winnerAddress.slice(-5)} 🏆</p>
                  )}

                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}

// Button style
const buttonStyle = {
  display: "block",
  margin: "auto",
  marginTop: "10px",
  width: "200px",
  height: "50px",
  fontSize: "20px",
  borderRadius: "10px",
  transition: "background-color 0.3s, border-color 0.3s, color 0.3s",
  cursor: "pointer",
};

export default Home;
