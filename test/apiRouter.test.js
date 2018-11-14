const request = require("supertest");
const { mainConnection } = require("../config/mongoose.config");

const app = require("../app");

const fakeUser = {
  email: "test@gmail.com",
  username: "test",
  password: "supersecretpasswordhere"
};

describe("apiRouter", () => {
  describe("/api/data", () => {
    it("just verify that server is responding some data", () => {
      return request(app)
        .get("/api/data")
        .then(res => {
          expect(res.text).toEqual(JSON.stringify({ message: "Hello!" }));
        });
    });
  });

  afterAll(() => {
    return Promise.all([mainConnection.dropCollection("users")]);
  });

  describe("/api/signup", () => {
    it("will sign up new users when correct data provided", async () => {
      return request(app)
        .post("/api/signup")
        .send(fakeUser)
        .then(res => {
          const { user } = res.body;
          expect(user).toHaveProperty("email");
          expect(user).toHaveProperty("username");
          expect(user).not.toHaveProperty("password");
        });
    });
  });

  describe("/api/login", () => {
    it("login user if correct credentials provided", async () => {
      return request(app)
        .post("/api/login")
        .send({ username: fakeUser.email, password: fakeUser.password })
        .expect(200)
        .then(res => {
          expect(res.body.success).toBeTruthy();
        });
    });
  });
});
