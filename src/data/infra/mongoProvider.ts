import mongoose, { Connection } from "mongoose";

class MongoProvider {
  private _connection = {} as Connection;
  database: string;

  constructor(database?: string) {
    const uri = process.env.MONGO_DEMO;
    if (uri === undefined) {
      console.error("MongoProvider: Fatal: Mongo connection string undefined");
      process.exit(1);
    }
    this.database = uri;

    mongoose.Promise = global.Promise;
    mongoose.connection.on("connected", () => {
      this.database = mongoose.connection.db.databaseName;
      this._connection = mongoose.connection;
      console.info(`MongoProvider: connect: ${mongoose.connection.host}`);
    });
    mongoose.connection.on("fullsetup", error => {
      console.info("MongoProvider: connected to primary");
    });
    mongoose.connection.on("all", error => {
      console.info("MongoProvider: connected to all servers`");
    });
    mongoose.connection.on("error", error => {
      console.error("MongoProvider: connection error: " + error);
    });
    mongoose.connection.on("close", error => {
      console.info("MongoProvider: closing");
    });
    mongoose.connection.on("MongoProvider: connecting", error => {
      console.info("connecting");
    });
    mongoose.connection.on("reconnected", error => {
      console.info("MongoProvider: reconnected");
    });
    mongoose.connection.on("disconnecting", error => {
      console.info("MongoProvider: disconnecting");
    });
    mongoose.connection.on("disconnected", error => {
      console.info("MongoProvider: disconnected");
      process.exit(1);
    });
    mongoose.connection.on("reconnectFailed", error => {
      console.error("MongoProvider: reconnect failed");
      process.exit(1);
    });
    if (process.env.MONGODEBUG === "true") {
      mongoose.set("debug", (collectionName: string, method: string, query: any, doc: any) => {
        console.info(`Mongoose: ${collectionName}.${method} ${JSON.stringify(query)}`);
      });
    }
  }

  startDebug() {
    mongoose.set("debug", true);
  }

  stopDebug() {
    mongoose.set("debug", false);
  }

  get connection() {
    return this._connection;
  }

  get connected() {
    const state = this._connection.readyState;
    return state === 1 || state === 2;
  }

  async connect(database?: string) {
    console.info(`MongoProvider: Database: ${this.database}`);
    // connection.readyState will be "connecting"
    // until further methods are called
    // consider increasing poolSize to 10
    try {
      return mongoose.connect(database ?? this.database, {
        useNewUrlParser: true,
        numberOfRetries: 3,
        // autoReconnect: true,
        keepAlive: true,
        // reconnectTries: 3,
        // reconnectInterval: 1000,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      });
    } catch (error) {
      console.error(`connect error catch: ${error.message}`);
      process.exit(1);
    }
  }
}

const mongoProvider = new MongoProvider();
export default mongoProvider;
