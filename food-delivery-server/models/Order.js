const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  items: [
    {
      menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'menuItem' },
      quantity: Number,
    },
  ],
  total: Number,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('order', OrderSchema);
