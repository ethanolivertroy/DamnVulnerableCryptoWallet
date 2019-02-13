pragma solidity ^0.4.22;

contract DVC {
  string public name = "Damn Vulnerable Contract";
  string public symbol = "DVC";
  string public standard = "DVC Token";
  uint256 public totalSupply;

  event Transfer(
    address indexed _from,
    address indexed _to,
    uint256 _value,
  );

  event Approval(
    address indexed _owner,
    address indexed _spender,
    uint256  _value,
  );
  
  mapping(address => uint256) public balanceOf;
  mapping(address => mapping(address => uint256)) public allowance;

  function DVC (uint256 _initialSupply) public payable{
    balanceOf[msg.sender] = _initialSupply;
    totalSupply = _initialSupply;
  }	

  function transfer (address _to, uint256 _value) public returns (bool success) {
    require(balanceOf[msg.sender] >= _value);
    
    balanceOf[msg.sender] -= _value;
    balanceOf[_to] += _value;
    
    Transfer(msg.sender, _to, _value);
     
    return true;

  }
  
  function approve(address _spender, uint256 _value) public returns (bool success) {
    
    Approval(msg.sender, _spender, _value);

    return true;
  }

  function allowance(){

  };
}
