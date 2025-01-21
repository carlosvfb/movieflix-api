import { PrismaClient } from "@prisma/client";
import express from "express";

const port = 3003;
const app = express();
const prisma = new PrismaClient();

app.get("/movies", async (_, res) => {
    const movies = await prisma.movie.findMany({
        orderBy: {
            title: "asc",
        },
        include: {
            genre: true,
            language: true,
        }
    });
    res.json(movies);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});