const {
  ApolloServer
} = require('apollo-server')
const typeDefs = require('./db/schema')
const resolvers = require('./db/resolvers')
const conexionDB = require('./config/db')
const jwt = require('jsonwebtoken')
require('dotenv').config({
  path: '.env'
})

// conexion Base de Datos
conexionDB()
// server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({
    req
  }) => {
    const token = req.headers['authorization'] || ''

    if (token) {
      try {
        const user = jwt.verify(token, process.env.TOKEN_SECRET)

        return {
          user
        }

      } catch (error) {
        console.log(error)
      }
    }

  }
})

// iniciarservidor

server.listen()
  .then(({
    url
  }) => {
    console.log(`iniciando apollo desde puerto ${url}`)
  })