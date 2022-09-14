const { verifyJWT } = require('../utils/validations.js');


const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const header = authHeader.split(' ') ?? [];
        const token = header.length > 1 ? header[1] : header[0];
        const userId = verifyJWT(token);
        if (userId != null) {
            req.userId = userId;
            next();
        } else {
            return res.sendStatus(403);
        }
    } else {
        res.sendStatus(401);
    }
};

module.exports = { authenticateJWT };