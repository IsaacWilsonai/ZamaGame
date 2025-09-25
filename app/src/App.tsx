import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { initSDK, createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';
import './App.css';

// 游戏合约ABI (简化版)
const gameABI = [
  {
    "inputs": [],
    "name": "attackMonster",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "player", "type": "address"}],
    "name": "getPlayerEquipmentCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "index", "type": "uint256"}],
    "name": "getMyEquipment",
    "outputs": [
      {"internalType": "euint8", "name": "equipmentType", "type": "bytes32"},
      {"internalType": "euint32", "name": "attackPower", "type": "bytes32"},
      {"internalType": "bool", "name": "exists", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

interface Equipment {
  type: string;
  attackPower: number;
  index: number;
}

function App() {
  const { address, isConnected } = useAccount();
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [isAttacking, setIsAttacking] = useState(false);
  const [fhevmInstance, setFhevmInstance] = useState<any>(null);
  const [gameContractAddress] = useState('0x...'); // TODO: 部署后填入实际地址

  // 写合约 - 攻击怪物
  const { data: attackHash, writeContract: attackMonster } = useWriteContract();
  const { isLoading: isAttackLoading, isSuccess: isAttackSuccess } = useWaitForTransactionReceipt({
    hash: attackHash,
  });

  // 读合约 - 获取装备数量
  const { data: equipmentCount, refetch: refetchCount } = useReadContract({
    address: gameContractAddress as `0x${string}`,
    abi: gameABI,
    functionName: 'getPlayerEquipmentCount',
    args: address ? [address] : undefined,
  });

  // 初始化Zama FHEVM实例
  useEffect(() => {
    const initFHEVM = async () => {
      try {
        await initSDK();
        const instance = await createInstance(SepoliaConfig);
        setFhevmInstance(instance);
        console.log('Zama FHEVM初始化成功');
      } catch (error) {
        console.error('Zama FHEVM初始化失败:', error);
      }
    };

    initFHEVM();
  }, []);

  // 攻击成功后刷新装备列表
  useEffect(() => {
    if (isAttackSuccess) {
      setIsAttacking(false);
      refetchCount();
      decryptAllEquipments();
    }
  }, [isAttackSuccess]);

  // 攻击怪物
  const handleAttackMonster = async () => {
    if (!isConnected || !attackMonster) return;
    
    setIsAttacking(true);
    try {
      attackMonster({
        address: gameContractAddress as `0x${string}`,
        abi: gameABI,
        functionName: 'attackMonster',
      });
    } catch (error) {
      console.error('攻击怪物失败:', error);
      setIsAttacking(false);
    }
  };

  // 解密所有装备
  const decryptAllEquipments = async () => {
    if (!fhevmInstance || !address || !equipmentCount) return;

    try {
      const decryptedEquipments: Equipment[] = [];
      const count = Number(equipmentCount);

      for (let i = 0; i < count; i++) {
        // TODO: 从合约读取加密数据并解密
        // 这里需要实际的合约调用和解密逻辑
        // const encryptedData = await readContract({...});
        // const decrypted = await fhevmInstance.userDecrypt(...);
        
        // 暂时使用模拟数据
        const mockEquipment: Equipment = {
          type: ['武器', '鞋子', '盾牌'][Math.floor(Math.random() * 3)],
          attackPower: Math.floor(Math.random() * 100) + 1,
          index: i,
        };
        decryptedEquipments.push(mockEquipment);
      }

      setEquipments(decryptedEquipments);
    } catch (error) {
      console.error('解密装备失败:', error);
    }
  };

  // 单个装备解密
  const decryptEquipment = async (index: number) => {
    if (!fhevmInstance || !address) return;

    try {
      // TODO: 实际的解密逻辑
      console.log(`解密装备 ${index}`);
      await decryptAllEquipments();
    } catch (error) {
      console.error('解密装备失败:', error);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏰 ZamaGame - 加密装备RPG</h1>
        <ConnectButton />
      </header>

      {isConnected ? (
        <main className="game-content">
          <div className="game-actions">
            <button 
              onClick={handleAttackMonster}
              disabled={isAttacking || isAttackLoading}
              className="attack-button"
            >
              {isAttacking || isAttackLoading ? '攻击中...' : '⚔️ 攻击怪物'}
            </button>
            <p>攻击怪物可以获得神秘的加密装备！</p>
          </div>

          <div className="equipment-section">
            <div className="section-header">
              <h2>🎒 我的装备 ({equipmentCount ? Number(equipmentCount) : 0} 件)</h2>
              <button onClick={decryptAllEquipments} className="decrypt-all-btn">
                🔓 解密所有装备
              </button>
            </div>

            <div className="equipment-grid">
              {equipments.map((equipment) => (
                <div key={equipment.index} className="equipment-card">
                  <h3>装备 #{equipment.index + 1}</h3>
                  <p><strong>类型:</strong> {equipment.type}</p>
                  <p><strong>攻击力:</strong> {equipment.attackPower}</p>
                  <button 
                    onClick={() => decryptEquipment(equipment.index)}
                    className="decrypt-btn"
                  >
                    🔓 重新解密
                  </button>
                </div>
              ))}
            </div>

            {equipmentCount && Number(equipmentCount) === 0 && (
              <div className="no-equipment">
                <p>还没有装备，快去攻击怪物吧！</p>
              </div>
            )}
          </div>

          <div className="game-info">
            <h3>📜 游戏说明</h3>
            <ul>
              <li>点击"攻击怪物"可以随机获得装备</li>
              <li>装备的类型和攻击力都是加密的</li>
              <li>点击"解密"按钮才能看到装备的真实属性</li>
              <li>装备类型包括：武器、鞋子、盾牌</li>
              <li>攻击力范围：1-100</li>
            </ul>
          </div>
        </main>
      ) : (
        <main className="connect-prompt">
          <h2>请连接钱包开始游戏</h2>
          <p>连接你的钱包到Sepolia测试网来体验加密装备RPG游戏</p>
        </main>
      )}
    </div>
  );
}

export default App;
