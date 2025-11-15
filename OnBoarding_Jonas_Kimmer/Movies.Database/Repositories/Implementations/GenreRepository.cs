using Microsoft.EntityFrameworkCore;
using Movies.Data;
using Movies.Models.Entities;

namespace Movies.Repositories.Implementations
{
    public class GenreRepository : Repository<Genre>, IGenreRepository
    {
        public GenreRepository(MovieDbContext context) : base(context)
        {
        }

        public async Task<Genre> GetGenreByNameAsync(string name)
        {
            return await _context.Genres
                .FirstOrDefaultAsync(g => g.Name.ToLower() == name.ToLower());
        }
    }
}