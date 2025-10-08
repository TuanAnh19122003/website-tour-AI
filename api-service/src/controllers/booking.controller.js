const BookingService = require('../services/booking.service');

class BookingController {
    async findAll(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 5;
            const offset = (page - 1) * pageSize;

            const { count, rows } = await BookingService.findAll({ offset, limit: pageSize });

            res.status(200).json({
                success: true,
                message: 'Lấy danh sách booking thành công',
                data: rows,
                total: count,
                page,
                pageSize,
            });
        } catch (error) {
            console.error('Lỗi:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi lấy danh sách booking',
                error: error.message,
            });
        }
    }

    async createBooking(req, res) {
        try {
            const { items, totalPrice, note, paymentMethod } = req.body;
            const userId = req.user?.id || req.body.userId;

            if (!items || items.length === 0) {
                return res.status(400).json({ message: 'Booking phải có ít nhất một tour' });
            }

            const { booking, approveUrl } = await BookingService.create(
                userId,
                items,
                totalPrice,
                note,
                paymentMethod
            );

            res.status(201).json({
                success: true,
                message: 'Tạo booking thành công',
                data: booking,
                ...(approveUrl && { approveUrl }),
            });
        } catch (err) {
            console.error('Error in createBooking:', err);
            res.status(500).json({
                success: false,
                message: 'Tạo booking thất bại',
                error: err.message,
            });
        }
    }

    async updateBooking(req, res) {
        try {
            const bookingId = req.params.id;
            const { userId, note, items } = req.body;

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Booking phải có ít nhất một tour',
                });
            }

            const updated = await BookingService.update(bookingId, {
                userId,
                note,
                items,
            });

            res.status(200).json({
                success: true,
                message: 'Cập nhật booking thành công',
                data: updated,
            });
        } catch (err) {
            console.error('Error in updateBooking:', err);
            res.status(500).json({
                success: false,
                message: 'Cập nhật booking thất bại',
                error: err.message,
            });
        }
    }

    async getBookingsByUser(req, res) {
        try {
            const userId = req.user?.id || req.params.id;
            const data = await BookingService.getBookingsByUser(userId);

            res.status(200).json({
                success: true,
                message: 'Lấy danh sách booking theo user thành công',
                data,
            });
        } catch (err) {
            console.error('Error in getBookingsByUser:', err);
            res.status(500).json({
                success: false,
                message: 'Lấy booking thất bại',
                error: err.message,
            });
        }
    }

    async updateBookingStatus(req, res) {
        try {
            const { bookingId, status } = req.body;
            const data = await BookingService.updateBookingStatus(bookingId, status);
            res.status(200).json({
                success: true,
                message: 'Cập nhật trạng thái booking thành công',
                data,
            });
        } catch (err) {
            console.error('Error in updateBookingStatus:', err);
            res.status(500).json({
                success: false,
                message: 'Cập nhật trạng thái booking thất bại',
                error: err.message,
            });
        }
    }

    async updateBookingItemQuantity(req, res) {
        try {
            const { bookingItemId } = req.params;
            const { quantity } = req.body;

            if (!quantity || quantity <= 0) {
                return res.status(400).json({ message: 'Số lượng không hợp lệ' });
            }

            const { bookingItem, newTotal } = await BookingService.updateBookingItemQuantity(bookingItemId, quantity);

            res.status(200).json({
                success: true,
                message: 'Cập nhật số lượng và tổng tiền booking thành công',
                bookingItem,
                newTotal,
            });
        } catch (err) {
            console.error('Error in updateBookingItemQuantity:', err);
            res.status(500).json({
                success: false,
                message: 'Cập nhật số lượng thất bại',
                error: err.message,
            });
        }
    }

    async deleteBooking(req, res) {
        try {
            const { bookingId } = req.params;
            const data = await BookingService.delete(bookingId);
            res.status(200).json({
                success: true,
                message: 'Xóa booking thành công',
                data,
            });
        } catch (err) {
            console.error('Error in deleteBooking:', err);
            res.status(500).json({
                success: false,
                message: 'Xóa booking thất bại',
                error: err.message,
            });
        }
    }

    async getBookingDetailsByUser(req, res) {
        try {
            const userId = req.params.id || req.user?.id;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu userId',
                });
            }

            const bookings = await BookingService.getBookingsByUser(userId);

            if (!bookings || bookings.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không có booking nào cho user này',
                });
            }

            res.status(200).json({
                success: true,
                message: 'Lấy chi tiết booking thành công',
                data: bookings,
            });
        } catch (err) {
            console.error('Error in getBookingDetailsByUser:', err);
            res.status(500).json({
                success: false,
                message: 'Lấy chi tiết booking thất bại',
                error: err.message,
            });
        }
    }
}

module.exports = new BookingController();
