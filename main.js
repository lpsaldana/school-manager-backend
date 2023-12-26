const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// routes
const routes = require("./routes");

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(routes);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
