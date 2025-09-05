
// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IAfricanProof} from "../interfaces/IAfricanProof.sol";
contract MyGatedContract {
    IAfricanProof public africanProof;
    uint256 public ghaCount;

    constructor(address _africanProof) {
        africanProof = IAfricanProof(_africanProof);
        ghaCount=0;
    }


    modifier onlyFromCountry(string memory country) {
        require(
            africanProof.isUserVerifiedForCountry(msg.sender, country),
            "Not verified for this country"
        );
        _;
    }

    function ghanaOnly() external onlyFromCountry("GHA") {
        // Only Ghanaian users can call this
        ghaCount++;
    }

    function nigeriaOnly() external onlyFromCountry("NGA") {
        // Only Nigerian users can call this
    }
}