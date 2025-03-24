// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract ExchangeContract {
    struct ExchangeRequest {
        uint256 exchange_id;
        address user_1_wallet;
        address user_2_wallet;
        string item_1_id;
        string item_2_id;
        uint256 timestamp;
        string transaction_hash;
        uint8 status; // 0 = pending, 1 = completed, 2 = rejected
    }

    mapping(uint256 => ExchangeRequest) public exchanges;
    uint256 public exchangeCounter = 1; // ✅ เริ่มจาก 1 เพื่อป้องกันปัญหา ID = 0

    event ExchangeRequested(uint256 exchange_id, address indexed user_1_wallet, address indexed user_2_wallet);
    event ExchangeConfirmed(uint256 exchange_id, address indexed confirmedBy);
    event ExchangeRejected(uint256 exchange_id, address indexed rejectedBy);
    event TransactionHashUpdated(uint256 exchange_id, string transaction_hash);

    modifier onlyValidExchange(uint256 _exchange_id) {
        require(_exchange_id > 0 && _exchange_id < exchangeCounter, "Invalid exchange ID");
        _;
    }

    modifier onlyRecipient(uint256 _exchange_id) {
        require(msg.sender == exchanges[_exchange_id].user_2_wallet, "Only recipient can process this exchange");
        _;
    }

    function requestExchange(
        address _user_2_wallet,
        string memory _item_1_id,
        string memory _item_2_id
    ) public {
        require(_user_2_wallet != msg.sender, "You cannot exchange with yourself");
        require(bytes(_item_1_id).length > 0 && bytes(_item_2_id).length > 0, "Invalid item IDs");

        uint256 exchangeId = exchangeCounter++; // ✅ เพิ่มค่าก่อนนำไปใช้

        exchanges[exchangeId] = ExchangeRequest(
            exchangeId,
            msg.sender,
            _user_2_wallet,
            _item_1_id,
            _item_2_id,
            block.timestamp,
            "",
            0
        );

        emit ExchangeRequested(exchangeId, msg.sender, _user_2_wallet);
    }
    
    function getAllExchanges() public view returns (ExchangeRequest[] memory) {
    ExchangeRequest[] memory allExchanges = new ExchangeRequest[](exchangeCounter - 1);
    uint256 index = 0;
    for (uint256 i = 1; i < exchangeCounter; i++) {
        allExchanges[index] = exchanges[i];
        index++;
    }
    return allExchanges;
}

    function getPendingExchanges(address wallet) public view returns (ExchangeRequest[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i < exchangeCounter; i++) {
            if (
                (exchanges[i].user_1_wallet == wallet || exchanges[i].user_2_wallet == wallet) &&
                exchanges[i].status == 0
            ) {
                count++;
            }
        }

        ExchangeRequest[] memory pending = new ExchangeRequest[](count);
        uint256 index = 0;

        for (uint256 i = 1; i < exchangeCounter; i++) {
            if (
                (exchanges[i].user_1_wallet == wallet || exchanges[i].user_2_wallet == wallet) &&
                exchanges[i].status == 0
            ) {
                pending[index] = exchanges[i];
                index++;
            }
        }

        return pending;
    }

    function getExchangeHistory(address wallet) public view returns (ExchangeRequest[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i < exchangeCounter; i++) {
            if (exchanges[i].user_1_wallet == wallet || exchanges[i].user_2_wallet == wallet) {
                count++;
            }
        }

        ExchangeRequest[] memory history = new ExchangeRequest[](count);
        uint256 index = 0;

        for (uint256 i = 1; i < exchangeCounter; i++) {
            if (exchanges[i].user_1_wallet == wallet || exchanges[i].user_2_wallet == wallet) {
                history[index] = exchanges[i];
                index++;
            }
        }

        return history;
    }

    

    function confirmExchange(uint256 _exchange_id) public onlyValidExchange(_exchange_id) onlyRecipient(_exchange_id) {
        require(exchanges[_exchange_id].status == 0, "Exchange is already processed");

        exchanges[_exchange_id].status = 1;
        emit ExchangeConfirmed(_exchange_id, msg.sender);
    }

    function rejectExchange(uint256 _exchange_id) public onlyValidExchange(_exchange_id) onlyRecipient(_exchange_id) {
        require(exchanges[_exchange_id].status == 0, "Exchange is already processed");

        exchanges[_exchange_id].status = 2;
        emit ExchangeRejected(_exchange_id, msg.sender);
    }

    // ✅ ฟังก์ชันใหม่สำหรับอัปเดต Transaction Hash แยกต่างหาก
    function updateTransactionHash(uint256 _exchange_id, string memory _txHash) public onlyValidExchange(_exchange_id) {
        require(bytes(_txHash).length > 0, "Transaction hash required");
        require(exchanges[_exchange_id].status != 0, "Exchange must be confirmed or rejected first");

        exchanges[_exchange_id].transaction_hash = _txHash;
        emit TransactionHashUpdated(_exchange_id, _txHash);
    }
}
