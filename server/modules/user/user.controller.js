import { validationResult } from "express-validator/check";
import _ from "lodash";

import User from "./user.model";

export async function create(req, res, next) {
  try {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
    }

    let body = _.pick(req.body, ["username", "email", "password"]);
    let user = await User.create(body);
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

export async function list(req, res) {
  try {
    let users = await User.find();
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

export async function get(req, res) {
  try {
    let userId = req.params.id;
    let user = await User.findById(userId);

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

export async function login(req, res) {
  try {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
    }

    let body = _.pick(req.body, ['email', 'password']);

    let user = await User.findByCredentials(body.email, body.password);

    if(!user) {
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
      error: null,
    });
  } catch (err) {
    return res.status(400).json({
      data: null,
      error: err
    });
  }
}

export async function logout(req, res) {
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
