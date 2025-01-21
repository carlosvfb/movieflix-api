import { PrismaClient } from "@prisma/client";
import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";


const port = 3003;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

app.delete("/movies/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const movie = await prisma.movie.findUnique({
      where: {
        id,
      },
    });

    if (!movie) {
      return res.status(404).send({ message: "Filme não encontrado" });
    }

    await prisma.movie.delete({
      where: {
        id,
      },
    });
      
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Falha ao deletar o filme" });
  }
  
  res.status(200).send();
});

app.get("/movies/:genreName", async (req, res) => {
  try {
    const moviesFilteredByGenreName = await prisma.movie.findMany({
      include: {
        genre: true,
        language: true
      },
      where: {
        genre: {
          name: {
            equals:req.params.genreName,
            mode: "insensitive"
          }
        }
      }
    });
    res.status(200).send(moviesFilteredByGenreName);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Falha ao filtrar filmes por gênero" });
  }

  
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
