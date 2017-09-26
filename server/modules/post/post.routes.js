import { Router } from 'express';

import * as helpers from '../helpers/helpers';

import * as postController from './post.controller';

import postValidations from './post.validations';

const routes = Router();

routes.post('/', helpers.authentication, postValidations.create, postController.create);

routes.get('/', helpers.authentication, postController.list);

routes.get('/:id', helpers.authentication, postController.get);

routes.delete('/:id', helpers.authentication, postController._delete);

routes.put('/:id', helpers.authentication, postController.update);

export default routes;
