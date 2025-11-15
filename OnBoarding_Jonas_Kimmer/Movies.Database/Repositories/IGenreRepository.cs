using Movies.Models.Entities;

namespace Movies.Repositories
{
    public interface IGenreRepository : IRepository<Genre>
    {
        Task<Genre> GetGenreByNameAsync(string name);
    }
}