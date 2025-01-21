import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    // Deletar todos os dados para garantir um seed limpo
    await prisma.movie.deleteMany();
    await prisma.genre.deleteMany();
    await prisma.language.deleteMany();

    // Inserir gêneros
    const genres = await prisma.genre.createMany({
        data: [
            { id: 1, name: "Ação" },
            { id: 2, name: "Suspense" },
            { id: 3, name: "Aventura" },
            { id: 4, name: "Terror" },
            { id: 5, name: "Drama" },
            { id: 6, name: "Comédia" },
            { id: 7, name: "Romance" },
        ],
    });

    console.log(`Gêneros inseridos: ${genres.count}`);

    // Inserir idiomas
    const languages = await prisma.language.createMany({
        data: [
            { id: 1, name: "Português" },
            { id: 2, name: "Inglês" },
            { id: 3, name: "Espanhol" },
            { id: 4, name: "Japonês" },
            { id: 5, name: "Francês" },
        ],
    });

    console.log(`Idiomas inseridos: ${languages.count}`);

    // Inserir filmes (depois de gêneros e idiomas)
    const movies = await prisma.movie.createMany({
        data: [
            { title: "A teoria de tudo", release_date: new Date("2015-01-29"), genre_id: 5, language_id: 2, oscar_count: 2 },
            { title: "A rede social", release_date: new Date("2010-12-03"), genre_id: 5, language_id: 2, oscar_count: 1 },
            { title: "A grande aposta", release_date: new Date("2016-01-14"), genre_id: 1, language_id: 2 },
            { title: "Parasita", release_date: new Date("2019-05-30"), genre_id: 5, language_id: 2 },
            { title: "Uma mente brilhante", release_date: new Date("2002-02-15"), genre_id: 3, language_id: 2 },
            { title: "O jogo da imitação", release_date: new Date("2014-09-28"), genre_id: 3, language_id: 2 },
            { title: "Gênio indomável", release_date: new Date("1998-02-20"), genre_id: 1, language_id: 2 },
            { title: "Cisne negro", release_date: new Date("2011-02-04"), genre_id: 5, language_id: 2, oscar_count: 1 },
            { title: "Duna", release_date: new Date("2021-10-21"), genre_id: 1, language_id: 2 },
            { title: "Turma da mônica: lições", release_date: new Date("2021-12-30"), genre_id: 3, language_id: 1 },
            { title: "Minha mãe é uma peça 3", release_date: new Date("2019-12-26"), genre_id: 6, language_id: 1 },
            { title: "High Life", release_date: new Date("2018-11-07"), genre_id: 1, language_id: 5 },
            { title: "Mademoiselle vingança", release_date: new Date("2018-09-12"), genre_id: 7, language_id: 5, oscar_count: 1 },
        ],
    });

    console.log(`Filmes inseridos: ${movies.count}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
