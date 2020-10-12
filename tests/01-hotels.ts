import assert from "assert";
import agent from "supertest";

import { expressApp } from "../src/app";
import { Checkin } from "../src/data/entities/checkings";
import { Hotel } from "../src/data/entities/hotels";
import { Room } from "../src/data/entities/rooms";

const app = expressApp();
const capacity = 10;
const hotel = {
  id: "",
  name: "Test hotel 1"
};

describe("Test Hotel model", () => {
  before(async () => {
    await Promise.all([Hotel.collection.drop(), Checkin.collection.drop(), Room.collection.drop()]);
  });

  it.skip("Test add room", async () => {
    const room = new Room();
    room.hotel = "test-id";
    room.number = 8;
    const thisRoom = await room.save();
    console.log(`Room ${thisRoom._id} saved`);

    assert.ok(true);
  });

  it("add", async () => {
    const response = await agent(app).post("/hotel/add").send({
      name: hotel.name,
      capacity
    });

    hotel.id = response.body._id;
    assert.strictEqual(response.status, 201);
  });

  it("Confirm hotel capacity", async () => {
    const count = await Room.countDocuments({ hotel: hotel.id });
    assert.strictEqual(capacity, count);
  });
});
