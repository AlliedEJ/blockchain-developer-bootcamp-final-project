// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NftCreator is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    constructor() public ERC721("BootNFT", "BNFT") {}

    function createNFT(string memory tokenURI) public returns (uint256){
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

    function tokenCount() public view returns (uint256){
        return _tokenIds.current();
    }

    // function isOwner(uint tokenId) view public returns(bool){
    //     if (_owners[tokenId] == msg.sender){
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }
}
