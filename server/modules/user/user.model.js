import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import _ from 'lodash';
import jwt from 'jsonwebtoken';

const userSchema = new Schema({
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
            validator: (value) => validator.isEmail(value),
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

userSchema.methods.toJSON = function() {
	let user = this;
	let userObject = user.toObject();
	return _.pick(userObject, ['_id', 'username', 'email']);
};

userSchema.methods.generateAuthToken = function() {
	let user = this;
	let access = 'auth';

	let token = jwt.sign({
		_id: user._id,
		access,
	}, process.env.SECRET_KEY);

	user.tokens.push({
		access,
		token
	});

	return user.save().then(() => token);
};

userSchema.statics.findByToken = function(token) {
	let User = this;
  let decoded;

	try {
    decoded = jwt.verify(token, process.env.SECRET_KEY);
	} catch (err) {
		return Promise.reject();
	}

	return User.findOne({
		'_id': decoded._id,
		'tokens.token': token,
		'tokens.access': 'auth'
	});
};

userSchema.methods.removeToken = function(token) {
	let user = this;
	return user.update({
		$pull: {
			tokens: { token }
		}
	});
};

userSchema.statics.findByCredentials = function(email, password) {
	let User = this;

	return User.findOne({ email }).then(user => {
		if(!user) return Promise.reject();

		return new Promise((resolve, reject) => {
			bcrypt.compare(password, user.password, (err, res) => {
				if(err || !res) return reject();
				return resolve(user);
			});
		});
	});
};

userSchema.statics.findByUsername = function(username) {
	let User = this;
	return User.find({ username: username });
};

userSchema.statics.findByEmail = function(email) {
	let User = this;
	return User.find({ email: email });
};

userSchema.pre('save', function(next) {
    let user = this;
    if(user.isModified('password')) {
		bcrypt.genSalt(10, (err, salt) => {
			if(err) return next(err);

			bcrypt.hash(user.password, salt, (err, hash) => {
				if(err) return next(err);
				user.password = hash;
				next();
			});
		});
	} else {
		next();
	}

});

export default mongoose.model('User', userSchema);
