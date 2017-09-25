import { check } from 'express-validator/check';
import Post from './post.model';

export default {
  'create': [
    check('title', 'Title is required.').exists().custom(title => {
      return Post.findByTitle(title).then(post => {
        if(!post) {
          return title;
        }

        throw new Error(`${title} already in used.`);
      });
    }),
    check('title').isLength(3).withMessage('Title must be 3 character long.'),
    check('text', 'Text is required').exists(),
    check('text').isLength(10).withMessage('Text must be 10 character long.')
  ],
}
