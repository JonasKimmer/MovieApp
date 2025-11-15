using Microsoft.EntityFrameworkCore;
using Movies.Data;
using Movies.Models.Entities;

namespace Movies.Repositories.Implementations
{
    public class PersonRepository : Repository<Person>, IPersonRepository
    {
        public PersonRepository(MovieDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Person>> GetPersonsByBirthdayYearAsync(int year)
        {
            return await _context.Persons
                .Where(p => p.Birthday == year)
                .ToListAsync();
        }

        public async Task<Person> GetPersonByNameAsync(string name)
        {
            return await _context.Persons
                .FirstOrDefaultAsync(p => p.Name.ToLower() == name.ToLower());
        }
    }
}