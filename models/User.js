// models/User.js
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const { getDatabase } = require('../db');

const saltRounds = 10;

class User {
    static async findOne(filter) {
        const db = getDatabase();
        const usersCollection = db.collection('Users');
        return await usersCollection.findOne(filter);
    }

    static async create(userData) {
        const db = getDatabase();
        const usersCollection = db.collection('Users');
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
        const newUser = { ...userData, password: hashedPassword };
        const result = await usersCollection.insertOne(newUser);
        return result;
    }

    static async removeRefreshToken(userId, refreshToken) {
        const db = getDatabase();
        const usersCollection = db.collection('Users');
        await usersCollection.updateOne(
            { _id: ObjectId(userId) },
            { $pull: { refreshTokens: refreshToken } }
        );
    }
}

module.exports = User;