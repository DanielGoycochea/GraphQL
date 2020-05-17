const User = require("../models/User");
const bcryptjs = require("bcryptjs");
// Resolver
const resolvers = {
  Query: {
    obtenerCurso: () => "Algo",
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
      const salt = await bcryptjs.genSalt(10)
      input.password = await bcryptjs.hash(password, salt)


      // Guardar en db
      try {
        const user = new User(input);
        user.save();
        return user;
      } catch (error) {
        console.log(error);
      }
    },
  },
};

module.exports = resolvers;
