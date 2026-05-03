const express = require('express');
const router = express.Router();

var contacts = [
    {id: 1, name: "Khairul Ikhwan", phone: "0198878293"},
    {id: 2, name: "Zafrul Noordin", phone: "0176663838"},
    {id: 3, name: "Wong Siew Lan", phone: "0123393939" }
];

// Read - Contact List
router.get('/', (req, res) => {
    res.render('contact/contacts', {
        title: 'My Contact List',
        content: 'Manage and view details',
        contacts
    });
});

// Read - Add Contact Form
router.get('/add', (req, res) => {
    renderFormPage(res);
});

// Read - Contact Details
router.get('/:id', (req, res) => {
    const contact = contacts.find(c => c.id == req.params.id);

    if (!contact) {
        return res.status(404).send('Contact not found');
    }

    res.render('contact/contact_details', {
        title: 'Contact Details',
        content: 'View detailed information about this contact.',
        contact
    });
});

// Create - Handle Add Contact
router.post('/add', (req, res) => {
    const { name, phone } = req.body;
    const newContact = {
        id: contacts.length + 1,
        name,
        phone
    };
    contacts.push(newContact);
    res.redirect('/contacts');
});

// Update - Render Update Form
router.get('/update/:id', (req, res) => {
    const contact = contacts.find(c => c.id == req.params.id);
    if (!contact) return res.status(404).send('Contact not found');
    renderFormPage(res, null, contact);
});

// Update - Handle Update Contact
router.put('/update/:id', (req, res) => {
    const { name, phone } = req.body;
    const contact = contacts.find(c => c.id == req.params.id);

    if (!contact) return res.status(404).send('Contact not found');

    // Validation
    if (!name || name.trim() === '') {
        return renderFormPage(res, 'Name cannot be empty.', contact);
    }
    if (!phone || !/^\d+$/.test(phone)) {
        return renderFormPage(res, 'Phone number must contain numbers only and cannot be empty.', contact);
    }

    // Update values and redirect back
    contact.name = name;
    contact.phone = phone;
    res.redirect('/contacts');
});

// Delete - Handle Delete Contact
router.delete('/delete/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = contacts.findIndex(c => c.id === id);

    if (index === -1) {
        return res.status(404).send('Contact not found');
    }

    // Remove from array and redirect back
    contacts.splice(index, 1);
    res.redirect('/contacts');
});

// Render Form Page (shared for Add & Update)
function renderFormPage(res, error = null, contact = null) {
    const isUpdate = !!contact;
    res.render('contact/contact_form', {
        title: isUpdate ? 'Update Contact' : 'Add New Contact',
        content: isUpdate
            ? 'Update the details of this contact.'
            : 'Fill in the details to add a new contact.',
        error,
        contact,
        formAction: isUpdate ? `/contacts/update/${contact.id}?_method=PUT` : '/contacts/add'
    });
}

module.exports = router;