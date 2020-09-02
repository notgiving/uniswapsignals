import { ChainId, TokenAmount, Route, Trade, Fetcher } from "@uniswap/sdk";
import { TwilioWhastAppMessage } from "./services/message";
import { config } from "./config";
import { tokens } from "./data/pairs";
import { InfluxDB, FieldType } from "influx";
import { InfluxDBRepository } from "./services/events";
import { UniSwapPairTracker } from "./services/pairtracker";

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
const INFLUXDB_HOST = config.get("influxdb").host;
const INFLUXDB_PORT = config.get("influxdb").port;
const INFLUXDB_ADMIN_USER = config.get("influxdb").user;
const INFLUXDB_ADMIN_PASSWORD = config.get("influxdb").password;

let authToken = config.get("twilio").authToken;
let chain = ChainId.MAINNET;
let pairs = [
  ["CRV", "WETH"],
  ["DIA", "WETH"],
  ["LINK", "WETH"],
  ["DAI", "WETH"],
  ["LEND", "WETH"],
  ["SUSHI", "WETH"],
  ["FSW", "WETH"],
  ["OXT", "WETH"],
  ["WBTC", "WETH"],
  ["HAKKA", "WETH"],
  ["OM", "WETH"],
  ["FACT", "WETH"],
  ["SNX", "WETH"],
  ["LID", "WETH"],
  ["MITX", "WETH"],
  ["LOCK", "WETH"],
  ["OM", "WETH"],
  ["DISTX","WETH"],
  ["RUBY","WETH"],
  ["BZRZ","WETH"],
  ["rPepe","WETH"],
  ["XTAKE","WETH"],
  ["KIMCHI","WETH"],
  ["YUNO","WETH"],



];

let messageService = new TwilioWhastAppMessage(accountSid, authToken);

let eventService = new InfluxDBRepository({
  username: INFLUXDB_ADMIN_USER,
  password: INFLUXDB_ADMIN_PASSWORD,
  database: "pairs",
  schema: [schema],
});

let main = async () => {
  // Init message Service

  for (let index = 0; index < pairs.length; index++) {
    const element = pairs[index];

    new UniSwapPairTracker(
      messageService,
      eventService,
      element,
      chain
    ).start();
  }
};

main();
