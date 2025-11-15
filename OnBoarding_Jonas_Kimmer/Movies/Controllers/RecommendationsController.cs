using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Movies.Models.Dto;
using Movies.Repositories;
using Movies.Models.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Movies.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecommendationsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public RecommendationsController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        /// <summary>
        /// TEST-Endpoint für Neo4j-Verbindung
        /// </summary>
        [HttpGet("test")]
        public async Task<IActionResult> TestNeo4j()
        {
            try
            {
                Console.WriteLine("🚀 Test-Endpoint aufgerufen");
                
                // Teste einfache Neo4j Abfrage
                var popularRecommendations = await _unitOfWork.Neo4j
                    .GetRecommendationsBasedOnFavoritesAsync(2);

                return Ok(new { 
                    message = "Neo4j Test erfolgreich",
                    timestamp = DateTime.Now,
                    recommendationsFound = popularRecommendations.Count,
                    sampleRecommendations = popularRecommendations.Take(2).Select(r => new {
                        title = r.Key.Title,
                        reason = r.Value
                    })
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Test fehlgeschlagen: {ex.Message}");
                return BadRequest(new { 
                    error = "Test fehlgeschlagen", 
                    message = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        /// <summary>
        /// DEBUG: Analysiere Neo4j-Datenstruktur
        /// </summary>
        [HttpGet("debug/analyze")]
        public async Task<IActionResult> AnalyzeNeo4jData()
        {
            try
            {
                // Hier müssen Sie die Debug-Methode aufrufen
                // Falls die Methode in der Repository nicht verfügbar ist, 
                // rufen Sie eine einfache Test-Query auf
                
                var simpleTest = await _unitOfWork.Neo4j.GetActorsForMovieAsync(1);
                
                return Ok(new {
                    message = "Analyse gestartet - schauen Sie die Console-Ausgaben an",
                    timestamp = DateTime.Now,
                    testActorsCount = simpleTest.Count(),
                    note = "Detaillierte Ausgaben finden Sie in der Konsole"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { 
                    error = "Analyse fehlgeschlagen", 
                    message = ex.Message 
                });
            }
        }

        /// <summary>
        /// DEBUG: Teste vereinfachte Empfehlungen
        /// </summary>
        [HttpGet("debug/simple")]
        public async Task<IActionResult> TestSimpleRecommendations([FromQuery] int count = 3)
        {
            try
            {
                Console.WriteLine($"🧪 Teste vereinfachte Empfehlungen (count={count})");
                
                // Teste die vereinfachte beliebte Empfehlungen
                var recommendations = await _unitOfWork.Neo4j
                    .GetRecommendationsBasedOnFavoritesAsync(count);

                Console.WriteLine($"📋 Ergebnis: {recommendations.Count} Empfehlungen");

                var result = recommendations.Select(r => new
                {
                    movie = new
                    {
                        id = r.Key.Id,
                        title = r.Key.Title,
                        released = r.Key.Released
                    },
                    reason = r.Value
                });

                return Ok(new {
                    message = "Vereinfachte Empfehlungen",
                    count = recommendations.Count,
                    recommendations = result
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Fehler bei vereinfachten Empfehlungen: {ex.Message}");
                return BadRequest(new { 
                    error = "Test fehlgeschlagen", 
                    message = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        /// <summary>
        /// Empfehlungen für einen bestimmten Film
        /// </summary>
        [HttpGet("movie/{movieId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetMovieRecommendations(
            int movieId, 
            [FromQuery] int count = 4, 
            [FromQuery] string type = "actors")
        {
            try
            {
                Console.WriteLine($"🚀 API-Aufruf: Empfehlungen für Film {movieId}, count={count}, type={type}");
                
                var baseMovie = await _unitOfWork.Movies.GetByIdAsync(movieId);
                if (baseMovie == null)
                {
                    Console.WriteLine($"❌ Film mit ID {movieId} nicht gefunden");
                    return NotFound(new { 
                        error = "Film nicht gefunden",
                        movieId = movieId 
                    });
                }

                Console.WriteLine($"📖 Basis-Film: {baseMovie.Title} ({baseMovie.Released})");

                var recommendations = await _unitOfWork.Neo4j
                    .GetRecommendationsWithReasonsAsync(movieId, count, type);

                Console.WriteLine($"📋 Empfehlungen erhalten: {recommendations.Count}");

                if (!recommendations.Any())
                {
                    return Ok(new { 
                        message = "Keine Empfehlungen gefunden",
                        baseMovie = new {
                            id = baseMovie.Id,
                            title = baseMovie.Title,
                            released = baseMovie.Released
                        },
                        searchType = type,
                        recommendations = new List<object>()
                    });
                }

                var result = recommendations.Select(r => new
                {
                    movie = new 
                    {
                        id = r.Key.Id,
                        title = r.Key.Title,
                        released = r.Key.Released,
                        rating = r.Key.Rating,
                        summary = r.Key.Summary,
                        tagline = r.Key.Tagline
                    },
                    reason = r.Value,
                    basedOn = $"Basierend auf: {baseMovie.Title}"
                });

                Console.WriteLine($"✅ API-Response: {result.Count()} Empfehlungen");
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ API-Fehler: {ex.Message}");
                Console.WriteLine($"❌ StackTrace: {ex.StackTrace}");
                return BadRequest(new { 
                    error = "Fehler bei Empfehlungen", 
                    message = ex.Message 
                });
            }
        }

/// <summary>
/// Echte beliebte Empfehlungen (basierend auf Ratings und Popularität)
/// </summary>
[HttpGet("popular")]
public async Task<ActionResult<IEnumerable<object>>> GetPopularRecommendations([FromQuery] int count = 4)
{
    try
    {
        Console.WriteLine($"🚀 API-Aufruf: Beliebte Empfehlungen, count={count}");
        
        // Strategie 1: Versuche beliebte Empfehlungen
        var recommendations = await _unitOfWork.Neo4j
            .GetRecommendationsBasedOnFavoritesAsync(count);

        Console.WriteLine($"📋 Beliebte Empfehlungen erhalten: {recommendations.Count}");

        // Strategie 2: Falls zu wenige, fülle mit film-spezifischen Empfehlungen auf
        if (recommendations.Count < count)
        {
            Console.WriteLine($"⚡ Fülle Empfehlungen auf - aktuell: {recommendations.Count}, gewünscht: {count}");
            
            // Hole Empfehlungen für verschiedene Filme
            var movieIds = new[] { 1, 2, 3, 4, 5 }; // IDs der ersten paar Filme
            var additionalRecs = new Dictionary<Movie, string>();
            
            foreach (var movieId in movieIds)
            {
                if (additionalRecs.Count >= (count - recommendations.Count)) break;
                
                var movieRecs = await _unitOfWork.Neo4j
                    .GetRecommendationsWithReasonsAsync(movieId, 2, "actors");
                
                foreach (var rec in movieRecs)
                {
                    if (!recommendations.ContainsKey(rec.Key) && !additionalRecs.ContainsKey(rec.Key))
                    {
                        additionalRecs[rec.Key] = rec.Value;
                        if (additionalRecs.Count >= (count - recommendations.Count)) break;
                    }
                }
            }
            
            // Kombiniere beide Listen
            foreach (var additional in additionalRecs)
            {
                recommendations[additional.Key] = additional.Value;
            }
            
            Console.WriteLine($"📋 Nach Auffüllung: {recommendations.Count} Empfehlungen");
        }

        if (!recommendations.Any())
        {
            return Ok(new {
                message = "Keine beliebten Empfehlungen gefunden",
                recommendations = new List<object>()
            });
        }

        var result = recommendations.Select(r => new
        {
            movie = new
            {
                id = r.Key.Id,
                title = r.Key.Title,
                released = r.Key.Released,
                rating = r.Key.Rating,
                summary = r.Key.Summary,
                tagline = r.Key.Tagline
            },
            reason = r.Value
        });

        Console.WriteLine($"✅ API-Response: {result.Count()} beliebte Empfehlungen");
        return Ok(result);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ API-Fehler: {ex.Message}");
        return BadRequest(new { 
            error = "Fehler bei beliebten Empfehlungen", 
            message = ex.Message 
        });
    }
}


        /// <summary>
        /// Debug-Endpoint: Zeigt verfügbare Filme in Neo4j
        /// </summary>
        [HttpGet("debug/neo4j-movies")]
        public IActionResult GetNeo4jMovies([FromQuery] int limit = 10)
        {
            try
            {
                return Ok(new { 
                    message = "Debug-Endpoint verfügbar",
                    suggestion = "Verwenden Sie den /test Endpoint für grundlegende Tests",
                    limit = limit,
                    note = "Für detaillierte Neo4j-Tests nutzen Sie GET /api/recommendations/test"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { 
                    error = "Debug-Fehler", 
                    message = ex.Message 
                });
            }
        }
    }
}