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
