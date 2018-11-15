const request = require("supertest")
const { mainConnection } = require("../config/mongoose.config")

const app = require("../app")

const fakeUser = {
  email: "test@gmail.com",
  username: "test",
  password: "supersecretpasswordhere"
}

describe("apiRouter", () => {
  afterAll(async () => {
    await Promise.all([mainConnection.dropCollection("users")]).then(() =>
      // closing connection forcefully other jest not exiting
      mainConnection.close(true)
    )
  })

  describe("/api/data", async () => {
    it("just verify that server is responding some data", async () => {
      const res = await request(app).get("/api/data")
      expect(res.text).toEqual(JSON.stringify({ message: "Hello!" }))
    })
  })

  describe("/api/signup", () => {
    it("will sign up new users when correct data provided", async () => {
      const res = await request(app)
        .post("/api/signup")
        .expect(200)
        .send(fakeUser)
      const { user } = res.body
      expect(user).toHaveProperty("email")
      expect(user).toHaveProperty("username")
      expect(user).not.toHaveProperty("password")
    })

    it("will return error if required parameters are missing", async () => {
      const res = await request(app)
        .post("/api/signup")
        .send({ username: 'onlythis' })
        .expect(422)
      expect(res.body).toHaveProperty("error")
      expect(res.body.error).toBe(true);
    })

    it("will return error if userdata is already present", async () => {
      const res = await request(app)
        .post("/api/signup")
        .send(fakeUser)
        .expect(409)
      expect(res.body).toHaveProperty("error")
      expect(res.body.error).toBe(true)
    });
  })
  describe("/api/login", () => {
    it("login user if correct credentials provided", async () => {
      const res = await request(app)
        .post("/api/login")
        .send({ username: fakeUser.email, password: fakeUser.password })
        .expect(200)
      expect(res.body.success).toBe(true)
    })

    it("will reture error if login parameters are mission", async () => {
      const res = await request(app)
        .post("/api/login")
        .send({})
        .expect(403)
      expect(res.body).toHaveProperty("error")
      expect(res.body.error).toBe(true)
    })

    it("will return false if incorrect password provided", async () => {
      const res = await request(app)
        .post("/api/login")
        .send({ username: fakeUser.username, password: 'somewrongpassword' })
        .expect(401)
      expect(res.body).toHaveProperty("error")
      expect(res.body.error).toBe(true)
    })

    it("will return false if username is not present", async () => {
      const res = await request(app)
        .post("/api/login")
        .send({ username: 'notpresentusername' , password: 'somewrongpassword' })
        .expect(404)
      expect(res.body).toHaveProperty("error")
      expect(res.body.error).toBe(true)
    })
  })
})
