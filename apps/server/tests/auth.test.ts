import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { prisma } from "db";

const BASE_URL = "http://localhost:4000";

beforeAll(async () => {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ["test@example.com", "login@test.com"],
      },
    },
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ["test@example.com", "login@test.com"],
      },
    },
  });
  await prisma.$disconnect();
});

describe("User Authentication", () => {
  describe("POST /user/singup", () => {
    test("should create the new user successfully", async () => {
      const response = await fetch(`${BASE_URL}/api/v1/user/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "Test1234!",
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data).toHaveProperty("userId");
    });

    test(
      "allready created user should get the error [User already exists]",
      async () => {
        await fetch(`${BASE_URL}/api/v1/user/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            password: "Test1234!",
          }),
        });

        const response = await fetch(`${BASE_URL}/api/v1/user/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            password: "Test1234!",
          }),
        });

        expect(response.status).toBe(400);
      }
    );
  });
  describe("POST /user/singin", () => {
  beforeAll(async () => {
    await fetch(`${BASE_URL}/api/v1/user/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "login@test.com",
        password: "Login1234!",
      }),
    });
  });

  test("should login successfully with correct credentials", async () => {
    const response = await fetch(`${BASE_URL}/api/v1/user/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "login@test.com",
        password: "Login1234!",
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toHaveProperty("userdata");
  });
});

});
