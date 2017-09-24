import { check } from 'express-validator/check';
import Post from './post.model';

export default {
  'create': [
    check('title', 'Title is required.').exists().custom(title => {
      return Post.findByTitle(title).then(post => {
        if(!post) {
          return title;
        }
      });
    }),
    check('text', 'Text is required').exists(),
  ],
}
