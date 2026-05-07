const express = require('express');
const db = require('../../database');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [result] = await db.query('SELECT * FROM users');
        const users = result;
        // console.log(users);
        res.render('users/users', {
            title: 'Users Management',
            content: 'Manage your users',
            // users: users
            users
        });
    } catch(err) {
        console.log(err);
    }
});

router.get('/add', (req, res) => {
    renderFormPage(res);
});

router.get('/:id', async (req, res) => {
    try {
        const [result] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
        const user = result[0];
        if(!user) return res.status(404).send('User not found');
        res.render('users/user_details', {
            title: 'User Details',
            content: 'View your user',
            // users: users
            user
        });
    } catch(err) {
        console.log(err);
    }
});

function renderFormPage(res, error = null, user = null){
    const isUpdate = !!user;

    res.render('users/user_form', {
        title: isUpdate ? 'Update User' : 'New User',
        content: isUpdate ? 'Change user details' :'Fill up user details',
        error,
        user,
        formAction: isUpdate ? '/users/update/' + user.id + '?_method=PUT' :'/users/add'
    });
};

function validateForm(name, phone, email, res, userId = null){
    if(!name || name.trim() == ''){
        renderFormPage(res, 'Name is required', {name, email, phone, id: userId});
        return false;
    }
    if(!phone || !/^\d{6,12}$/.test(phone)){
        renderFormPage(res, 'Valid phone is required', {name, email, phone, id: userId});
        return false;
    }
    if(!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)){
        renderFormPage(res, 'Valid email is required', {name, email, phone, id: userId});
        return false;
    }
    return true;
}

router.post('/add', async (req, res)=>{
    const { name, email, phone } = req.body;
    if(!validateForm(name, phone, email)){
        return;
    }
    try{
        await db.query('INSERT INTO users (name, email, phone) VALUES (?,?,?)', [name, email, phone]);
        res.redirect('/users');
    } catch(err) {
        renderFormPage(res, 'Database error. please check with admin', {name, email, phone});
    }
});

router.delete('/delete/:id', async(req, res) => {
    try {
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        if(result.affectedRows == 0) return res.status(404).send('User not found');
        res.redirect('/users');
    } catch(err){
        console.log(err);
        res.status(500).send('An error occured. Unable to delete from database.');
    }
});

router.get('/update/:id', async(req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
        if(rows.length < 1) return res.status(404).send('User not found');
        const user = rows[0];
        console.log(user);
        renderFormPage(res, null, user);
    } catch(err){

    }
});

router.put('/update/:id', async(req, res) => {
    const { name, email, phone } = req.body;
    if(!validateForm(name, phone, email, res, req.params.id)){
        return;
    }
    try {
        const [result] = await db.query('UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?', 
            [name, email, phone, req.params.id]);
        if(result.affectedRows == 0) return res.status(404).send('User not found');
        res.redirect('/users');
    } catch(err){
        renderFormPage(res, 'Database error');
    }

});

module.exports = router;