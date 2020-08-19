import {IMessage} from './message'
import {IEvents} from './events'
import { ChainId, TokenAmount, Route, Trade, Fetcher } from "@uniswap/sdk";

import { tokens } from "../data/pairs";


export class UniSwapPairTracker  {
    private messageservice: IMessage;
    private eventservice :IEvents;
    private pair :Array<string>;
    private chain: number


    constructor(message:IMessage,eventservice:IEvents,pair:Array<string>,chain:number){
        this.messageservice = message
        this.eventservice = eventservice
        this.chain = chain
        this.pair = pair


    }
    
    async start() {
        console.log("Fetching Token Data of ", this.pair[0]);
        const token0 = await Fetcher.fetchTokenData(
          this.chain,
          tokens[this.chain][this.pair[0]]
        );
        console.log("Fetching Token Data of ", this.pair[1]);
        const token1 = await Fetcher.fetchTokenData(
          this.chain,
          tokens[this.chain][this.pair[1]]
        );
        let pair = await Fetcher.fetchPairData(token0, token1);

        while (true) {
            try {
              const TOKEN0_TOKEN1_ROUTE = new Route([pair], token0, token1);
              // Sample Trade of 270 Tokens
              let tradedia = Trade.exactIn(
                TOKEN0_TOKEN1_ROUTE,
                new TokenAmount(token0, "270000000000000000000")
              );
              console.log("Trade", tradedia.executionPrice.invert().toSignificant(6));
        
              console.log("fetching Price ", this.pair[1]);
              let p = pair.priceOf(token1);
        
              let pairinstring = this.pair[0] + "/" + this.pair[1];
        
              console.log("Fetched Price",p.toSignificant(6))
        
              this.eventservice.write({type:"price",pair:pairinstring,price:p.toSignificant(6)})
            //   if (p.greaterThan("175")) {
            //     let message =
            //       "Dia Price is " +
            //       p.toSignificant(6) +
            //       "WETH :   Trade Price will be : " +
            //       tradedia.executionPrice.invert().toSignificant(6);
            //      // this.messageservice.sendToMultiple(message, alertRecievers);
            //   }
            //   if (p.lessThan("161")) {
            //     let message =
            //       "Dia Price is " +
            //       p.toSignificant(6) +
            //       "WETH :   Trade Price will be : " +
            //       tradedia.executionPrice.invert().toSignificant(6);
            //       messageService.sendToMultiple(message, alertRecievers);
            //   }
            } catch (err) {
              console.log("Error wile running main", err);
            }
          }

        

    }
}