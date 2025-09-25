import { useEffect, useMemo, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { createPublicClient, http, custom } from 'viem';
import { sepolia } from 'viem/chains';
import { initSDK, createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';
import { ZAMAGAME_ABI } from '../config/zamagame-abi';
import monster from '../assets/monster.svg';
import { ethers } from 'ethers';
import './Home.css';

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
        setStatus('Loading encrypted equipment...');
        const count = await client.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: ZAMAGAME_ABI,
          functionName: 'getPlayerEquipmentCount',
          args: [address as `0x${string}`],
        });
        const n = Number(count);
        setEquipCount(n);
        setItems(Array.from({ length: n }, (_, i) => ({ index: i })));
        setStatus('');
      } catch (e) {
        console.error('read count failed', e);
        setStatus('Failed to load equipment count, please check network/chain');
      }
    })();
  }, [isConnected, address, client]);

  const decryptOne = async (index: number) => {
    if (!instance || !address) {
      setStatus('Decryption environment not initialized or wallet not connected');
      return;
    }
    try {
      setStatus('Loading encrypted equipment...');
      const res = await client.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: ZAMAGAME_ABI,
        functionName: 'getMyEquipment',
        account: address as `0x${string}`,
        args: [BigInt(index)],
      });
      const [encType, encPower, exists] = res as readonly [`0x${string}`, `0x${string}`, boolean];
      if (!exists) {
        setStatus('Equipment not found (index may be out of range)');
        return;
      }

      setStatus('Preparing signature authorization...');
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

      setStatus('Sending decryption request to Relayer...');
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
      setStatus('Decryption completed');
    } catch (e) {
      console.error('decrypt failed', e);
      setStatus('Decryption failed, please check console for detailed errors');
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
        args: [address as `0x${string}`],
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
    <div className="game-container">
      <header className="header">
        <div className="header-content">
          <h1 className="game-title">🏰 ZamaGame</h1>
          <p className="game-subtitle">Encrypted Equipment RPG</p>
        </div>
        <ConnectButton />
      </header>

      {!isConnected ? (
        <main className="welcome-screen">
          <div className="welcome-content">
            <div className="welcome-icon">🗡️</div>
            <h2 className="welcome-title">Ready for Battle?</h2>
            <p className="welcome-description">
              Connect your wallet to the Sepolia testnet and embark on an epic adventure with encrypted NFT equipment!
            </p>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">⚔️</div>
                <h3>Battle Monsters</h3>
                <p>Fight epic creatures to earn rare equipment</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3>Encrypted NFTs</h3>
                <p>All item stats are encrypted on-chain</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎒</div>
                <h3>Collect & Decrypt</h3>
                <p>Build your inventory and reveal hidden powers</p>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <main className="game-main">
          <section className="battle-section">
            <div className="monster-card">
              <div className="monster-image-container">
                <img src={monster} alt="Monster" className="monster-image" />
                <div className="monster-glow"></div>
              </div>
              <div className="monster-info">
                <h2 className="monster-title">🐉 Ancient Dragon</h2>
                <div className="monster-stats">
                  <div className="stat">
                    <span className="stat-label">Level</span>
                    <span className="stat-value">???</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">HP</span>
                    <span className="stat-value">∞</span>
                  </div>
                </div>
                <p className="monster-description">
                  A legendary creature guarding ancient treasures. Defeat it to claim encrypted equipment with mysterious powers!
                </p>
                <div className="loot-info">
                  <h4>Possible Drops:</h4>
                  <div className="loot-types">
                    <span className="loot-type weapon">⚔️ Weapons</span>
                    <span className="loot-type armor">🛡️ Armor</span>
                    <span className="loot-type shoes">👟 Shoes</span>
                  </div>
                </div>
                <button className="attack-button" onClick={attack} disabled={busy}>
                  {busy ? (
                    <>
                      <span className="button-spinner"></span>
                      Battling...
                    </>
                  ) : (
                    <>
                      ⚔️ Attack Monster
                      <span className="button-glow"></span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          <section className="inventory-section">
            <div className="section-header">
              <h2 className="section-title">
                🎒 Your Arsenal
                <span className="item-count">({equipCount} {equipCount === 1 ? 'item' : 'items'})</span>
              </h2>
              <button className="refresh-button" onClick={() => {
                if (!address) return;
                setStatus('Loading encrypted equipment...');
                client.readContract({ address: CONTRACT_ADDRESS as `0x${string}`, abi: ZAMAGAME_ABI, functionName: 'getPlayerEquipmentCount', args: [address] })
                  .then((count) => {
                    const n = Number(count);
                    setEquipCount(n);
                    setItems(Array.from({ length: n }, (_, i) => ({ index: i })));
                    setStatus('');
                  })
                  .catch((e) => { console.error(e); setStatus('Loading failed'); });
              }}>
                <span className="refresh-icon">↻</span> Refresh
              </button>
            </div>

            {equipCount === 0 ? (
              <div className="empty-inventory">
                <div className="empty-icon">📦</div>
                <h3>Your arsenal awaits!</h3>
                <p>Battle the dragon above to claim your first encrypted equipment</p>
              </div>
            ) : (
              <div className="equipment-grid">
                {items.map((it) => (
                  <div key={it.index} className={`equipment-card ${it.type ? 'decrypted' : 'encrypted'}`}>
                    <div className="equipment-header">
                      <h3 className="equipment-title">Equipment #{it.index + 1}</h3>
                      {it.type && <div className="rarity-badge">✨ Revealed</div>}
                    </div>

                    <div className="equipment-stats">
                      <div className="stat-row">
                        <span className="stat-label">Type:</span>
                        <span className={`stat-value ${it.type ? 'revealed' : 'hidden'}`}>
                          {it.type || '🔒 Encrypted'}
                        </span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Power:</span>
                        <span className={`stat-value ${it.attackPower ? 'revealed' : 'hidden'}`}>
                          {it.attackPower || '🔒 Encrypted'}
                        </span>
                      </div>
                    </div>

                    <button
                      className="decrypt-button"
                      onClick={() => decryptOne(it.index)}
                      disabled={!instance || !!it.type}
                    >
                      {it.type ? '✅ Decrypted' : '🔓 Reveal Stats'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {status && (
              <div className="status-message">
                <div className="status-icon">⚡</div>
                <p>{status}</p>
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  );
}
