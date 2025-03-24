// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract TradeRecord {
    struct Trade {
        string tradeId;
        address buyer;
        address seller;
        string itemId;
        uint256 priceUsd;
        uint256 priceEth;
        string timestamp;
        string transactionHash;
    }

    Trade[] public trades;

    event TradeRecorded(
        string tradeId,
        address buyer,
        address seller,
        string itemId,
        uint256 priceUsd,
        uint256 priceEth,
        string timestamp,
        string transactionHash
    );

    function recordTrade(
        string memory tradeId,
        address buyer,
        address seller,
        string memory itemId,
        uint256 priceUsd,
        uint256 priceEth,
        string memory timestamp,
        string memory txHash
    ) public {
        trades.push(Trade(tradeId, buyer, seller, itemId, priceUsd, priceEth, timestamp, txHash));
        emit TradeRecorded(tradeId, buyer, seller, itemId, priceUsd, priceEth, timestamp, txHash);
    }

    function getAllTrades() public view returns (Trade[] memory) {
        return trades;
    }

    function getTradesByBuyer(address buyerWallet) public view returns (Trade[] memory) {
        uint256 count;
        for (uint256 i = 0; i < trades.length; i++) {
            if (trades[i].buyer == buyerWallet) {
                count++;
            }
        }

        Trade[] memory buyerTrades = new Trade[](count);
        uint256 index;
        for (uint256 i = 0; i < trades.length; i++) {
            if (trades[i].buyer == buyerWallet) {
                buyerTrades[index] = trades[i];
                index++;
            }
        }

        return buyerTrades;
    }
}
