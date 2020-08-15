import { ChainId, TokenAmount, Route, Trade, Fetcher } from "@uniswap/sdk";
import { TwilioWhastAppMessage } from "./services/message";
import { config } from "./config";
import { tokens } from "./data/pairs";
import { InfluxDB, FieldType } from "influx";

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
const influx = new InfluxDB({
  host: "localhost",
  port: 8086,
  database: "pairs",
  schema: [schema],
});

influx.getDatabaseNames()
  .then(names => {
    if (!names.includes('pairs')) {
      return influx.createDatabase('pairs');
    }
  })

let alertRecievers = config.get("alertRecievers");
let accountSid = config.get("twilio").accountSid;
let authToken = config.get("twilio").authToken;
let chain = ChainId.MAINNET;
let PAIR_TO_KEEP_EYE = ["DIA", "WETH"];

let main = async () => {
  // Init message Service
  let messageservice = new TwilioWhastAppMessage(accountSid, authToken);

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
      influx
        .writePoints([
          {
            measurement: "price",
            tags: { pair: pairinstring },
            fields: { pair:pairinstring, price: p.toSignificant(6) },
          },
        ])
        .catch((err) => {
          console.error(`Error saving data to InfluxDB! ${err.stack}`);
        });

      if (p.greaterThan("130")) {
        let message =
          "Dia Price is " +
          p.toSignificant(6) +
          "WETH :   Trade Price will be : " +
          tradedia.executionPrice.invert().toSignificant(6);
        messageservice.sendToMultiple(message, alertRecievers);
      }
      if (p.lessThan("160")) {
        let message =
          "Dia Price is " +
          p.toSignificant(6) +
          "WETH :   Trade Price will be : " +
          tradedia.executionPrice.invert().toSignificant(6);
        messageservice.sendToMultiple(message, alertRecievers);
      }
    } catch (err) {
      console.log("Error wile running main", err);
    }
  }
};

main();
