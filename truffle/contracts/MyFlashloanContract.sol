pragma solidity ^0.6.2;

import "../ez-flashloan/contracts/aave/FlashLoanReceiverBase.sol";
import "../ez-flashloan/contracts/aave/ILendingPool.sol";
import "../ez-flashloan/contracts/aave/ILendingPoolAddressesProvider.sol";

import "./interfaces/IUniswapV2Router01.sol";

contract MyFlashloanContract is FlashLoanReceiverBase {
    event ExecuteOperation(address, uint256, uint256);
    event PayBackLoan(uint256);
    event TransferFund(uint256);
    event AmountOut(uint256);
    event ReturnBackTokens(uint256);
    event ExpectedRecievingETH(uint256);

      

    // 0x1c8756FD2B28e9426CDBDcC7E3c4d64fa9A54728

    IUniswapV2Router01 public immutable router;
    address public tokenToDeal;
    address public loanasset;
    address public immutable factory;


    constructor(address factory_, IUniswapV2Router01 router_, address payable pooladdress,address dealtoken)
        public
        FlashLoanReceiverBase(pooladdress)
    {
        router = router_;
                factory = factory_;
         
        // tokenToDeal = 0x84cA8bc7997272c7CfB4D0Cd3D55cd942B3c9419; //<--- this is diatoken  0xaD6D458402F60fD3Bd25163575031ACDce07538D;
        loanasset = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;//ETH // ropsten = 0xf80A32A835F79D7787E8a8ee5721D0fEaFd78108;
        tokenToDeal = dealtoken ;
        // // Ropsten
        // tokenToDeal = 0xaD6D458402F60fD3Bd25163575031ACDce07538D;
        // diaaddressforfee = 0xf80A32A835F79D7787E8a8ee5721D0fEaFd78108;
    }

    function setTokenToDeal(address tokenaddress) public onlyOwner {
        tokenToDeal = tokenaddress;
    }

    function setdiaaddressforfee(address tokenaddress) public onlyOwner {
        loanasset = tokenaddress;
    }

    // amount is eth to take in loadn
    function flashloan(uint256 amount) public onlyOwner {
        bytes memory data = "";

        ILendingPool lendingPool = ILendingPool(
            addressesProvider.getLendingPool()
        );
        lendingPool.flashLoan(address(this), loanasset, amount, data);
    }

    function executeOperation(
        address _reserve,
        uint256 _amount,
        uint256 _fee,
        bytes calldata _params
    ) external override {
        emit ExecuteOperation(_reserve, _amount, _fee);

        require(
            _amount <= getBalanceInternal(address(this), _reserve),
            "Invalid balance, was the flashLoan successful?"
        );

        ERC20 token2 = ERC20(router.WETH()); //dia
        token2.approve(address(router), 999999999999);

        // -----------------------Buy Tokens from Bought ETH-----------------------------



        address[] memory path = new address[](2);
        // path[0] =  0xc778417E063141139Fce010982780140Aa0cD5Ab; //WETH
        path[0] = router.WETH();
        path[1] = tokenToDeal;

        uint256 DEADLINE = block.timestamp + 365 days;
        uint[] memory amounts = router.getAmountsOut( _amount, path); // amount[1]

        emit AmountOut(amounts[1]);
        uint256[] memory _result = router.swapExactETHForTokens{value: _amount}(
            amounts[1], // total token to be recieved
            path,
            address(this),
            DEADLINE
        );

        require(_result[1] > 0, "Error while converting ETH to tokens");

        uint256 tokenToDealAmount = _result[1];

        ERC20 token = ERC20(tokenToDeal); //dia
        token.approve(address(router), tokenToDealAmount);

        path[0] = tokenToDeal; //Token to deal
        path[1] = router.WETH();


        emit TransferFund(amounts[1]);
        uint totalTokens = token.balanceOf(address(this));
        emit ReturnBackTokens(totalTokens);

        amounts = router.getAmountsOut(totalTokens, path); // amount[1]

         // -----------------------Sell Tokens-----------------------------
        uint256 totalDebt = _amount.add(_fee);

        _result = router.swapTokensForExactETH(
            amounts[1],
            totalTokens,
            path,
            address(this),
            DEADLINE + 500
        );

         emit ExpectedRecievingETH(_result[1]);

        // require(
        //     _result[1] > totalDebt,
        //     "Required ETH is not enough to clear loan"
        // );

        // Time to transfer the funds back
        emit PayBackLoan(totalDebt);


        transferFundsBackToPoolInternal(_reserve, totalDebt);
    }
}
