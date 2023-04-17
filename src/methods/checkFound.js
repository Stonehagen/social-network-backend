exports.checkFound = (res, found, code, message) => {
  if (!found) {
    return res.status(code).json({ message });
  }
  return true;
};
