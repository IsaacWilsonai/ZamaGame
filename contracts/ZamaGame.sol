// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, euint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title ZamaGame - Encrypted loot RPG demo
/// @notice Players can attack a monster to receive confidential equipment.
///         Equipment type (0: Weapon, 1: Shoes, 2: Shield) and attack power are encrypted euints.
contract ZamaGame is SepoliaConfig {
    struct Equipment {
        euint8 equipmentType; // 0: Weapon, 1: Shoes, 2: Shield
        euint32 attackPower;  // 1..100
        bool exists;
    }

    mapping(address => Equipment[]) private _equipments;

    /// @notice Attack a monster to obtain a random encrypted equipment.
    function attackMonster() external {
        // Pseudo-randomness for demo only. Do not use in production.
        uint256 rand = uint256(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, msg.sender, _equipments[msg.sender].length)));
        uint8 equipmentTypeClear = uint8(rand % 3); // 0..2
        uint32 attackPowerClear = uint32((rand % 100) + 1); // 1..100

        euint8 encType = FHE.asEuint8(equipmentTypeClear);
        euint32 encPower = FHE.asEuint32(attackPowerClear);

        // Push equipment
        _equipments[msg.sender].push(Equipment({equipmentType: encType, attackPower: encPower, exists: true}));

        // Grant ACL so the player can decrypt their equipment
        Equipment storage eq = _equipments[msg.sender][_equipments[msg.sender].length - 1];
        FHE.allow(eq.equipmentType, msg.sender);
        FHE.allow(eq.attackPower, msg.sender);
        // Allow contract itself as well (optional, useful for chained FHE ops)
        FHE.allowThis(eq.equipmentType);
        FHE.allowThis(eq.attackPower);
    }

    /// @notice Get how many equipments a player owns
    function getPlayerEquipmentCount(address player) external view returns (uint256) {
        return _equipments[player].length;
    }

    /// @notice Get caller's equipment at index
    /// @dev Returns encrypted handles if exists, or zero handles with exists=false
    function getMyEquipment(uint256 index) external view returns (euint8 equipmentType, euint32 attackPower, bool exists) {
        if (index >= _equipments[msg.sender].length) {
            return (euint8.wrap(bytes32(0)), euint32.wrap(bytes32(0)), false);
        }
        Equipment storage eq = _equipments[msg.sender][index];
        return (eq.equipmentType, eq.attackPower, true);
    }
}
