const {
  gql
} = require('apollo-server')

// Schema
const typeDefs = gql `
  type User{
    id: ID
    name: String
    lastname: String
    email: String
    created: String
  }
  type Token {
    token: String
  }

  type Product {
    id: ID
    name: String
    existence: Int
    price: Float
    created: String
  }

  input UserInput {
    name: String!
    lastname: String!
    email: String!
    password: String!
  }

  input authenticateInput {
    email: String!
    password: String!
  }

  input ProductInput {
    name: String!
    existence: Int!
    price: Float!
  }

  type Query {
    # Users
    getUser(token: String!): User

    # Products
    getProducts:[Product]
    getProduct(id: ID!): Product
  }

  type Mutation {
    # User
    newUser(input: UserInput): User
    authenticateUser(input: authenticateInput):Token
    
    # Product
    newProduct(input:ProductInput): Product
    updateProduct(id: ID!, input: ProductInput): Product
    deleteProduct(id: ID!): String
  }
`;

module.exports = typeDefs