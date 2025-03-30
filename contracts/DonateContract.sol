// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DonateContract {
    address public owner;
    address public recipientWallet;

    struct Donation {
        address donor;
        uint256 amount;
        uint256 timestamp;
        uint256 usdAmount;
        bytes32 txHash; // ✅ เก็บ txHash จริง
    }

    Donation[] public donations;
    mapping(address => Donation[]) public donorHistory;

    event DonationReceived(
        address indexed donor,
        uint256 amount,
        uint256 timestamp,
        uint256 usdAmount,
        bytes32 txHash
    );

    constructor(address _recipientWallet) {
        owner = msg.sender;
        recipientWallet = _recipientWallet;
    }

    function donate(uint256 usdAmount) external payable {
        require(msg.value > 0, "Donation amount must be greater than 0");

        // ✅ ใส่ txHash เป็นค่าชั่วคราวก่อน (จะ update ทีหลัง)
        Donation memory newDonation = Donation({
            donor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            usdAmount: usdAmount,
            txHash: bytes32(0) // Placeholder
        });

        donations.push(newDonation);
        donorHistory[msg.sender].push(newDonation);

        (bool success, ) = recipientWallet.call{value: msg.value}("");
        require(success, "Transfer to recipient failed");

        emit DonationReceived(msg.sender, msg.value, block.timestamp, usdAmount, bytes32(0));
    }

    // ✅ ให้ frontend ส่ง real txHash มาบันทึกภายหลัง
    function registerTxHash(bytes32 txHash) external {
        require(donorHistory[msg.sender].length > 0, "No donation found");

        uint256 latestIndex = donorHistory[msg.sender].length - 1;
        donorHistory[msg.sender][latestIndex].txHash = txHash;

        // ✅ อัปเดตใน donations[] ด้วย
        for (uint256 i = donations.length; i > 0; i--) {
            if (donations[i - 1].donor == msg.sender && donations[i - 1].txHash == bytes32(0)) {
                donations[i - 1].txHash = txHash;
                emit DonationReceived(
                    msg.sender,
                    donations[i - 1].amount,
                    donations[i - 1].timestamp,
                    donations[i - 1].usdAmount,
                    txHash
                );
                break;
            }
        }
    }

    function getAllDonations() external view returns (Donation[] memory) {
        return donations;
    }

    function getDonationsByAddress(address _donor) external view returns (Donation[] memory) {
        return donorHistory[_donor];
    }

    function updateRecipientWallet(address _newRecipient) external {
        require(msg.sender == owner, "Only owner can update recipient wallet");
        recipientWallet = _newRecipient;
    }
}
