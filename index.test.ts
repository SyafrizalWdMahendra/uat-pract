import { it } from "node:test";
import assert from "node:assert/strict";

const request = require("supertest");
const app = require("../app");
it("should return all products", async () => {
  const res = await request(app).get("/api/products");
  assert.strictEqual(res.statusCode, 200);
  assert.ok(Array.isArray(res.body));
});
