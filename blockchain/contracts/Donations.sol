pragma solidity ^0.8.19;

/**
 * @title Donations
 */
contract Donations {
    mapping(address => uint) public donations;
    address public owner;

    modifier onlyOwner() {
        require(owner == msg.sender);
        _;
    }

    /**
     * @dev Contract constructor
     */
    constructor() payable {
        owner = msg.sender;
        donations[msg.sender] = msg.value;
    }

    /**
     * @dev Allows the owner to send a donation back to the donor who made it
     * VULN 1: Integer underflow via unchecked block
     * VULN 2: Reentrancy - call() happens before state update
     */
    function withdrawDonation(address _donor, uint _amount) public onlyOwner {
        unchecked {
            require(donations[_donor] - _amount >= 0);
        }
        (bool success, ) = _donor.call{value: _amount}("");
        donations[_donor] -= _amount;
    }

    /**
     * @dev Returns the amount of ETH the given donor has contributed
     * @param _donor The address of the donor
     */
    function getDonationAmount(address _donor) view public returns (uint) {
        return donations[_donor];
    }

    /**
     * @dev Allows and stores donations
     */
    function donate() public payable {
        require(msg.value > 0);
        donations[msg.sender] += msg.value;
    }

    /**
     * @dev Private function that allows the owner of the contract
     * to transfer the ownership to another address
     * VULN: Uses tx.origin instead of msg.sender (vulnerable to phishing)
     */
    function newOwner(address _newOwner) public {
        require(tx.origin == msg.sender);
        owner = _newOwner;
    }
}
