// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/**
 * @title MockStringUtils
 * @notice Mock implementation of ENS StringUtils for testing and compilation
 * @dev This replaces the complex @ensdomains/ens-contracts dependency
 */
library MockStringUtils {
    /**
     * @notice Get the length of a string
     * @param s The string to measure
     * @return The length of the string
     */
    function strlen(string memory s) internal pure returns (uint256) {
        return bytes(s).length;
    }

    /**
     * @notice Compare two strings for equality
     * @param a First string
     * @param b Second string
     * @return True if strings are equal
     */
    function equal(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }

    /**
     * @notice Convert string to lowercase
     * @param str The string to convert
     * @return The lowercase string
     */
    function toLower(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        
        for (uint i = 0; i < bStr.length; i++) {
            // Convert uppercase A-Z to lowercase a-z
            if ((uint8(bStr[i]) >= 65) && (uint8(bStr[i]) <= 90)) {
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }

    /**
     * @notice Check if string contains only valid characters
     * @param str The string to validate
     * @return True if valid
     */
    function isValidName(string memory str) internal pure returns (bool) {
        bytes memory b = bytes(str);
        if (b.length == 0 || b.length > 255) return false;
        
        for (uint i = 0; i < b.length; i++) {
            bytes1 char = b[i];
            // Allow a-z, 0-9, and hyphen (basic validation)
            if (!(char >= 0x30 && char <= 0x39) && // 0-9
                !(char >= 0x61 && char <= 0x7A) && // a-z
                !(char == 0x2D)) { // hyphen
                return false;
            }
        }
        return true;
    }

    /**
     * @notice Concatenate two strings
     * @param a First string
     * @param b Second string
     * @return The concatenated string
     */
    function concat(string memory a, string memory b) internal pure returns (string memory) {
        return string(abi.encodePacked(a, b));
    }

    /**
     * @notice Check if string is empty
     * @param str The string to check
     * @return True if empty
     */
    function isEmpty(string memory str) internal pure returns (bool) {
        return bytes(str).length == 0;
    }

    /**
     * @notice Get substring
     * @param str The source string
     * @param start Start index
     * @param length Length of substring
     * @return The substring
     */
    function substring(string memory str, uint256 start, uint256 length) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        require(start + length <= strBytes.length, "Substring out of bounds");
        
        bytes memory result = new bytes(length);
        for (uint256 i = 0; i < length; i++) {
            result[i] = strBytes[start + i];
        }
        return string(result);
    }

    /**
     * @notice Find index of character in string
     * @param str The string to search
     * @param char The character to find
     * @return The index, or type(uint256).max if not found
     */
    function indexOf(string memory str, bytes1 char) internal pure returns (uint256) {
        bytes memory strBytes = bytes(str);
        for (uint256 i = 0; i < strBytes.length; i++) {
            if (strBytes[i] == char) {
                return i;
            }
        }
        return type(uint256).max;
    }

    /**
     * @notice Split string by delimiter
     * @param str The string to split
     * @param delimiter The delimiter character
     * @return parts Array of string parts
     */
    function split(string memory str, bytes1 delimiter) internal pure returns (string[] memory) {
        bytes memory strBytes = bytes(str);
        uint256 count = 1;
        
        // Count delimiters
        for (uint256 i = 0; i < strBytes.length; i++) {
            if (strBytes[i] == delimiter) {
                count++;
            }
        }
        
        string[] memory parts = new string[](count);
        uint256 partIndex = 0;
        uint256 start = 0;
        
        for (uint256 i = 0; i <= strBytes.length; i++) {
            if (i == strBytes.length || strBytes[i] == delimiter) {
                bytes memory part = new bytes(i - start);
                for (uint256 j = 0; j < i - start; j++) {
                    part[j] = strBytes[start + j];
                }
                parts[partIndex] = string(part);
                partIndex++;
                start = i + 1;
            }
        }
        
        return parts;
    }
}
