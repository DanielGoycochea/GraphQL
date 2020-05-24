const User = require("../models/User");
const Product = require("../models/Products");
const Client = require("../models/Client");
const Order = require("../models/Orders");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config({
  path: ".env",
});

// Crear Token

const createToken = (user, secret, expiresIn) => {
  const { id, email, name, lastname } = user;

  return jwt.sign(
    {
      id,
      email,
      name,
      lastname,
    },
    secret,
    {
      expiresIn,
    }
  );
};

// Resolvers
const resolvers = {
  Query: {
    getUser: async (_, { token }) => {
      const userID = await jwt.verify(token, process.env.TOKEN_SECRET);

      return userID;
    },

    getProducts: async () => {
      try {
        const product = await Product.find({});
        return product;
      } catch (error) {
        console.log(error);
      }
    },

    getProduct: async (_, { id }) => {
      // revisa el producto existe
      const product = await Product.findById(id);
      if (!product) {
        throw new Error("Producto no encontrado");
      }
      return product;
    },
    getClients: async () => {
      try {
        const clients = await Client.find({});
        return clients;
      } catch (error) {
        console.log(error);
      }
    },
    getClientsSalesman: async (_, {}, ctx) => {
      try {
        const clientsSalesman = await Client.find({
          salesman: ctx.user.id.toString(),
        });
        return clientsSalesman;
      } catch (error) {
        console.log(error);
      }
    },
    getClient: async (_, { id }, ctx) => {
      // verificar que el usuario exista
      const client = await Client.findById(id);
      if (!client) {
        throw new Error("Cliente no existe");
      }
      // quien lo creo puedo verlo
      if (client.salesman.toString() !== ctx.user.id) {
        throw new Error("No tiene las credenciales para acceder");
      }
      return client;
    },
    getOrders: async () => {
      try {
        const order = await Order.find({});
        return order;
      } catch (error) {
        console.log(error);
      }
    },
    getOrdersSalesman: async (_, {}, ctx) => {
      try {
        const orderSalesname = await Order.find({ salesman: ctx.user.id });
        return orderSalesname;
      } catch (error) {
        console.log(error);
      }
    },
    getOrder: async (_, { id }, ctx) => {
      // verificar si exite
      const order = await Order.findById(id);

      if (!order) {
        throw new Error("El pedido no existe");
      }

      // verificar quien lo crea

      if (order.salesman.toString() !== ctx.user.id) {
        throw new Error("No tiene credenciales de acceso");
      }

      // resultado
      return order;
    },
    getOrdersStates: async (_, { state }, ctx) => {
      const order = Order.find({ salesman: ctx.user.id, state });
      return order;
    },
    bestClients: async () => {
      const clients = await Order.aggregate([
        { $match: { state: "completado" } },
        {
          $group: {
            _id: "$client",
            total: { $sum: "$total" },
          },
        },
        {
          $lookup: {
            from: "clients",
            localField: "_id",
            foreignField: "_id",
            as: "client",
          },
        },
        {
          $sort: { total: -1 },
        },
        {
          $limit: 3,
        },
      ]);
      return clients;
    },
    bestSalesman: async () => {
      const salesman = await Order.aggregate([
        { $match: { state: "completado" } },
        {
          $group: {
            _id: "$salesman",
            total: { $sum: "$total" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "salesman",
          },
        },
        {
          $limit: 3,
        },
        {
          $sort: { total: -1 },
        },
      ]);
      return salesman;
    },
    searchProduct: async (_, { text }) => {
      const products = await Product.find({ $text: { $search: text } }).limit(
        10
      );
      return products;
    },
  },
  Mutation: {
    newUser: async (_, { input }) => {
      const { email, password } = input;

      // Revisar si el usuario ya existe
      const existsUser = await User.findOne({
        email,
      });
      if (existsUser) {
        throw new Error("El usuario ya existe");
      }

      // Hash Password
      const salt = await bcryptjs.genSalt(10);
      input.password = await bcryptjs.hash(password, salt);

      // Guardar en db
      try {
        const user = new User(input);
        user.save();
        return user;
      } catch (error) {
        console.log(error);
      }
    },

    authenticateUser: async (_, { input }) => {
      const { email, password } = input;

      // El usuario existe

      const existsUser = await User.findOne({
        email,
      });
      if (!existsUser) {
        throw new Error("El usuario no existe");
      }

      //Revisar password

      const passwordSuccess = await bcryptjs.compare(
        password,
        existsUser.password
      );
      if (!passwordSuccess) {
        throw new Error("El password es incorrecto");
      }

      // Crear token

      return {
        token: createToken(existsUser, process.env.TOKEN_SECRET, "24h"),
      };
    },
    newProduct: async (_, { input }) => {
      try {
        const product = new Product(input);

        // Guardar en la base de Datos
        const result = await product.save();

        return result;
      } catch (error) {
        console.log(error);
      }
    },

    updateProduct: async (_, { id, input }) => {
      let product = await Product.findById(id);
      if (!product) {
        throw new Error("producto no encontado");
      }

      // guardar en la base de datos
      product = await Product.findOneAndUpdate(
        {
          _id: id,
        },
        input,
        {
          new: true,
        }
      );

      return product;
    },

    deleteProduct: async (_, { id }) => {
      let product = await Product.findById(id);
      if (!product) {
        throw new Error("producto no encontado");
      }
      // eliminar
      await Product.findByIdAndDelete({
        _id: id,
      });
      return "Producto eliminado";
    },
    newClient: async (_, { input }, ctx) => {
      const { email } = input;

      // verificar que el cliente existe
      const client = await Client.findOne({ email });

      if (client) {
        throw new Error("El cliente ya existe");
      }

      const newClient = new Client(input);

      // asingnar vendedor

      newClient.salesman = ctx.user.id;

      // gurdarlo en la base de datos

      try {
        const resultClient = await newClient.save();

        return resultClient;
      } catch (error) {
        console.log(error);
      }
    },
    updateClient: async (_, { id, input }, ctx) => {
      // verificar si el cliente existe
      let clientUpdate = await Client.findById(id);

      if (!clientUpdate) {
        throw new Error("El cliente no existe");
      }

      // el vendedor es quien actualiza
      if (clientUpdate.salesman.toString() !== ctx.user.id) {
        throw new Error("No tiene las credenciales para acceder");
      }

      // guardar
      clientUpdate = await Client.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });

      return clientUpdate;
    },
    deleteClient: async (_, { id }, ctx) => {
      let clientdelete = await Client.findById(id);
      if (!clientdelete) {
        throw new Error("Cliente no encontado");
      }
      if (clientdelete.salesman.toString() !== ctx.user.id) {
        throw new Error("No tiene las credenciales para acceder");
      }
      await Client.findOneAndRemove({ _id: id });
      return "El cliente se elimino";
    },
    newOrder: async (_, { input }, ctx) => {
      const { client } = input;

      // vefificar si exirte el cliente
      let clientExists = await Client.findById(client);
      if (!clientExists) {
        throw new Error("El cliente ya existe");
      }

      // verificar si el cliente es del vendedor
      if (clientExists.salesman.toString() !== ctx.user.id) {
        throw new Error("No tiene las credenciales para acceder");
      }

      // revisar si hay disponiblidad
      for await (const item of input.order) {
        const { id } = item;

        const product = await Product.findById(id);

        if (item.quantity > product.existence) {
          throw new Error(
            `el articulo ${product.name} excede la cantidad disponible`
          );
        } else {
          product.existence = product.existence - item.quantity;
          await product.save();
        }
      }
      // crear pedido
      const newOrder = new Order(input);
      // asignar vendedor

      newOrder.salesman = ctx.user.id;

      // guardar en la base de datos

      const order = await newOrder.save();
      return order;
    },
    updateOrder: async (_, { id, input }, ctx) => {
      const { client } = input;

      // verificar si el pedido existe
      const orderExists = await Order.findById(id);
      if (!orderExists) {
        throw new Error("No existe el pedido");
      }
      // verificar que el cliente existe
      const clientExists = await Client.findById(client);
      if (!clientExists) {
        throw new Error("No existe el Cliente");
      }

      // verificar vendedor
      if (clientExists.salesman.toString() !== ctx.user.id) {
        throw new Error("No tiene las credenciales para acceder");
      }

      // revisar existencias
      if (input.order) {
        for await (const item of input.order) {
          const { id } = item;

          const product = await Product.findById(id);

          if (item.quantity > product.existence) {
            throw new Error(
              `el articulo ${product.name} excede la cantidad disponible`
            );
          } else {
            product.existence = product.existence - item.quantity;
            await product.save();
          }
        }
      }
      // gurdar pedido
      const updateOrder = await Order.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });
      return updateOrder;
    },
    deleteOrder: async (_, { id }, ctx) => {
      let order = await Order.findById(id);
      if (!order) {
        throw new Error("Pedido no encontado");
      }

      // verificar vendedor
      if (order.salesman.toString() !== ctx.user.id) {
        throw new Error("No tiene las credenciales para acceder");
      }

      await Order.findOneAndDelete({
        _id: id,
      });

      return "Pedido Eliminado";
    },
  },
};

module.exports = resolvers;
