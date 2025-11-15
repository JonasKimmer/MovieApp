using System.ComponentModel.DataAnnotations;

namespace Movies.Models.Entities
{
    public class Movie
    {
        [Key]
        public int Id { get; set; }                  // PostgreSQL Primary Key (movieId)

        public string? Neo4jElementId { get; set; }  // Neo4j elementId

        public string Title { get; set; } = string.Empty;
        public int Released { get; set; }            // released (aus Neo4j)
        public int? Rating { get; set; }             // Rating 0-100 (aus Neo4j REVIEWED)
        public string? Summary { get; set; }         // Summary/Beschreibung des Films
        public string? Tagline { get; set; }         // tagline (aus Neo4j)

        // Favoriten
        public bool IsFavorite { get; set; } = false;
        public DateTime? FavoritedAt { get; set; }
        
        public int? UserRating { get; set; }    // Deine persönliche Bewertung (0-10) - EDITIERBAR

    }
}