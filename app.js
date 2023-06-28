const compression = require('compression');
const express = require("express");
const PORT = process.env.PORT || 4000;
const cors = require("cors");
const app = express();

app.use(cors());
app.use(compression());


app.use(express.static(__dirname));
app.get("*" , (req,res) => {
  res.sendFile(__dirname + "/index.html");
});

  app.listen(PORT, () => {
    console.log(`App is running on` +  PORT);
});