App = {
  web3Provider: null,
  contracts: {},
  names: new Array(),
  url: '',
  chairPerson:null,
  currentAccount:null,
  address:'',
  init: function() {
    $.getJSON('../proposals.json', function(data) {
      var proposalsRow = $('#proposalsRow');
      var proposalTemplate = $('#proposalTemplate');

      for (i = 0; i < data.length; i ++) {
        proposalTemplate.find('.panel-title').text(data[i].name);
        proposalTemplate.find('img').attr('src', data[i].picture);
        proposalTemplate.find('.btn-vote').attr('data-id', data[i].id);

        proposalsRow.append(proposalTemplate.html());
        App.names.push(data[i].name);
      }
    });
    return App.initWeb3();
  },

  initWeb3: function() {
        // Is there is an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fallback to the TestRPC
      App.web3Provider = new Web3.providers.HttpProvider(App.url);
    }
    web3 = new Web3(App.web3Provider);

    ethereum.enable();

    App.populateAddress();
    return App.initContract();
  },

  initContract: function() {
      $.getJSON('VoteCorp.json', function(data) {
    // Get the necessary contract artifact file and instantiate it with truffle-contract
    var voteArtifact = data;
    App.contracts.vote = TruffleContract(voteArtifact);

    // Set the provider for our contract
    App.contracts.vote.setProvider(App.web3Provider);
    return App.bindEvents();
  });
  },

  bindEvents: function() {
    $(document).on('click', '.btn-vote', App.handleVote);
    $(document).on('click', '#win-count', App.handleWinner);
    $(document).on('click', '#submit_add', function(){ var ad = $('#enter_address').val(); console.log(ad); App.handleAddress(ad); });
    $(document).on('click', '#ageSubmission', function(){ var ad = $('#age').val(); console.log(ad); App.handleAge(ad); });
    $(document).on('click', '#membershipSubmission', function(){ var ad = $('#membership').val(); console.log(ad); App.handleMembership(ad); });
    $(document).on('click', '#bopMemberSubmission', function(){ var ad = $('#bopMember').val(); console.log(ad); App.handleBOPMembership(ad); }); //voteDetails = bopmember
    $(document).on('click', '#registration', function(){ var ad = $('#enter_address').val(); console.log(ad); App.handleRegisterDetails(ad);});
    $(document).on('click', '#chairPersonSubmission', function(){ var ad1 = $('#chairPersonKey').val(); console.log(ad1); var ad2 = $('#chairPersonPassword').val(); console.log(ad2); App.handleChairPersonVerification(ad1, ad2);});
    $(document).on('click', '#b1', function(){ console.log("clicked"); App.handleVote("0");});
    $(document).on('click', '#b2', function(){ console.log("clicked"); App.handleVote("1");});
    $(document).on('click', '#b3', function(){ console.log("clicked"); App.handleVote("2");});
    $(document).on('click', '#b4', function(){ console.log("clicked"); App.handleVote("3");});
    $(document).on('click', '#win-count', function(){ console.log("clicked"); App.handleWinner();});
    $(document).on('click', '#stateSubmission', function(){ var ad = $('#stateChange').val(); console.log(ad); App.handleStateChange(ad);});
    // $(document).on('click', '#changeState2', function(){ console.log("clicked"); App.handleStateChange(3);});
  },

  populateAddress : function(){
    new Web3(new Web3.providers.HttpProvider(App.url)).eth.getAccounts((err, accounts) => {
      jQuery.each(accounts,function(i){ 
        if(web3.eth.coinbase != accounts[i]){
          optionElementFirst='<option value="'+accounts[1]+'">'+accounts[1]+'</option';
          var optionElement = '<option value="'+accounts[i]+'">'+accounts[i]+'</option';
          jQuery('#enter_address').append(optionElement);  
        }
      });
      jQuery('#chair_address').append(optionElementFirst); 
      App.chairPerson=$('#chair_address').val();
      console.log(App.chairPerson)
    });
  },

  handleAddress: function(addr){
    console.log(addr)
    var voteInstance;
    App.contracts.vote.deployed().then(function(instance) {
      voteInstance = instance;
      return voteInstance.enterAddress(addr);
    }).then(function(result, err){
        if(result){
            //debugger
            console.log(result.receipt.status)
            if(parseInt(result.receipt.status) == 1)
            alert(addr + " Address Checking Done Successfully. This is a Valid Address")
            else
            alert(addr + " Address Checking failed due to revert. This is not a valid Address")
        } else {
            alert(addr + " Address Checking failed")
        }   
    });
},

handleAge: function(addr){
  if(addr<=18)
  {
    alert("Entered age is below 18. You must be above 18 to register.")
  }
  var voteInstance;
  App.contracts.vote.deployed().then(function(instance) {
    voteInstance = instance;
    return voteInstance.enterEmployeeAge(addr);
  }).then(function(result, err){
      if(result){
          if(parseInt(result.receipt.status) == 1)
          alert(addr + " You have entered your age successfully . Please Proceed with further details ")
          else
          alert(addr + " Age Checking failed due to revert")
      } else {
          alert(addr + " Age Checking failed")
      }   
  });
},

