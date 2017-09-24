require('dotenv').config();

const ENV = process.env.NODE_ENV;
const PORT = process.env.PORT;

switch(ENV) {
	case 'production':
		process.env.MONGODB_URL = 'mongodb://localhost:27017/blogApi';
		break;
	case 'test':
		process.env.MONGODB_URL = 'mongodb://localhost:27017/blogApiTest';
		break;
	default:
		process.env.MONGODB_URL = 'mongodb://localhost:27017/blogApiDev';
		break;
}

const MONGODB_URL = process.env.MONGODB_URL;

export default {
    PORT,
    MONGODB_URL,
    ENV
};
