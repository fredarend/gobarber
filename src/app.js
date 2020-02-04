import 'dotenv/config';
import express from 'express';
import 'express-async-errors'; // Mostrar erros, por padrão o express não mostra erros em funções async
import path from 'path'; // Maneira de acessar diretórios
import Youch from 'youch'; // Biblioteca para tratamento de erros.
import * as Sentry from '@sentry/node'; // Software para verificar erros na aplicação. http://sentry.io
import routes from './routes';
import sentryConfig from './config/sentry';

import './database';

class App {
  constructor() {
    this.server = express();

    Sentry.init(sentryConfig);

    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  middlewares() {
    this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(express.json());
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
    this.server.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandler() {
    // Quando um middleware recebe 4 parametros o express entende que é um middleware de tratamento de excessões
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const errors = await new Youch(err, req).toJSON();

        return res.status(500).json(errors);
      }

      return res.status(500).json({ error: 'Internal server error' });
    });
  }
}

export default new App().server;
