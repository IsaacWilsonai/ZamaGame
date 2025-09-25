import { task } from "hardhat/config";

task("zamagame:attack", "Attack monster to get encrypted equipment")
  .addOptionalParam("address", "ZamaGame contract address (defaults to deployments)")
  .setAction(async (args, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const addr = args.address || (await hre.deployments.get("ZamaGame")).address;
    const game = await hre.ethers.getContractAt("ZamaGame", addr, signer);
    const tx = await game.attackMonster();
    console.log(`tx: ${tx.hash}`);
    await tx.wait();
    console.log("Attack complete.");
  });

task("zamagame:count", "Get player equipment count")
  .addOptionalParam("player", "Player address (defaults to signer)")
  .addOptionalParam("address", "ZamaGame contract address (defaults to deployments)")
  .setAction(async (args, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const player = args.player || signer.address;
    const addr = args.address || (await hre.deployments.get("ZamaGame")).address;
    const game = await hre.ethers.getContractAt("ZamaGame", addr, signer);
    const count = await game.getPlayerEquipmentCount(player);
    console.log(`Player ${player} equipment count: ${count}`);
  });

task("zamagame:getEquipment", "Get caller's equipment by index (encrypted handles)")
  .addParam("index", "Index")
  .addOptionalParam("address", "ZamaGame contract address (defaults to deployments)")
  .setAction(async (args, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const addr = args.address || (await hre.deployments.get("ZamaGame")).address;
    const game = await hre.ethers.getContractAt("ZamaGame", addr, signer);
    const res = await game.getMyEquipment(args.index);
    console.log(`Encrypted equipment:`, res);
  });

