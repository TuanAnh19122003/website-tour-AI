const sequelize = require('./src/config/database');
const { faker } = require('@faker-js/faker');
const slugify = require('slugify');

// Import models
const Role = require('./src/models/role.model');
const User = require('./src/models/user.model');
const Discount = require('./src/models/discount.model');
const Tour = require('./src/models/tour.model');
const Booking = require('./src/models/booking.model');
const BookingItem = require('./src/models/bookingItem.model');
const Review = require('./src/models/review.model');
const Contact = require('./src/models/contact.model');

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        await sequelize.sync({ force: true });
        console.log('Database synced (all tables recreated)...');

        // ===================== Roles =====================
        const roles = await Role.bulkCreate([
            { code: 'ADMIN', name: 'Admin' },
            { code: 'CUSTOMER', name: 'Customer' },
        ]);
        console.log(`Created ${roles.length} roles`);

        // ===================== Users =====================
        const users = [
            { firstname: 'Admin', lastname: 'Travel', email: 'admin@travel.com', password: 'admin123', roleId: roles[0].id },
            { firstname: 'Nguyen', lastname: 'An', email: 'an@travel.com', password: '123456', roleId: roles[1].id },
            { firstname: 'Tran', lastname: 'Binh', email: 'binh@travel.com', password: '123456', roleId: roles[1].id },
            { firstname: 'Le', lastname: 'Chi', email: 'chi@travel.com', password: '123456', roleId: roles[1].id },
        ];
        const createdUsers = await User.bulkCreate(users);
        console.log(`Created ${createdUsers.length} users`);

        // ===================== Discounts =====================
        const discounts = [];
        for (let i = 0; i < 5; i++) {
            const startDate = faker.date.future({ years: 0.5 });
            const endDate = faker.date.soon({ days: faker.number.int({ min: 30, max: 90 }), refDate: startDate });

            discounts.push({
                name: `${faker.commerce.productAdjective()} ${faker.word.sample()} Sale`,
                description: faker.commerce.productDescription(),
                percentage: faker.number.int({ min: 5, max: 50 }),
                start_date: startDate,
                end_date: endDate,
            });
        }

        const createdDiscounts = await Discount.bulkCreate(discounts);
        console.log(`Created ${createdDiscounts.length} discounts`);

        // ===================== Tours =====================
        const tourNames = [
            'Tour Đà Nẵng 3N2Đ',
            'Tour Đà Lạt 4N3Đ',
            'Tour Phú Quốc 5N4Đ',
            'Tour Sapa 3N2Đ',
            'Tour Hạ Long 2N1Đ',
            'Tour Huế - Hội An 3N2Đ',
            'Tour Ninh Bình 2N1Đ',
            'Tour Quy Nhơn 4N3Đ',
            'Tour Cần Thơ - Sóc Trăng 3N2Đ',
            'Tour Hà Giang 4N3Đ',
        ];

        const tours = await Tour.bulkCreate(
            tourNames.map((name, i) => ({
                code: `TOUR-${(i + 1).toString().padStart(3, '0')}`,
                name,
                slug: slugify(name, { lower: true, strict: true }),
                description: faker.lorem.paragraph(),
                image: `tour-${i + 1}.jpg`,
                price: faker.number.int({ min: 2000000, max: 7000000 }),
                start_date: faker.date.future({ years: 1 }),
                end_date: faker.date.future({ years: 1 }),
                duration_days: faker.number.int({ min: 2, max: 5 }),
                location: faker.location.city(),
                departure: faker.location.city(),
                itinerary: {
                    day1: faker.lorem.sentence(),
                    day2: faker.lorem.sentence(),
                    day3: faker.lorem.sentence(),
                },
                note: faker.lorem.sentence(),
                max_people: faker.number.int({ min: 10, max: 40 }),
                available_people: faker.number.int({ min: 5, max: 40 }),
                is_active: true,
                is_featured: faker.datatype.boolean(),
                discountId: faker.helpers.arrayElement(discounts).id,
            }))
        );
        console.log(`Created ${tours.length} tours`);

        // ===================== Bookings =====================
        const bookings = [];
        for (let i = 0; i < 15; i++) {
            const user = faker.helpers.arrayElement(createdUsers.slice(1)); // exclude admin
            bookings.push({
                userId: user.id,
                total_price: faker.number.int({ min: 2000000, max: 15000000 }),
                booking_date: faker.date.recent({ days: 30 }),
                status: faker.helpers.arrayElement(['pending', 'paid', 'cancelled', 'completed']),
                paymentMethod: faker.helpers.arrayElement(['cod', 'paypal']),
                paypal_order_id: faker.string.uuid(),
                note: faker.lorem.sentence(),
            });
        }
        const createdBookings = await Booking.bulkCreate(bookings);
        console.log(`Created ${createdBookings.length} bookings`);

        // ===================== Booking Items =====================
        const bookingItems = [];
        for (const booking of createdBookings) {
            const randomTours = faker.helpers.arrayElements(tours, faker.number.int({ min: 1, max: 2 }));
            for (const tour of randomTours) {
                const qty = faker.number.int({ min: 1, max: 5 });
                bookingItems.push({
                    bookingId: booking.id,
                    tourId: tour.id,
                    quantity: qty,
                    price: tour.price,
                });
            }
        }
        await BookingItem.bulkCreate(bookingItems);
        console.log(`Created ${bookingItems.length} booking items`);

        // ===================== Reviews =====================
        const reviews = [];
        for (const user of createdUsers.slice(1)) {
            const randomTours = faker.helpers.arrayElements(tours, faker.number.int({ min: 1, max: 3 }));
            for (const tour of randomTours) {
                reviews.push({
                    userId: user.id,
                    tourId: tour.id,
                    rating: faker.number.int({ min: 3, max: 5 }),
                    comment: faker.lorem.sentence(),
                });
            }
        }
        await Review.bulkCreate(reviews);
        console.log(`Created ${reviews.length} reviews`);

        // ===================== Contacts =====================
        const contacts = [];
        for (let i = 0; i < 10; i++) {
            contacts.push({
                name: faker.person.fullName(),
                email: faker.internet.email(),
                phone: faker.phone.number('09########'),
                subject: faker.lorem.words(3),
                message: faker.lorem.sentences(2),
            });
        }
        await Contact.bulkCreate(contacts);
        console.log(`Created ${contacts.length} contacts`);

        console.log('SEEDING COMPLETED SUCCESSFULLY!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
}

seed();
