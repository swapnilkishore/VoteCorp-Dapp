pragma solidity >=0.4.22 <=0.6.6;

contract VoteCorp {
    struct Voter {
        uint weight;
        uint8 employeeAge;
        uint8 vote;
        uint8 numVotes;
        bool isMemberOfBOP;
        bool isMember;
        bool isRegistered;
        bool voted;
    }
    
    struct Proposal {
        uint voteCount;
        //bool bondAvail;
    }
    
    address chairperson;
    address voterAddress;
    Proposal[] proposals;
    mapping(address => Voter) voters;
    //mapping(address => Proposal) proposals;
    enum Phase {Init, Regs, Vote, Done}
    Phase public currentPhase = Phase.Init;
    uint8 public voterCount = 0;
    bytes32 public voterToken;
    
    event DappInit();
    event RegsStarted();
    event VotingStarted();
    event VotingClosed(uint8 winningProposal);
    event voted(string message);
    
    modifier validPhase(Phase reqPhase) {
        require(currentPhase == reqPhase, "Invalid Phase");
        _;
    }
    
    modifier onlyChair() {
        require(msg.sender == chairperson, "Only Chairperson");
        _;
    }
    
    modifier onlyMemberOfCorp() {
        require(voters[voterAddress].isMember == true, "Member needed");
        _;
    }
    
    modifier onlyMemberOfBOP() {
        require(voters[voterAddress].isMember == true && voters[voterAddress].isMemberOfBOP == true, "Board Member needed");
        _;
    }
    
    modifier checkMax()
    {
        require(voters[voterAddress].numVotes <= 3, "Vote limit reached!");
        _;
    }
    
    modifier onlyLongTerm() {
        require(voters[voterAddress].employeeAge >= 10, "Long term employee needed");
        _;
    }
    
    modifier checkRegister() {
        require(voters[voterAddress].isRegistered == true, "Not registered");
        _;
    }
    
    modifier checkVoted() {
        require(voters[voterAddress].voted == false, "Already voted");
        _;
    }
    
    // modifier bondCheck() {
    //     require(proposals[voterAddress].bondAvail == true, "Must accept bond to register as candidate!");
    //     _;
    // }
    
    constructor (uint8 numProposals) public {
        chairperson = msg.sender;
        for (uint8 prop = 0; prop < numProposals; prop ++)
            proposals.push(Proposal(0));
        voters[chairperson].weight = 2;
        //state = 1;
    }
    
    function change(Phase phase) onlyChair public {
           
        require(voterToken == 0xc4124432ae40ed9bd95b70cb9da40389172ce078f626033d49d5b7ce21129a30, "Chairperson not verified");
        currentPhase = phase;
        if (currentPhase == Phase.Vote) emit VotingStarted();
        if (currentPhase == Phase.Regs) emit RegsStarted();
        if (currentPhase == Phase.Init) emit DappInit();
    }
    
    function enterAddress(address voter) public validPhase(Phase.Regs) {
        voterAddress = voter;
    }
    
    function enterEmployeeAge(uint8 employeeAge) public validPhase(Phase.Regs) {
        voters[voterAddress].employeeAge = employeeAge;
    }
    
    function enterMember(bool isMember) public validPhase(Phase.Regs) {
        voters[voterAddress].isMember = isMember;
    }
    
    // function enterBondAvail(bool bondAvail) public validPhase(Phase.Regs) {
    //     proposals[voterAddress].bondAvail = bondAvail;
    // }
    
    function enterMemberOfBOP(bool isMemberOfBOP) onlyMemberOfCorp onlyLongTerm public validPhase(Phase.Regs) {
        voters[voterAddress].isMemberOfBOP = isMemberOfBOP;
    }
    
    function register(address voter) public validPhase(Phase.Regs) onlyChair {
        require(voterToken == 0xc4124432ae40ed9bd95b70cb9da40389172ce078f626033d49d5b7ce21129a30, "Chairperson not verified");
        require(voters[voter].isRegistered == false, "Already registered");
        if(voters[voter].isMemberOfBOP == true) {
            voters[voter].weight = 2;
        } else {
            voters[voter].weight = 1;
        }
        voters[voter].voted = false;
        voters[voter].isRegistered = true;
        voterCount++;
    }
    
    
    function vote(uint8 toProposal) public validPhase(Phase.Vote) checkRegister checkMax {
        //Voter memory sender = voters[voterAddress]; 
        require(toProposal < proposals.length);
        voters[voterAddress].voted = true;
        voters[voterAddress].vote = toProposal; 
        voters[voterAddress].numVotes++;
        proposals[toProposal].voteCount += 1 * voters[voterAddress].weight;
        emit voted("Vote cast!");
    }
    
    function declarePresident() public validPhase(Phase.Done) onlyChair  returns (uint8 winningProposal) {
       
        uint256 winningVoteCount = 0;
        for (uint8 prop = 0; prop < proposals.length; prop++) 
            if (proposals[prop].voteCount > winningVoteCount) {
                winningVoteCount = proposals[prop].voteCount;
                winningProposal = prop;
            }
       assert(winningVoteCount>=1);
       emit VotingClosed(winningProposal);
    }
    
    function hashMe(uint8 key, bytes32 password) public onlyChair validPhase(Phase.Init) {
        voterToken = keccak256(abi.encodePacked(key, password));
    }
    
    
    //password : 0x60298f78cc0b47170ba79c10aa3851d7648bd96f2f8e46a19dbc777c36fb0c00, key : 12
}