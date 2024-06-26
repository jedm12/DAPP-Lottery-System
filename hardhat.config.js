/** @type import('hardhat/config').HardhatUserConfig */

/*Bartolome, Jed Miguel O.
 WD-401*/

 require('dotenv').config();
 require("@nomiclabs/hardhat-ethers");
 
 const { API_URL, PRIVATE_KEY } = process.env;
 
   module.exports = {
     solidity: "0.8.0",
     defaultNetwork: "sepolia",
     networks: {
       hardhat: {},
       sepolia: {
         url: API_URL,
         accounts: [`0x${PRIVATE_KEY}`]
       }
     },
 };