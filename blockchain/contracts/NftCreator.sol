// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NftCreator is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    /// @notice the marketContractAddress is the market used to list NFT sales--set in contract constructor
    address public marketContractAddress;
    constructor(address marketAddress) public ERC721("BootNFT", "BNFT") {
        marketContractAddress = marketAddress;
    }

/**
    @notice mints ERC721 tokens to msg.sender (Caller) address
    @param tokenURI is the link to the JSON format of the token's metadata
    @return newItemId represents the newly minted token
 */
    function createNft(string memory tokenURI) public returns (uint256){
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        setApprovalForAll(marketContractAddress, true);

        return newTokenId;
    }
    
    /**
    #### Read Function(s) ####
    */   
    /// @return returns the total number of tokens minted by the contract
    function tokenCount() public view returns (uint256){
        return _tokenIds.current();
    }
}
