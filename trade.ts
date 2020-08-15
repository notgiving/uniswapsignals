import {
  ChainId,
  Token,
  TokenAmount,
  Pair,
  TradeType,
  Route,
  Trade,
  Fetcher,
  Fraction,
} from "@uniswap/sdk";
import { TwilioWhastAppMessage } from "./services/message";
import { config } from "./config";


let  delay = (ms: number) =>{
    return new Promise( resolve => setTimeout(resolve, ms) );
}

let alertRecievers = config.get("alertRecievers")
let accountSid = config.get("twilio").accountSid
let authToken = config.get("twilio").authToken


let main = async () => {

  // Init message Service
  let messageservice = new TwilioWhastAppMessage(accountSid,authToken)

  while (true) {
    try{
    const DIA = await Fetcher.fetchTokenData(ChainId.MAINNET,"0x84cA8bc7997272c7CfB4D0Cd3D55cd942B3c9419")
    const WETH = await Fetcher.fetchTokenData(ChainId.MAINNET,"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2")
    
    let pair = await Fetcher.fetchPairData( WETH,DIA);
    const DIA_TO_WETH_ROUTE = new Route([pair], DIA, WETH);
    // let tradedia = new Trade(DIA_TO_WETH_ROUTE,new TokenAmount(WETH, '100000000000000000'), TradeType.EXACT_OUTPUT)

    let tradedia = Trade.exactIn(DIA_TO_WETH_ROUTE,new TokenAmount(DIA, '270000000000000000000'))
    console.log("trade",tradedia.executionPrice.invert().toSignificant(6))

    let p = pair.priceOf(WETH);

    if (p.greaterThan("130")) {
      console.log("Buy Buy Buy");
      let message = "Dia Price is "+p.toSignificant(6)+"WETH :   Trade Price will be : "+tradedia.executionPrice.invert().toSignificant(6)
      messageservice.sendToMultiple(message,alertRecievers)
      await delay(100000);

    }
    if (p.lessThan("160")) {
      let message = "Dia Price is "+p.toSignificant(6)+"WETH :   Trade Price will be : "+tradedia.executionPrice.invert().toSignificant(6)
      messageservice.sendToMultiple(message,alertRecievers)
    }
    console.log("Price of DAI per Weth: ", p.toSignificant(6));
    await delay(100000);
  }
  catch(err){
  console.log("Error wile running main", err)
  }
}
};

main();


