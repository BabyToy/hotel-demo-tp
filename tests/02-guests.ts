import assert from "assert";
import agent from "supertest";

import { expressApp } from "../src/app";
import { Guest } from "../src/data/entities/guests";

const guest = {
  id: "",
  name: "Test guest"
};

const app = expressApp();

describe("Test guest handling", () => {
  before(async () => {
    await Guest.deleteMany({ name: guest.name });
  });

  after(async () => {
    await Guest.findByIdAndDelete(guest.id);
  });

  it("Delete unexistent guest", async () => {
    const response = await agent(app).post("/guest/delete").send({ id: "test-id" });

    assert.strictEqual(response.status, 500);
  });

  it("Add guest", async () => {
    const response = await agent(app).post("/guest/add").send({ name: guest.name });

    assert.strictEqual(response.status, 201);
    guest.id = response.body._id;

    const thisGuest = await Guest.findById(guest.id);
    assert.ok(thisGuest);
  });

  it("Get all guests", async () => {
    const response = await agent(app).get("/guest/all");
    assert.strictEqual(response.status, 201);
    assert.ok(response.body.some(x => x._id === guest.id));
  });

  it("Get guest data", async () => {
    const response = await agent(app).get("/guest").query({ id: guest.id });
    assert.strictEqual(response.status, 201);
    assert.strictEqual(response.body.name, guest.name);
  });

  it("Update guest", async () => {
    const newName = "new-guest-name";
    const response = await agent(app).post("/guest/update").send({ id: guest.id, name: newName });
    assert.strictEqual(response.status, 201, response.body.result);
    assert.strictEqual(response.body.name, newName);
  });
});
