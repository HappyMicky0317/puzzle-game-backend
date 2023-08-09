const express = require("express");

const app = express();
const cors = require("cors");

// Init Middleware
app.use(express.json());
app.use(cors());

const user = require("./routes/user");
const questionaire = require("./routes/questionaire");

// Define Routes
app.use("/api/users", user);
app.use("/api/questionaire", questionaire);

app.get("*", (req, res) => {
  res.send("user is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
