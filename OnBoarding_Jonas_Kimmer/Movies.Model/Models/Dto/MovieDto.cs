namespace Movies.Models.Dto
{
    public class MovieDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public int Released { get; set; }
        public int? Rating { get; set; }
        
        public string? Summary { get; set; }     
        public string? Tagline { get; set; } 
        public bool IsFavorite { get; set; } // Favoriten-Status für Frontend
        public string? Actors { get; set; } // Hauptdarsteller als String für DataGrid
        public int? UserRating { get; set; } // User-Bewertung (0-10) für Frontend
        public string? Director { get; set; } // Regisseur für Frontend
    }
}