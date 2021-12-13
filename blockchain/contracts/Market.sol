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

    /// @notice enum used to designate if an item sale is active on the marketplace.
    enum State {notForSale, ForSale}

    /// @notice item designates the required metadata associated with each NFT listed to the marketplace.
    struct Item {
        address nftAddress;
        uint tokenId;
        uint itemId;
        address payable seller;
        address payable owner;
        uint price;
        State state;
    }

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

    /**
    @notice public function used to add an nft to the marketplace and build the Item metatdata
    @param nftAddress is the NFT creator contract address
    @param _tokenId is the direct ID of the NFT to be listed based on the NFT creator contract
    @param price is the sale price for the NFT on the marketplace 
     */
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

    /**
    @notice public payable function used to purchase an nft from the marketplace and transfer to buyer
    @param nftAddress is the NFT creator contract address
    @param _itemId is the marketplace ID of the NFT to be purchased
    */
    function purchaseNft(address nftAddress, uint _itemId) public payable nonReentrant {
        require(nftMap[_itemId].owner != msg.sender, 'Buyer and Seller cannot be the same addresses');
        require(nftMap[_itemId].state == State.ForSale, 'Item requested is not listed for sale.');
        require(msg.value == nftMap[_itemId].price, 'Please submit the correct amount of ether.');

        nftMap[_itemId].owner = payable(msg.sender);
        nftMap[_itemId].state = State.notForSale;
        
        IERC721(nftAddress).safeTransferFrom(address(this), msg.sender, nftMap[_itemId].tokenId);
        IERC721(nftAddress).setApprovalForAll(msg.sender, true);

        (bool salePriceTransferred, ) = nftMap[_itemId].seller.call{ value: msg.value }('');
        require(salePriceTransferred, 'Failed to transfer Eth to the seller.');

        emit NftPurchased(_itemId);
    }

    /**
    #### Read Function(s) ####
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

    function getItemPrice(uint _itemId) public view returns (uint price) {
        return nftMap[_itemId].price;
    }

    function getForSaleItems() public view returns (Item[] memory) {
        uint totalItemCount = _itemIds.current();
        uint itemsListedCount = 0;
        uint resultItemId = 0;

        for (uint i = 0; i < totalItemCount; i++) {
            if (nftMap[i + 1].state == State.ForSale) {
                itemsListedCount++;
            }
        }   

        Item[] memory listedItems = new Item[](itemsListedCount);
        for (uint i = 0; i < totalItemCount; i++) {
        if (nftMap[i + 1].state == State.ForSale) {
            uint thisItemId = nftMap[i + 1].itemId;
            Item storage thisItem = nftMap[thisItemId];
            listedItems[resultItemId] = thisItem;
            resultItemId++;
            }
        }
        return listedItems;
    }
}