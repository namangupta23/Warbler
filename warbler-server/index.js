require("dotenv").config();
const express = require("express")
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");


const errorHandler = require("./handlers/error.js");
const authRoutes = require("./routes/auth.js");
const messageRoutes = require("./routes/messages.js");
const { loginRequired, ensureCorrectUser } = require("./middleware/auth.js");
const db = require("./models");


const PORT = 8081;

app.use(cors());
app.use(bodyParser.json());


app.use("/api/auth", authRoutes);
app.use("/api/auth/:id/messages",
    loginRequired,
    ensureCorrectUser,
    messageRoutes
);
app.get("/api/messages", loginRequired, async function(req, res, next) {
    try {
        let messages = await db.Message.find()
            .sort({ createdAt: "desc" })
            .populate("user", {
                username: true,
                profileImageUrl: true
            });
        return res.status(200).json(messages);
    } catch (err) {
        return next(err);
    }
});

//Error Handling

app.use(function(req, res, next) {
    let err = new Error("Not Found");
    err.status = 404;
    next(err);
})

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is starting on port ${PORT}`);
})