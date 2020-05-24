const mongoose = require('mongoose')

const OrderSchema = mongoose.Schema({
  order: {
    type: Array,
    require: true,
  },
  total: {
    type: Number,
    require: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    require: true
  },
  salesman: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    require: true
  },
  state: {
    type: String,
    default: "pendiente"
  },
  created: {
    type: Date,
    default: Date.now()
  }
})

module.exports = mongoose.model('Orders', OrderSchema)