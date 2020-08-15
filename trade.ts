import { ChainId, TokenAmount, Route, Trade, Fetcher } from "@uniswap/sdk";
import { TwilioWhastAppMessage } from "./services/message";
import { config } from "./config";
import { tokens } from "./data/pairs";
import { InfluxDB, FieldType } from "influx";
import { InfluxDBRepository } from "./services/events";

let delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

let schema = {
  measurement: "price",
  fields: {
    pair: FieldType.STRING,
    price: FieldType.FLOAT,
  },
  tags: ["pair"],
};



let alertRecievers = config.get("alertRecievers");
let accountSid = config.get("twilio").accountSid;
const INFLUXDB_HOST = config.get("influxdb").host
const INFLUXDB_PORT = config.get("influxdb").port
const INFLUXDB_ADMIN_USER= config.get("influxdb").user
const INFLUXDB_ADMIN_PASSWORD = config.get("influxdb").password


let authToken = config.get("twilio").authToken;
let chain = ChainId.MAINNET;
let PAIR_TO_KEEP_EYE = ["DIA", "WETH"];

let messageService = new TwilioWhastAppMessage(accountSid, authToken);


let eventService = new InfluxDBRepository({
  username: INFLUXDB_ADMIN_USER,
  password: INFLUXDB_ADMIN_PASSWORD,
  database: "pairs",
  schema: [schema]
});



let main = async () => {
  // Init message Service

  while (true) {
    try {
      console.log("Fetching Token Data of ", PAIR_TO_KEEP_EYE[0]);
      const token0 = await Fetcher.fetchTokenData(
        chain,
        tokens[chain][PAIR_TO_KEEP_EYE[0]]
      );
      console.log("Fetching Token Data of ", PAIR_TO_KEEP_EYE[1]);
      const token1 = await Fetcher.fetchTokenData(
        chain,
        tokens[chain][PAIR_TO_KEEP_EYE[1]]
      );
      let pair = await Fetcher.fetchPairData(token0, token1);
      const TOKEN0_TOKEN1_ROUTE = new Route([pair], token0, token1);
      // Sample Trade of 270 Tokens
      let tradedia = Trade.exactIn(
        TOKEN0_TOKEN1_ROUTE,
        new TokenAmount(token0, "270000000000000000000")
      );
      console.log("Trade", tradedia.executionPrice.invert().toSignificant(6));

      console.log("fetching Price ", PAIR_TO_KEEP_EYE[1]);
      let p = pair.priceOf(token1);

      let pairinstring = PAIR_TO_KEEP_EYE[0] + "/" + PAIR_TO_KEEP_EYE[1];
      eventService.write({type:"price",pair:pairinstring,price:p.toSignificant(6)})
      if (p.greaterThan("130")) {
        let message =
          "Dia Price is " +
          p.toSignificant(6) +
          "WETH :   Trade Price will be : " +
          tradedia.executionPrice.invert().toSignificant(6);
          messageService.sendToMultiple(message, alertRecievers);
      }
      if (p.lessThan("160")) {
        let message =
          "Dia Price is " +
          p.toSignificant(6) +
          "WETH :   Trade Price will be : " +
          tradedia.executionPrice.invert().toSignificant(6);
          messageService.sendToMultiple(message, alertRecievers);
      }
    } catch (err) {
      console.log("Error wile running main", err);
    }
  }
};



main();
