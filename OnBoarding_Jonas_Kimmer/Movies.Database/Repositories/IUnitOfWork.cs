namespace Movies.Repositories
{
    public interface IUnitOfWork : IDisposable
    {
        IMovieRepository Movies { get; }
        IPersonRepository Persons { get; }
        IGenreRepository Genres { get; }
        INeo4jRepository Neo4j { get; }
        
        Task CommitAsync();
    }
}