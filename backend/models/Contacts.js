let mongoose = require('mongoose')

let contactSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  firstName: { 
    type: String, 
    required: [true, 'First name is required'] 
  },
  
  lastName: { type: String, default: '' },
  
  email: { 
    type: String, 
    required: false, 
    trim: true,
    lowercase: true
  }, 
  
  phone: { type: String, default: '' },
  company: { type: String, default: '' },
  tags: [{ type: String }],
  notes: { type: String, default: '' },
  isFavorite: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);