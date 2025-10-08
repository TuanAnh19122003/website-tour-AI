module.exports = (db) => {
    const { Role, User, Tour, Discount, Booking, BookingItem, Review } = db;

    const fk = (name, allowNull = false, onDelete = 'CASCADE', onUpdate = 'CASCADE') => ({
        foreignKey: { name, allowNull },
        constraints: true,
        onDelete,
        onUpdate
    });

    // ===== Role ↔ User =====
    Role.hasMany(User, { ...fk('roleId'), as: 'users' });
    User.belongsTo(Role, { ...fk('roleId'), as: 'role' });

    // ===== User ↔ Booking =====
    User.hasMany(Booking, { ...fk('userId'), as: 'bookings' });
    Booking.belongsTo(User, { ...fk('userId'), as: 'user' });

    // ===== Discount ↔ Tour =====
    Discount.hasMany(Tour, { ...fk('discountId', true, 'SET NULL'), as: 'tours' });
    Tour.belongsTo(Discount, { ...fk('discountId', true, 'SET NULL'), as: 'discount' });

    // ===== Booking ↔ BookingItem =====
    Booking.hasMany(BookingItem, { ...fk('bookingId'), as: 'items' });
    BookingItem.belongsTo(Booking, { ...fk('bookingId'), as: 'booking' });

    // ===== Tour ↔ BookingItem =====
    Tour.hasMany(BookingItem, { ...fk('tourId'), as: 'bookingItems' });
    BookingItem.belongsTo(Tour, { ...fk('tourId'), as: 'tour' });

    // ===== User ↔ Review =====
    User.hasMany(Review, { ...fk('userId'), as: 'reviews' });
    Review.belongsTo(User, { ...fk('userId'), as: 'user' });

    // ===== Tour ↔ Review =====
    Tour.hasMany(Review, { ...fk('tourId'), as: 'reviews' });
    Review.belongsTo(Tour, { ...fk('tourId'), as: 'tour' });
};
