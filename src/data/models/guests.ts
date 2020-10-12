/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import dayjs from "dayjs";

import { Checkin } from "../entities/checkings";
import { Guest, IGuestDocument } from "../entities/guests";
import { Hotel } from "../entities/hotels";
import { IGuest } from "../entities/IGuest";
import { Room } from "../entities/rooms";
import HotelModel from "./hotels";

export default class GuestModel {
  hotelModel: HotelModel;

  constructor() {
    this.hotelModel = new HotelModel();
  }

  async checkin(hotelId: string, guestId: string, toDate: Date) {
    const [hotel, guest] = await Promise.all([Hotel.findById(hotelId), Guest.findById(guestId)]);
    if (!hotel) {
      throw new Error("Hotel not found");
    }
    if (!guest) {
      throw new Error("Guest not found");
    }
    const today = dayjs();
    if (today.hour() < 14) {
      throw new Error("Checkins before 2PM are not allowed");
    }
    // get room inventory
    const rooms = await this.hotelModel.inventory(hotelId, today.toDate(), toDate);
    const room = rooms.find(x => x.guest === undefined);
    if (!room) {
      throw new Error("No rooms available");
    }

    const checkIn = new Checkin();
    checkIn.hotelId = hotelId;
    checkIn.guestId = guestId;
    checkIn.room = room.room;

    return checkIn.save();
  }

  async checkout(checkInId: string) {
    const checkIn = await Checkin.findById(checkInId);
    if (!checkIn) {
      throw new Error("Gust not checked in");
    }
    checkIn.checkOut = new Date();
    const thisRoom = await Room.findOne({ hotel: checkIn.hotelId, number: checkIn.room });
    if (!thisRoom) {
      throw new Error("Room not found");
    }
    thisRoom.guest = undefined;
    thisRoom.checkIn = undefined;
    thisRoom.checkOut = undefined;
    await thisRoom.save();
    return checkIn.save();
  }

  async add(name: string): Promise<IGuestDocument> {
    const exists = await Guest.findOne({ name }).lean();
    if (exists) {
      throw new Error("Guest exists");
    }
    const guest = new Guest();
    guest.name = name;
    return guest.save();
  }

  async update(id: string, name: string): Promise<IGuestDocument> {
    const guest = await Guest.findById(id);
    if (!guest) {
      throw new Error("Guest not found");
    }
    guest.name = name;
    return guest.save();
  }

  async getAll() {
    return Guest.find().sort({ name: 1 }).lean();
  }

  async findById(id: string): Promise<IGuest> {
    const guest = await Guest.findById(id);
    if (!guest) {
      throw new Error("Guest not found");
    }
    return <IGuest>guest.toObject();
  }

  async get(name: string): Promise<IGuest> {
    const guest = await Guest.findOne({ name });
    if (!guest) {
      throw new Error("Guest not found");
    }
    return <IGuest>guest.toObject();
  }

  async delete(name: string) {
    const guest = await Guest.findOne({ name });
    if (!guest) {
      throw new Error("Guest not found");
    }
    const state = await Guest.deleteOne({ name });
    return state !== undefined;
  }
}
