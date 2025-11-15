using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Movies.Data;
using Movies.Repositories;
using Movies.Repositories.Implementations;
using Neo4j.Driver;

var builder = WebApplication.CreateBuilder(args);

// === DATABASE CONFIGURATION ===
builder.Services.AddDbContext<MovieDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddSingleton<IDriver>(provider =>
    GraphDatabase.Driver(
        builder.Configuration.GetConnectionString("Neo4jConnection") ?? "bolt://localhost:7687",
        AuthTokens.Basic("neo4j", "default_password")
    )
);

// === REPOSITORIES ===
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IMovieRepository, MovieRepository>();
builder.Services.AddScoped<IPersonRepository, PersonRepository>();
builder.Services.AddScoped<IGenreRepository, GenreRepository>();
builder.Services.AddScoped<INeo4jRepository, Neo4jRepository>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// === API CONFIGURATION ===
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwagger();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// === SWAGGER (DEVELOPMENT) ===
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Movie API v1");
        c.RoutePrefix = string.Empty; // Swagger als Startseite
    });
}

// === DATABASE SEEDING ===
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<MovieDbContext>();
    await context.Database.EnsureCreatedAsync();
    await SeedData.SeedDatabase(context);
}

// === MIDDLEWARE PIPELINE ===
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthorization();
app.MapControllers();

app.Run();

// === EXTENSION METHOD ===
public static class ServiceExtensions
{
    public static IServiceCollection AddSwagger(this IServiceCollection services)
    {
        return services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Movie Database API",
                Version = "v1",
                Description = "API für Filme, Favoriten und Empfehlungen"
            });
        });
    }
}