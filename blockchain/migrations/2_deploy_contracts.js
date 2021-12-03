var Market = artifacts.require("./Market.sol")
var NftCreator = artifacts.require("./NftCreator.sol");

module.exports = function(deployer) {
  deployer.deploy(Market).then(async() => {
    const marketContract = await Market.deployed();
    await deployer.deploy(NftCreator, marketContract.address)
  })  
};
