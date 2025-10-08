const { User, Tour, Discount } = require('../models');
const Booking = require('../models/booking.model');
const BookingItem = require('../models/bookingItem.model');
const { client: paypalClient } = require('../config/paypal');
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

class BookingService {
    // ===================== LẤY DANH SÁCH BOOKING =====================
    static async findAll({ offset, limit }) {
        const bookings = await Booking.findAndCountAll({
            distinct: true,
            include: [
                { model: User, as: 'user' },
                {
                    model: BookingItem,
                    as: 'items',
                    include: [{ model: Tour, as: 'tour' }],
                },
            ],
            offset,
            limit,
            order: [['createdAt', 'DESC']],
        });
        return bookings;
    }

    // ===================== LẤY BOOKING THEO NGƯỜI DÙNG =====================
    static async getBookingsByUser(userId) {
        return await Booking.findAll({
            where: { userId },
            include: [
                {
                    model: BookingItem,
                    as: 'items',
                    include: [{ model: Tour, as: 'tour' }],
                },
            ],
            order: [['createdAt', 'DESC']],
        });
    }

    // ===================== TẠO BOOKING =====================
    static async create(userId, items, totalPrice, note, paymentMethod = 'cod') {
        const tourIds = [...new Set(items.map(i => i.tourId))];
        const tours = await Tour.findAll({ where: { id: tourIds } });
        const tourMap = {};
        tours.forEach(t => { tourMap[t.id] = t.name; });

        return await Booking.sequelize.transaction(async (t) => {
            const booking = await Booking.create({
                userId,
                total_price: totalPrice,
                note,
                paymentMethod,
                status: paymentMethod === 'paypal' ? 'pending' : 'paid',
            }, { transaction: t });

            const bookingItemsData = items.map((item) => ({
                bookingId: booking.id,
                tourId: item.tourId,
                quantity: item.quantity,
                price: item.price,
            }));

            await BookingItem.bulkCreate(bookingItemsData, { transaction: t });

            // Nếu COD thì không cần PayPal
            if (paymentMethod === 'cod') {
                return { booking };
            }

            // ===================== PAYPAL =====================
            const itemsUSD = items.map(item => ({
                ...item,
                unitAmount: parseFloat((item.price / 24000).toFixed(2)) // Quy đổi VND -> USD
            }));

            const itemTotal = itemsUSD
                .reduce((sum, item) => sum + item.unitAmount * item.quantity, 0)
                .toFixed(2);

            const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
            request.prefer('return=representation');
            request.requestBody({
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: 'USD',
                        value: itemTotal,
                        breakdown: {
                            item_total: {
                                currency_code: 'USD',
                                value: itemTotal,
                            },
                        },
                    },
                    items: itemsUSD.map(item => ({
                        name: tourMap[item.tourId] || 'Tour du lịch',
                        unit_amount: {
                            currency_code: 'USD',
                            value: item.unitAmount.toFixed(2),
                        },
                        quantity: item.quantity.toString(),
                    })),
                }],
                application_context: {
                    brand_name: 'Tour Booking',
                    landing_page: 'LOGIN',
                    user_action: 'PAY_NOW',
                    return_url: `http://localhost:3000/paypal-success?bookingId=${booking.id}`,
                    cancel_url: `http://localhost:3000/payment-fail?bookingId=${booking.id}`,
                },
            });

            const response = await paypalClient().execute(request);
            const paypalOrderId = response.result.id;
            const approveUrl = response.result.links.find(link => link.rel === 'approve')?.href;

            booking.paypal_order_id = paypalOrderId;
            await booking.save({ transaction: t });

            return { booking, approveUrl };
        });
    }

    // ===================== CẬP NHẬT BOOKING =====================
    static async update(bookingId, { userId, note, items }) {
        return await Booking.sequelize.transaction(async (t) => {
            const booking = await Booking.findByPk(bookingId, { transaction: t });
            if (!booking) throw new Error('Booking not found');

            booking.userId = userId ?? booking.userId;
            booking.note = note ?? '';

            await BookingItem.destroy({ where: { bookingId }, transaction: t });

            const bookingItemsData = items.map((item) => ({
                bookingId,
                tourId: item.tourId,
                quantity: item.quantity,
                price: item.price,
            }));

            await BookingItem.bulkCreate(bookingItemsData, { transaction: t });

            const totalPrice = bookingItemsData.reduce((sum, item) => sum + item.quantity * item.price, 0);
            booking.total_price = totalPrice;
            await booking.save({ transaction: t });

            return booking;
        });
    }

    // ===================== CẬP NHẬT TRẠNG THÁI BOOKING =====================
    static async updateBookingStatus(bookingId, status) {
        const booking = await Booking.findByPk(bookingId);
        if (!booking) throw new Error('Booking not found');

        booking.status = status;
        await booking.save();
        return booking;
    }

    // ===================== CẬP NHẬT SỐ LƯỢNG TOUR TRONG BOOKING =====================
    static async updateBookingItemQuantity(bookingItemId, newQuantity) {
        return await BookingItem.sequelize.transaction(async (t) => {
            const bookingItem = await BookingItem.findByPk(bookingItemId, {
                include: [{ model: Tour, as: 'tour' }],
                transaction: t,
            });

            if (!bookingItem) throw new Error('Booking item not found');

            bookingItem.quantity = newQuantity;
            await bookingItem.save({ transaction: t });

            const bookingId = bookingItem.bookingId;
            const allItems = await BookingItem.findAll({ where: { bookingId }, transaction: t });

            const newTotal = allItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
            const booking = await Booking.findByPk(bookingId, { transaction: t });

            booking.total_price = newTotal;
            await booking.save({ transaction: t });

            return { bookingItem, newTotal };
        });
    }

    // ===================== XOÁ BOOKING =====================
    static async delete(bookingId) {
        return await Booking.sequelize.transaction(async (t) => {
            const booking = await Booking.findByPk(bookingId, { transaction: t });
            if (!booking) throw new Error('Booking not found');

            await BookingItem.destroy({ where: { bookingId }, transaction: t });
            await booking.destroy({ transaction: t });

            return { message: 'Booking deleted successfully' };
        });
    }
}

module.exports = BookingService;
