const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  items: [
    {
      menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'menuItem' },
      quantity: { type: Number, default: 1 },
    },
  ],
});

module.exports = mongoose.model('cart', CartSchema);
