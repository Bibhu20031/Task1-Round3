const express = require('express');
const Equipment = require('../models/dbModel.js');
const auth = require('../middleware/middleware.js');
const Redis = require('ioredis');
// const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const router = express.Router();
const redis = new Redis({ host: 'localhost', port: 6379 }); 

/**
 * @swagger
 * components:
 *   schemas:
 *     Equipment:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - price
 *         - supplier_id
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the equipment
 *         name:
 *           type: string
 *           description: Name of the equipment
 *         category:
 *           type: string
 *           description: Category of the equipment
 *         price:
 *           type: number
 *           description: Price of the equipment
 *         supplier_id:
 *           type: string
 *           description: Supplier ID
 *         availability:
 *           type: boolean
 *           description: Availability status
 *       example:
 *         id: 60d21b4667d0d8992e610c85
 *         name: Hammer
 *         category: Tools
 *         price: 25.50
 *         supplier_id: 12345
 *         availability: true
 */

/**
 * @swagger
 * /equipment:
 *   post:
 *     summary: Add new equipment
 *     security:
 *       - bearerAuth: []
 *     tags: [Equipment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Equipment'
 *     responses:
 *       201:
 *         description: Equipment added successfully
 *       400:
 *         description: Missing fields
 *       500:
 *         description: Server error
 */
router.post('/', auth, async (req, res) => {
    try {
        const { name, category, price, supplier_id, availability } = req.body;
        if (!name || !category || !price || !supplier_id) {
            return res.status(400).json({ message: "Missing fields" });
        }
        const newEquipment = new Equipment({ name, category, price, supplier_id, availability });
        await newEquipment.save();

        await redis.del('equipment_list');

        res.status(201).json({ message: "Equipment added successfully", equipment: newEquipment });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @swagger
 * /equipment:
 *   get:
 *     summary: Get all equipment
 *     security:
 *       - bearerAuth: []
 *     tags: [Equipment]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: supplier_id
 *         schema:
 *           type: string
 *         description: Filter by supplier ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of equipment
 *       500:
 *         description: Server error
 */
router.get('/', auth, async (req, res) => {
    try {
        let { category, minPrice, maxPrice, supplier_id, page, limit } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        let query = {};
        if (category) query.category = category;
        if (supplier_id) query.supplier_id = supplier_id;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        const cacheKey = `equipment_list_${JSON.stringify(query)}_page${page}_limit${limit}`;

        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            return res.status(200).json(JSON.parse(cachedData));
        }

        const equipments = await Equipment.find(query).skip(skip).limit(limit);
        const total = await Equipment.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        const response = { page, limit, total, totalPages, equipments };

        await redis.set(cacheKey, JSON.stringify(response), 'EX', 60);

        res.json(response);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
