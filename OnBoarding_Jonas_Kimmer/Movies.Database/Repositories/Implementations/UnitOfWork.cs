using Movies.Data;
using Neo4j.Driver;

namespace Movies.Repositories.Implementations
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly MovieDbContext _context;
        private readonly IDriver _neoDriver;
        
        private IMovieRepository _movieRepository;
        private IPersonRepository _personRepository;
        private IGenreRepository _genreRepository;
        private INeo4jRepository _neo4jRepository;

        public UnitOfWork(MovieDbContext context, IDriver neoDriver)
        {
            _context = context;
            _neoDriver = neoDriver;
        }

        public IMovieRepository Movies => 
            _movieRepository ??= new MovieRepository(_context);

        public IPersonRepository Persons => 
            _personRepository ??= new PersonRepository(_context);

        public IGenreRepository Genres => 
            _genreRepository ??= new GenreRepository(_context);

        public INeo4jRepository Neo4j => 
            _neo4jRepository ??= new Neo4jRepository(_neoDriver, _context);

        public async Task CommitAsync()
        {
            await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}