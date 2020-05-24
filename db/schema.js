const { gql } = require("apollo-server");

// Schema
const typeDefs = gql`
  type User {
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

  type Client {
    id: ID
    name: String
    lastname: String
    company: String
    email: String
    phone: String
    salesman: String
  }

  type Order {
    id: ID
    order: [OrderGroup]
    total: Float
    client: ID
    salesman: ID
    date: String
    state: StateOrder
  }

  type OrderGroup {
    id: ID
    quantity: Int
  }

  type TopClient {
    total: Float
    client: [Client]
  }

  type topSaleman {
    total: Float
    salesman: [User]
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

  input ClientInput {
    name: String!
    lastname: String!
    company: String!
    email: String!
    phone: String
  }

  input OrderProductInput {
    id: ID
    quantity: Int
  }

  input OrderInput {
    order: [OrderProductInput]
    total: Float
    client: ID
    state: StateOrder
  }

  enum StateOrder {
    pendiente
    completado
    cancelado
  }

  type Query {
    # Users
    getUser(token: String!): User

    # Products
    getProducts: [Product]
    getProduct(id: ID!): Product

    # Client
    getClients: [Client]
    getClientsSalesman: [Client]
    getClient(id: ID!): Client

    # Pedidos
    getOrders: [Order]
    getOrdersSalesman: [Order]
    getOrder(id: ID!): Order
    getOrdersStates(state: String!): [Order]

    # Busquedas

    bestClients: [TopClient]
    bestSalesman: [topSaleman]
    searchProduct(text: String!): [Product]
  }

  type Mutation {
    # User
    newUser(input: UserInput): User
    authenticateUser(input: authenticateInput): Token

    # Product
    newProduct(input: ProductInput): Product
    updateProduct(id: ID!, input: ProductInput): Product
    deleteProduct(id: ID!): String

    # Cliente

    newClient(input: ClientInput): Client
    updateClient(id: ID!, input: ClientInput): Client
    deleteClient(id: ID!): String

    # Pedidos

    newOrder(input: OrderInput): Order
    updateOrder(id: ID!, input: OrderInput): Order
    deleteOrder(id: ID!): String
  }
`;

module.exports = typeDefs;
