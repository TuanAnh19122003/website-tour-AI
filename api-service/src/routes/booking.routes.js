const express = require('express');
const router = express.Router();
const controller = require('../controllers/booking.controller');

router.get('/', controller.findAll);
router.post('/', controller.createBooking);
router.put('/:id', controller.updateBooking);
router.get('/user/:id', controller.getBookingsByUser);
router.patch('/status', controller.updateBookingStatus);
router.patch('/item/:bookingItemId', controller.updateBookingItemQuantity);
router.delete('/:bookingId', controller.deleteBooking);

module.exports = router;
