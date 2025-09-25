import { useEffect, useMemo, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { createPublicClient, http, custom } from 'viem';
import { sepolia } from 'viem/chains';
import { initSDK, createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';
import { ZAMAGAME_ABI } from '../config/zamagame-abi';
import monster from '../assets/monster.svg';
import { ethers } from 'ethers';

type EquipmentView = { index: number; type?: string; attackPower?: number };

const CONTRACT_ADDRESS = '0xAC8119750D7a1b344d4c2A818083c1b676aA7e3a';
const EQUIP_TYPE_LABELS = ['Weapon', 'Shoe', 'Armor'] as const;

export default function Home() {
  const { address, isConnected } = useAccount();
  const [equipCount, setEquipCount] = useState<number>(0);
  const [items, setItems] = useState<EquipmentView[]>([]);
  const [busy, setBusy] = useState(false);
  const [instance, setInstance] = useState<any>(null);
  const [status, setStatus] = useState<string>('');

  const client = useMemo(() => {
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        return createPublicClient({ chain: sepolia, transport: custom((window as any).ethereum) });
      }
    } catch {}
    return createPublicClient({ chain: sepolia, transport: http() });
  }, []);

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
        setStatus('读取加密装备中...');
        const count = await client.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: ZAMAGAME_ABI,
          functionName: 'getPlayerEquipmentCount',
          args: [address],
        });
        const n = Number(count);
        setEquipCount(n);
        setItems(Array.from({ length: n }, (_, i) => ({ index: i })));
        setStatus('');
      } catch (e) {
        console.error('read count failed', e);
        setStatus('读取装备数量失败，请检查网络/链');
      }
    })();
  }, [isConnected, address, client]);

  const decryptOne = async (index: number) => {
    if (!instance || !address) {
      setStatus('解密环境尚未初始化或未连接钱包');
      return;
    }
    try {
      setStatus('读取加密装备中...');
      const res = await client.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: ZAMAGAME_ABI,
        functionName: 'getMyEquipment',
        account: address as `0x${string}`,
        args: [BigInt(index)],
      });
      const [encType, encPower, exists] = res as readonly [`0x${string}`, `0x${string}`, boolean];
      if (!exists) {
        setStatus('未找到该装备（索引可能超出范围）');
        return;
      }

      setStatus('准备签名授权...');
      const keypair = instance.generateKeypair();
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '7';
      const contracts = [CONTRACT_ADDRESS];
      const eip712 = instance.createEIP712(keypair.publicKey, contracts, startTimeStamp, durationDays);

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const signature = await signer.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message
      );

      setStatus('向 Relayer 发起解密请求...');
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
        userAddress,
        startTimeStamp,
        durationDays
      );

      const typeVal = Number(result[encType as string]);
      const powerVal = Number(result[encPower as string]);
      setItems((prev) => prev.map((it) => (it.index === index ? { index, type: EQUIP_TYPE_LABELS[typeVal], attackPower: powerVal } : it)));
      setStatus('解密完成');
    } catch (e) {
      console.error('decrypt failed', e);
      setStatus('解密失败，请在控制台查看详细错误');
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
          <section style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1rem', alignItems: 'center', padding: '1rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <img src={monster} alt="怪物" width={220} height={200} style={{ objectFit: 'contain' }} />
            <div>
              <h2 style={{ margin: '0 0 0.5rem' }}>野外怪物</h2>
              <p style={{ margin: '0 0 0.5rem', color: '#374151' }}>攻击怪物可以获得加密的随机NFT道具。</p>
              <p style={{ margin: 0, color: '#6b7280' }}>掉落类型：武器 / 鞋子 / 盾牌（属性与类型在链上加密，需点击解密才能查看）。</p>
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem' }}>
                <button onClick={attack} disabled={busy}>
                  {busy ? '攻击中...' : '⚔️ 攻击怪物'}
                </button>
                {/* <button onClick={() => decryptAll()} disabled={!equipCount || !instance}>🔓 解密所有掉落</button> */}
              </div>
            </div>
          </section>

          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>🎒 我的装备 ({equipCount} 件)</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {/* <button onClick={decryptAll} disabled={!equipCount || !instance}>🔓 解密所有装备</button> */}
                <button onClick={() => {
                  // 手动刷新计数
                  if (!address) return;
                  setStatus('读取加密装备中...');
                  client.readContract({ address: CONTRACT_ADDRESS as `0x${string}`, abi: ZAMAGAME_ABI, functionName: 'getPlayerEquipmentCount', args: [address] })
                    .then((count) => {
                      const n = Number(count);
                      setEquipCount(n);
                      setItems(Array.from({ length: n }, (_, i) => ({ index: i })));
                      setStatus('');
                    })
                    .catch((e) => { console.error(e); setStatus('读取失败'); });
                }}>↻ 刷新</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              {items.map((it) => (
                <div key={it.index} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', background: '#fff' }}>
                  <h3>装备 #{it.index + 1}</h3>
                  <p><strong>类型:</strong> {it.type ?? '加密中'}</p>
                  <p><strong>攻击力:</strong> {it.attackPower ?? '加密中'}</p>
                  <button onClick={() => decryptOne(it.index)} disabled={!instance}>🔓 解密</button>
                </div>
              ))}
            </div>
            {status && <p style={{ marginTop: '0.75rem', color: '#374151' }}>{status}</p>}
            {equipCount === 0 && <p style={{ marginTop: '1rem' }}>还没有装备，快去攻击怪物吧！</p>}
          </section>
        </main>
      )}
    </div>
  );
}
