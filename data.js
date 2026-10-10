const content = [
  // Movies
  { id: 1, title: "Inception", type: "movie", genres: ["Sci-Fi", "Action", "Thriller"], year: 2010, rating: 8.8, runtime: "148 min", trending: true, description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.", poster: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg", backdrop: "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg", trailer: "YoHD9XEInc0" },
  { id: 2, title: "The Dark Knight", type: "movie", genres: ["Action", "Crime", "Drama"], year: 2008, rating: 9.0, runtime: "152 min", trending: true, description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.", poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", backdrop: "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg", trailer: "EXeTwQWrcwY" }
  // ... (truncated for this call — full file will be completed)
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = content;
} else {
  window.content = content;
}
