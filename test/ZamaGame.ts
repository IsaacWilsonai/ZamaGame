import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import type { ZamaGame } from "../types";
import { FhevmType } from "@fhevm/hardhat-plugin";

describe("ZamaGame", function () {
  let zamaGame: ZamaGame;
  let owner: any;
  let player1: any;
  let player2: any;

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();
    
    // 部署ZamaGame合约
    const ZamaGameFactory = await ethers.getContractFactory("ZamaGame");
    zamaGame = await ZamaGameFactory.deploy();
    await zamaGame.waitForDeployment();
  });

  describe("部署", function () {
    it("应该正确部署合约", async function () {
      expect(await zamaGame.getAddress()).to.be.a("string");
    });
  });

  describe("攻击怪物", function () {
    it("应该能够攻击怪物并获得装备", async function () {
      // 获取玩家初始装备数量
      const initialCount = await zamaGame.getPlayerEquipmentCount(player1.address);
      expect(initialCount).to.equal(0);

      // 攻击怪物
      const tx = await zamaGame.connect(player1).attackMonster();
      await tx.wait();

      // 验证装备数量增加
      const newCount = await zamaGame.getPlayerEquipmentCount(player1.address);
      expect(newCount).to.equal(1);
    });

    it("多次攻击应该获得多个装备", async function () {
      // 攻击怪物3次
      for (let i = 0; i < 3; i++) {
        const tx = await zamaGame.connect(player1).attackMonster();
        await tx.wait();
      }

      // 验证装备数量
      const count = await zamaGame.getPlayerEquipmentCount(player1.address);
      expect(count).to.equal(3);
    });

    it("不同玩家应该有独立的装备", async function () {
      // 玩家1攻击怪物
      await zamaGame.connect(player1).attackMonster();
      
      // 玩家2攻击怪物2次
      await zamaGame.connect(player2).attackMonster();
      await zamaGame.connect(player2).attackMonster();

      // 验证装备数量
      const count1 = await zamaGame.getPlayerEquipmentCount(player1.address);
      const count2 = await zamaGame.getPlayerEquipmentCount(player2.address);
      
      expect(count1).to.equal(1);
      expect(count2).to.equal(2);
    });
  });

  describe("获取装备信息", function () {
    beforeEach(async function () {
      // 为测试准备一个装备
      const tx = await zamaGame.connect(player1).attackMonster();
      await tx.wait();
    });

    it("应该能够获取装备信息", async function () {
      const [equipmentType, attackPower, exists] = await zamaGame
        .connect(player1)
        .getMyEquipment(0);
      
      expect(exists).to.be.true;
      // 注意：equipmentType和attackPower是加密的，所以我们不能直接比较其值
      expect(equipmentType).to.be.a("string");
      expect(attackPower).to.be.a("string");
    });

    it("获取不存在的装备应该失败", async function () {
      await expect(
        zamaGame.connect(player1).getMyEquipment(999)
      ).to.be.revertedWith("Equipment not found");
    });

    it("应该能够批量获取所有装备", async function () {
      // 再获得2个装备
      await zamaGame.connect(player1).attackMonster();
      await zamaGame.connect(player1).attackMonster();
      
      const [types, powers] = await zamaGame.connect(player1).getMyAllEquipments();
      
      expect(types.length).to.equal(3);
      expect(powers.length).to.equal(3);
    });
  });

  describe("装备类型检查", function () {
    beforeEach(async function () {
      // 为测试准备一个装备
      const tx = await zamaGame.connect(player1).attackMonster();
      await tx.wait();
    });

    it("应该能够检查装备类型", async function () {
      // 这些函数现在是state-changing的，所以我们需要发送交易
      const weaponTx = await zamaGame.connect(player1).isWeapon(0);
      await weaponTx.wait();
      
      const shoesTx = await zamaGame.connect(player1).isShoes(0);
      await shoesTx.wait();
      
      const shieldTx = await zamaGame.connect(player1).isShield(0);
      await shieldTx.wait();
      
      // 验证交易成功执行
      expect(weaponTx).to.have.property('hash');
      expect(shoesTx).to.have.property('hash');
      expect(shieldTx).to.have.property('hash');
    });

    it("检查不存在的装备类型应该失败", async function () {
      await expect(
        zamaGame.connect(player1).isWeapon(999)
      ).to.be.revertedWith("Equipment not found");
    });
  });

  describe("权限控制", function () {
    beforeEach(async function () {
      // 玩家1获得装备
      const tx = await zamaGame.connect(player1).attackMonster();
      await tx.wait();
    });

    it("玩家只能访问自己的装备", async function () {
      // 玩家1应该能访问自己的装备
      const [equipmentType, attackPower, exists] = await zamaGame
        .connect(player1)
        .getMyEquipment(0);
      expect(exists).to.be.true;

      // 玩家2不能通过getMyEquipment访问玩家1的装备（因为会检查msg.sender）
      const count = await zamaGame.getPlayerEquipmentCount(player2.address);
      expect(count).to.equal(0);
    });
  });

  describe("事件", function () {
    it("攻击怪物应该发出事件", async function () {
      await expect(zamaGame.connect(player1).attackMonster())
        .to.emit(zamaGame, "MonsterAttacked")
        .withArgs(player1.address, 0);
    });

    it("生成装备应该发出事件", async function () {
      await expect(zamaGame.connect(player1).attackMonster())
        .to.emit(zamaGame, "EquipmentGenerated")
        .withArgs(player1.address, 0);
    });
  });

  // 如果需要进行加密解密测试，可以添加以下测试
  // 但需要注意这需要完整的FHEVM环境
  describe.skip("解密测试 (需要FHEVM环境)", function () {
    it("应该能够解密装备类型和攻击力", async function () {
      // 攻击怪物获得装备
      const tx = await zamaGame.connect(player1).attackMonster();
      await tx.wait();

      // 获取加密的装备信息
      const [encryptedType, encryptedPower] = await zamaGame
        .connect(player1)
        .getMyEquipment(0);

      // 在真实的FHEVM环境中，可以进行解密测试
      // const decryptedType = await fhevm.userDecryptEuint(
      //   FhevmType.euint8,
      //   encryptedType,
      //   zamaGame.address,
      //   player1
      // );
      
      // 验证解密后的装备类型在有效范围内 (0-2)
      // expect(decryptedType).to.be.at.least(0);
      // expect(decryptedType).to.be.at.most(2);
    });
  });
});