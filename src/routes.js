import { Router } from 'express';
import User from './app/models/User';

const routes = new Router();

routes.get('/', async (req, res) => {
  const user = await User.create({
    name: 'Frederico Binsfeld',
    email: 'fred@fabet.com.br',
    password_has: '3123123213'
  });

  return res.json(user);
});

export default routes;
