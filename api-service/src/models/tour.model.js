// models/Tour.js
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');
const slugify = require('slugify');

const Tour = sequelize.define('Tour', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        unique: true
    },
    description: {
        type: DataTypes.TEXT
    },
    image: {
        type: DataTypes.STRING
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    duration_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    departure: {
        type: DataTypes.STRING,
        allowNull: true
    },
    itinerary: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Lịch trình tour (mảng JSON: ngày, hoạt động, mô tả, ...)'
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    max_people: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    available_people: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    discountId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'tours',
    hooks: {
        beforeCreate: (tour) => {
            if (tour.name) {
                tour.slug = slugify(tour.name, { lower: true, strict: true });
            }
        },
        beforeUpdate: (tour) => {
            if (tour.name) {
                tour.slug = slugify(tour.name, { lower: true, strict: true });
            }
        }
    }
});

module.exports = Tour;
