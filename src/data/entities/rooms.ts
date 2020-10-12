import { Document, Model, model, Schema } from "mongoose";
import Int32 from "mongoose-int32";

import { IRoom } from "./IRoom";

interface IRoomDocument extends IRoom, Document {}

interface IRoomModel extends Model<IRoomDocument> {}

const schema = new Schema({
  hotel: { type: String, index: true },
  number: { type: Int32, index: true },
  guest: { type: String, index: true },
  checkIn: { type: Date, index: true },
  checkOut: { type: Date, index: true }
});

schema.index({ hotel: 1, number: 1 }, { unique: true });

schema.pre("save", function (this: IRoomDocument, next) {
  next();
});

schema.post("save", function (error, doc, next) {
  if (error !== undefined) {
    if (error.name === "MongoError") {
      switch (error.code) {
        case 11000: {
          next(error);
        }
      }
      next(error);
    } else {
      next(error);
    }
  }
});

// tslint:disable-next-line:variable-name
const Room: IRoomModel = <IRoomModel>model("room", schema);
export { Room, IRoomDocument };
