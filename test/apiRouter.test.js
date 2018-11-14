const request = require('supertest');
const { User } = require('../components/user/model');

const app = require('../app');

describe('apiRouter', () => {
  describe('/api/data', () => {
    it('just verify that server is responding some data', (done) => {
      request(app)
        .get('/api/data')
        .then((res) => {
          expect(res.text).toEqual(JSON.stringify({ message: 'Hello!' }))
          done();
        });
    });
  });

  afterAll((done) => {
    User.findOneAndDelete({ email: 'mdaziz067@gmail.com' }).then(done);
  })
  describe('/api/signup', () => {
    it('will sign up new users when correct data provided', (done) => {
      request(app)
        .post('/api/signup')
        .send({ email: 'mdaziz067@gmail.com', password: 'abscddsadfa' })
        .then((res) => {
          const { user } = res.body;
          expect(user).toHaveProperty('email');
          done();
        });
    })
  });

  describe('/api/login', () => {

  });
});
