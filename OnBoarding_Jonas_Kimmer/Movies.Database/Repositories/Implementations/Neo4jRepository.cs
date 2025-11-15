using Neo4j.Driver;
using Movies.Models.Entities;
using Movies.Data;
using Microsoft.EntityFrameworkCore;

namespace Movies.Repositories.Implementations
{
    public class Neo4jRepository : INeo4jRepository
    {
        private readonly IDriver _driver;
        private readonly MovieDbContext _context;

        public Neo4jRepository(IDriver driver, MovieDbContext context)
        {
            _driver = driver;
            _context = context;
        }

        public async Task<IDictionary<Movie, string>> GetRecommendationsBasedOnFavoritesAsync(int count)
        {
            var query = @"
                MATCH (m:Movie)
                WHERE m.rating IS NOT NULL
                RETURN m.title as title,
                       m.released as released,
                       m.rating as rating,
                       CASE
                           WHEN m.rating >= 85 THEN 'Meisterwerk 🏆'
                           WHEN m.rating >= 75 THEN 'Hochbewertet ⭐'
                           WHEN m.rating >= 70 THEN 'Beliebter Film 👍'
                           ELSE 'Empfehlung ✨'
                       END as reason
                ORDER BY m.rating DESC
                LIMIT $count";

            using var session = _driver.AsyncSession();
            try
            {
                Console.WriteLine("🔍 Führe Empfehlungs-Query aus...");
                var result = await session.RunAsync(query, new { count });
                var recommendations = new Dictionary<Movie, string>();

                await result.ForEachAsync(record =>
                {
                    var title = record["title"].As<string>();
                    var released = record["released"].As<int>();
                    var rating = record["rating"].As<double>();
                    var reason = record["reason"].As<string>();

                    Console.WriteLine($"✨ Gefunden: {title} ({released}) - Rating: {rating}");

                    var movie = _context.Movies.FirstOrDefault(m => 
                        m.Title.ToLower() == title.ToLower() && 
                        m.Released == released);

                    if (movie != null)
                    {
                        recommendations[movie] = $"{reason} ({rating:F0}/100)";
                        Console.WriteLine($"✅ Hinzugefügt: {movie.Title}");
                    }
                });

                Console.WriteLine($"🎯 Empfehlungen gefunden: {recommendations.Count}");
                return recommendations;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERROR: {ex.Message}");
                return new Dictionary<Movie, string>();
            }
        }

        public async Task<IDictionary<Movie, string>> GetRecommendationsWithReasonsAsync(int movieId, int count, string type = "actors")
        {
            var movie = await _context.Movies.FindAsync(movieId);
            if (movie == null) 
            {
                Console.WriteLine($"❌ Film mit ID {movieId} nicht in Datenbank gefunden");
                return new Dictionary<Movie, string>();
            }

            Console.WriteLine($"🎬 Suche Empfehlungen für: {movie.Title} ({movie.Released})");

            string query;
            Func<string, string> reasonText;

            switch (type.ToLower())
            {
                case "actors":
                    query = @"
                        MATCH (m:Movie {title: $title})<-[:ACTED_IN]-(a:Person)-[:ACTED_IN]->(rec:Movie) 
                        WHERE m <> rec 
                        WITH rec, a.name as actor 
                        RETURN DISTINCT rec.title as title, 
                                      rec.released as released, 
                                      actor 
                        LIMIT $count";
                    reasonText = actor => $"Gemeinsame Schauspieler: {actor}";
                    break;

                case "director":
                    query = @"
                        MATCH (m:Movie {title: $title})<-[:DIRECTED]-(d:Person)-[:DIRECTED]->(rec:Movie) 
                        WHERE m <> rec 
                        WITH rec, d.name as director
                        RETURN DISTINCT rec.title as title, 
                                      rec.released as released, 
                                      director as actor
                        LIMIT $count";
                    reasonText = director => $"Gleicher Regisseur: {director}";
                    break;

                case "genre":
                    query = @"
                        MATCH (m:Movie {title: $title})-[:IN_GENRE]->(g:Genre)<-[:IN_GENRE]-(rec:Movie)
                        WHERE m <> rec
                        WITH rec, g.name as genre
                        RETURN DISTINCT rec.title as title,
                                      rec.released as released,
                                      genre as actor
                        LIMIT $count";
                    reasonText = genre => $"Gleiches Genre: {genre}";
                    break;

                default:
                    // Fallback: Einfach andere Filme mit denselben Schauspielern
                    query = @"
                        MATCH (rec:Movie)<-[:ACTED_IN]-(a:Person)
                        WHERE rec.title <> $title
                        WITH rec, a.name as actor
                        RETURN DISTINCT rec.title as title, 
                                       rec.released as released, 
                                       actor
                        LIMIT $count";
                    reasonText = actor => $"Empfohlener Film mit {actor}";
                    break;
            }

            Console.WriteLine($"🔍 Neo4j Query Type: {type}");
            Console.WriteLine($"📊 Parameter: title='{movie.Title}', count={count}");
            Console.WriteLine($"🔍 Query: {query}");

            return await RunRecommendationQuery(query, new { title = movie.Title, count }, reasonText);
        }

