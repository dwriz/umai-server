if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/", require("./routers"));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});

module.exports = { app };
