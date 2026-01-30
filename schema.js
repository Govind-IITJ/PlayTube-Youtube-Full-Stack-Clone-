const Joi = require("joi");

module.exports.commentJoiSchema = Joi.object({
  content: Joi.string()
    .trim()
    .min(1)
    .max(500)
    .required()
    .messages({
      "string.empty": "Comment cannot be empty",
      "string.max": "Comment must be under 500 characters",
    }),
});

module.exports.communityPostJoiSchema = Joi.object({
  content: Joi.string()
    .trim()
    .min(1)
    .max(1000)
    .required()
    .messages({
      "string.empty": "Post content is required",
      "string.max": "Post can be at most 1000 characters",
    }),
});

module.exports.shortsJoiSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required(),

  description: Joi.string()
    .trim()
    .max(500)
    .allow("")
    .optional(),
});

module.exports.userSignupJoiSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(20)
    .required()
    .messages({
      "string.base": "Username must be a text value",
      "string.empty": "Username is required",
      "string.alphanum": "Username can contain only letters and numbers",
      "string.min": "Username must be at least 3 characters long",
      "string.max": "Username must not exceed 20 characters",
      "any.required": "Username is required",
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.base": "Email must be a text value",
      "string.empty": "Email is required",
      "string.email": "Please enter a valid email address",
      "any.required": "Email is required",
    }),

  password: Joi.string()
    .min(6)
    .max(30)
    .required()
    .messages({
      "string.base": "Password must be a text value",
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters long",
      "string.max": "Password must not exceed 30 characters",
      "any.required": "Password is required",
    }),
});


module.exports.videoJoiSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(120)
    .required(),

  description: Joi.string()
    .trim()
    .max(1000)
    .allow("")
    .optional(),

  category: Joi.string()
    .valid(
      "Music",
      "Gaming",
      "Sports",
      "Travel",
      "Food",
      "Education",
      "Entertainment",
      "Technology",
      "Programming",
      "Lifestyle"
    )
    .required(),
});