handleMembership: function(addr){
  if(addr==0)
  {
    alert("You must be a member of coindeal.com to register")
  }
    var voteInstance;
    App.contracts.vote.deployed().then(function(instance) {
      voteInstance = instance;
      return voteInstance.enterMember(addr);
    }).then(function(result, err){
        if(result){
            if(parseInt(result.receipt.status) == 1)
            alert(addr + " You have entered your membership details successfully . Please Proceed with further details ")
            else
            alert(addr + " membership details failed due to revert")
        } else {
            alert(addr + " membership details failed")
        }   
    });
  },

  handleBOPMembership: function(addr){
    var voteInstance;
    App.contracts.vote.deployed().then(function(instance) {
      voteInstance = instance;
      return voteInstance.enterMemberOfBOP(addr);
    }).then(function(result, err){
        if(result){
            if(parseInt(result.receipt.status) == 1)
            alert(addr + " You have entered your Board of operations member details successfully . Please Proceed with further details ")
            else
            alert(addr + " previous voting details failed due to revert")
        } else {
            alert(addr + " previous voting details failed")
        }   
    });
  },

  handleRegisterDetails: function(addr){
    var voteInstance;
    App.contracts.vote.deployed().then(function(instance) {
      voteInstance = instance;
      return voteInstance.register(addr);
      //debugger
    }).then(function(result, err){
        if(result){
          //debugger
          if(parseInt(result.receipt.status) == 1)
            alert(addr + " You have registered a voter successfully . Please Proceed with further details ")
            else
            alert(addr + " Registration failed due to revert")
        } else {
            alert(addr + " registration failed")
        }   
    });
  },

  handleChairPersonVerification: function(addr1, addr2){
    var voteInstance;
    App.contracts.vote.deployed().then(function(instance) {
      voteInstance = instance;
      return voteInstance.hashMe(addr1, addr2);
      //debugger
    }).then(function(result, err){
        if(result){
          //debugger
          if(parseInt(result.receipt.status) == 1)
            alert(" Chairperson hash generated")
            else
            alert(" Chariperson hash generation failed due to revert")
        } else {
            alert(" Chairperson hash generation failed")
        }   
    });
  },

  handleVote: function(addr){
    console.log(addr)
    //debugger
    var voteInstance;
    App.contracts.vote.deployed().then(function(instance) {
      voteInstance = instance;
      return voteInstance.vote(addr);
    }).then(function(result, err){
        if(result){
         if(parseInt(result.receipt.status) == 1)
            alert(" You have Voted successfully ")
            else
            alert(" Voting failed due to revert")
        } else {
            alert(" Voting  failed")
        }   
    });
  },

  handleStateChange: function(state){
    var voteInstance;
    App.contracts.vote.deployed().then(function(instance) {
      voteInstance = instance;
      return voteInstance.change(state);
    }).then(function(result, err){
        if(result){
         if(parseInt(result.receipt.status) == 1)
            alert(" You have changed state successfully.")
            else
            alert(" State Change failed due to revert")
        } else {
            alert(" State Change failed")
        }   
    });
  },

  handleWinner : function() {
    var voteInstance;
    App.contracts.vote.deployed().then(function(instance) {
      voteInstance = instance;
      return voteInstance.declarePresident();
    }).then(function(res){
    console.log(res);
    console.log(App.names[res-1])
      alert(App.names[res] + "  has been elected the new President");
    }).catch(function(err){
      console.log(err.message);
    })
  },

  abi: [
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "numProposals",
          "type": "uint8"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [],
      "name": "DappInit",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [],
      "name": "RegsStarted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "winningProposal",
          "type": "uint8"
        }
      ],
      "name": "VotingClosed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [],
      "name": "VotingStarted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "message",
          "type": "string"
        }
      ],
      "name": "voted",
      "type": "event"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "currentPhase",
      "outputs": [
        {
          "internalType": "enum VoteCorp.Phase",
          "name": "",
          "type": "uint8"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "voterCount",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "voterToken",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "enum VoteCorp.Phase",
          "name": "phase",
          "type": "uint8"
        }
      ],
      "name": "change",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "address",
          "name": "voter",
          "type": "address"
        }
      ],
      "name": "enterAddress",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "uint8",
          "name": "employeeAge",
          "type": "uint8"
        }
      ],
      "name": "enterEmployeeAge",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "bool",
          "name": "isMember",
          "type": "bool"
        }
      ],
      "name": "enterMember",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "bool",
          "name": "isMemberOfBOP",
          "type": "bool"
        }
      ],
      "name": "enterMemberOfBOP",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "address",
          "name": "voter",
          "type": "address"
        }
      ],
      "name": "register",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "uint8",
          "name": "toProposal",
          "type": "uint8"
        }
      ],
      "name": "vote",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [],
      "name": "declarePresident",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "winningProposal",
          "type": "uint8"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "uint8",
          "name": "key",
          "type": "uint8"
        },
        {
          "internalType": "bytes32",
          "name": "password",
          "type": "bytes32"
        }
      ],
      "name": "hashMe",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
