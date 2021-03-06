'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _account = require('../../models/sql-models/account');

var _account2 = _interopRequireDefault(_account);

var _token = require('../../auth/middleware/token');

var _passport = require('../../config/passport/passport');

var _passport2 = _interopRequireDefault(_passport);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app) {

    app.route('/api/account').post(function (req, res) {
        var accountCredentials = req.body;
        _account2.default.create(accountCredentials).then(function (user) {
            return res.json({ user: user, success: true });
        }).catch(function (error) {
            return res.status(500).json({ error: error, success: false });
        });
    });

    app.route('/api/account/authenticate').post(function (req, res) {
        var accountCredentials = req.body;
        _account2.default.findOne(accountCredentials).then(function (token) {
            res.json({ success: true, token: token });
        }).catch(function (errorMessage) {
            console.log(errorMessage);
            if (errorMessage.error) {
                return res.status(500).json({ success: false, error: errorMessage });
            } else if (!errorMessage.authenticated) {
                return res.status(403).json({ success: false, authenticated: false });
            }
        });
    });

    app.get('/api/users', _token.hasToken, function (req, res) {
        _account2.default.findByQuery(req.query.search).then(function (users) {
            return res.json({ users: users, currentUser: req.currentUser, success: true });
        }).catch(function (error) {
            return res.send({ error: error, success: false });
        });
    });

    app.get('/auth/facebook', _passport2.default.authenticate('facebook', { session: false }));

    app.get('/auth/facebook/callback', _passport2.default.authenticate('facebook', {
        failureRedirect: '/',
        session: false
    }), function (req, res) {
        res.json(req.user);
    });

    app.get('/auth/google', _passport2.default.authenticate('google', {
        session: false,
        scope: ['email profile']
    }));

    app.get('/auth/google/callback', _passport2.default.authenticate('google', {
        failureRedirect: '/',
        session: false
    }), function (req, res) {
        res.cookie('nfToken', req.user);
        res.redirect('/tournaments');
    });
};