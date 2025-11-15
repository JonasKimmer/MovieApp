using Movies.Models.Entities;

namespace Movies.Repositories
{
    public interface INeo4jRepository
    {
        // Empfehlungen
        Task<IDictionary<Movie, string>> GetRecommendationsWithReasonsAsync(int movieId, int count, string type = "actors");
        Task<IDictionary<Movie, string>> GetRecommendationsBasedOnFavoritesAsync(int count);
        Task<IDictionary<Movie, string>> GetTopRatedRecommendationsAsync(int count);
        
        // Beziehungen
        Task<IEnumerable<Person>> GetActorsForMovieAsync(int movieId);
        Task<IEnumerable<Person>> GetLeadActorsForMovieAsync(int movieId);
        Task<IEnumerable<Person>> GetDirectorsForMovieAsync(int movieId);
        Task<IEnumerable<Movie>> GetMoviesByActorAsync(int actorId);
        
        // Optional (falls später benötigt)
        Task<IEnumerable<Movie>> GetRecommendationsForMovieAsync(int movieId, int count);
        Task<IEnumerable<Genre>> GetGenresForMovieAsync(int movieId);
        Task SyncNeo4jElementIdAsync<T>(T entity) where T : class;
    }
}