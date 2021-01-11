var VoteCorp = artifacts.require("VoteCorp");

module.exports = function(deployer) {
  deployer.deploy(VoteCorp,4);
};
