using Microsoft.EntityFrameworkCore;
using Movies.Data;
using Movies.Models.Entities;

namespace Movies.Repositories.Implementations
{
    public class MovieRepository : Repository<Movie>, IMovieRepository
    {
        public MovieRepository(MovieDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Movie>> GetTopRatedMoviesAsync(int count)
        {
            return await _context.Movies
                .Where(m => m.Rating.HasValue)
                .OrderByDescending(m => m.Rating)
                .Take(count)
                .ToListAsync();
        }

        public async Task<IEnumerable<Movie>> GetMoviesByGenreAsync(string genreName)
        {
            // Da Genre-Film-Beziehungen in Neo4j gespeichert sind,
            // kann diese Methode später mit Hilfe des Neo4j-Repositories implementiert werden
            // Für jetzt geben wir eine leere Liste zurück
            return new List<Movie>();
        }

        public async Task<IEnumerable<Movie>> GetMoviesByYearAsync(int year)
        {
            return await _context.Movies
                .Where(m => m.Released == year)
                .ToListAsync();
        }

        public async Task<Movie> GetMovieByTitleAsync(string title)
        {
            return await _context.Movies
                .FirstOrDefaultAsync(m => m.Title.ToLower() == title.ToLower());
        }

        public async Task<Movie> GetMovieWithDetailsAsync(int id)
        {
            return await _context.Movies.FindAsync(id);
        }

        public async Task<IEnumerable<Movie>> GetFavoriteMoviesAsync()
        {
            return await _context.Movies
                .Where(m => m.IsFavorite)
                .OrderByDescending(m => m.FavoritedAt)
                .ToListAsync();
        }
    }
}