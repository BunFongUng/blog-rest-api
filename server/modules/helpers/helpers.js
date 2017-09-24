import User from '../user/user.model';

export async function authentication(req, res, next) {
  try {
    let token = req.header('x-auth');
    let user = await User.findByToken(token);
    if(!user || user === null) {
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

