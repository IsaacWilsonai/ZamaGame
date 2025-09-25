// Generated from deployments/sepolia/ZamaGame.json
export const ZAMAGAME_ABI = [
  {"inputs":[],"name":"attackMonster","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"getMyEquipment","outputs":[{"internalType":"euint8","name":"equipmentType","type":"bytes32"},{"internalType":"euint32","name":"attackPower","type":"bytes32"},{"internalType":"bool","name":"exists","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"player","type":"address"}],"name":"getPlayerEquipmentCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
] as const;

