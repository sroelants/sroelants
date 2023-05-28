import { parse } from "https://deno.land/std@0.187.0/csv/mod.ts";
import { slugify } from "https://deno.land/x/slugify/mod.ts";

type Book = {
  id: string,
  title: string,
  author: string,
  additionalAuthors: string | undefined,
  isbn: string,
  rating: number,
  publisher: string,
  yearPublished: number,
  originallyPublished: number | undefined,
  dateRead: Date,
  review: string | undefined,
}

const fields = [
  "id",
  "title",
  "author",
  "author l-f",
  "additionalAuthors",
  "isbn",
  "isbn13",
  "rating",
  "avgRating",
  "publisher",
  "binding",
  "pages",
  "published",
  "originallyPublished",
  "dateRead",
  "dateAdded",
  "bookshelves",
  "bookshelvesWithPositions",
  "exclusiveShelf",
  "review",
  "spoiler",
  "notes",
  "readCount",
  "ownedCopies"
] as const;

type Entry = Record<typeof fields[number], string>;

const [filename] = Deno.args;
const contents = await Deno.readTextFile(filename);

const parsed = parse(contents, { skipFirstRow: true, columns: fields }) as Entry[];

const books: Book[] =  parsed
  .filter((entry: Entry) => entry.dateRead !== "")
  .map((entry: Entry) => {
    return {
      id: entry.id,
      title: entry.title,
      author: entry.author,
      additionalAuthors: entry.additionalAuthors,
      isbn: entry.isbn,
      rating: Number(entry.rating),
      publisher: entry.publisher,
      yearPublished: Number(entry.published),
      originallyPublished: Number(entry.originallyPublished),
      dateRead: new Date(Date.parse(entry.dateRead)),
      review: entry.review,
    }
  });

for (const book of books) {
  const slug = slugify(book.title, {lower: true});
  const contents = `---
title: "${book.title}"
author: "${book.author}"
published: ${book.yearPublished}
dateRead: ${book.dateRead}
stars: ${book.rating}
---
${book.review}
`;

  const encoder = new TextEncoder();
  const data = encoder.encode(contents);
  const file = await Deno.open(
    `../content/books/${slug}.md`, 
    { write: true, create: true }
  );
  await file.write(data); // 11
  file.close();
}
