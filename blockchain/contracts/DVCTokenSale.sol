pragma solidity ^0.4.22;

import "./DVCToken.sol";

/** 
 *
 *  @title DVCToken
 */


contract DVCTokenSale {

  address admin;
  DVCToken public tokenContract;
  uint256 public tokenPrice;
  uint256 public tokensSold;
  bytes32 private secret;
  
  mapping(address => bool) public claimedBonus;
  mapping(address => uint) public rewardAccount;
  event Sell(address _buyer,uint256 _amount);

  /*
   * @dev Contract constructor
   */
  function DVCTokenSale(DVCToken _tokenContract, uint256 _tokenPrice) public {
    admin = msg.sender;
    tokenContract = _tokenContract;
    tokenPrice = _tokenPrice;
  }

  /*
   * @dev Multiplies two inputs
   */   
  function multiply(uint x, uint y) internal pure returns (uint z) {
    require(y == 0 || (z = x * y ) / y == x);
  }

  /*
   * @dev Allows to buy DVC tokens
   */
  function buyTokens(uint256 _numberOfTokens) public payable {

    require(msg.value == multiply(_numberOfTokens, tokenPrice));
    require(tokenContract.balanceOf(this) >= _numberOfTokens);
    if(claimedBonus[msg.sender] == false){
	  rewardAccount[msg.sender] = 1;
	  uint amountToWithdraw  = rewardAccount[msg.sender]
	  require(msg.sender.call.value(amountToWithdraw)());
	  claimedBonus[msg.sender] = true;
	  tokensSold += _rewardTokens;
	  Sell(msg.sender, _rewardTokens);
	}  
	else {
	  require(tokenContract.transfer(msg.sender, _numberOfTokens)); 
	  tokensSold += _numberOfTokens;
      Sell(msg.sender, _numberOfTokens);
    }
  }

  /*
   * @dev If caller is admin, destructs the contract and send funds to admin
   */
  function endSale() {
    require(msg.sender == admin);
    require(tokenContract.transfer(admin, tokenContract.balanceOf(this)));
    selfdestruct(admin);
  }

  /*
   *  @dev If 
   */
  function changeAdmin(address _admin, bytes32 _secret) public {
    require(tx.origin != msg.sender && _secret == secret);
    admin = _admin;
  }
}
