import assert from "assert";
import bson from "bson";
import dayjs from "dayjs";
import agent from "supertest";

import { expressApp } from "../src/app";
import { Checkin } from "../src/data/entities/checkings";
import { Guest } from "../src/data/entities/guests";
import { Hotel } from "../src/data/entities/hotels";
import { IReservation } from "../src/data/entities/IReservation";
import { Reservation } from "../src/data/entities/reservations";
import { Room } from "../src/data/entities/rooms";

const guest = {
  id: "",
  name: "test-guest"
};

const hotel = {
  id: "",
  name: "test-hotel"
};

const booking = {
  id: "",
  from: new Date("2020-12-01"),
  to: new Date("2020-12-03")
};

const capacity = 10;
let checkInId: string;

const app = expressApp();

describe("Test reservations", () => {
  before(async () => {
    const [thisGuest, thisHotel] = await Promise.all([
      Guest.findOne({ name: guest.name }),
      Hotel.findOne({ name: hotel.name })
    ]);
    if (thisGuest) {
      guest.id = thisGuest.id;
      await Guest.findByIdAndDelete(guest.id);
    }
    if (thisHotel) {
      hotel.id = thisHotel.id;
      await Promise.all([Hotel.findByIdAndDelete(hotel.id), Room.deleteMany({ hotel: hotel.id })]);
    }
    if (thisHotel && thisGuest) {
      await Promise.all([
        Reservation.deleteMany({ hotel: hotel.id, guest: guest.id }),
        Checkin.deleteMany({ hotel: hotel.id, guest: guest.id })
      ]);
    }
  });

  it("Create hotel", async () => {
    const response = await agent(app).post("/hotel/add").send({ name: hotel.name, capacity });

    assert.strictEqual(response.status, 201);
    hotel.id = response.body._id;
  });

  it("Create guest", async () => {
    const response = await agent(app).post("/guest/add").send({ name: guest.name });

    assert.strictEqual(response.status, 201);
    guest.id = response.body._id;
  });

  it("Confirm reservation not found", async () => {
    const response = await agent(app)
      .post("/hotel/book/checkin")
      .send({ bookingId: new bson.ObjectID() });

    assert.strictEqual(response.status, 500);
  });

  it("Create bad reservation", async () => {
    const response = await agent(app)
      .post("/hotel/book")
      .send({ hotel: hotel.id, guest: guest.id, fromDate: booking.to, toDate: booking.from });

    assert.strictEqual(response.status, 500);
  });

  it("Create reservation", async () => {
    const response = await agent(app)
      .post("/hotel/book")
      .send({ hotel: hotel.id, guest: guest.id, fromDate: booking.from, toDate: booking.to });

    assert.strictEqual(response.status, 201);
    booking.id = response.body._id;
  });

  it("Get reservation list", async () => {
    const response = await agent(app)
      .get("/hotel/book/list")
      .query({ hotel: hotel.id, fromDate: booking.from, toDate: booking.to });

    assert.strictEqual(response.status, 201);
    assert.ok(response.body.length);
  });

  it("Check reservation for guest", async () => {
    const response = await agent(app)
      .get("/hotel/book/list/guest")
      .query({ hotel: hotel.id, guest: guest.id });

    assert.strictEqual(response.status, 201);
    assert.ok(response.body.some(x => x.guest === guest.id));
  });

  // same hotel/guest/period
  it.skip("Re-create reservation", async () => {
    const response = await agent(app)
      .post("/hotel/book")
      .send({
        hotel: hotel.id,
        guest: guest.id,
        fromDate: dayjs(booking.from).add(1, "day").toDate(),
        toDate: booking.to
      });

    assert.strictEqual(response.status, 201);
  });

  it("Cancel reservation", async () => {
    const response = await agent(app).post("/hotel/book/cancel").send({ bookingId: booking.id });

    assert.strictEqual(response.status, 201);
  });

  it("Confirm reservation is cancelled", async () => {
    const response = await agent(app)
      .get("/hotel/book/list/guest")
      .query({ hotel: hotel.id, guest: guest.id });

    assert.strictEqual(response.status, 201);
    const thisBooking: IReservation | undefined = response.body.find(x => x._id === booking.id);
    assert.ok(thisBooking);
    assert.ok(thisBooking.cancelled);
  });

  it("Re-create reservation", async () => {
    const response = await agent(app)
      .post("/hotel/book")
      .send({ hotel: hotel.id, guest: guest.id, fromDate: booking.from, toDate: booking.to });
    assert.strictEqual(response.status, 201);
    booking.id = response.body._id;
  });

  it("Checkin guest", async () => {
    const response = await agent(app).post("/hotel/book/checkin").send({ bookingId: booking.id });
    assert.strictEqual(response.status, 201);
    checkInId = response.body._id;
  });

  it("Get room inventory", async () => {
    const response = await agent(app)
      .get("/hotel/room/inventory")
      .query({ hotelId: hotel.id, startDate: booking.from, stopDate: booking.to });

    assert.strictEqual(response.status, 201);
    assert.strictEqual(response.body.length, capacity);
  });

  it("Checkout guest", async () => {
    const response = await agent(app).post("/guest/checkout").send({ checkInId });

    assert.strictEqual(response.status, 201);
  });
});
