// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const accessTokenSecret = process.env.JWT_SECRET;
const refreshTokenSecret = process.env.JWT_SECRET;

router.post('/signup', async (req, res) => {
    try {

        const { firstName, lastName, email, password } = req.body;
        const userData = { firstName, lastName, email, password };
        await User.create(userData);
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password, data } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const accessToken = jwt.sign({ userId: user._id, email: user.email }, accessTokenSecret, {
            expiresIn: '1m',
        });
        const refreshToken = jwt.sign({ userId: user._id, email: user.email }, refreshTokenSecret, {
            expiresIn: '7d',
        });


        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            sameSite: 'strict',
            expires: new Date(Date.now() + 1 * 60 * 1000),
            path: '/',
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            path: '/',
        });

        res.json({ message: 'Login successful', accessToken, refreshToken });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/refresh-token', async (req, res) => {
    const { refreshToken } = req.body;
    jwt.verify(refreshToken, refreshTokenSecret, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Failed to verify refresh token' });
        }

        const { email } = decoded;

        try {
            const user = await User.findOne({ email: email });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const accessToken = jwt.sign({ userId: user._id, email: user.email }, accessTokenSecret, {
                expiresIn: '1m',
            });

            const refreshToken = jwt.sign({ userId: user._id, email: user.email }, refreshTokenSecret, {
                expiresIn: '7d',
            });

            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                sameSite: 'strict',
                expires: new Date(Date.now() + 1 * 60 * 1000),
                path: '/',
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                sameSite: 'strict',
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                path: '/',
            });


            res.json({ message: 'refresh-token successful', accessToken, refreshToken });
        } catch (err) {
            res.status(500).json({ message: 'Internal server error' });
        }
    });
});

router.post('/logout', async (req, res) => {
    const { refreshToken } = req.cookies;

    try {
        const user = await User.findOne({ refreshTokens: refreshToken });

        if (!user) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        await User.removeRefreshToken(user._id, refreshToken);

        res.clearCookie('accessToken', { path: '/' });
        res.clearCookie('refreshToken', { path: '/' });

        res.json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});



module.exports = router;