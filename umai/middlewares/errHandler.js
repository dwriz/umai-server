const errHandler = (err, req, res, next) => {
    console.log(err.name);
    switch (err.name) {
      case "validation errors":
        res.status(400).json({ message: "Error validation create." });
        return;
      case "Error login user not found atau password not matched":
        res.status(401).json({
          message: "Error login user not found atau password not matched",
        });
        return;
      case "Error authentication":
        res.status(401).json({ message: "Error authentication" });
        return;
      case "Forbidden error di authorization":
        res.status(403).json({ message: "Forbidden error di authorization" });
      case "error not found":
        res.status(404).json({ message: "data not found" });
        return;
      default:
        res.status(500).json({ message: "Internal server error" });
        return;
    }
  };
  
  module.exports = { errHandler };
  