var NftCreator = artifacts.require("./NftCreator.sol");

module.exports = function(deployer) {
  deployer.deploy(NftCreator);
};
