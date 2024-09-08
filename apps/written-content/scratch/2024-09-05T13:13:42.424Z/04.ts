// Exact types

interface Album {
  title: string;
  releaseYear: number;
}

const processAlbum = (album: Album) => console.log(album);

processAlbum({
  title: "Rubber Soul",
  releaseYear: 1965,
  label: "Parlophone",
}); // No error!
