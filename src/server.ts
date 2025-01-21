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
    },
  });
  res.json(movies);
});

app.post("/movies", async (req, res) => {
  const { title, genre_id, language_id, oscar_count, release_date } = req.body;

  try {
    const movieWithSameTitle = await prisma.movie.findFirst({
      where: {
        title: {
          equals: title,
          mode: "insensitive",
        },
      },
    });

    if (movieWithSameTitle) {
      return res.status(409).send({ message: "Já existe um filme cadastrado com esse título" });
    }

    await prisma.movie.create({
      data: {
        title,
        genre_id,
        language_id,
        oscar_count,
        release_date: new Date(release_date),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Falha ao cadastrar filme" });
  }

  res.status(201).send();
});

app.put("/movies/:id", async (req, res) => {
  try{
    const id = Number(req.params.id);

    const movie = await prisma.movie.findUnique({
      where: {
        id,
      },
    });
  
    if (!movie) {
      return res.status(404).send({ message: "Filme não encontrado" });
    }

    const data = { ...req.body };
    data.release_date = data.release_date ? new Date(data.release_date) : undefined;
  
    await prisma.movie.update({
      where: {
        id,
      },
      data: data
    });
  }catch(error){
    console.error(error);
    return res.status(500).send({ message: "Falha ao atualizar o registro do filme" });
  }

  res.status(200).send();
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
