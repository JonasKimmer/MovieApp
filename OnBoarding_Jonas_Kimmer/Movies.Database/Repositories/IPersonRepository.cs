using Movies.Models.Entities;

namespace Movies.Repositories
{
    public interface IPersonRepository : IRepository<Person>
    {
        Task<IEnumerable<Person>> GetPersonsByBirthdayYearAsync(int year);
        Task<Person> GetPersonByNameAsync(string name);
    }
}