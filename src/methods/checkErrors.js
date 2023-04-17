exports.checkErrors = (res, errors, code) => {
  if (!errors.isEmpty()) {
    return res.status(code).json({ errors: errors.array() });
  }
  return false;
};
