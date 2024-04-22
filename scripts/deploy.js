async function main() {
    const lotteryFactory = await ethers.getContractFactory("Lottery");
    
    const lottery = await lotteryFactory.deploy(); // Pass the required argument
    console.log("contract address:", lottery.address);

}

main() 
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});