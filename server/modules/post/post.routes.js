import { Router } from 'express';

import * as helpers from '../helpers/helpers';

import * as postController from './post.controller';

import postValidations from './post.validations';

const routes = Router();

routes.post('/', helpers.authentication, postValidations.create, postController.create);

export default routes;
