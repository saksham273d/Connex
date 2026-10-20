let Contact = require('../models/Contacts');

exports.getContacts = async (req, res) => {
  try {
    let { search } = req.query;
    
    let query = { user: req.user._id };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    let contacts = await Contact.find(query).sort({ createdAt: -1 });

    res.status(200).json(contacts);
  } catch (error) {
    console.error("Get Contacts Error:", error.message);
    res.status(500).json({ message: 'Server error fetching contacts' });
  }
};

exports.addContact = async (req, res) => {
  try {
    let { 
      firstName, 
      lastName, 
      email, 
      phone, 
      company, 
      tags, 
      notes, 
      isFavorite 
    } = req.body;

    if (!firstName || firstName.trim() === '') {
      return res.status(400).json({ message: 'First Name is required' });
    }

    let hasValidEmail = email && typeof email === 'string' && email.trim().length > 0;
    let hasValidPhone = phone && typeof phone === 'string' && phone.trim().length > 0;

    if (!hasValidEmail && !hasValidPhone) {
      return res.status(400).json({ 
        message: 'Please provide at least a Phone Number OR an Email Address.' 
      });
    }

    let newContact = await Contact.create({
      user: req.user._id,
      firstName: firstName.trim(),
      lastName: lastName ? lastName.trim() : '',
      email: hasValidEmail ? email.trim().toLowerCase() : '', 
      phone: hasValidPhone ? phone.trim() : '',              
      company: company ? company.trim() : '',
      tags: Array.isArray(tags) ? tags : [],
      notes: notes ? notes.trim() : '',
      isFavorite: !!isFavorite
    });

    res.status(201).json(newContact);
  } catch (error) {
    console.error("Add Contact Error:", error.message);
    res.status(500).json({ message: 'Server error while saving contact', details: error.message });
  }
};

exports.updateContact = async (req, res) => {
  try {
    let { id } = req.params;
    
    let updatedContact = await Contact.findOneAndUpdate(
      { _id: id, user: req.user._id }, 
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ message: 'Contact not found or unauthorized access' });
    }

    res.status(200).json(updatedContact);
  } catch (error) {
    console.error("Update Contact Error:", error.message);
    res.status(500).json({ message: 'Server error updating contact' });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    let { id } = req.params;

    let deletedContact = await Contact.findOneAndDelete({ 
      _id: id, 
      user: req.user._id
    });

    if (!deletedContact) {
      return res.status(404).json({ message: 'Contact not found or already deleted/unauthorized' });
    }

    res.status(200).json({ message: 'Contact removed successfully', id });
  } catch (error) {
    console.error("Delete Contact Error:", error.message);
    res.status(500).json({ message: 'Server error deleting contact' });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    let { id } = req.params;

    let contact = await Contact.findOne({ _id: id, user: req.user._id });

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found or unauthorized' });
    }

    contact.isFavorite = !contact.isFavorite;
    await contact.save();

    res.status(200).json(contact);
  } catch (error) {
    console.error("Toggle Favorite Error:", error.message);
    res.status(500).json({ message: 'Server error toggling favorite status' });
  }
};