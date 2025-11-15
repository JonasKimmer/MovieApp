using Microsoft.AspNetCore.Mvc;
using Movies.Models.Dto;
using Movies.Repositories;

namespace Movies.Controllers
{
    [Route("api/[controller]")]
    [ProducesResponseType(typeof(IEnumerable<MovieDto>), 200)]
    [ProducesResponseType(400)]
    [ApiController]
    public class MoviesController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public MoviesController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        /// <summary>
        /// Alle Filme abrufen - OHNE Actors (wie ursprünglich)
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<MovieDto>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> GetAllMovies()
        {
            try
            {
                var movies = await _unitOfWork.Movies.GetAllAsync();
                var movieDtos = new List<MovieDto>();
                foreach (var m in movies)
                {
                    var leadActors = await _unitOfWork.Neo4j.GetLeadActorsForMovieAsync(m.Id);
                    var mainActor = leadActors.FirstOrDefault()?.Name ?? "";

                    var directors = await _unitOfWork.Neo4j.GetDirectorsForMovieAsync(m.Id);
                    var director = directors.FirstOrDefault()?.Name ?? "";

                    movieDtos.Add(new MovieDto
                    {
                        Id = m.Id,
                        Title = m.Title,
                        Released = m.Released,
                        Rating = m.Rating,
                        Summary = m.Summary,
                        Tagline = m.Tagline,
                        IsFavorite = m.IsFavorite,
                        UserRating = m.UserRating,
                        Actors = mainActor,
                        Director = director
                    });
                }

                return Ok(movieDtos);
            }
            catch (Exception ex)
            {
                return BadRequest($"Fehler beim Laden der Filme: {ex.Message}");
            }
        }

