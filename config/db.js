const moongose = require('mongoose')
require('dotenv').config({
  path: '.env'
})

const conexionDB = async () => {
  try {
    await moongose.connect(process.env.MONGO_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    })
    console.log('DB conectada')
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

module.exports = conexionDB