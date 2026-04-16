import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const app = express();

// serve up production assets
app.use(express.static("./dist/"));

// let the react app handle any unknown routes
// serve up the index.html if express doesn't recognize the route
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "dist/index.html"));
});

const PORT = 5001;

console.log("server started on port:", PORT);
app.listen(PORT);