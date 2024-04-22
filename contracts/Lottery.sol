// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Lottery {
    address public manager;
    address payable[] public players;
    address payable public winner;
    uint public totalParticipants;
    uint public totalPrizePool;
    bool public isComplete;
    bool public claimed;
    uint public minimumParticipants; // Minimum required participants to pick a winner

    constructor () {
        manager = msg.sender;
        isComplete = false;
        claimed = false;
        totalParticipants = 0;
        totalPrizePool = 0;
        minimumParticipants = 2; // Minimum participants required to pick a winner
    }

    modifier onlyManager(){
        require(msg.sender == manager);
        _;
    }

    function getManager() public view returns (address){
        return manager;
    }

    function getWinner() public view returns (address){
        return winner;
    }

    function getTotalParticipants() public view returns (uint){
        return totalParticipants;
    }

    function getTotalPrizePool() public view returns (uint){
        return totalPrizePool;
    }

    function enter() public payable {
        require(msg.value >= 0.001 ether);
        require(!isComplete);
        players.push(payable(msg.sender));
        totalParticipants++;
        totalPrizePool += msg.value; // Add contribution to prize pool
    }

    function pickWinner() public onlyManager {
        require(players.length >= minimumParticipants); // Require minimum participants
        require(!isComplete);
        winner = players[randomNumber() % players.length];
        isComplete = true;
    }

    function randomNumber() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(blockhash(block.number - 1), block.timestamp, players.length)));
    }


    function claimPrize() public {
        require(msg.sender == winner);
        require(isComplete);
        winner.transfer(address(this).balance);
        claimed = true;
        totalParticipants = 0; // Reset totalParticipants to 0
        totalPrizePool = 0; // Reset totalPrizePool to 0
        reset();
    }

    function reset() private {
        delete players;
        winner = payable(address(0));
        isComplete = false;
        claimed = false;
    }

    function getPlayers() public view returns (address payable[] memory){
        return players;
    }
}
