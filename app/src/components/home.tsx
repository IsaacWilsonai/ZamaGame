import { useEffect, useMemo, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { initSDK, createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';
import { ZAMAGAME_ABI } from '../config/zamagame-abi';

type EquipmentView = { index: number; type?: string; attackPower?: number };

const CONTRACT_ADDRESS = '0xAC8119750D7a1b344d4c2A818083c1b676aA7e3a';
const EQUIP_TYPE_LABELS = ['Weapon', 'Shoe', 'Armor'] as const;

export default function Home() {
  const { address, isConnected } = useAccount();
  const [equipCount, setEquipCount] = useState<number>(0);
  const [items, setItems] = useState<EquipmentView[]>([]);
  const [busy, setBusy] = useState(false);
  const [instance, setInstance] = useState<any>(null);

  const client = useMemo(() => createPublicClient({ chain: sepolia, transport: http() }), []);

  useEffect(() => {
    const init = async () => {
      await initSDK();
      const cfg = { ...SepoliaConfig, network: (window as any).ethereum };
      const inst = await createInstance(cfg);
      setInstance(inst);
    };
    init();
  }, []);

  useEffect(() => {
    if (!isConnected || !address) {
      setEquipCount(0);
      setItems([]);
      return;
    }
    (async () => {
      try {
        const count = await client.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: ZAMAGAME_ABI,
          functionName: 'getPlayerEquipmentCount',
          args: [address],
        });
        const n = Number(count);
        setEquipCount(n);
        setItems(Array.from({ length: n }, (_, i) => ({ index: i })));
      } catch (e) {
        console.error('read count failed', e);
      }
    })();
  }, [isConnected, address, client]);

  const decryptOne = async (index: number) => {
    if (!instance || !address) return;
    try {
      const res = await client.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: ZAMAGAME_ABI,
        functionName: 'getMyEquipment',
        args: [BigInt(index)],
      });
      const [encType, encPower, exists] = res as readonly [`0x${string}`, `0x${string}`, boolean];
      if (!exists) return;

      const keypair = instance.generateKeypair();
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '7';
      const contracts = [CONTRACT_ADDRESS];
      const eip712 = instance.createEIP712(keypair.publicKey, contracts, startTimeStamp, durationDays);

      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      const signature = await signer.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message
      );

      const pairs = [
        { handle: encType as string, contractAddress: CONTRACT_ADDRESS },
        { handle: encPower as string, contractAddress: CONTRACT_ADDRESS },
      ];

      const result = await instance.userDecrypt(
        pairs,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x', ''),
        contracts,
        signer.address,
        startTimeStamp,
        durationDays
      );

      const typeVal = Number(result[encType as string]);
      const powerVal = Number(result[encPower as string]);
      setItems((prev) => prev.map((it) => (it.index === index ? { index, type: EQUIP_TYPE_LABELS[typeVal], attackPower: powerVal } : it)));
    } catch (e) {
      console.error('decrypt failed', e);
    }
  };

  const decryptAll = async () => {
    for (let i = 0; i < equipCount; i++) {
      // eslint-disable-next-line no-await-in-loop
      await decryptOne(i);
    }
  };

  const attack = async () => {
    if (!isConnected) return;
    setBusy(true);
    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const game = new ethers.Contract(CONTRACT_ADDRESS, ZAMAGAME_ABI as any, signer);
      const tx = await game.attackMonster();
      await tx.wait();
      const count = await client.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: ZAMAGAME_ABI,
        functionName: 'getPlayerEquipmentCount',
        args: [signer.address],
      });
      const n = Number(count);
      setEquipCount(n);
      setItems(Array.from({ length: n }, (_, i) => ({ index: i })));
    } catch (e) {
      console.error('attack failed', e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🏰 ZamaGame - 加密装备RPG</h1>
        <ConnectButton />
      </header>

      {!isConnected ? (
        <main style={{ textAlign: 'center', padding: '2rem 0' }}>
          <h2>请连接钱包开始游戏</h2>
          <p>连接你的钱包到Sepolia测试网来体验加密装备RPG游戏</p>
        </main>
      ) : (
        <main>
          <div style={{ margin: '1rem 0' }}>
            <button onClick={attack} disabled={busy}>
              {busy ? '攻击中...' : '⚔️ 攻击怪物'}
            </button>
          </div>

          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>🎒 我的装备 ({equipCount} 件)</h2>
              <button onClick={decryptAll} disabled={!equipCount}>🔓 解密所有装备</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              {items.map((it) => (
                <div key={it.index} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', background: '#fff' }}>
                  <h3>装备 #{it.index + 1}</h3>
                  <p><strong>类型:</strong> {it.type ?? '加密中'}</p>
                  <p><strong>攻击力:</strong> {it.attackPower ?? '加密中'}</p>
                  <button onClick={() => decryptOne(it.index)}>🔓 解密</button>
                </div>
              ))}
            </div>
            {equipCount === 0 && <p style={{ marginTop: '1rem' }}>还没有装备，快去攻击怪物吧！</p>}
          </section>
        </main>
      )}
    </div>
  );
}

