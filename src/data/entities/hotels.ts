import { Document, Model, model, Schema } from "mongoose";
import Int32 from "mongoose-int32";

import { IHotel } from "./IHotel";

interface IHotelDocument extends IHotel, Document {}

interface IHotelModel extends Model<IHotelDocument> {}

const schema = new Schema({
  name: { type: String, index: true, unique: true },
  capacity: Int32
});

schema.pre("save", function (this: IHotelDocument, next) {
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
const Hotel: IHotelModel = <IHotelModel>model("hotel", schema);
export { Hotel, IHotelDocument };
