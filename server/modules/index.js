import userRoutes from './user/user.routes';
import postRoutes from './post/post.routes';

export default app => {
    app.use('/api/v1/user', userRoutes);
    app.use('/api/v1/post', postRoutes);
}
