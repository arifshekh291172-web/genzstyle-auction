const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      error: 'VALIDATION_FAILED',
      message: errorDetails[0].message,
      errors: errorDetails,
    });
  }
  next();
};

module.exports = {
  validateRequest,
};
