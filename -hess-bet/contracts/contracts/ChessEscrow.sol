// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title ChessEscrow
/// @notice Эскроу шахматных ставок в USDC (6 знаков). Ставка 0.05–5 USDC с шагом 0.05.
///         Победитель получает 94% банка, 6% уходит владельцу проекта. Ничья/отмена — полный возврат.
contract ChessEscrow is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum Status { None, Open, Active, Finished, Cancelled }

    struct Game {
        address p1;
        address p2;
        uint128 bet;
        uint32 duration;
        uint64 startedAt;
        Status status;
    }

    uint256 public constant MIN_BET = 50_000;     // 0.05 USDC
    uint256 public constant MAX_BET = 5_000_000;  // 5 USDC
    uint256 public constant BET_STEP = 50_000;    // 0.05 USDC
    uint16 public constant MAX_FEE_BPS = 1000;    // потолок комиссии 10%
    uint32 public constant GRACE = 3 days;

    IERC20 public immutable usdc;
    address public oracle;
    address public feeRecipient;
    uint16 public feeBps;

    uint256 public nextGameId = 1;
    mapping(uint256 => Game) public games;

    event GameCreated(uint256 indexed id, address indexed p1, uint256 bet, uint32 duration);
    event GameJoined(uint256 indexed id, address indexed p1, address indexed p2);
    event GameCancelled(uint256 indexed id);
    event GameFinished(uint256 indexed id, address indexed winner, uint256 payout, uint256 fee);
    event GameDrawn(uint256 indexed id);
    event GameRefunded(uint256 indexed id);
    event OracleChanged(address oracle);
    event FeeChanged(uint16 feeBps, address recipient);

    error BadBet();
    error BadDuration();
    error BadStatus();
    error NotAllowed();
    error BadWinner();
    error TooEarly();
    error TransferMismatch();
    error ZeroAddress();
    error FeeTooHigh();

    modifier onlyOracle() {
        if (msg.sender != oracle) revert NotAllowed();
        _;
    }

    constructor(address _usdc, address _oracle, address _feeRecipient, uint16 _feeBps) Ownable(msg.sender) {
        if (_usdc == address(0) || _oracle == address(0) || _feeRecipient == address(0)) revert ZeroAddress();
        if (_feeBps > MAX_FEE_BPS) revert FeeTooHigh();
        usdc = IERC20(_usdc);
        oracle = _oracle;
        feeRecipient = _feeRecipient;
        feeBps = _feeBps;
    }

    function createGame(uint256 bet, uint32 duration) external nonReentrant returns (uint256 id) {
        if (bet < MIN_BET || bet > MAX_BET || bet % BET_STEP != 0) revert BadBet();
        if (!_validDuration(duration)) revert BadDuration();
        id = nextGameId++;
        games[id] = Game(msg.sender, address(0), uint128(bet), duration, 0, Status.Open);
        _pull(msg.sender, bet);
        emit GameCreated(id, msg.sender, bet, duration);
    }

    function joinGame(uint256 id) external nonReentrant {
        Game storage g = games[id];
        if (g.status != Status.Open) revert BadStatus();
        if (msg.sender == g.p1) revert NotAllowed();
        g.p2 = msg.sender;
        g.startedAt = uint64(block.timestamp);
        g.status = Status.Active;
        _pull(msg.sender, g.bet);
        emit GameJoined(id, g.p1, msg.sender);
    }

    function cancelGame(uint256 id) external nonReentrant {
        Game storage g = games[id];
        if (g.status != Status.Open) revert BadStatus();
        if (msg.sender != g.p1) revert NotAllowed();
        g.status = Status.Cancelled;
        usdc.safeTransfer(g.p1, g.bet);
        emit GameCancelled(id);
    }

    /// @param winner адрес победителя или address(0) для ничьей
    function reportResult(uint256 id, address winner) external onlyOracle nonReentrant {
        Game storage g = games[id];
        if (g.status != Status.Active) revert BadStatus();
        g.status = Status.Finished;
        if (winner == address(0)) {
            usdc.safeTransfer(g.p1, g.bet);
            usdc.safeTransfer(g.p2, g.bet);
            emit GameDrawn(id);
            return;
        }
        if (winner != g.p1 && winner != g.p2) revert BadWinner();
        uint256 pot = uint256(g.bet) * 2;
        uint256 fee = (pot * feeBps) / 10_000;
        uint256 payout = pot - fee;
        if (fee > 0) usdc.safeTransfer(feeRecipient, fee);
        usdc.safeTransfer(winner, payout);
        emit GameFinished(id, winner, payout, fee);
    }

    /// @notice Если результат не сообщён вовремя, любой возвращает ставки обоим (без комиссии).
    function refundStuck(uint256 id) external nonReentrant {
        Game storage g = games[id];
        if (g.status != Status.Active) revert BadStatus();
        if (block.timestamp < uint256(g.startedAt) + 2 * uint256(g.duration) + GRACE) revert TooEarly();
        g.status = Status.Cancelled;
        usdc.safeTransfer(g.p1, g.bet);
        usdc.safeTransfer(g.p2, g.bet);
        emit GameRefunded(id);
    }

    function setOracle(address _oracle) external onlyOwner {
        if (_oracle == address(0)) revert ZeroAddress();
        oracle = _oracle;
        emit OracleChanged(_oracle);
    }

    function setFee(uint16 _feeBps, address _recipient) external onlyOwner {
        if (_feeBps > MAX_FEE_BPS) revert FeeTooHigh();
        if (_recipient == address(0)) revert ZeroAddress();
        feeBps = _feeBps;
        feeRecipient = _recipient;
        emit FeeChanged(_feeBps, _recipient);
    }

    function _validDuration(uint32 d) private pure returns (bool) {
        return d == 900 || d == 1800 || d == 2700 || d == 3600 || d == 10800 || d == 86400;
    }

    function _pull(address from, uint256 amount) private {
        uint256 before = usdc.balanceOf(address(this));
        usdc.safeTransferFrom(from, address(this), amount);
        if (usdc.balanceOf(address(this)) - before != amount) revert TransferMismatch();
    }
}
