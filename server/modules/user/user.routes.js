import { Router } from 'express';
import { check } from 'express-validator/check';

import * as userController from './user.controller';
import userValidations from './user.validations';
import * as helpers from '../helpers/helpers';

const routes = Router();

routes.post('/', userValidations.register, userController.create);

routes.post('/login', userValidations.login, userController.login);

routes.delete('/logout', helpers.authentication , userController.logout);

export default routes;
