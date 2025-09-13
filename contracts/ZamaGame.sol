// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, euint32, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title ZamaGame - 一个使用Zama加密的RPG游戏
/// @notice 玩家可以攻击怪物获得加密的装备
contract ZamaGame is SepoliaConfig {
    // 装备类型常量 (0=武器, 1=鞋, 2=盾牌)
    uint8 constant WEAPON = 0;
    uint8 constant SHOES = 1;
    uint8 constant SHIELD = 2;
    
    // 装备结构体
    struct Equipment {
        euint8 equipmentType;  // 加密的装备类型
        euint32 attackPower;   // 加密的攻击力
        bool exists;           // 装备是否存在
    }
    
    // 玩家数据
    mapping(address => Equipment[]) public playerEquipments;
    mapping(address => uint256) public playerEquipmentCount;
    
    // 事件
    event MonsterAttacked(address indexed player, uint256 indexed equipmentIndex);
    event EquipmentGenerated(address indexed player, uint256 indexed equipmentIndex);
    
    /// @notice 攻击怪物并随机获得装备
    /// @dev 使用Zama的随机数功能生成加密的装备
    function attackMonster() external {
        // 生成随机的装备类型 (0-2)
        euint8 randomType = FHE.rem(FHE.randEuint8(), 3);
        
        // 生成随机的攻击力 (1-100)
        euint32 randomPower = FHE.add(FHE.rem(FHE.randEuint32(), 100), 1);
        
        // 创建新装备
        Equipment memory newEquipment = Equipment({
            equipmentType: randomType,
            attackPower: randomPower,
            exists: true
        });
        
        // 添加到玩家的装备列表
        playerEquipments[msg.sender].push(newEquipment);
        uint256 equipmentIndex = playerEquipmentCount[msg.sender];
        playerEquipmentCount[msg.sender]++;
        
        // 设置ACL权限 - 允许合约和玩家访问加密数据
        FHE.allowThis(newEquipment.equipmentType);
        FHE.allow(newEquipment.equipmentType, msg.sender);
        
        FHE.allowThis(newEquipment.attackPower);
        FHE.allow(newEquipment.attackPower, msg.sender);
        
        emit MonsterAttacked(msg.sender, equipmentIndex);
        emit EquipmentGenerated(msg.sender, equipmentIndex);
    }
    
    /// @notice 获取玩家的装备数量
    /// @param player 玩家地址
    /// @return 装备数量
    function getPlayerEquipmentCount(address player) external view returns (uint256) {
        return playerEquipmentCount[player];
    }
    
    /// @notice 获取玩家指定索引的装备
    /// @param player 玩家地址
    /// @param index 装备索引
    /// @return equipmentType 加密的装备类型
    /// @return attackPower 加密的攻击力
    /// @return exists 装备是否存在
    function getPlayerEquipment(address player, uint256 index) 
        external 
        view 
        returns (euint8 equipmentType, euint32 attackPower, bool exists) 
    {
        require(index < playerEquipmentCount[player], "Equipment not found");
        Equipment storage equipment = playerEquipments[player][index];
        return (equipment.equipmentType, equipment.attackPower, equipment.exists);
    }
    
    /// @notice 获取玩家自己的装备 (用于前端解密)
    /// @param index 装备索引
    /// @return equipmentType 加密的装备类型
    /// @return attackPower 加密的攻击力
    /// @return exists 装备是否存在
    function getMyEquipment(uint256 index) 
        external 
        view 
        returns (euint8 equipmentType, euint32 attackPower, bool exists) 
    {
        require(index < playerEquipmentCount[msg.sender], "Equipment not found");
        Equipment storage equipment = playerEquipments[msg.sender][index];
        return (equipment.equipmentType, equipment.attackPower, equipment.exists);
    }
    
    /// @notice 批量获取玩家自己的所有装备 (返回加密数据供前端解密)
    /// @return types 所有装备的加密类型数组
    /// @return powers 所有装备的加密攻击力数组
    function getMyAllEquipments() 
        external 
        view 
        returns (euint8[] memory types, euint32[] memory powers) 
    {
        uint256 count = playerEquipmentCount[msg.sender];
        types = new euint8[](count);
        powers = new euint32[](count);
        
        for (uint256 i = 0; i < count; i++) {
            Equipment storage equipment = playerEquipments[msg.sender][i];
            if (equipment.exists) {
                types[i] = equipment.equipmentType;
                powers[i] = equipment.attackPower;
            }
        }
        
        return (types, powers);
    }
    
    /// @notice 检查装备类型是否为武器 (返回加密的布尔值)
    /// @param index 装备索引
    /// @return 如果是武器返回加密的true，否则返回加密的false
    function isWeapon(uint256 index) external returns (ebool) {
        require(index < playerEquipmentCount[msg.sender], "Equipment not found");
        Equipment storage equipment = playerEquipments[msg.sender][index];
        ebool result = FHE.eq(equipment.equipmentType, WEAPON);
        
        // 设置ACL权限
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);
        
        return result;
    }
    
    /// @notice 检查装备类型是否为鞋子
    /// @param index 装备索引
    /// @return 如果是鞋子返回加密的true，否则返回加密的false
    function isShoes(uint256 index) external returns (ebool) {
        require(index < playerEquipmentCount[msg.sender], "Equipment not found");
        Equipment storage equipment = playerEquipments[msg.sender][index];
        ebool result = FHE.eq(equipment.equipmentType, SHOES);
        
        // 设置ACL权限
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);
        
        return result;
    }
    
    /// @notice 检查装备类型是否为盾牌
    /// @param index 装备索引
    /// @return 如果是盾牌返回加密的true，否则返回加密的false
    function isShield(uint256 index) external returns (ebool) {
        require(index < playerEquipmentCount[msg.sender], "Equipment not found");
        Equipment storage equipment = playerEquipments[msg.sender][index];
        ebool result = FHE.eq(equipment.equipmentType, SHIELD);
        
        // 设置ACL权限
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);
        
        return result;
    }
}