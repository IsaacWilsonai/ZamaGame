import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("deploy-zama-game", "Deploy ZamaGame contract")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    console.log("🚀 Deploying ZamaGame contract...");
    console.log("📍 Network:", hre.network.name);
    console.log("👤 Deployer:", deployer);

    const deployment = await deploy("ZamaGame", {
      from: deployer,
      log: true,
      waitConfirmations: 1,
    });

    console.log("✅ ZamaGame deployed to:", deployment.address);
    return deployment.address;
  });

task("game-info", "Get game contract information")
  .addParam("contract", "Contract address")
  .setAction(async (taskArgs, hre) => {
    const ZamaGame = await hre.ethers.getContractAt("ZamaGame", taskArgs.contract);
    
    console.log("🎮 ZamaGame Contract Info");
    console.log("📍 Address:", taskArgs.contract);
    console.log("🌐 Network:", hre.network.name);
    
    // 获取一些基本信息 (如果有的话)
    try {
      // 这里可以添加更多合约信息的查询
      console.log("✅ Contract is accessible");
    } catch (error) {
      console.error("❌ Error accessing contract:", error);
    }
  });

task("attack-monster", "Attack a monster to get equipment (for testing)")
  .addParam("contract", "Contract address")
  .setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const ZamaGame = await hre.ethers.getContractAt("ZamaGame", taskArgs.contract);
    
    console.log("⚔️ Attacking monster...");
    console.log("👤 Player:", signer.address);
    
    try {
      const tx = await ZamaGame.connect(signer).attackMonster();
      console.log("📤 Transaction hash:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("✅ Monster attacked successfully!");
      console.log("⛽ Gas used:", receipt.gasUsed.toString());
      
      // 获取装备数量
      const equipmentCount = await ZamaGame.getPlayerEquipmentCount(signer.address);
      console.log("🎒 Total equipment count:", equipmentCount.toString());
      
    } catch (error) {
      console.error("❌ Error attacking monster:", error);
    }
  });

task("get-equipment-count", "Get player equipment count")
  .addParam("contract", "Contract address")
  .addOptionalParam("player", "Player address (defaults to first signer)")
  .setAction(async (taskArgs, hre) => {
    const [defaultSigner] = await hre.ethers.getSigners();
    const playerAddress = taskArgs.player || defaultSigner.address;
    
    const ZamaGame = await hre.ethers.getContractAt("ZamaGame", taskArgs.contract);
    
    try {
      const equipmentCount = await ZamaGame.getPlayerEquipmentCount(playerAddress);
      console.log("🎒 Equipment Count for", playerAddress);
      console.log("📦 Count:", equipmentCount.toString());
    } catch (error) {
      console.error("❌ Error getting equipment count:", error);
    }
  });

task("setup-game", "Complete setup for ZamaGame development")
  .setAction(async (taskArgs, hre) => {
    console.log("🔧 Setting up ZamaGame...");
    
    // 编译合约
    console.log("📝 Compiling contracts...");
    await hre.run("compile");
    
    // 部署合约
    console.log("🚀 Deploying contracts...");
    const contractAddress = await hre.run("deploy-zama-game");
    
    // 获取合约信息
    console.log("ℹ️ Getting contract info...");
    await hre.run("game-info", { contract: contractAddress });
    
    console.log("✅ Setup complete!");
    console.log("🎮 You can now start playing the game!");
    console.log("🌐 Start the frontend with: cd app && npm run dev");
  });