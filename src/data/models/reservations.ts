import dayjs from "dayjs";

import { Checkin } from "../entities/checkings";
import { Guest } from "../entities/guests";
import { Hotel } from "../entities/hotels";
import { Reservation } from "../entities/reservations";
import { Room } from "../entities/rooms";
import HotelModel from "./hotels";

export default class ReservationModel {
  hotelModel: HotelModel;

  constructor() {
    this.hotelModel = new HotelModel();
  }

  /**
   * Creates a room reservation
   * @param hotel string hotelId
   * @param guest string guestId
   * @param targetDate Date
   */
  async add(hotel: string, guest: string, targetDate: Date, toDate: Date) {
    const [thisHotel, thisGuest] = await Promise.all([
      Hotel.findById(hotel),
      Guest.findById(guest)
    ]);
    if (!thisHotel) {
      throw new Error("Hotel not found");
    }
    if (!thisGuest) {
      throw new Error("Guest not found");
    }
    const bookingFromDate = dayjs(targetDate).hour(12);
    const bookingToDate = dayjs(toDate).hour(12);
    const today = dayjs().hour(12);
    if (bookingFromDate.isBefore(today)) {
      throw new Error("Invalid booking date");
    }
    if (bookingToDate.isBefore(bookingFromDate)) {
      throw new Error("Invalid booking date");
    }
    const bookings = await Reservation.find({
      hotel,
      cancelled: { $exists: false },
      checkedIn: { $exists: false },
      fromDate: { $gte: bookingFromDate.toDate() },
      toDate: { $lte: bookingToDate.toDate() }
    });
    if (bookings.length >= thisHotel.capacity) {
      throw new Error("Hotel fully booked for period");
    }
    if (bookings.some(x => x.guest === guest)) {
      throw new Error("Guest already booked");
    }
    // no pending reservations
    const booking = new Reservation();
    booking.hotel = hotel;
    booking.guest = guest;
    // noon
    booking.fromDate = dayjs(targetDate).hour(12).toDate();
    booking.toDate = dayjs(toDate).hour(12).toDate();
    return booking.save();
  }

  async cancel(bookingId: string) {
    const booking = await Reservation.findById(bookingId);
    if (!booking) {
      throw new Error("Guest has no pending reservation");
    }
    booking.cancelled = new Date();
    return booking.save();
  }

  async checkin(bookingId: string) {
    const booking = await Reservation.findById(bookingId);
    if (!booking) {
      throw new Error("Reservation not found");
    }
    if (booking.cancelled) {
      throw new Error("Reservation was cancelled");
    }
    if (booking.checkedIn) {
      throw new Error("Reservation alredy checked in");
    }
    const today = dayjs();
    if (dayjs(booking.toDate).isBefore(today)) {
      throw new Error("Reservation has expired");
    }

    // get room inventory
    const rooms = await this.hotelModel.inventory(booking.hotel, today.toDate(), booking.toDate);
    const room = rooms.find(x => x.guest === "(vacant)");
    if (!room) {
      throw new Error("No rooms available");
    }

    booking.checkedIn = today.toDate();
    await booking.save();

    const checkIn = new Checkin();
    checkIn.hotelId = booking.hotel;
    checkIn.guestId = booking.guest;
    checkIn.room = room.room;

    const thisRoom = await Room.findOne({ hotel: booking.hotel, number: room.room });
    if (!thisRoom) {
      throw new Error("Room not found");
    }
    thisRoom.guest = booking.guest;
    thisRoom.checkIn = today.toDate();
    await Promise.all([booking.save(), thisRoom.save()]);
    return checkIn.save();
  }

  async pending(hotel: string) {
    return Reservation.find({
      hotel,
      cancelled: { $exists: false },
      checkedIn: { $exists: false }
    });
  }

  async list(hotel: string, fromDate: Date, toDate: Date) {
    return Reservation.find({
      hotel,
      fromDate: { $gte: fromDate },
      toDate: { $lte: toDate }
    }).sort({ fromDate: "asc" });
  }

  async listPerGuest(hotel: string, guest: string) {
    return Reservation.find({
      hotel,
      guest
    }).sort({ fromDate: "asc" });
  }
}
