import _ from 'lodash';

import { validationResult } from 'express-validator/check';

import Post from './post.model';

export async function create(req, res) {
  try {
    let errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });

    let body = _.pick(req.body, ['title', 'text']);
        body.creator = req.user._id;
    let post = await Post.create(body);
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

export async function list(req, res) {
  try {
    let skip = parseInt(req.query.skip);
    let limit = parseInt(req.query.limit);
    let search = req.query.search;
    let posts;
    // , {'creator': req.user._id}

    if(search) {
      posts = await Post.find({ $and:[ { 'title': new RegExp(search, "i") }, { 'creator': req.user._id } ]})
                        .sort({ createdAt: -1 })
                        .skip(skip)
                        .limit(limit);
    } else {
      posts = await Post.find({'creator': req.user._id})
                        .sort({ createdAt: -1 })
                        .skip(skip)
                        .limit(limit);
    }

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

export async function get(req, res) {
  try {
    let postId = req.params.id;
    let post = await Post.findOne({
      _id: postId,
      creator: req.user._id
    });

    if(!post) return Promise.reject();

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

export async function _delete(req, res) {
  try {
    let postId = req.params.id;
    let post = await Post.findOneAndRemove({
      _id: postId,
      creator: req.user._id
    });

    if(!post) return Promise.reject();

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

export async function update(req, res) {
  try {
    let postId = req.params.id;
    let body = _.pick(req.body, ['']);
  } catch (err) {
    return res.status(400).json({
      status: 'error',
      data: null,
      error: err
    });
  }
}
