import express from "express";

const port = 3003;
const app = express();

app.get("/movies", (req, res) => {
    res.send("Listagem de filmes");
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});