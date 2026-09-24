const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'AUTH_REQUIRED',
      message: 'Authentication required.',
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'FORBIDDEN',
      message: 'Administrative privileges are strictly required to perform this action.',
    });
  }

  next();
};

module.exports = {
  requireAdmin,
};
