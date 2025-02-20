const jwt= require('jsonwebtoken');
const dotenv = require('dotenv');


module.exports = (req, res, next) => {
    const token = req.header('Authorization');
    if(!token) return res.status(401).send('Access Denied');
    try{
        const verified= jwt.verify(token, process.env.JWT_TOKEN);
        req.user= verified;
        next();
    }catch(error){
        res.status(400).json({ message: 'Invalid token' });
    }
}