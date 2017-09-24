import mongoose, { Schema } from 'mongoose';

import slug from 'slug';

const postSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: true,
    minlength: 3,
    unique: true
  },
  title: {
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
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });


postSchema.methods._slugtify = function() {
  this.slug = slug(this.title);
};

postSchema.methods.toJSON = function() {
  return {
    _id: this._id,
    title: this.title,
    text: this.text,
    slug: this.slug,
    creator: this.creator,
    createdAt: this.createdAt
  }
}

postSchema.statics.findByTitle = function(title) {
  let Post = this;
  return Post.findOne({
    title
  });
}

postSchema.pre('validate', function(next) {
  this._slugtify();
  next();
});

export default mongoose.model('Post', postSchema);
