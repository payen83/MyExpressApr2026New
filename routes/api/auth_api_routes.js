const express = require('express');
const db = require('../../database');
const router = express.Router();
const bcrypt = require('bcrypt');
const multer = require('multer');
const upload = multer();
require('dotenv').config();
const jwt = require('jsonwebtoken');

router.post('/login', upload.none(), async(req, res)=>{
    const data =  {...req.body, ...req.query};
    const {email, password} = data;
    try{
        const [rows] = await db.query(
            'SELECT * FROM users WHERE email = ? AND type = ?',
            [email, 'admin']
        );
        if(rows.length==0){
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        const admin = rows[0];
        const isMatch = await bcrypt.compare(password, admin.hash_password);
        if(!isMatch){
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        const token = jwt.sign(
            { id: admin.id, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.json({
            success: true,
            message: 'Login successfull',
            token,
            user: {
                id: admin.id,
                name: admin.name,
                email: admin.email
            }
        });
    }catch(err){
        console.log(err);
        res.status(500).json({
            success: false,
            message: 'Sign in failed',
            error: err.message
        })
    }
});

router.post('/register', upload.none(), async (req, res) => {
    //email: rahman@mail.com
    //password: abc12345
    const data = { ...req.body, ...req.query};
    const {name, email, password} = data;
    const errors = [];

    if(!name || name.trim() == '') errors.push('Name is required');
    if(!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) errors.push('Valid email is required');
    if(!password || !/^[a-zA-Z0-9]{8,}$/.test(password)) errors.push('Password need to be at least 8 chars');
    if(errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    try{
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if(existingUser.length > 0){
            return res.status(409).json({
                success: false,
                message: 'Email already exists'
            });
        }
        const type = 'admin';
        const [result] = await db.query(
            'INSERT INTO users (name, email, hash_password, type) VALUES (?,?,?,?)',
            [name, email, hashedPassword, type]
        );
        res.status(201).json({
            success: true,
            message: 'Registered successfully',
            data: {
                id: result.insertId
            }
        });
    } catch(err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'An error occurred',
            error: err.message
        });
    }
})

module.exports = router;