        // Alle Schauspieler eines Films (für Detailseite)
        public async Task<IEnumerable<Person>> GetActorsForMovieAsync(int movieId)
        {
            var movie = await _context.Movies.FindAsync(movieId);
            if (movie == null)
            {
                Console.WriteLine($"❌ Film mit ID {movieId} nicht gefunden");
                return new List<Person>();
            }

            Console.WriteLine($"🎭 Lade alle Schauspieler für: {movie.Title}");

            var query = "MATCH (m:Movie {title: $title})<-[:ACTED_IN]-(p:Person) RETURN p.name as name";
            return await RunPersonQuery(query, new { title = movie.Title });
        }

        // Nur EINEN Hauptdarsteller (für Tabelle)
        public async Task<IEnumerable<Person>> GetLeadActorsForMovieAsync(int movieId)
        {
            var movie = await _context.Movies.FindAsync(movieId);
            if (movie == null)
            {
                Console.WriteLine($"❌ Film mit ID {movieId} nicht gefunden");
                return new List<Person>();
            }

            Console.WriteLine($"🎭 Lade Hauptdarsteller für: {movie.Title}");

            var query = "MATCH (m:Movie {title: $title})<-[:ACTED_IN]-(p:Person) RETURN p.name as name LIMIT 1";
            return await RunPersonQuery(query, new { title = movie.Title });
        }

        public async Task<IEnumerable<Person>> GetDirectorsForMovieAsync(int movieId)
        {
            var movie = await _context.Movies.FindAsync(movieId);
            if (movie == null)
            {
                Console.WriteLine($"❌ Film mit ID {movieId} nicht gefunden");
                return new List<Person>();
            }

            Console.WriteLine($"🎬 Lade Regisseure für: {movie.Title}");

            var query = "MATCH (m:Movie {title: $title})<-[:DIRECTED]-(p:Person) RETURN p.name as name";
            return await RunPersonQuery(query, new { title = movie.Title });
        }

        public async Task<IEnumerable<Movie>> GetMoviesByActorAsync(int actorId)
        {
            var person = await _context.Persons.FindAsync(actorId);
            if (person == null)
            {
                Console.WriteLine($"❌ Person mit ID {actorId} nicht gefunden");
                return new List<Movie>();
            }

            Console.WriteLine($"🎭 Lade Filme für Schauspieler: {person.Name}");

            var query = "MATCH (p:Person {name: $name})-[:ACTED_IN]->(m:Movie) RETURN m.title as title, m.released as released";
            return await RunMovieQuery(query, new { name = person.Name });
        }

        // Interface-Methoden
        public async Task<IEnumerable<Movie>> GetRecommendationsForMovieAsync(int movieId, int count)
        {
            var recommendations = await GetRecommendationsWithReasonsAsync(movieId, count);
            return recommendations.Keys;
        }

        public async Task<IEnumerable<Genre>> GetGenresForMovieAsync(int movieId)
        {
            var movie = await _context.Movies.FindAsync(movieId);
            if (movie == null) return new List<Genre>();

            var query = "MATCH (m:Movie {title: $title})-[:IN_GENRE]->(g:Genre) RETURN g.name as name";

            using var session = _driver.AsyncSession();
            try
            {
                var result = await session.RunAsync(query, new { title = movie.Title });
                var genres = new List<Genre>();

                await result.ForEachAsync(record =>
                {
                    var name = record["name"].As<string>();
                    genres.Add(new Genre { Name = name });
                });

                return genres;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Fehler beim Laden der Genres: {ex.Message}");
                return new List<Genre>();
            }
        }

        public async Task SyncNeo4jElementIdAsync<T>(T entity) where T : class
        {
            await Task.CompletedTask;
        }

