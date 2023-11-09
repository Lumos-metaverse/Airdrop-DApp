//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Airdrop{
    bytes32 public merkleRoot = 0x7c56ea52358c2b726ae6201452f2fd3a36c0481658756195cec50f411a2e2af2;
    address tokenAddress;

    mapping(address => bool) claimed;

    /// @dev pass in the address of the token address at construction
    constructor(address _tokenAddress){
        tokenAddress = _tokenAddress;
    }

    function claimToken(bytes32[] calldata _merkleProof, uint256 _amount) external returns(bool){
        require(!claimed[msg.sender], "Already Claimed");
         bytes32 leaf = keccak256(abi.encodePacked(msg.sender, _amount));

        if(!MerkleProof.verify(_merkleProof, merkleRoot, leaf)) {
            revert("You are not eligible to claim");
        }

        claimed[msg.sender] = true;
    
        IERC20(tokenAddress).transfer(msg.sender, _amount);
        return true;
    }
    
}