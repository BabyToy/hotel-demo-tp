/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Guest } from "../entities/guests";
import { Hotel, IHotelDocument } from "../entities/hotels";
import { IHotel } from "../entities/IHotel";
import { Reservation } from "../entities/reservations";
import { Room } from "../entities/rooms";

export default class HotelModel {
  /**
   * Nukes the hotel and room collection
   */
  async add(name: string, rooms: number): Promise<IHotelDocument> {
    const exists = await Hotel.findOne({ name }).lean();
    if (exists) {
      throw new Error("Hotel exists");
    }
    const hotel = new Hotel();
    hotel.capacity = rooms;
    hotel.name = name;
    this.createRooms(hotel);
    return hotel.save();
  }

  async update(id: string, name: string, rooms: number): Promise<IHotelDocument> {
    const hotel = await Hotel.findById(id);
    if (!hotel) {
      throw new Error("Hotel not found");
    }
    hotel.name = name;
    hotel.capacity = rooms;
    await Room.deleteMany({ hotel: hotel._id });
    await Reservation.deleteMany({ hotel: hotel._id });
    this.createRooms(hotel);
    return hotel.save();
  }

  createRooms(hotel: IHotelDocument): void {
    for (let idx = 0; idx < hotel.capacity; idx++) {
      const room = new Room();
      room.hotel = hotel._id;
      room.number = idx + 1;
      room.save();
      // room.save().then(thisRoom => {
      //   console.log(`Room ${thisRoom._id} saved`);
      // })
      // .catch(error => {
      //   console.error(error);
      // });
    }
  }

  async getAll() {
    return Hotel.find().lean();
  }

  async get(id: string): Promise<IHotel> {
    const hotel = await Hotel.findById(id);
    if (!hotel) {
      throw new Error("Hotel not found");
    }
    return <IHotel>hotel.toObject();
  }

  async delete(name: string) {
    const hotel = await Hotel.findOne({ name });
    if (!hotel) {
      throw new Error("Hotel not found");
    }
    await Room.deleteMany({ hotel: hotel._id });
    await Reservation.deleteMany({ hotel: hotel._id });
    const state = await Hotel.deleteOne({ name });
    return state !== undefined;
  }

  /**
   * returns room inventory
   */
  async inventory(hotelId: string, fromDate: Date, toDate: Date) {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      throw new Error("Hotel not found");
    }
    const roomList: { hotel: string; room: number; guest: string }[] = [];
    const rooms = await Room.find({ hotel: hotel._id }).sort({ room: "asc" });
    for (const room of rooms) {
      let guestName = "(vacant)";
      if (room.guest) {
        const guest = await Guest.findById(room.guest);
        if (guest) {
          guestName = guest.name;
        }
      }
      roomList.push({ hotel: hotel.name, room: room.number, guest: guestName });
    }
    return roomList;
  }
}
