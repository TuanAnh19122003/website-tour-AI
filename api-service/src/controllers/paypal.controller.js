const { client: paypalClient } = require('../config/paypal');
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const Booking = require('../models/booking.model');
const BookingItem = require('../models/bookingItem.model');

// =============== Helper chuyển items sang PayPal format ===============
const convertBookingToPaypalItems = (items, usdRate = 25000) => {
    const paypalItems = items.map(item => {
        const usdPrice = Math.round((item.price / usdRate) * 100) / 100;
        return {
            name: item.name || 'Tour du lịch',
            unit_amount: { currency_code: 'USD', value: usdPrice.toFixed(2) },
            quantity: String(item.quantity),
        };
    });

    const itemTotal = paypalItems.reduce(
        (sum, item) => sum + parseFloat(item.unit_amount.value) * parseInt(item.quantity),
        0
    );

    return { paypalItems, itemTotal: itemTotal.toFixed(2) };
};

// =============== Tạo PayPal order ===============
exports.create = async (req, res) => {
    try {
        const { userId, items, totalPrice, note } = req.body;

        if (!items?.length) {
            return res.status(400).json({ success: false, message: "Không có tour nào trong booking" });
        }

        const { paypalItems, itemTotal } = convertBookingToPaypalItems(items);
        const origin = req.get('origin') || 'http://localhost:5173';

        // Tạo booking pending trong DB
        const newBooking = await Booking.create({
            userId,
            total_price: totalPrice,
            note,
            status: 'pending',
            paymentMethod: 'paypal',
        });

        await BookingItem.bulkCreate(
            items.map(i => ({
                bookingId: newBooking.id,
                tourId: i.tourId,
                quantity: i.quantity,
                price: i.price,
            }))
        );

        // Tạo order trên PayPal
        const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
        request.prefer('return=representation');
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: itemTotal,
                    breakdown: { item_total: { currency_code: 'USD', value: itemTotal } }
                },
                items: paypalItems,
            }],
            application_context: {
                brand_name: 'Travel Booking',
                landing_page: 'LOGIN',
                user_action: 'PAY_NOW',
                return_url: `${origin}/bookings/paypal-success?bookingId=${newBooking.id}`,
                cancel_url: `${origin}/bookings/paypal-cancel?bookingId=${newBooking.id}`,
            },
        });

        const paypalOrder = await paypalClient().execute(request);
        newBooking.paypal_order_id = paypalOrder.result.id;
        await newBooking.save();

        res.json({
            success: true,
            orderID: paypalOrder.result.id,
            approveUrl: paypalOrder.result.links.find(l => l.rel === 'approve')?.href,
            data: newBooking,
        });
    } catch (err) {
        console.error('PayPal create error:', err);
        res.status(500).json({ success: false, message: 'Tạo PayPal order thất bại', error: err.message });
    }
};

// =============== Capture PayPal payment ===============
exports.capture = async (req, res) => {
    try {
        const { bookingId } = req.query;
        const booking = await Booking.findByPk(bookingId);

        if (!booking || !booking.paypal_order_id) {
            return res.status(404).json({ success: false, message: 'Booking không tồn tại hoặc không có PayPal order' });
        }

        const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(booking.paypal_order_id);
        request.requestBody({});
        const capture = await paypalClient().execute(request);

        booking.status = 'paid';
        await booking.save();

        res.json({ success: true, message: 'Thanh toán thành công', data: booking, paypal: capture.result });
    } catch (err) {
        console.error('PayPal capture error:', err);
        res.status(500).json({ success: false, message: 'Xác nhận thanh toán thất bại', error: err.message });
    }
};
