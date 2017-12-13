pragma solidity ^0.4.17;

contract PowerIndexFactory {

  struct researchContract {
    address contractInstance;
    address contractOwner;
    bytes32 contractName;
  }

  uint index;
  address owner;
  mapping(uint => researchContract) contracts;
  bytes32[] contractsArray;

  function PowerIndexFactory() public{
    owner = msg.sender;
    index = 1;
  }

  function createResearcher(bytes32 name){
    require(findIndexByName(name) == 0 && msg.sender == owner);
    uint contractIndex = getIndex();
    contracts[contractIndex].contractInstance = new Researcher(name);
    contracts[contractIndex].contractOwner = msg.sender;
    contracts[contractIndex].contractName = name;
    contractsArray.push(name);
  }

  function updateResearcher(bytes32[12] data){
    uint contractId = findIndexByName(data[0]);
    require(contractId != 0 && msg.sender == owner);
    Researcher rsch = Researcher(contracts[contractId].contractInstance);
    rsch.updateData(data);
  }

  function deleteResearcher(bytes32 name){
    uint contractId = findIndexByName(name);
    require(contractId != 0 && msg.sender == owner);
    delete contractsArray[contractId-1];
  }


  function findResearcherByName(bytes32 name) view returns (bytes32[12]) {
    uint contractId = findIndexByName(name);
    require(contractId != 0 && msg.sender == owner);
    Researcher rsch = Researcher(contracts[contractId].contractInstance);
    bytes32[12] storage result;
    result[0] = rsch.name();
    result[1] = rsch.institution();
    result[2] = rsch.department();
    result[3] = rsch.currentPosition();
    result[4] = rsch.rgscore();
    result[5] = rsch.readsNum();
    result[6] = rsch.citNum();
    result[7] = rsch.itemNum();
    result[8] = rsch.pilar1();
    result[9] = rsch.pilar2();
    result[10] = rsch.pilar3();
    result[11] = rsch.photo();
    return result;
  }

  function findIndexByName(bytes32 name) internal view returns (uint) {
    for(uint i = 1; i<=contractsArray.length; i++) {
      if(contractsArray[i-1] == name) {
        return i;
      }
    }
    return 0;
  }

  function getIndex() internal returns (uint) {
    uint result = index;
    index = index+1;
    return result;
  }

  function destroy() public{
    require(msg.sender == owner);
    selfdestruct(owner);
  }

}

contract Researcher {

  bytes32 public name;
  bytes32 public institution;
  bytes32 public department;
  bytes32 public currentPosition;
  bytes32 public rgscore;
  bytes32 public readsNum;
  bytes32 public citNum;
  bytes32 public itemNum;
  bytes32 public pilar1;
  bytes32 public pilar2;
  bytes32 public pilar3;
  bytes32 public photo;

  function Researcher(bytes32 data) public {
      name = data;
  }

  function updateData(bytes32[12] data) public {
    institution = data[1];
    department = data[2];
    currentPosition = data[3];
    rgscore = data[4];
    readsNum = data[5];
    citNum = data[6];
    itemNum = data[7];
    pilar1 = data[8];
    pilar2 = data[9];
    pilar3 = data[10];
    photo = data[11];
  }

}
