const express = require('express');
const router = express.Router();

var contacts = [
    {id: 1, name: "Khairul Ikhwan", phone: "0198878293"},
    {id: 2, name: "Zafrul Noordin", phone: "0176663838"},
    {id: 3, name: "Wong Siew Lan", phone: "0123393939" }
];

router.get('/', (req, res) => {
    res.render('contact/contacts', {
        title: 'My Contact List',
        content: 'Manage and view details',
        contacts
    });
});

router.get('/add', (req, res) => {
    renderFormPage(res);
});

router.get( '/:id', (req, res) => {
  const contact = contacts.find( c => c.id == req.params.id );

  if ( !contact ) {
    return res.status( 404 ).send( 'Contact not found' );
  }

  res.render( 'contact/contact_details', {
    title: 'Contact Details',
    content: 'View detailed information about this contact.', 
    contact
  });
});

function renderFormPage(res, error = null){
    res.render('contact/contact_form', {
        title: 'Add New Contact',
        content: 'Fill in the details',
        error,
        formAction: '/contacts/add'
    });
}

router.post('/add', (req,res) => {
    const {name, phone} = req.body;
    const newContact = {
        id: contacts.length+1,
        name,
        phone
    }
    contacts.push(newContact);
    res.redirect('/contacts');
});

router.post('/delete/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = contacts.findIndex(item => item.id == id);
    if(index < 0) return res.status(404).send('Contact id not found');
    contacts.splice(index, 1);
    res.redirect('/contacts');
});

module.exports = router;