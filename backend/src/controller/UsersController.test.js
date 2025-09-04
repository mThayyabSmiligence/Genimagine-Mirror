const { getChatsData } = require('../controller/UsersController');
const { getImagesByChatId } = require('../service/UserService');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');

describe('getChatsData', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: { chat_id: 'testChatId' },
      headers: { cookie: 'token=testToken' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });
});
