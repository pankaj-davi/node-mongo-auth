const jwt = require('jsonwebtoken');
const accessTokenSecret = process.env.JWT_SECRET;

 const verifyAccessToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ message: 'Missing authorization header' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Missing access token' });
    }

    jwt.verify(token, accessTokenSecret, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Failed to verify access token' });
        }

        req.user = decoded; 
        next();
    });
};

module.exports = {
    verifyAccessToken
};