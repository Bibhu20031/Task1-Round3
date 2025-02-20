const mongoose = require('mongoose');

const equipmentSchema = mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true, index: true },
    supplier_id: { type: String, required: true, index: true },
    availability: { type: Boolean, default: true }
});

module.exports= mongoose.model('Equipment', equipmentSchema);

