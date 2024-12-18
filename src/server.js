require('dotenv').config();
const Hapi = require('@hapi/hapi');
const notes = require('./api/notes');
const NotesService = require('./services/postgres/NotesService');
const NotesValidator = require('./validator/notes');
const ClientError = require('./exceptions/ClientError');
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

const authentications = require('./api/authentications');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');
const AuthenticationService = require('./services/postgres/AuthenticationService');

const Jwt = require('@hapi/jwt');

const init = async () => {
  const noteService = new NotesService();
  const usersService = new UsersService();
  const authenticationService = new AuthenticationService();
  
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt
    }
  ]);

  server.auth.strategy('notesapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: notes,
      options: {
        service: noteService,
        validator: NotesValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService: authenticationService,
        usersService: usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    }
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;
    if(response instanceof Error){
      if (response instanceof ClientError) {
        const newRespone = h.response({
          status: 'fail',
          message: response.message,
        });
  
        newRespone.code(response.statusCode);
  
        return newRespone;
      }
      if (!response.isServer) {
          return h.continue;
      }

      const r = h.response({
          status: 'error',
          message: "Kami mengalami kegagalan server",
          error: response.message
      });

      r.code(500);
      return r;

    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
