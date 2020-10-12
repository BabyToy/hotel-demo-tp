import { Document, Model, model, Schema } from "mongoose";
import Int32 from "mongoose-int32";

import { IGuest } from "./IGuest";

interface IGuestDocument extends IGuest, Document {}

interface IGuestModel extends Model<IGuestDocument> {}

const schema = new Schema({
  name: { type: String, index: true, unique: true },
});

schema.pre("save", function (this: IGuestDocument, next) {
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
const Guest: IGuestModel = <IGuestModel>model("guest", schema);
export { Guest, IGuestDocument };
