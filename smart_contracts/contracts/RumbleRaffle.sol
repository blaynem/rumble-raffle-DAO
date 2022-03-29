//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract RumbleRaffle is Ownable {
    event EntryFeePaid(address indexed from, address indexed tokenAddress, uint256 value);
    event WithdrawBalance(address indexed to, IERC20 indexed tokenAddress, uint256 value);
    event PrizePayout(address indexed to, IERC20 indexed tokenAddress, uint256 value);

    using SafeMath for uint256;

    struct Balance {
        address tokenAddress;
        string name;
        string symbol;
        uint holdings;
    }

    // Index of the address in the addressStore
    mapping (address => uint) index;
    // All erc20 token addresses that have been interacted with
    address[] addressStore = [address(0x0)];

    // returns true if the address is in the address array.
    function _inAddressArray(address _tokenAddress) private view returns (bool) {
        if (_tokenAddress != address(0x0) && index[_tokenAddress] > 0) {
            return true;
        }
        return false;
    }

    // Add the token to the address array if it has not already been added.
    function _addToAddressArray(address _tokenAddress) private {
        if (!_inAddressArray(_tokenAddress)) {
            // Append
            index[_tokenAddress] = addressStore.length;
            addressStore.push(_tokenAddress);
        }
    }

    function payEntryFee(address _tokenAddress, uint _amount) public {
        // convert to token
        IERC20 token = IERC20(_tokenAddress);
        // TODO: Put in a check for allowance of the specified token
        // set buyins
        token.transferFrom(msg.sender, address(this), _amount);
        // Add the token address to the store arr
        _addToAddressArray(_tokenAddress);

        emit EntryFeePaid(msg.sender, _tokenAddress, _amount);
    }

    // balance of the given token address
    function getTokenBalance(IERC20 _token) public view returns (uint) {
        return _token.balanceOf(address(this));
    }

    // Returns the token balance as it's Balance struct
    // {tokenAddress, name, symbol, holdings}
    function _getTokenBalanceStruc(address _tokenAddress) private view returns (Balance memory) {
        ERC20 _token = ERC20(_tokenAddress);
        string memory _names = _token.name();
        string memory _symbols = _token.symbol();
        uint _value = _token.balanceOf(address(this));
  
        return Balance(_tokenAddress, _names, _symbols, _value);
    }

    // Returns all the erc20 tokens that have been interacted with
    // and the contracts holdings of those tokens.
    function getAllTokenBalances() public view returns (Balance[] memory) {
        uint _n = addressStore.length;
        // arr will have n-1 items to offset the 0x0 address.
        Balance[] memory _balances = new Balance[](_n - 1);
        // we start at 1 so we dont get the 0x0 address.
        for (uint _i = 1; _i < _n; _i++) {
            // offset index by 1 for balances arr, otherwise we get empty vals
            _balances[_i - 1] = _getTokenBalanceStruc(addressStore[_i]);
        }
        return _balances;
    }

    // Withdraws a single token to the callers address. Only owner.
    function withdrawTokenBalance(IERC20 _token, uint _amount) public onlyOwner {
        uint _currentTokenBalance = getTokenBalance(_token);
        require(_currentTokenBalance > 0, "No balance for this token");
        require(_currentTokenBalance > _amount, "Not enough balance");

        _token.transfer(msg.sender, _amount);

        emit WithdrawBalance(msg.sender, _token, _amount);
    }


    // sum adds the different elements of the array and return its sum
    function _sum(uint[] memory _amounts) private pure returns (uint) {
        // the value of message should be exact of total amounts
        uint _totalAmnt = 0;
        
        for (uint _i = 0; _i < _amounts.length; _i++) {
            _totalAmnt = _totalAmnt.add(_amounts[_i]);
        }
        
        return _totalAmnt;
    }

    // payout prize by transferring tokens
    function _payoutPrize(address payable _receiverAddr, uint _amt, IERC20 _token) private {
        _token.transfer(_receiverAddr, _amt);

        emit PrizePayout(_receiverAddr, _token, _amt);
    }
    
    // Pays out multiple prizes to multiple different accounts in one call
    // decreasing network fees
    function payoutPrizes(address payable[] memory _paymentAddrs, uint[] memory _paymentAmts, IERC20 _token) payable public onlyOwner  {
        // Gets total amount of held tokens
        uint _tokenBalance = getTokenBalance(_token);
        require(_tokenBalance > 0, "There are no tokens of this type.");
        // the addresses and amounts should be same in length
        require(_paymentAddrs.length == _paymentAmts.length, "The length of two array should be the same");
        
        uint _totalPaymentAmt = _sum(_paymentAmts);
        // the total available token balance is greater than the desired payment amount.
        require(_tokenBalance >= _totalPaymentAmt, "The value is not sufficient or exceed");
        
        
        for (uint _i = 0; _i < _paymentAddrs.length; _i++) {
            // first subtract the transferring amount from the total_value
            // of the smart-contract then send it to the receiver
            _tokenBalance = _tokenBalance.sub(_paymentAmts[_i]);
            
            // send the specified amount to the recipient
            _payoutPrize(_paymentAddrs[_i], _paymentAmts[_i], _token);
        }
    }
}