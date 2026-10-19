// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

contract Counter {
    uint256 public constant MAX = 10;   // カウントの上限
    address public owner;               // このコントラクトを作った人
    uint256 public count;               // いまのカウント

    event Incremented(address indexed by, uint256 newCount);
    event Reset(address indexed by);

    constructor() {
        owner = msg.sender;             // デプロイした人
    }

    function increment() public {
        require(count < MAX, "limit reached");
        count += 1;
        emit Incremented(msg.sender, count);
    }

    function reset() public {
        require(msg.sender == owner, "not owner");
        count = 0;
        emit Reset(msg.sender);
    }

    function remaining() public view returns (uint256) {
        return MAX - count;
    }
}
