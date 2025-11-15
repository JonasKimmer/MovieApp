using System.ComponentModel.DataAnnotations;

namespace Movies.Models.Entities
{
    public class Person
    {
        [Key]
        public int Id { get; set; }                  // PostgreSQL Primary Key (personId)
        
        public string? Neo4jElementId { get; set; }  // Neo4j elementId
        
        public string Name { get; set; } = string.Empty;
        public int? Birthday { get; set; }           // born/birthday (aus Neo4j - "born:1964")
    }
}