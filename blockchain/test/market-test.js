let Market = artifacts.require("Market");
let Creator = artifacts.require("NftCreator");
const { items: ItemStruct, isDefined, isPayable, isType } = require("./ast-helper");

contract ("Nft Tester", function (accounts) {
    const [alice] = accounts;
    const listPrice = 2;

    beforeEach(async () => {
        store = await Market.new();
        minter = await Creator.new(store.address);
    });

    describe("enum State", () => {
        let enumState;
        before(() => {
          enumState = Market.enums.State;
          assert(
            enumState,
            "The contract should define an Enum called State"
          );
        });
  
        it("should define `notForSale`", () => {
          assert(
            enumState.hasOwnProperty('notForSale'),
            "The enum does not have a `notForSale` value"
          );
        });
  
        it("should define `ForSale`", () => {
          assert(
            enumState.hasOwnProperty('ForSale'),
            "The enum does not have a `ForSale` value"
            );
        });
    });
    
    describe("Item struct", () => {
        let subjectStruct;
  
        before(() => {
          subjectStruct = ItemStruct(Market);
          assert(
            subjectStruct !== null, 
            "The contract should define an `Item Struct`"
          );
        });
  
        it("should have a `nftAddress`", () => {
          assert(
            isDefined(subjectStruct)("nftAddress"), 
            "Struct Item should have a `nftAddress` denoting origin contract"
          );
          assert(
            isType(subjectStruct)("nftAddress")("address"), 
            "`nftAddress` should be of type `address`"
          );
        });
  
        it("should have a `tokenId`", () => {
          assert(
            isDefined(subjectStruct)("tokenId"), 
            "Struct Item should have a `tokenId` member"
          );
          assert(
            isType(subjectStruct)("tokenId")("uint"), 
            "`tokenId` should be of type `uint`"
          );
        });
  
        it("should have a `itemId`", () => {
          assert(
            isDefined(subjectStruct)("itemId"), 
            "Struct Item should have a `itemId` member"
          );
          assert(
            isType(subjectStruct)("itemId")("uint"), 
            "`itemId` should be of type `uint`"
          );
        });
  
        it("should have a `state`", () => {
          assert(
            isDefined(subjectStruct)("state"), 
            "Struct Item should have a `state` member"
          );
        });
  
        it("should have a `seller`", () => {
          assert(
            isDefined(subjectStruct)("seller"), 
            "Struct Item should have a `seller` member"
          );
          assert(
            isType(subjectStruct)("seller")("address"), 
            "`seller` should be of type `address`"
          );
          assert(
            isPayable(subjectStruct)("seller"), 
            "`seller` should be payable"
          );
        });
  
        it("should have a `owner`", () => {
          assert(
            isDefined(subjectStruct)("owner"), 
            "Struct Item should have a `owner` member"
          );
          assert(
            isType(subjectStruct)("owner")("address"), 
            "`owner` should be of type `address`"
          );
          assert(
            isPayable(subjectStruct)("owner"), 
            "`owner` should be payable"
          );
        });

        it("should have a `price`", () => {
            assert(
              isDefined(subjectStruct)("price"), 
              "Struct Item should have a `price` member"
            );
            assert(
              isType(subjectStruct)("price")("uint"), 
              "`price` should be of type `uint`"
            );
        });
    });

    describe("Nft Creation", () => {
        beforeEach(async ()=>{
            await minter.createNft("www.example1.com")
            await minter.createNft("www.example2.com")
        });

        it('should successfully set the tokenURI of the NFT', async() =>{
            const token1URI = await minter.tokenURI(1)
            const token2URI = await minter.tokenURI(2)
            expect(await token1URI).to.equal('www.example1.com')
            expect(await token2URI).to.equal('www.example2.com') 
        });
    });

    describe("Marketplace Transfer", () => {
        beforeEach(async () => {
            await minter.createNft("www.example1.com", { from: alice })
            await store.addToMarket(minter.address, 1, listPrice)
        })

        it("should successfully be added to the Market as ForSale", async () =>{
            const sellerItem = await store.getItemById(1)
            expect(await sellerItem[6]).to.equal("1")
        });

        it("should successfully be added to the Market and reflect the correct price", async () =>{
            const sellerItem = await store.getItemById(1)
            expect(await sellerItem[5]).to.equal(listPrice.toString())
        });
    });
});


