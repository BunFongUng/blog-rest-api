import express from 'express';

import './config/db.connection';
import constants from './config/constants';
import middlewares from './config/middlewares';
import routes from './modules/index';

const app = express();

middlewares(app);
routes(app);

app.listen(constants.PORT, () => {
    console.log(`Server is running on port: ${constants.PORT}`);
});