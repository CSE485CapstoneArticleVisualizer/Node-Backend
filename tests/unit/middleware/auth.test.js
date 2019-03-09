const { User } = require("../../../models/user");
const auth = require('../../../middleware/auth');
const mongoose = require('mongoose');

describe('auth middleware', () => {
    it('should populate req.user with the payload of a valid JWT', () => {
        // Create a token for the request
        const user = { _id: mongoose.Types.ObjectId().toHexString(), isAdmin: true };
        const token = new User(user).generateAuthToken();

        // Craft the request (Must include header)
        const req = {
            header: jest.fn().mockReturnValue(token)
        };
        const res = {};
        const next = jest.fn();

        // Call the middleware
        auth(req, res, next);

        // Expect req.user to be defined
        expect(req.user).toMatchObject(user);
    });


});