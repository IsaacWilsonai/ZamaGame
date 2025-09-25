import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { expect } from "chai";
import { ZamaGame, ZamaGame__factory } from "../types";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("ZamaGame")) as ZamaGame__factory;
  const game = (await factory.deploy()) as ZamaGame;
  const address = await game.getAddress();
  return { game, address };
}

describe("ZamaGame", function () {
  let signers: Signers;
  let game: ZamaGame;
  let address: string;

  before(async function () {
    const e = (await ethers.getSigners()) as HardhatEthersSigner[];
    signers = { deployer: e[0], alice: e[1], bob: e[2] };
  });

  beforeEach(async function () {
    // Only run on FHEVM mock within Hardhat
    if (!fhevm.isMock) {
      this.skip();
    }
    ({ game, address } = await deployFixture());
  });

  it("initial count is zero", async function () {
    const c = await game.getPlayerEquipmentCount(signers.alice.address);
    expect(c).to.eq(0n);
  });

  it("attack grants equipment and values decrypt in expected range", async function () {
    // Alice attacks 3 times
    for (let i = 0; i < 3; i++) {
      const tx = await game.connect(signers.alice).attackMonster();
      await tx.wait();
    }

    const count = await game.getPlayerEquipmentCount(signers.alice.address);
    expect(count).to.eq(3n);

    for (let i = 0; i < Number(count); i++) {
      const res = await game.connect(signers.alice).getMyEquipment(i);
      // res: [euint8 handle, euint32 handle, exists]
      expect(res[2]).to.eq(true);

      const eqType = await fhevm.userDecryptEuint(FhevmType.euint8, res[0], address, signers.alice);
      const power = await fhevm.userDecryptEuint(FhevmType.euint32, res[1], address, signers.alice);

      expect(eqType >= 0 && eqType <= 2).to.eq(true);
      expect(power >= 1 && power <= 100).to.eq(true);
    }
  });

  it("out of bounds returns exists=false and zero handles", async function () {
    const res = await game.connect(signers.alice).getMyEquipment(0);
    expect(res[2]).to.eq(false);
    expect(res[0]).to.eq(ethers.ZeroHash);
    expect(res[1]).to.eq(ethers.ZeroHash);
  });
});

