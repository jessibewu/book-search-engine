const { User, Book } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    //we are now using the parameters to which the apollo-server library passes argument data so we can have a more dynamic interaction with our server
    //parent: This is if we used nested resolvers to handle more complicated actions, 
    // as it would hold the reference to the resolver that executed the nested resolver function
    
    // get a single user by either their id or their username
      user: async (parent, { _id, username }) => {
        return User.findOne({ username })
          .select('-__v -password')
          .populate('savedBooks');
    },

    //new me() method
    me: async (parent, args, context) => {
      if (context.user) {
      const userData = await User.findOne({ _id: context.user._id })
        .select('-__v -password')
        .populate('savedBooks');
       
      return userData;
    }
    
    throw new AuthenticationError('Not logged in');
    },    
  },
  Mutation: {
    // create a user, sign a token, and send it back (to client/src/components/SignUpForm.js)
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },

    // login a user, sign a token, and send it back (to client/src/components/LoginForm.js)
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
    
      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }
    
      const correctPw = await user.isCorrectPassword(password);
    
      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }
    
      const token = signToken(user);
      return { token, user };
    },

    // save a book to a user's `savedBooks` field by adding it to the set (to prevent duplicates)
    // user comes from `req.user` created in the auth middleware function
    saveBook: async (parent, args, context) => {
      if (context.user) {
        const book = await book.create({ ...args, username: context.user.username });
    
        await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: body } },
          { new: true }
        );
    
        return book;
      }
    
      throw new AuthenticationError('You need to be logged in!');
    },

    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: params.bookId } } },
          { new: true }
        ).populate('savedBooks');
    
        return updatedUser;
      }
    
      throw new AuthenticationError('You need to be logged in!');
    }
  }
};
  
module.exports = resolvers;