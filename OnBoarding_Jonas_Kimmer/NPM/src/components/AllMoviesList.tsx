import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, IconButton, Box, Card, CardContent, CardActions, Chip, TextField, Stack,
  FormControl, InputLabel, Select, MenuItem, Button, Rating
} from '@mui/material';
import {
  Favorite, FavoriteBorder, PlayArrow, InfoOutlined, Star, Delete as DeleteIcon
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

  // Filter States
  const [titleFilter, setTitleFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'all' | 'high' | 'medium' | 'low' | 'unrated'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'released' | 'rating'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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

  // Filter und Sort Logic
  useEffect(() => {
    let filtered = [...movies];

    if (titleFilter) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(titleFilter.toLowerCase())
      );
    }

    if (yearFilter) {
      filtered = filtered.filter(movie =>
        movie.released.toString().includes(yearFilter)
      );
    }

    if (ratingFilter !== 'all') {
      filtered = filtered.filter(movie => {
        const rating = movie.rating || 0;
        switch (ratingFilter) {
          case 'high':
            return rating >= 80;
          case 'medium':
            return rating >= 60 && rating < 80;
          case 'low':
            return rating > 0 && rating < 60;
          case 'unrated':
            return !movie.rating || movie.rating === 0;
          default:
            return true;
        }
      });
    }

    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === 'rating') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredMovies(filtered);
  }, [movies, titleFilter, yearFilter, ratingFilter, sortBy, sortOrder]);

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

  const handleRatingChange = async (movieId: number, newValue: number | null, event: React.SyntheticEvent) => {
    event.stopPropagation();
    if (newValue === null) return;

    try {
      const response = await fetch(`http://localhost:5157/api/movies/${movieId}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newValue)
      });

      if (response.ok) {
        const updatedMovies = movies.map(m =>
          m.id === movieId ? { ...m, userRating: newValue } : m
        );
        setMovies(updatedMovies);
      }
    } catch (error) {
      console.error('Fehler beim Rating-Update:', error);
    }
  };

  const handleDeleteRating = async (movieId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const response = await fetch(`http://localhost:5157/api/movies/${movieId}/rating`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const updatedMovies = movies.map(m =>
          m.id === movieId ? { ...m, userRating: null } : m
        );
        setMovies(updatedMovies);
      }
    } catch (error) {
      console.error('Fehler beim Rating-Löschen:', error);
    }
  };

  const MovieCard = ({ movie, isRecommendation = false }: { movie: any; isRecommendation?: boolean }) => (
    <Card
      sx={{
        minWidth: isRecommendation ? 280 : 300,
        maxWidth: isRecommendation ? 280 : 300,
        height: isRecommendation ? 420 : 480,
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

        {!isRecommendation && (
          <Box sx={{ mt: 2 }} onClick={(e) => e.stopPropagation()}>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Meine Bewertung:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Rating
                value={movie.userRating || 0}
                max={10}
                size="small"
                onChange={(e, newValue) => handleRatingChange(movie.id, newValue, e)}
              />
              {movie.userRating && (
                <>
                  <Typography variant="caption" color="text.secondary">
                    {movie.userRating}/10
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleDeleteRating(movie.id, e)}
                    sx={{ p: 0.5 }}
                  >
                    <DeleteIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  </IconButton>
                </>
              )}
            </Box>
          </Box>
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

      {/* Filter Section */}
      <Box sx={{ mb: 4, px: 1 }}>
        <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
          Alle Filme ({filteredMovies.length})
        </Typography>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ mb: 3, flexWrap: 'wrap' }}
        >
          <TextField
            label="Titel suchen"
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
            size="small"
            sx={{
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.05)',
              }
            }}
          />

          <TextField
            label="Jahr"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            size="small"
            sx={{
              minWidth: 120,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.05)',
              }
            }}
          />

          <FormControl
            size="small"
            sx={{
              minWidth: 160,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.05)',
              }
            }}
          >
            <InputLabel>Rating</InputLabel>
            <Select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value as any)}
              label="Rating"
            >
              <MenuItem value="all">Alle</MenuItem>
              <MenuItem value="high">Hoch (80-100)</MenuItem>
              <MenuItem value="medium">Mittel (60-79)</MenuItem>
              <MenuItem value="low">Niedrig (1-59)</MenuItem>
              <MenuItem value="unrated">Ohne Rating</MenuItem>
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              minWidth: 140,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.05)',
              }
            }}
          >
            <InputLabel>Sortieren</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              label="Sortieren"
            >
              <MenuItem value="title">Titel</MenuItem>
              <MenuItem value="released">Jahr</MenuItem>
              <MenuItem value="rating">Rating</MenuItem>
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              minWidth: 120,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.05)',
              }
            }}
          >
            <InputLabel>Reihenfolge</InputLabel>
            <Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              label="Reihenfolge"
            >
              <MenuItem value="asc">Aufsteigend</MenuItem>
              <MenuItem value="desc">Absteigend</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={() => {
              setTitleFilter('');
              setYearFilter('');
              setRatingFilter('all');
              setSortBy('title');
              setSortOrder('asc');
            }}
            sx={{
              borderColor: 'rgba(255,255,255,0.3)',
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255,255,255,0.05)',
              }
            }}
          >
            Zurücksetzen
          </Button>
        </Stack>
      </Box>

      {/* All Movies Section */}
      <Box sx={{ mb: 4 }}>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">Lade Filme...</Typography>
          </Box>
        ) : filteredMovies.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary">
              {titleFilter || yearFilter || ratingFilter !== 'all'
                ? 'Keine Filme gefunden, die den Filterkriterien entsprechen.'
                : 'Keine Filme verfügbar.'}
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
                xl: 'repeat(6, 1fr)',
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
