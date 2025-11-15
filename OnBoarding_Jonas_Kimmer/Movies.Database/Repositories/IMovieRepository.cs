
using System.Linq.Expressions;
using Movies.Models.Entities;

namespace Movies.Repositories
{
    public interface IMovieRepository : IRepository<Movie>
    {
        Task<IEnumerable<Movie>> GetTopRatedMoviesAsync(int count);
        Task<IEnumerable<Movie>> GetMoviesByGenreAsync(string genreName);
        Task<IEnumerable<Movie>> GetMoviesByYearAsync(int year);
        Task<Movie> GetMovieByTitleAsync(string title);
        Task<Movie> GetMovieWithDetailsAsync(int id);
        Task<IEnumerable<Movie>> GetFavoriteMoviesAsync();
    }
}