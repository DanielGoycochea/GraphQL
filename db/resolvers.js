const User = require("../models/User");
const Product = require("../models/Products");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: ".env" });

// Crear Token

const createToken = (user, secret, expiresIn) => {
  const { id, email, name, lastname } = user;

  return jwt.sign({ id, email, name, lastname }, secret, { expiresIn });
};

// Resolvers
const resolvers = {
  Query: {
    getUser: async (_, {token}) => {
      const userID = await jwt.verify(token, process.env.TOKEN_SECRET)

      return userID
    }
  },
  Mutation: {
    newUser: async (_, { input }) => {
      const { email, password } = input;

      // Revisar si el usuario ya existe
      const existsUser = await User.findOne({ email });
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

      const existsUser = await User.findOne({ email });
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
    newProduct: async (_, {input}) => {
      try {
        const product = new Product(input)

        // Guardar en la base de Datos
        const result = await product.save()

        return result

      } catch (error) {
        console.log(error)
      }
    }
  },
};

module.exports = resolvers;
