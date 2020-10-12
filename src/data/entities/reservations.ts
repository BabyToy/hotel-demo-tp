import { Document, Model, model, Schema } from "mongoose";

import { IReservation } from "./IReservation";

interface IReservationDocument extends IReservation, Document {}

interface IReservationModel extends Model<IReservationDocument> {}

const schema = new Schema({
  hotel: { type: String, index: true },
  guest: { type: String, index: true },
  fromDate: { type: Date, index: true },
  toDate: { type: Date, index: true },
  checkedIn: { type: Date, index: true },
  cancelled: Date,
  created: Date
});

schema.pre("save", function (this: IReservationDocument, next) {
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
const Reservation: IReservationModel = <IReservationModel>model("reservation", schema);
export { Reservation, IReservationDocument };
