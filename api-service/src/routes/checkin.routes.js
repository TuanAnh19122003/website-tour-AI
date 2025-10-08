const express = require('express');
const router = express.Router();
const Booking = require('../models/booking.model');
const BookingItem = require('../models/bookingItem.model');

// GET chi tiết booking
router.get('/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findByPk(bookingId, {
            include: [
                {
                    model: BookingItem,
                    as: 'items',
                    include: [
                        {
                            model: require('../models/tour.model'),
                            as: 'tour',
                            attributes: ['id', 'name', 'image', 'location', 'price', 'description'] // thêm các trường cần thiết
                        }
                    ]
                }
            ]
        });

        if (!booking)
            return res.status(404).json({ success: false, message: 'Booking không tồn tại' });

        res.json({ success: true, data: booking });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lấy chi tiết booking thất bại', error: err.message });
    }
});


// POST check-in booking
router.post('/:bookingId/checkin', async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findByPk(bookingId);

        if (!booking)
            return res.status(404).json({ success: false, message: 'Booking không tồn tại' });

        if (booking.status !== 'paid')
            return res.status(400).json({ success: false, message: 'Chưa thanh toán, không thể check-in' });

        booking.status = 'completed';
        await booking.save();

        res.json({ success: true, message: 'Check-in thành công', data: booking });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Check-in thất bại', error: err.message });
    }
});

router.get('/:bookingId/qr', async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findByPk(bookingId, {
            include: [
                {
                    model: BookingItem,
                    as: 'items',
                    include: [
                        {
                            model: require('../models/tour.model'),
                            as: 'tour',
                            attributes: ['id', 'name', 'image', 'location', 'price']
                        }
                    ]
                }
            ]
        });


        if (!booking) return res.status(404).json({ success: false, message: 'Booking không tồn tại' });
        if (!booking.qrCode) return res.status(404).json({ success: false, message: 'Chưa có QR code' });

        res.json({ success: true, qrCode: booking.qrCode });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lấy QR code thất bại', error: err.message });
    }
});

module.exports = router;
