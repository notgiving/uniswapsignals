// const LiquidityValueCalculator = artifacts.require("LiquidityValueCalculator");

// module.exports = function (deployer) {

//   // uniswap factory address
//   deployer.deploy(LiquidityValueCalculator,"0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f");
// };


// const ExampleSwapToPrice = artifacts.require("ExampleSwapToPrice");

// module.exports = function (deployer) {

//   // uniswap factory address
//   deployer.deploy(ExampleSwapToPrice,"0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f","0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
// };


const MyFlashloanContract = artifacts.require("MyFlashloanContract");

module.exports = function (deployer,network) {

  // uniswap factory address
  // aave LendingPoolAddressesProvider  mainnet 0x24a42fD28C976A61Df5D00D0599C34c4f90748c8
  // ropsten 0x1c8756FD2B28e9426CDBDcC7E3c4d64fa9A54728

 switch(network) {
   case "mainnet":{
    deployer.deploy(MyFlashloanContract,"0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f","0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D","0x24a42fD28C976A61Df5D00D0599C34c4f90748c8","0x84cA8bc7997272c7CfB4D0Cd3D55cd942B3c9419");
   }
   break
   case "ropsten":{
    deployer.deploy(MyFlashloanContract,"0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f","0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D","0x1c8756FD2B28e9426CDBDcC7E3c4d64fa9A54728","0xf80A32A835F79D7787E8a8ee5721D0fEaFd78108");
   }
 }


};


 