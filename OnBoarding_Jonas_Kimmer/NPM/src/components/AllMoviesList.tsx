import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, IconButton, Box, Card, CardContent, CardActions, Chip, TextField, Stack
} from '@mui/material';
import {
  Favorite, FavoriteBorder, PlayArrow, InfoOutlined, Star
} from '@mui/icons-material';

interface Movie {
  id: number;
  title: string;
  released: number;
  rating: number;
  summary: string;
  tagline: string;
  isFavorite: boolean;
  actors: string;
  userRating: number | null;
  director: string;
}

interface Recommendation {
  movie: {
    id: number;
    title: string;
    released: number;
    rating?: number;
    summary?: string;
  };
  reason: string;
}

function AllMoviesList() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:5157/api/movies');
        if (!response.ok) throw new Error('Fehler beim Laden der Filme');
        const data = await response.json();
        setMovies(data);
        setFilteredMovies(data);
        loadPopularRecommendations();
      } catch (err) {
        console.error('Fehler:', err);
        setError('Fehler beim Laden der Filme');
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  const loadPopularRecommendations = async () => {
    try {
      const response = await fetch('http://localhost:5157/api/recommendations/popular?count=12');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setRecommendations(data);
        } else if (data.recommendations && Array.isArray(data.recommendations)) {
          setRecommendations(data.recommendations);
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden der Empfehlungen:', error);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = movies.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMovies(filtered);
    } else {
      setFilteredMovies(movies);
    }
  }, [searchTerm, movies]);

  const handleFavoriteToggle = async (movieId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const movie = movies.find(m => m.id === movieId);
    if (!movie) return;

    try {
      const method = movie.isFavorite ? 'DELETE' : 'POST';
      const response = await fetch(`http://localhost:5157/api/movies/${movieId}/favorite`, {
        method
      });

      if (response.ok) {
        const updatedMovies = movies.map(m =>
          m.id === movieId ? { ...m, isFavorite: !m.isFavorite } : m
        );
        setMovies(updatedMovies);
      }
    } catch (error) {
      console.error('Fehler beim Favoriten-Update:', error);
    }
  };

  const MovieCard = ({ movie, isRecommendation = false }: { movie: any; isRecommendation?: boolean }) => (
    <Card
      sx={{
        minWidth: isRecommendation ? 280 : 300,
        maxWidth: isRecommendation ? 280 : 300,
        height: isRecommendation ? 420 : 450,
        bgcolor: '#2f2f2f',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'scale(1.08)',
          zIndex: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        },
      }}
      onClick={() => navigate(`/movie/${movie.id}`)}
    >
      <Box
        sx={{
          height: isRecommendation ? 180 : 200,
          bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          background: `linear-gradient(135deg, ${['#667eea', '#f093fb', '#4facfe', '#00f2fe', '#43e97b'][movie.id % 5]} 0%, ${['#764ba2', '#f5576c', '#00f2fe', '#4facfe', '#38f9d7'][movie.id % 5]} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, textAlign: 'center', px: 2 }}>
          {movie.title.substring(0, 1)}
        </Typography>
        <IconButton
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'white',
            bgcolor: 'rgba(0,0,0,0.5)',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
          }}
          onClick={(e) => handleFavoriteToggle(movie.id, e)}
        >
          {movie.isFavorite ? <Favorite /> : <FavoriteBorder />}
        </IconButton>
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {movie.title}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Chip
            label={movie.released}
            size="small"
            sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'text.secondary' }}
          />
          {movie.rating && (
            <Chip
              icon={<Star sx={{ fontSize: 16 }} />}
              label={`${movie.rating}/100`}
              size="small"
              sx={{ bgcolor: 'rgba(229, 9, 20, 0.2)', color: 'primary.main' }}
            />
          )}
        </Stack>

        {!isRecommendation && movie.tagline && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontStyle: 'italic',
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {movie.tagline}
          </Typography>
        )}

        {isRecommendation && movie.reason && (
          <Typography
            variant="body2"
            sx={{
              color: 'primary.main',
              fontStyle: 'italic',
              mb: 1,
              fontSize: '0.85rem'
            }}
          >
            {movie.reason}
          </Typography>
        )}

        {movie.summary && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: '0.85rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {movie.summary}
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <IconButton
          size="small"
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            mr: 1,
            '&:hover': { bgcolor: 'primary.dark' }
          }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/movie/${movie.id}`);
          }}
        >
          <PlayArrow />
        </IconButton>
        <IconButton
          size="small"
          sx={{
            border: '2px solid',
            borderColor: 'rgba(255,255,255,0.5)',
            color: 'white',
            '&:hover': { borderColor: 'white' }
          }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/movie/${movie.id}`);
          }}
        >
          <InfoOutlined />
        </IconButton>
      </CardActions>
    </Card>
  );

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Recommendations Section - Horizontal Scroll */}
      {recommendations.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 2, px: 1 }}>
            Empfohlen für Sie
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              overflowY: 'hidden',
              pb: 2,
              px: 1,
              '&::-webkit-scrollbar': {
                height: 8,
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: 'rgba(255,255,255,0.1)',
                borderRadius: 4,
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'rgba(255,255,255,0.3)',
                borderRadius: 4,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.5)',
                },
              },
            }}
          >
            {recommendations.map((rec, index) => (
              <MovieCard
                key={index}
                movie={{ ...rec.movie, reason: rec.reason }}
                isRecommendation={true}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Search */}
      <Box sx={{ mb: 4, px: 1 }}>
        <TextField
          fullWidth
          placeholder="Filme durchsuchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            maxWidth: 600,
            '& .MuiOutlinedInput-root': {
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.15)',
              },
              '&.Mui-focused': {
                bgcolor: 'rgba(255,255,255,0.15)',
              },
            },
          }}
        />
      </Box>

      {/* All Movies Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={600} sx={{ mb: 2, px: 1 }}>
          {searchTerm ? `Suchergebnisse (${filteredMovies.length})` : `Alle Filme (${filteredMovies.length})`}
        </Typography>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">Lade Filme...</Typography>
          </Box>
        ) : filteredMovies.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary">
              {searchTerm ? `Keine Filme gefunden für "${searchTerm}"` : 'Keine Filme verfügbar.'}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
                xl: 'repeat(5, 1fr)',
              },
              gap: 3,
              px: 1,
            }}
          >
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default AllMoviesList;
