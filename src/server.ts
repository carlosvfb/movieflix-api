import { PrismaClient } from "@prisma/client";
import express from "express";

const port = 3003;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

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

app.post("/movies", async (req, res) => {
    const { title, genre_id, language_id, oscar_count, release_date } = req.body;

    try{
        await prisma.movie.create({
            data: {
                title,
                genre_id,
                language_id,
                oscar_count,
                release_date: new Date(release_date),
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Falha ao cadastrar filme" });
    }

    res.status(201).send();
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});