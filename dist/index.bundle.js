module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 11);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("express-validator/check");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _mongoose = __webpack_require__(4);

var _mongoose2 = _interopRequireDefault(_mongoose);

var _bcryptjs = __webpack_require__(18);

var _bcryptjs2 = _interopRequireDefault(_bcryptjs);

var _validator = __webpack_require__(27);

var _validator2 = _interopRequireDefault(_validator);

var _lodash = __webpack_require__(3);

var _lodash2 = _interopRequireDefault(_lodash);

var _jsonwebtoken = __webpack_require__(24);

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const userSchema = new _mongoose.Schema({
	username: {
		type: String,
		trim: true,
		unique: true,
		required: true
	},
	email: {
		type: String,
		trim: true,
		unique: true,
		required: true,
		validate: {
			validator: value => _validator2.default.isEmail(value),
			message: '{VALUE} is not valid email.'
		}
	},
	password: {
		type: String,
		required: true,
		minlength: 6
	},
	tokens: [{
		access: {
			type: String,
			required: true
		},
		token: {
			type: String,
			required: true
		}
	}]
}, { timestamps: true });

userSchema.methods.toJSON = function () {
	let user = this;
	let userObject = user.toObject();
	return _lodash2.default.pick(userObject, ['_id', 'username', 'email']);
};

userSchema.methods.generateAuthToken = function () {
	let user = this;
	let access = 'auth';

	_jsonwebtoken2.default.sign({
		_id: user._id,
		access
	}, process.env.SECRET_KEY, (err, token) => {
		if (err) throw new Error(err);
		user.tokens.push({
			access,
			token
		});

		return user.save().then(() => token);
	});

	// let token = jwt.sign({
	// 	_id: user._id,
	// 	access,
	// }, process.env.SECRET_KEY);

	// user.tokens.push({
	// 	access,
	// 	token
	// });

	// return user.save().then(() => token);
};

userSchema.statics.findByToken = function (token) {
	let User = this;
	let decoded;

	try {
		decoded = _jsonwebtoken2.default.verify(token, process.env.SECRET_KEY);
	} catch (err) {
		return Promise.reject();
	}

	return User.findOne({
		'_id': decoded._id,
		'tokens.token': token,
		'tokens.access': 'auth'
	});
};

userSchema.methods.removeToken = function (token) {
	let user = this;
	return user.update({
		$pull: {
			tokens: { token }
		}
	});
};

userSchema.statics.findByCredentials = function (email, password) {
	let User = this;

	return User.findOne({ email }).then(user => {
		if (!user) return Promise.reject();

		return new Promise((resolve, reject) => {
			_bcryptjs2.default.compare(password, user.password, (err, res) => {
				if (err || !res) return reject();
				return resolve(user);
			});
		});
	});
};

userSchema.statics.findByUsername = function (username) {
	let User = this;
	return User.find({ username: username });
};

userSchema.statics.findByEmail = function (email) {
	let User = this;
	return User.find({ email: email });
};

userSchema.pre('save', function (next) {
	let user = this;
	if (user.isModified('password')) {
		_bcryptjs2.default.genSalt(10, (err, salt) => {
			if (err) return next(err);

			_bcryptjs2.default.hash(user.password, salt, (err, hash) => {
				if (err) return next(err);
				user.password = hash;
				next();
			});
		});
	} else {
		next();
	}
});

exports.default = _mongoose2.default.model('User', userSchema);

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("lodash");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("mongoose");

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
__webpack_require__(22).config();

const ENV = process.env.NODE_ENV;
const PORT = process.env.PORT;

