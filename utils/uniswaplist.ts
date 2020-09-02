import { TokenList, schema, TokenInfo } from "@uniswap/token-lists";
import { tokens } from "../data/pairs";

import { getDefaultProvider, Contract } from "ethers";
var fs = require('fs');

// generate your token list however you like.

const abi = [
  // Read-Only Functions
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",

  // Authenticated Functions
  "function transfer(address to, uint amount) returns (boolean)",

  // Events
  "event Transfer(address indexed from, address indexed to, uint amount)",
];

let getTokenDetails = async (address: string): Promise<TokenInfo> => {
  const provider = getDefaultProvider();
  const erc20 = new Contract(address, abi, provider);
  let decimal = await erc20.decimals();
  let symbol = await erc20.symbol();
  return {
    chainId: 1,
    address: address,
    symbol: symbol,
    name: symbol,
    decimals: decimal,
  };
};

let generateTokens = async (): Promise<TokenInfo[]> => {
  let results = [];
  let pendingPromises = [];
  Object.keys(tokens[1]).forEach((key) => {
    console.log(key, tokens[1][key]);
    pendingPromises.push(getTokenDetails(tokens[1][key]));
  });
  results = await Promise.all(pendingPromises);
  return results;
};

let generateList = async () => {
  let tokens = await generateTokens();

  return {
    name: "TwentyFourBytes",
    timestamp: new Date(),
    version: { major: 1, minor: 1, patch: 4 },
    tokens: tokens,
  };
};

let main = async()=>{
   let list =  await generateList()
   console.log(list)

 

  fs.writeFile('twentyfourbytes.json', JSON.stringify(list), function (err) {
    if (err) throw err;
    console.log('Saved!');
  });

}


main()