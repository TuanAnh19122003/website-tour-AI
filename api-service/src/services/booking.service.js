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
    static async create(req, userId, items, totalPrice, note = '', paymentMethod = 'cod') {
        if (!userId) throw new Error("Missing userId");
        if (!Array.isArray(items) || items.length === 0) throw new Error("Items cannot be empty");

        const computedTotal = Number(totalPrice);
        if (isNaN(computedTotal) || computedTotal <= 0) {
            throw new Error("Invalid totalPrice");
        }

        const tourIds = [...new Set(items.map(i => i.tourId))];
        const tours = await Tour.findAll({ where: { id: tourIds } });
        const tourMap = {};
        tours.forEach(t => { tourMap[t.id] = t.name; });

        // Lấy origin của FE
        const origin = req.get('origin') || `http://${req.hostname}:${req.socket.localPort}`;

        return await Booking.sequelize.transaction(async (t) => {
            // Tạo booking chính
            const booking = await Booking.create({
                userId,
                total_price: computedTotal.toFixed(2),
                note,
                paymentMethod,
                status: paymentMethod === 'paypal' ? 'pending' : 'paid',
            }, { transaction: t });

            //Tạo booking items
            const bookingItemsData = items.map(item => ({
                bookingId: booking.id,
                tourId: item.tourId,
                quantity: Number(item.quantity),
                price: Number(item.price),
            }));
            await BookingItem.bulkCreate(bookingItemsData, { transaction: t });

            //Giảm chỗ còn lại trong tours
            for (const item of bookingItemsData) {
                const tour = await Tour.findByPk(item.tourId, { transaction: t });
                if (!tour) throw new Error(`Tour with id ${item.tourId} not found`);

                const newAvailable = Math.max(tour.available_people - item.quantity, 0);
                await tour.update({ available_people: newAvailable }, { transaction: t });
            }

            // Thanh toán PayPal (nếu có)
            if (paymentMethod === 'cod') return { booking };

            const itemsUSD = bookingItemsData.map(item => ({
                ...item,
                unitAmount: parseFloat((item.price / 24000).toFixed(2)), // VND -> USD
            }));

            const itemTotalUSD = itemsUSD
                .reduce((sum, item) => sum + item.unitAmount * item.quantity, 0)
                .toFixed(2);
            const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
            request.prefer('return=representation');
            request.requestBody({
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: 'USD',
                        value: itemTotalUSD,
                        breakdown: { item_total: { currency_code: 'USD', value: itemTotalUSD } },
                    },
                    items: itemsUSD.map(item => ({
                        name: tourMap[item.tourId] || 'Tour du lịch',
                        unit_amount: { currency_code: 'USD', value: item.unitAmount.toFixed(2) },
                        quantity: item.quantity.toString(),
                    })),
                }],
                application_context: {
                    brand_name: 'Tour Booking',
                    landing_page: 'LOGIN',
                    user_action: 'PAY_NOW',
                    return_url: `${origin}/bookings/paypal-success?bookingId=${booking.id}`,
                    cancel_url: `${origin}/bookings/payment-fail?bookingId=${booking.id}`,
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

    // ===================== CẬP NHẬT TRẠNG THÁI BOOKING =====================
    static async updateBookingStatus(bookingId, status) {
        if (!bookingId) throw new Error('Invalid booking ID');
        const booking = await Booking.findByPk(bookingId, {
            include: [{ model: BookingItem, as: 'items' }],
        });
        if (!booking) throw new Error('Booking not found');

        //Nếu huỷ booking → hoàn chỗ lại
        if (status === 'cancelled' && booking.items && booking.items.length > 0) {
            for (const item of booking.items) {
                const tour = await Tour.findByPk(item.tourId);
                if (tour) {
                    const restored = Math.min(tour.available_people + item.quantity, tour.max_people);
                    await tour.update({ available_people: restored });
                }
            }
        }

        booking.status = status;
        await booking.save();
        return booking;
    }

    // ===================== XOÁ BOOKING =====================
    static async delete(bookingId) {
        return await Booking.sequelize.transaction(async (t) => {
            const booking = await Booking.findByPk(bookingId, {
                include: [{ model: BookingItem, as: 'items' }],
                transaction: t,
            });
            if (!booking) throw new Error('Booking not found');

            //Khi xoá booking → hoàn chỗ lại luôn
            if (booking.items && booking.items.length > 0) {
                for (const item of booking.items) {
                    const tour = await Tour.findByPk(item.tourId, { transaction: t });
                    if (tour) {
                        const restored = Math.min(tour.available_people + item.quantity, tour.max_people);
                        await tour.update({ available_people: restored }, { transaction: t });
                    }
                }
            }

            await BookingItem.destroy({ where: { bookingId }, transaction: t });
            await booking.destroy({ transaction: t });

            return { message: 'Booking deleted successfully' };
        });
    }
}

module.exports = BookingService;