        /// <summary>
        /// Film-Details mit Hauptdarstellern
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(IEnumerable<MovieDto>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> GetMovieDetails(int id)
        {
            try
            {
                var movie = await _unitOfWork.Movies.GetByIdAsync(id);
                if (movie == null) return NotFound($"Film mit ID {id} nicht gefunden");

                // Hauptdarsteller von Neo4j holen
                var leadActors = await _unitOfWork.Neo4j.GetLeadActorsForMovieAsync(id);
                var actorNames = string.Join(", ", leadActors.Select(a => a.Name)); // ALLE!

                // Regisseur von Neo4j holen
                var directors = await _unitOfWork.Neo4j.GetDirectorsForMovieAsync(id);
                var director = directors.FirstOrDefault()?.Name ?? "";

                var movieDto = new MovieDto
                {
                    Id = movie.Id,
                    Title = movie.Title,
                    Released = movie.Released,
                    Rating = movie.Rating,
                    Summary = movie.Summary,
                    Tagline = movie.Tagline,
                    IsFavorite = movie.IsFavorite,
                    UserRating = movie.UserRating,
                    Actors = actorNames, // alle Hauptdarsteller, kommasepariert
                    Director = director  // <--- hinzugefügt
                };

                return Ok(movieDto);
            }
            catch (Exception ex)
            {
                return BadRequest($"Fehler beim Laden des Films: {ex.Message}");
            }
        }

        /// <summary>
        /// Alle Actors für Detailseite
        /// </summary>
        [HttpGet("{id}/actors")]
        [ProducesResponseType(typeof(IEnumerable<MovieDto>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> GetMovieActors(int id)
        {
            try
            {
                var actors = await _unitOfWork.Neo4j.GetActorsForMovieAsync(id); // ALLE Actors
                var actorDtos = actors.Select(a => new PersonDto
                {
                    Id = a.Id,
                    Name = a.Name,
                    Birthday = a.Birthday
                });

                return Ok(actorDtos);
            }
            catch (Exception ex)
            {
                return BadRequest($"Fehler beim Laden der Actors: {ex.Message}");
            }
        }

        /// <summary>
        /// Nur Main Actor für Tabelle
        /// </summary>
        [HttpGet("{id}/main-actor")]
        [ProducesResponseType(typeof(IEnumerable<MovieDto>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> GetMovieMainActor(int id)
        {
            try
            {
                var actors = await _unitOfWork.Neo4j.GetLeadActorsForMovieAsync(id); // NUR einer
                var actorDtos = actors.Select(a => new PersonDto
                {
                    Id = a.Id,
                    Name = a.Name,
                    Birthday = a.Birthday
                });

                return Ok(actorDtos);
            }
            catch (Exception ex)
            {
                return BadRequest($"Fehler beim Laden des Main Actors: {ex.Message}");
            }
        }

        /// <summary>
        /// NEU: Separate Directors API
        /// </summary>
        [HttpGet("{id}/directors")]
        [ProducesResponseType(typeof(IEnumerable<MovieDto>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> GetMovieDirectors(int id)
        {
            try
            {
                var directors = await _unitOfWork.Neo4j.GetDirectorsForMovieAsync(id);
                var directorDtos = directors.Select(d => new PersonDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Birthday = d.Birthday
                });

                return Ok(directorDtos);
            }
            catch (Exception ex)
            {
                return BadRequest($"Fehler beim Laden der Directors: {ex.Message}");
            }
        }

        /// <summary>
        /// Film zu Favoriten hinzufügen
        /// </summary>
        [HttpPost("{id}/favorite")]
        [ProducesResponseType(typeof(IEnumerable<MovieDto>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> AddToFavorites(int id)
        {
            try
            {
                var movie = await _unitOfWork.Movies.GetByIdAsync(id);
                if (movie == null) return NotFound();

                movie.IsFavorite = true;
                movie.FavoritedAt = DateTime.UtcNow;

                await _unitOfWork.Movies.UpdateAsync(movie);
                await _unitOfWork.CommitAsync();

                return Ok(new { message = $"'{movie.Title}' zu Favoriten hinzugefügt" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Fehler: {ex.Message}");
            }
        }

        /// <summary>
        /// Film aus Favoriten entfernen
        /// </summary>
        [HttpDelete("{id}/favorite")]
        [ProducesResponseType(typeof(IEnumerable<MovieDto>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> RemoveFromFavorites(int id)
        {
            try
            {
                var movie = await _unitOfWork.Movies.GetByIdAsync(id);
                if (movie == null) return NotFound();

                movie.IsFavorite = false;
                movie.FavoritedAt = null;

                await _unitOfWork.Movies.UpdateAsync(movie);
                await _unitOfWork.CommitAsync();

                return Ok(new { message = $"'{movie.Title}' aus Favoriten entfernt" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Fehler: {ex.Message}");
            }
        }

        /// <summary>
        /// User-Rating hinzufügen/bearbeiten
        /// </summary>
        [HttpPost("{id}/rating")]
        [ProducesResponseType(typeof(IEnumerable<MovieDto>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> SetUserRating(int id, [FromBody] int rating)
        {
            try
            {
                if (rating < 1 || rating > 10)
                    return BadRequest("Rating muss zwischen 1 und 10 liegen");

                var movie = await _unitOfWork.Movies.GetByIdAsync(id);
                if (movie == null) return NotFound();

                movie.UserRating = rating;

                await _unitOfWork.Movies.UpdateAsync(movie);
                await _unitOfWork.CommitAsync();

                return Ok(new { message = $"Bewertung {rating}/10 für '{movie.Title}' gespeichert" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Fehler: {ex.Message}");
            }
        }

        /// <summary>
        /// User-Rating löschen
        /// </summary>
        [HttpDelete("{id}/rating")]
        [ProducesResponseType(typeof(IEnumerable<MovieDto>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> DeleteUserRating(int id)
        {
            try
            {
                var movie = await _unitOfWork.Movies.GetByIdAsync(id);
                if (movie == null) return NotFound();

                movie.UserRating = null;

                await _unitOfWork.Movies.UpdateAsync(movie);
                await _unitOfWork.CommitAsync();

                return Ok(new { message = $"Bewertung für '{movie.Title}' gelöscht" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Fehler: {ex.Message}");
            }
        }

        /// <summary>
        /// Favoriten-Liste abrufen
        /// </summary>
        [HttpGet("favorites")]
        [ProducesResponseType(typeof(IEnumerable<MovieDto>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> GetFavorites()
        {
            try
            {
                var favorites = await _unitOfWork.Movies.GetFavoriteMoviesAsync();
                var favoriteDtos = favorites.Select(m => new MovieDto
                {
                    Id = m.Id,
                    Title = m.Title,
                    Released = m.Released,
                    Rating = m.Rating,
                    Summary = m.Summary,
                    IsFavorite = m.IsFavorite,
                    UserRating = m.UserRating
                });

                return Ok(favoriteDtos);
            }
            catch (Exception ex)
            {
                return BadRequest($"Fehler beim Laden der Favoriten: {ex.Message}");
            }
        }

        /// <summary>
        /// Gibt nur den ersten Hauptdarsteller eines Films zurück
        /// </summary>
        [HttpGet("{id}/main-actor-name")]
        [ProducesResponseType(typeof(IEnumerable<MovieDto>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> GetMainActorName(int id)
        {
            try
            {
                var leadActors = await _unitOfWork.Neo4j.GetLeadActorsForMovieAsync(id);
                var mainActor = leadActors.FirstOrDefault()?.Name ?? "";
                return Ok(new { mainActor });
            }
            catch (Exception ex)
            {
                return BadRequest($"Fehler beim Laden des Hauptdarstellers: {ex.Message}");
            }
        }
    }
}
