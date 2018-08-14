pragma solidity ^0.4.21;

/**
 * @title Lottery
 * @dev Simple smart contract for a lottery game.
 * The user bets on a number between 0 and 9.
 * If he/she guesses correctly, then the whole jackpot is won.
 * Otherwise, the amount of the bet is added to the jackpot.
 */
contract Lottery {
    uint8 public lastResult;
    uint private seed;
    bool public winner = false;

    /**
     * @dev Contract constructor
     */
    function Lottery(uint _seed) public payable {
        seed = _seed;
    }

    /**
     * @dev Generates a pseudo-random number between 0 and 46
     */
    function getRandomNumber(uint _seed) internal view returns (uint8) {
        return uint8(uint256(keccak256(block.blockhash(block.number), block.timestamp, _seed)) % 47);
    }

    /**
     * @dev Throws a random number and compares it to a number chosen by the caller.
     * If the numbers match, the whole jackpot is transferred to the caller.
     * @return True if the caller won. False otherwise.
     */
    function bet(uint8 _bet) public payable returns (bool) {
        require(winner == false && msg.value > 0 && _bet >= 0 && _bet <= 46);

        lastResult = getRandomNumber(seed);
        
        if(lastResult == _bet) {
            msg.sender.transfer(address(this).balance);
            winner = true;
        }
        return winner;
    }
}
