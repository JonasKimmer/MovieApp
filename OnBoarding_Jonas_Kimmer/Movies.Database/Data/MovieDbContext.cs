// Data/MovieDbContext.cs
using Microsoft.EntityFrameworkCore;
using Movies.Models.Entities;

namespace Movies.Data
{
    public class MovieDbContext : DbContext
    {
        public MovieDbContext(DbContextOptions<MovieDbContext> options) : base(options)
        {
        }

        public DbSet<Movie> Movies { get; set; }
        public DbSet<Person> Persons { get; set; }
        public DbSet<Genre> Genres { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Movie Configuration
            modelBuilder.Entity<Movie>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Summary).HasMaxLength(2000);
                entity.Property(e => e.Tagline).HasMaxLength(500);
                entity.Property(e => e.Neo4jElementId).HasMaxLength(100);
                entity.Property(e => e.Rating).HasColumnType("int");

                // Indices
                entity.HasIndex(e => e.Title);
                entity.HasIndex(e => e.Released);
                entity.HasIndex(e => e.Neo4jElementId);
            });

            // Person Configuration
            modelBuilder.Entity<Person>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Neo4jElementId).HasMaxLength(100);

                // Indices
                entity.HasIndex(e => e.Name);
                entity.HasIndex(e => e.Birthday);
                entity.HasIndex(e => e.Neo4jElementId);
            });

            // Genre Configuration
            modelBuilder.Entity<Genre>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Neo4jElementId).HasMaxLength(100);

                // Unique constraint - jedes Genre nur einmal
                entity.HasIndex(e => e.Name).IsUnique();
                entity.HasIndex(e => e.Neo4jElementId);
            });
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                // Connection-String für Docker-Postgres
                optionsBuilder.UseNpgsql("Host=localhost;Database=postgres_movie_db;Username=default_user;Password=default_password");
            }
        }
    }
}