switch (ENV) {
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

exports.default = {
	PORT,
	MONGODB_URL,
	ENV
};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.authentication = authentication;

var _user = __webpack_require__(2);

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function authentication(req, res, next) {
  try {
    let token = req.header('x-auth');
    let user = await _user2.default.findByToken(token);
    if (!user || user === null) {
      return Promise.reject();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    res.status(401).json({
      status: "error",
      data: null,
      error: {
        message: "Unauthorized"
      }
    });
  }
}

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = __webpack_require__(4);

var _mongoose2 = _interopRequireDefault(_mongoose);

var _slug = __webpack_require__(26);

var _slug2 = _interopRequireDefault(_slug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const postSchema = new _mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: true,
    minlength: 3,
    unique: true
  },
  text: {
    type: String,
    trim: true,
    required: true,
    minlength: 10
  },
  slug: {
    type: String,
    trim: true,
    lowercase: true
  },
  creator: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

postSchema.methods._slugtify = function () {
  this.slug = (0, _slug2.default)(this.title);
};

postSchema.methods.toJSON = function () {
  return {
    _id: this._id,
    title: this.title,
    text: this.text,
    slug: this.slug,
    creator: this.creator,
    createdAt: this.createdAt
  };
};

postSchema.statics.findByTitle = function (title) {
  let Post = this;
  return Post.findOne({
    title
  });
};

postSchema.pre('validate', function (next) {
  this._slugtify();
  next();
});

exports.default = _mongoose2.default.model('Post', postSchema);

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _mongoose = __webpack_require__(4);

var _mongoose2 = _interopRequireDefault(_mongoose);

var _constants = __webpack_require__(5);

var _constants2 = _interopRequireDefault(_constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = global.Promise;

try {
    _mongoose2.default.connect(_constants2.default.MONGODB_URL, {
        useMongoClient: true
    });
} catch (err) {
    _mongoose2.default.createConnection(_constants2.default.MONGODB_URL, {
        useMongoClient: true
    });
}

_mongoose2.default.connection.once('open', () => {
    console.log(`MONGODB connected URL: ${_constants2.default.MONGODB_URL}`);
}).on('error', err => {
    throw err;
});

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _bodyParser = __webpack_require__(19);

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _morgan = __webpack_require__(25);

var _morgan2 = _interopRequireDefault(_morgan);

var _helmet = __webpack_require__(23);

var _helmet2 = _interopRequireDefault(_helmet);

var _compression = __webpack_require__(20);

var _compression2 = _interopRequireDefault(_compression);

var _cors = __webpack_require__(21);

var _cors2 = _interopRequireDefault(_cors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = app => {
    app.use((0, _morgan2.default)('dev'));
    app.use(_bodyParser2.default.json());
    app.use(_bodyParser2.default.urlencoded({ extended: false }));
    app.use((0, _compression2.default)());
    app.use((0, _helmet2.default)());
    app.use((0, _cors2.default)());
};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _user = __webpack_require__(16);

var _user2 = _interopRequireDefault(_user);

var _post = __webpack_require__(13);

var _post2 = _interopRequireDefault(_post);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = app => {
    app.use('/api/v1/user', _user2.default);
    app.use('/api/v1/post', _post2.default);
};

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _express = __webpack_require__(1);

var _express2 = _interopRequireDefault(_express);

__webpack_require__(8);

var _constants = __webpack_require__(5);

var _constants2 = _interopRequireDefault(_constants);

var _middlewares = __webpack_require__(9);

var _middlewares2 = _interopRequireDefault(_middlewares);

var _index = __webpack_require__(10);

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const app = (0, _express2.default)();

(0, _middlewares2.default)(app);
(0, _index2.default)(app);

app.listen(_constants2.default.PORT, () => {
    console.log(`Server is running on port: ${_constants2.default.PORT}`);
});

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;
exports.list = list;
exports.get = get;
exports._delete = _delete;
exports.update = update;

var _lodash = __webpack_require__(3);

var _lodash2 = _interopRequireDefault(_lodash);

var _check = __webpack_require__(0);

var _post = __webpack_require__(7);

var _post2 = _interopRequireDefault(_post);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function create(req, res) {
  try {
    let errors = (0, _check.validationResult)(req);

    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });

    let body = _lodash2.default.pick(req.body, ['title', 'text']);
    body.creator = req.user._id;
    let post = await _post2.default.create(body);
    return res.json({
      status: 'success',
      data: post,
      error: null
    });
  } catch (err) {
    return res.status(400).json({
      status: 'error',
      data: null,
      error: err
    });
  }
}

async function list(req, res) {
  try {
    let posts = await _post2.default.find({ creator: req.user._id });
    return res.json({
      status: 'success',
      data: posts,
      error: null
    });
  } catch (err) {
    return res.status(400).json({
      status: 'error',
      data: null,
      error: err
    });
  }
}

async function get(req, res) {
  try {
    let postId = req.params.id;
    let post = await _post2.default.findOne({
      _id: postId,
      creator: req.user._id
    });

    if (!post) return Promise.reject();

    return res.json({
      status: 'succes',
      data: post,
      error: null
    });
  } catch (err) {
    return res.status(400).json({
      status: 'error',
      data: null,
      error: err
    });
  }
}

async function _delete(req, res) {
  try {
    let postId = req.params.id;
    let post = await _post2.default.findOneAndRemove({
      _id: postId,
      creator: req.user._id
    });

    if (!post) return Promise.reject();

    return res.json({
      status: 'error',
      data: post,
      error: null
    });
  } catch (err) {
    return res.status(400).json({
      status: 'error',
      data: null,
      error: err
    });
  }
}

async function update(req, res) {
  try {
    let postId = req.params.id;
    let body = _lodash2.default.pick(req.body, ['']);
  } catch (err) {
    return res.status(400).json({
      status: 'error',
      data: null,
      error: err
    });
  }
}

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = __webpack_require__(1);

var _helpers = __webpack_require__(6);

var helpers = _interopRequireWildcard(_helpers);

var _post = __webpack_require__(12);

var postController = _interopRequireWildcard(_post);

var _post2 = __webpack_require__(14);

var _post3 = _interopRequireDefault(_post2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const routes = (0, _express.Router)();

routes.post('/', helpers.authentication, _post3.default.create, postController.create);

routes.get('/', helpers.authentication, postController.list);

routes.get('/:id', helpers.authentication, postController.get);

routes.delete('/:id', helpers.authentication, postController._delete);

routes.put('/:id', helpers.authentication, postController.update);

exports.default = routes;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _check = __webpack_require__(0);

var _post = __webpack_require__(7);

var _post2 = _interopRequireDefault(_post);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  'create': [(0, _check.check)('title', 'Title is required.').exists().custom(title => {
    return _post2.default.findByTitle(title).then(post => {
      if (!post) {
        return title;
      }

      throw new Error(`${title} already in used.`);
    });
  }), (0, _check.check)('title').isLength(3).withMessage('Title must be 3 character long.'), (0, _check.check)('text', 'Text is required').exists(), (0, _check.check)('text').isLength(10).withMessage('Text must be 10 character long.')]
};

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;
exports.list = list;
exports.get = get;
exports.login = login;
exports.logout = logout;

var _check = __webpack_require__(0);

var _lodash = __webpack_require__(3);

var _lodash2 = _interopRequireDefault(_lodash);

var _user = __webpack_require__(2);

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function create(req, res, next) {
  try {
    let errors = (0, _check.validationResult)(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
    }

    let body = _lodash2.default.pick(req.body, ["username", "email", "password"]);
    let user = await _user2.default.create(body);
    let token = await user.generateAuthToken();

    return res.header("x-auth", token).json({
      data: user,
      error: null,
      token
    });
  } catch (err) {
    return res.status(400).json({
      data: null,
      error: err
    });
  }
}

async function list(req, res) {
  try {
    let users = await _user2.default.find();
    return res.json({
      data: users,
      error: null
    });
  } catch (err) {
    return res.status(400).json({
      data: null,
      error: err
    });
  }
}

async function get(req, res) {
  try {
    let userId = req.params.id;
    let user = await _user2.default.findById(userId);

    if (!user) {
      return res.status(404).json({
        data: null,
        error: {
          message: "User not found."
        }
      });
    }
  } catch (err) {
    return res.status(400).json({
      data: null,
      error: err
    });
  }
}

async function login(req, res) {
  try {
    let errors = (0, _check.validationResult)(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
    }

    let body = _lodash2.default.pick(req.body, ['email', 'password']);

    let user = await _user2.default.findByCredentials(body.email, body.password);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        data: null,
        error: {
          message: 'Invalid access.'
        }
      });
    }
    let token = await user.generateAuthToken();

    return res.header("x-auth", token).json({
      data: user,
      token,
      error: null
    });
  } catch (err) {
    return res.status(400).json({
      data: null,
      error: err
    });
  }
}

