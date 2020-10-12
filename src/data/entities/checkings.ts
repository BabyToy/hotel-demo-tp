import { Document, Model, model, Schema } from "mongoose";

import { ICheckin } from "./ICheckin";

interface ICheckinDocument extends ICheckin, Document {
  created: Date;
}

interface ICheckinModel extends Model<ICheckinDocument> {}

const schema = new Schema({
  bookingId: String,
  hotelId: { type: String, index: true },
  guestId: { type: String, index: true },
  room: { type: Number, index: true },
  checkIn: { type: Date, index: true },
  checkout: { type: Date, index: true }
});

schema.pre("save", function (this: ICheckinDocument, next) {
  this.created = new Date();
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
const Checkin: ICheckinModel = <ICheckinModel>model("checkin", schema);
export { Checkin, ICheckinDocument };
