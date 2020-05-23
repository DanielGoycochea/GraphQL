const mongoose = require('mongoose')

const ClientSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
    trim: true
  },
  lastname:{
    type: String,
    require: true,
    trim: true
  },
  company:{
    type: String,
    require: true,
    trim: true
  },
  email:{
    type: String,
    require: true,
    trim: true,
    unique:true
  },
  phone:{
    type: String,
    trim: true,
  },
  created:{
    type: Date,
    default: Date.now()
  },
  salesman:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    require: true
  }
})

module.exports = mongoose.model('Client', ClientSchema)