        // Alternative Methode falls die erste zu wenige Ergebnisse liefert
        public async Task<IDictionary<Movie, string>> GetTopRatedRecommendationsAsync(int count)
        {
            var query = @"
                MATCH (rec:Movie)
                WHERE rec.rating IS NOT NULL
                WITH rec ORDER BY rec.rating DESC
                MATCH (rec)<-[:ACTED_IN]-(a:Person)
                WITH rec, rec.rating as rating, collect(a.name)[0] as actor
                RETURN DISTINCT rec.title as title,
                                rec.released as released,
                                rating,
                                actor
                LIMIT $count";

            var parameters = new { count };
            
            return await RunRecommendationQuery(
                query,
                parameters,
                (actor) => $"Top-bewerteter Film ({actor})"
            );
        }

        // === DEBUGGING UND TEST METHODEN ===
        
        public async Task<string> AnalyzeNeo4jDataStructureAsync()
        {
            using var session = _driver.AsyncSession();
            try
            {
                Console.WriteLine("🔍 Analysiere Neo4j-Datenstruktur...");

                // 1. Alle Movie-Titel auflisten
                var movieQuery = await session.RunAsync("MATCH (m:Movie) RETURN m.title as title, m.released as released ORDER BY m.title LIMIT 10");
                Console.WriteLine("\n🎬 Verfügbare Filme in Neo4j:");
                await movieQuery.ForEachAsync(record =>
                {
                    var title = record["title"].As<string>();
                    var released = record["released"]?.As<int?>();
                    Console.WriteLine($"   - {title} ({released})");
                });

                // 2. Beispiel ACTED_IN Beziehungen
                var actorQuery = await session.RunAsync(@"
                    MATCH (p:Person)-[:ACTED_IN]->(m:Movie) 
                    RETURN p.name as actor, m.title as movie 
                    LIMIT 5");
                Console.WriteLine("\n🎭 Beispiel Schauspieler-Beziehungen:");
                await actorQuery.ForEachAsync(record =>
                {
                    var actor = record["actor"].As<string>();
                    var movie = record["movie"].As<string>();
                    Console.WriteLine($"   - {actor} spielte in {movie}");
                });

                return "Analyse abgeschlossen - siehe Console für Details";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Fehler bei Datenstruktur-Analyse: {ex.Message}");
                return $"Fehler: {ex.Message}";
            }
        }

        // === HELPER METHODS ===
        
        // Neue spezielle Helper-Methode für beliebte Empfehlungen
        private async Task<IDictionary<Movie, string>> RunPopularRecommendationQuery(string query, object parameters)
        {
            using var session = _driver.AsyncSession();
            try
            {
                Console.WriteLine($"🔍 Führe beliebte Empfehlungen Query aus...");
                var result = await session.RunAsync(query, parameters);
                var recommendations = new Dictionary<Movie, string>();
                int resultCount = 0;

                await result.ForEachAsync(record =>
                {
                    resultCount++;
                    var title = record["title"].As<string>();
                    var released = record["released"].As<int>();
                    var reason = record["reason"].As<string>();
                    var rating = record["rating"]?.As<int>();
                    var actor = record["actor"]?.As<string>();

                    Console.WriteLine($"📝 Neo4j Popular Result {resultCount}: {title} ({released}) - {reason} - Rating: {rating}");

                    // Suche Film in SQL-Datenbank
                    var movie = _context.Movies.FirstOrDefault(m =>
                        m.Title.Trim().ToLower() == title.Trim().ToLower() &&
                        m.Released == released);

                    if (movie != null)
                    {
                        // Erstelle aussagekräftige Begründung
                        var finalReason = reason switch
                        {
                            "Meisterwerk" => $"🏆 Meisterwerk ({rating}/100)",
                            "Hochbewertet" => $"⭐ Hochbewerteter Film ({rating}/100)",
                            "Beliebter Film" => $"👍 Beliebter Film ({rating}/100)",
                            "Starbesetzung" => $"🎭 Film mit Starbesetzung",
                            _ => $"💡 Empfohlener Film"
                        };

                        if (!string.IsNullOrEmpty(actor))
                        {
                            finalReason += $" - mit {actor}";
                        }

                        recommendations[movie] = finalReason;
                        Console.WriteLine($"✅ Beliebter Film hinzugefügt: {movie.Title} - {finalReason}");
                    }
                    else
                    {
                        Console.WriteLine($"❌ Film nicht in SQL-DB gefunden: {title} ({released})");
                    }
                });

                Console.WriteLine($"🎯 Gesamt beliebte Ergebnisse: {resultCount}");
                Console.WriteLine($"🎯 Erfolgreiche Matches: {recommendations.Count}");

                return recommendations;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Neo4j Popular Query Fehler: {ex.Message}");
                return new Dictionary<Movie, string>();
            }
        }
        
        private async Task<IDictionary<Movie, string>> RunRecommendationQuery(string query, object parameters, Func<string, string> reasonBuilder)
        {
            using var session = _driver.AsyncSession();
            try
            {
                Console.WriteLine($"🔍 Führe Neo4j-Query aus...");
                var result = await session.RunAsync(query, parameters);
                var recommendations = new Dictionary<Movie, string>();
                int resultCount = 0;

                await result.ForEachAsync(record =>
                {
                    resultCount++;
                    var title = record["title"].As<string>();
                    var released = record["released"].As<int>();
                    var actor = record["actor"]?.As<string>();

                    Console.WriteLine($"📝 Neo4j Result {resultCount}: {title} ({released}) - Actor: {actor}");

                    // Exakte Suche in der SQL-Datenbank mit besserer Toleranz
                    var movie = _context.Movies.FirstOrDefault(m =>
                        m.Title.Trim().ToLower() == title.Trim().ToLower() &&
                        m.Released == released);

                    if (movie != null)
                    {
                        recommendations[movie] = reasonBuilder(actor ?? "unbekanntem Cast");
                        Console.WriteLine($"✅ Film gefunden und hinzugefügt: {movie.Title}");
                    }
                    else
                    {
                        Console.WriteLine($"❌ Film nicht in SQL-DB gefunden: {title} ({released})");

                        // Fallback: Suche nur nach Titel (falls Jahr nicht stimmt)
                        var fallbackMovie = _context.Movies.FirstOrDefault(m =>
                            m.Title.Trim().ToLower() == title.Trim().ToLower());
                        if (fallbackMovie != null)
                        {
                            Console.WriteLine($"⚠️ Fallback: Film mit anderem Jahr gefunden: {fallbackMovie.Title} ({fallbackMovie.Released})");
                        }
                    }
                });

                Console.WriteLine($"🎯 Gesamt Neo4j Ergebnisse: {resultCount}");
                Console.WriteLine($"🎯 Erfolgreiche Matches: {recommendations.Count}");

                return recommendations;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Neo4j Query Fehler: {ex.Message}");
                Console.WriteLine($"❌ StackTrace: {ex.StackTrace}");
                return new Dictionary<Movie, string>();
            }
        }

        private async Task<List<Person>> RunPersonQuery(string query, object parameters)
        {
            using var session = _driver.AsyncSession();
            try
            {
                var result = await session.RunAsync(query, parameters);
                var persons = new List<Person>();
                int resultCount = 0;

                await result.ForEachAsync(record =>
                {
                    resultCount++;
                    var name = record["name"].As<string>();
                    persons.Add(new Person { Name = name });
                    Console.WriteLine($"👤 Person {resultCount}: {name}");
                });

                Console.WriteLine($"🎯 Personen gefunden: {resultCount}");
                return persons;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Fehler beim Laden der Personen: {ex.Message}");
                return new List<Person>();
            }
        }

        private async Task<List<Movie>> RunMovieQuery(string query, object parameters)
        {
            using var session = _driver.AsyncSession();
            try
            {
                var result = await session.RunAsync(query, parameters);
                var movies = new List<Movie>();
                int resultCount = 0;

                await result.ForEachAsync(record =>
                {
                    resultCount++;
                    var title = record["title"].As<string>();
                    var released = record["released"].As<int>();

                    Console.WriteLine($"🎬 Neo4j Movie {resultCount}: {title} ({released})");

                    var movie = _context.Movies.FirstOrDefault(m =>
                        m.Title.ToLower() == title.ToLower() &&
                        m.Released == released);

                    if (movie != null)
                    {
                        movies.Add(movie);
                        Console.WriteLine($"✅ Film gemapped: {movie.Title}");
                    }
                    else
                    {
                        Console.WriteLine($"❌ Film nicht in SQL-DB: {title} ({released})");
                    }
                });

                Console.WriteLine($"🎯 Filme gefunden: {resultCount}, erfolgreich gemapped: {movies.Count}");
                return movies;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Fehler beim Laden der Filme: {ex.Message}");
                return new List<Movie>();
            }
        }
    }
}