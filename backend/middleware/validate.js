const { z } = require('zod');

const validate = (schema) => async (req, res, next) => {
  try {
    if (schema.body) {
      req.body = await schema.body.parseAsync(req.body);
    }
    if (schema.params) {
      req.params = await schema.params.parseAsync(req.params);
    }
    if (schema.query) {
      req.query = await schema.query.parseAsync(req.query);
    }
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid request data.',
        details,
      });
    }
    next(error);
  }
};

module.exports = validate;