async function logout(req, res) {
  try {
    let result = await req.user.removeToken(req.token);
    return res.status(200).send({
      status: 'success'
    });
  } catch (err) {
    return res.status(400).json({
      data: null,
      error: err
    });
  }
}

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = __webpack_require__(1);

var _check = __webpack_require__(0);

var _user = __webpack_require__(15);

var userController = _interopRequireWildcard(_user);

var _user2 = __webpack_require__(17);

var _user3 = _interopRequireDefault(_user2);

var _helpers = __webpack_require__(6);

var helpers = _interopRequireWildcard(_helpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const routes = (0, _express.Router)();

routes.post('/', _user3.default.register, userController.create);

routes.post('/login', _user3.default.login, userController.login);

routes.delete('/logout', helpers.authentication, userController.logout);

exports.default = routes;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _check = __webpack_require__(0);

var _user = __webpack_require__(2);

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    'register': [(0, _check.check)('username', 'Username is required.').exists().custom(username => {
        return _user2.default.findByUsername(username).then(user => {
            if (user.length > 0) {
                throw new Error('This username is already in use.');
            }

            return username;
        });
    }), (0, _check.check)('email', 'Email is required and must be valid email.').exists().isEmail().custom(email => {
        return _user2.default.findByEmail(email).then(user => {
            if (user.length > 0) {
                throw new Error('This email is already in use.');
            }

            return email;
        });
    }), (0, _check.check)('password', 'password is required and must be 6 character long.').isLength({ min: 6 }).exists()],
    'login': [(0, _check.check)('email', 'Email is required and must be valid email.').exists().isEmail(), (0, _check.check)('password', 'password is required and must be 6 character long.').isLength({ min: 6 }).exists()]
};

/***/ }),
/* 18 */
/***/ (function(module, exports) {

module.exports = require("bcryptjs");

/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = require("body-parser");

/***/ }),
/* 20 */
/***/ (function(module, exports) {

module.exports = require("compression");

/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = require("cors");

/***/ }),
/* 22 */
/***/ (function(module, exports) {

module.exports = require("dotenv");

/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = require("helmet");

/***/ }),
/* 24 */
/***/ (function(module, exports) {

module.exports = require("jsonwebtoken");

/***/ }),
/* 25 */
/***/ (function(module, exports) {

module.exports = require("morgan");

/***/ }),
/* 26 */
/***/ (function(module, exports) {

module.exports = require("slug");

/***/ }),
/* 27 */
/***/ (function(module, exports) {

module.exports = require("validator");

/***/ })
/******/ ]);