const bcrypt = require("bcrypt");

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  return hashedPassword;
};

const checkPassword = async (password, hashedPassword) => {
  const match = await bcrypt.compare(password, hashedPassword);

  return match;
};

module.exports = { hashPassword, checkPassword };
