const { client: paypalClient } = require('../config/paypal');
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const Booking = require('../models/booking.model');
const BookingItem = require('../models/bookingItem.model');
const Tour = require('../models/tour.model');

/**
 * Helper: convert danh sách tour trong booking sang định dạng PayPal
 */
const convertBookingToPaypalItems = (items, usdRate = 25000) => {
    // items: [{ name, price (VND), quantity }]
    const paypalItems = items.map(item => {
        const usdPrice = Math.round((item.price / usdRate) * 100) / 100; // làm tròn 2 chữ số
        return {
            name: item.name,
            unit_amount: {
                currency_code: "USD",
                value: usdPrice.toFixed(2),
            },
            quantity: String(item.quantity),
        };
    });

    const itemTotal = paypalItems.reduce(
        (sum, item) =>
            sum + parseFloat(item.unit_amount.value) * parseInt(item.quantity),
        0
    );

    return { paypalItems, itemTotal: itemTotal.toFixed(2) };
};

/**
 * Tạo PayPal order cho booking
 */
const create = async (req, res) => {
    try {
        const { userId, items, totalPrice, note } = req.body; 
        // items: [{ tourId, name, price, quantity }]

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Booking phải có ít nhất một tour",
            });
        }

        const { paypalItems, itemTotal } = convertBookingToPaypalItems(items);

        // Tạo request PayPal
        const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: itemTotal,
                        breakdown: {
                            item_total: {
                                currency_code: "USD",
                                value: itemTotal,
                            },
                        },
                    },
                    items: paypalItems,
                },
            ],
            application_context: {
                brand_name: "Travel Booking",
                landing_page: "LOGIN",
                user_action: "PAY_NOW",
                return_url: `http://localhost:3000/paypal-success`,
                cancel_url: `http://localhost:3000/payment-fail`,
            },
        });

        const paypalOrder = await paypalClient().execute(request);

        // Lưu Booking và BookingItems vào DB
        const newBooking = await Booking.create({
            userId,
            total_price: totalPrice,
            note,
            status: "pending",
            paymentMethod: "paypal",
            paypal_order_id: paypalOrder.result.id,
        });

        const bookingItems = items.map(i => ({
            bookingId: newBooking.id,
            tourId: i.tourId,
            quantity: i.quantity,
            price: i.price,
        }));

        await BookingItem.bulkCreate(bookingItems);

        res.json({
            success: true,
            message: "Tạo PayPal booking thành công",
            orderID: paypalOrder.result.id,
            approveUrl: paypalOrder.result.links.find(link => link.rel === 'approve')?.href,
            data: newBooking,
        });
    } catch (err) {
        console.error("Error in createBookingPayPal:", err.response?.data || err);
        res.status(500).json({
            success: false,
            message: "Tạo PayPal booking thất bại",
            error: err.message,
        });
    }
};

/**
 * Capture thanh toán PayPal
 */
const capture = async (req, res) => {
    try {
        const { bookingId } = req.query;
        const booking = await Booking.findByPk(bookingId);

        if (!booking || !booking.paypal_order_id) {
            return res.status(404).json({
                success: false,
                message: "Booking không tồn tại hoặc không thanh toán qua PayPal",
            });
        }

        const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(booking.paypal_order_id);
        request.requestBody({});

        const capture = await paypalClient().execute(request);

        // Cập nhật trạng thái booking
        booking.status = "paid";
        await booking.save();

        res.json({
            success: true,
            message: "Thanh toán PayPal thành công",
            data: booking,
            paypal: capture.result,
        });
    } catch (err) {
        console.error("Error in capture:", err.response?.data || err);
        res.status(500).json({
            success: false,
            message: "Xác nhận thanh toán PayPal thất bại",
            error: err.message,
        });
    }
};

module.exports = { create, capture };
