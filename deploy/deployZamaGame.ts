import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying ZamaGame contract...");
  console.log("Deployer:", deployer);

  const deployedZamaGame = await deploy("ZamaGame", {
    from: deployer,
    log: true,
    waitConfirmations: 1,
  });

  console.log(`ZamaGame contract deployed at: ${deployedZamaGame.address}`);
  
  // 保存合约地址到前端可以使用的文件
  const fs = require('fs');
  const contractAddress = {
    ZamaGame: deployedZamaGame.address,
    network: hre.network.name,
    deploymentTime: new Date().toISOString()
  };
  
  // 确保app目录存在
  if (fs.existsSync('./app/src')) {
    fs.writeFileSync('./app/src/contractAddress.json', JSON.stringify(contractAddress, null, 2));
    console.log("Contract address saved to app/src/contractAddress.json");
  }
  
  console.log("=".repeat(50));
  console.log("🎮 ZamaGame Deployment Complete!");
  console.log("=".repeat(50));
  console.log(`Contract Address: ${deployedZamaGame.address}`);
  console.log(`Network: ${hre.network.name}`);
  console.log(`Deployer: ${deployer}`);
  console.log("=".repeat(50));
  console.log("Next steps:");
  console.log("1. Update the contract address in your frontend");
  console.log("2. Verify the contract on Etherscan if needed");
  console.log("3. Start playing the game!");
  console.log("=".repeat(50));
};

export default func;
func.id = "deploy_zamaGame";
func.tags = ["ZamaGame"];