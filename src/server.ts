import { PrismaClient, Prisma } from "@prisma/client";
import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";


const port = 3003;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/movies", async (req, res) => {
  try {
    const { sort = "release_date", order = "asc", language } = req.query;

    const validSortFields = ["release_date", "title", "oscar_count", "genre_id", "language_id", "duration", "director"];
    const validOrderValues = ["asc", "desc"];

    if (!validSortFields.includes(sort as string)) {
      res.status(400).send({ message: `Campo de ordenação inválido: ${sort}` });
    }

    if (!validOrderValues.includes(order as string)) {
      res.status(400).send({ message: `Ordem inválida: ${order}` });
    }

    const whereClause: Prisma.MovieWhereInput = {};
    if (language === "en") {
      whereClause.language = { name: "Inglês" };
    } else if (language === "es") {
      whereClause.language = { name: "Espanhol" };
    } else if (language === "fr") {
      whereClause.language = { name: "Francês" };
    } else if (language === "jp") {
      whereClause.language = { name: "Japonês" };
    }

    const movies = await prisma.movie.findMany({
      where: whereClause,
      orderBy: {
        [sort as string]: order as "asc" | "desc",
      },
      include: {
        genre: true,
        language: true,
      },
    });

    if (!movies || movies.length === 0) {
      res.status(404).send({ message: "Nenhum filme encontrado" });
    }

    const totalMovies = await prisma.movie.count({
      where: whereClause,
    });

    const averageDuration = await prisma.movie.aggregate({
      where: whereClause,
      _avg: {
        duration: true,
      },
    });

    res.status(200).json({
      totalMovies: totalMovies || 0,
      averageDuration: averageDuration._avg.duration || 0,
      movies,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Erro ao buscar filmes." });
  }
});

  

app.post("/movies", async (req, res) => {
  const { title, genre_id, language_id, oscar_count, release_date, director, duration } = req.body;

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
      res.status(409).send({ message: "Já existe um filme cadastrado com esse título" });
    }

    await prisma.movie.create({
      data: {
        title,
        genre_id,
        language_id,
        oscar_count,
        director,
        duration,
        release_date: new Date(release_date),
      },
    });

    res.status(201).send({ message: "Filme cadastrado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Falha ao cadastrar filme" });
  }
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
      res.status(404).send({ message: "Filme não encontrado" });
    }

    const data = { ...req.body };
    data.release_date = data.release_date ? new Date(data.release_date) : undefined;
  
    await prisma.movie.update({
      where: {
        id,
      },
      data: data
    });

    res.status(200).send({ message: "Filme atualizado com sucesso" });
  }catch(error){
    console.error(error);
    res.status(500).send({ message: "Falha ao atualizar o registro do filme" });
  }
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
      res.status(404).send({ message: "Filme não encontrado" });
    }

    await prisma.movie.delete({
      where: {
        id,
      },
    });
      
    res.status(200).send({ message: "Filme deletado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Falha ao deletar o filme" });
  }
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

app.get("/genres", async (_, res) => {
  try {
    const genres = await prisma.genre.findMany({
      orderBy: {
        name: "asc"
      },
    });
    res.status(200).send(genres);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Falha ao listar gêneros" });
  }
});

app.post("/genres", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400).send({ message: "É necessário informar o nome do gênero." });
  }

  try {
    const existingGenre = await prisma.genre.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive"
        }
      }
    });

    if (existingGenre) {
      res.status(409).send({ message: "Esse nome de gênero já existe." });
    }
        
    const createdGenre = await prisma.genre.create({
      data: {
        name
      }
    });

    res.status(201).send(createdGenre);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Falha ao cadastrar gênero." });
  }
});

app.put("/genres/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const name = req.body.name;

    if (!name) {
      res.status(400).send({ message: "É necessário informar o nome do gênero." });
    }
    const genre = await prisma.genre.findUnique({
      where: {
        id,
      },
    });

    if (!genre) {
      res.status(404).send({ message: "Gênero nao encontrado." });
    }

    const existingGenre = await prisma.genre.findFirst({
      where: { 
        name: { equals: name, mode: "insensitive" },
        id: { not: id } 
      },
    });

    if(existingGenre){
      res.status(409).send({ message: "Esse nome de gênero já existe." });
    }

    const updateGenre = await prisma.genre.update({
      where: {
        id,
      },
      data: {
        name
      }
    });

    res.status(200).send(updateGenre);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Falha ao atualizar gênero" });
  }
});

app.delete("/genres/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const genre = await prisma.genre.findUnique({
      where: {
        id,
      },
    });
  
    if (!genre) {
      res.status(404).send({ message: "Gênero não encontrado" });
    }

    await prisma.genre.delete({
      where: {
        id,
      },
    });
    res.status(200).send({ message: "Gênero deletado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Falha ao deletar o gênero" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
