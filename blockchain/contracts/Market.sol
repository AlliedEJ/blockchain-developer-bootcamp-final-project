// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

contract Market is ERC721Holder, ReentrancyGuard{
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;

    mapping(uint => Item) public nftMap;

    enum State {notForSale, ForSale}

    struct Item {
        address nftAddress;
        uint tokenId;
        uint itemId;
        address payable seller;
        address payable owner;
        uint price;
        State state;
    }

    /**
    Events
     */
    event NftListed(
        address indexed nftAddress,
        uint indexed tokenId,
        uint indexed itemId,
        address seller,
        address owner,
        uint price,
        State state
    );   

    event NftPurchased(uint _itemId);

    function addToMarket(address nftAddress, uint _tokenId, uint price) public {
        require(price > 0, "Price must be greater than zero.");
        
        _itemIds.increment();
        uint newItemId = _itemIds.current();
        nftMap[newItemId] = Item({
            nftAddress: nftAddress,
            tokenId: _tokenId,
            itemId: newItemId,
            seller: payable(msg.sender),
            owner: payable(msg.sender),
            price: price,
            state: State.ForSale
        });

        IERC721(nftAddress).safeTransferFrom(msg.sender, address(this), _tokenId);

        emit NftListed(nftAddress, _tokenId, newItemId, msg.sender, address(0), price, State.ForSale);
    }

    function purchaseNft(address nftAddress, uint _itemId) public payable nonReentrant {
        require(nftMap[_itemId].owner != msg.sender, 'Buyer and Seller cannot be the same addresses');
        require(nftMap[_itemId].state == State.ForSale, 'Item requested is not listed for sale.');
        require(msg.value == nftMap[_itemId].price, 'Please submit the correct amount of ether.');

        IERC721(nftAddress).safeTransferFrom(address(this), msg.sender, nftMap[_itemId].tokenId);
        IERC721(nftAddress).setApprovalForAll(msg.sender, true);
        nftMap[_itemId].owner = payable(msg.sender);
        nftMap[_itemId].state = State.notForSale;

        (bool salePriceTransferred, ) = nftMap[_itemId].seller.call{ value: msg.value }('');
        require(salePriceTransferred, 'Failed to transfer Eth to the seller.');

        emit NftPurchased(_itemId);
    }

    /**
    Read Functions
    */
   function fetchItem(uint _itemId) public view returns (address nftAddress, uint tokenId, uint itemId, address seller, address owner, uint price) {
        nftAddress = nftMap[_itemId].nftAddress;
        tokenId = nftMap[_itemId].tokenId;
        itemId = nftMap[_itemId].itemId;
        seller = nftMap[_itemId].seller;
        owner = nftMap[_itemId].owner;
        price = nftMap[_itemId].price;

        return (nftAddress, tokenId, itemId, seller, owner, price);
  }

    function getItemById(uint _itemId) public view returns (Item memory) {
        return nftMap[_itemId];
    }
}