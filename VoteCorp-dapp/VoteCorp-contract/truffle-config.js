const HDWalletProvider = require('truffle-hdwallet-provider');
mnemonic='';
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
  	ropsten: {
  		provider: () => new HDWalletProvider(mnemonic, ''),
  		network_id: 3,
  		gas: 5000000,
  		skipDryRun: false
  	},
    development: {
      host: "localhost",
      port: 7545,
      network_id: "5777",
      gas: 4600000
    }
  }
};
