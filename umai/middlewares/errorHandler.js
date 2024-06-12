const errorHandler = (error, req, res, next) => {
  console.log(error);

  switch (error.message) {
    case "FULLNAME_NOT_FOUND":
      res.status(400).json({ message: "fullname is required" });
      break;
    case "USERNAME_NOT_FOUND":
      res.status(400).json({ message: "username is required" });
      break;
    case "EMAIL_NOT_FOUND":
      res.status(400).json({ message: "email is required" });
      break;
    case "PASSWORD_NOT_FOUND":
      res.status(400).json({ message: "password is required" });
      break;
    case "PASSWORD_LENGTH_INVALID":
      res.status(400).json({ message: "password length is invalid" });
      break;
    case "EMAIL_FORMAT_INVALID":
      res.status(400).json({ message: "email format is invalid" });
      break;
    case "USER_ALREADY_REGISTERED":
      res.status(409).json({ message: "user already registered" });
      break;
    case "AUTHENTICATION_INVALID":
      res.status(401).json({ message: "authentication invalid" });
      break;
    default:
      res.status(500).json({ message: "internal server error" });
      break;
  }
};

module.exports = { errorHandler };