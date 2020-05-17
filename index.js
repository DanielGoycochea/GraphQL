const { ApolloServer } = require('apollo-server')
const typeDefs = require('./db/schema')
const resolvers = require('./db/resolvers')
const conexionDB = require('./config/db')

// conexion Base de Datos
  conexionDB()
// server
const server = new  ApolloServer({
  typeDefs,
  resolvers
})

// iniciarservidor

server.listen()
  .then(({url}) => {
    console.log(`iniciando apollo desde puerto ${url}`)
  })
