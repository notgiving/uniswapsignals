import { InfluxDB, FieldType, ISingleHostConfig } from "influx";

export interface Events {
  type: string;
  pair: string;
  price: any;
}
export interface IEvents {
  write(event: Events): void;
}

export class InfluxDBRepository implements IEvents {
  private influx: InfluxDB;
  constructor(options: ISingleHostConfig) {
    this.influx = new InfluxDB(options);

    this.influx.getDatabaseNames().then((names) => {
      if (!names.includes("pairs")) {
        this.influx.createDatabase("pairs");
      }
    });
  }

  write(event: Events): void {
    try {
      this.influx.writePoints([
        {
          measurement: event.type,
          tags: { pair: event.pair },
          fields: { pair: event.pair, price: event.price },
        },
      ]);
      console.log("PriceFeed updated in influxdb");
    } catch (err) {
      console.log("Error writing to influxdb", err);
    }
  }
}
