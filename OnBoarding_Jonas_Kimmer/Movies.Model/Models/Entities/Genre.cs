using System.ComponentModel.DataAnnotations;

namespace Movies.Models.Entities
{
    public class Genre
    {
        [Key]
        public int Id { get; set; }                  // PostgreSQL Primary Key (genreId)
        
        public string? Neo4jElementId { get; set; }  // Neo4j elementId
        
        public string Name { get; set; } = string.Empty;
    }
}