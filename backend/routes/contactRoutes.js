let express = require('express');
let router = express.Router();
let contactController = require('../controllers/contactController');
let { protect } = require('../middleware/authMiddleware');

router.use(protect); 

router.route('/')
  .get(contactController.getContacts)  
  .post(contactController.addContact); 

router.route('/:id')
  .put(contactController.updateContact)     
  .delete(contactController.deleteContact); 

router.patch('/:id/favorite', contactController.toggleFavorite); 

module.exports = router;