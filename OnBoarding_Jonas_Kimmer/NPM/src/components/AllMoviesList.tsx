import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper, Typography, Button, Rating, IconButton, Box, Alert, Card, CardContent, CardActions,
  TextField, FormControl, InputLabel, Select, MenuItem, Chip, Stack, Grid, Fade
} from '@mui/material';
import {
  Favorite, FavoriteBorder, Delete as DeleteIcon, InfoOutlined, Star
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
  const [showRecommendations, setShowRecommendations] = useState(true);

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
      console.log('🔄 Lade beliebte Empfehlungen...');
      const response = await fetch('http://localhost:5157/api/recommendations/popular?count=8');
      console.log('📡 Response Status:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('🌟 Empfehlungen Antwort:', data);
        console.log('🌟 Typ:', Array.isArray(data) ? 'Array' : typeof data);
        console.log('🌟 Anzahl:', Array.isArray(data) ? data.length : 'Kein Array');

        // Check ob data ein Array ist oder ein Objekt mit recommendations
        if (Array.isArray(data)) {
          console.log('✅ Setze Empfehlungen (Array):', data.length);
          setRecommendations(data);
        } else if (data.recommendations && Array.isArray(data.recommendations)) {
          console.log('✅ Setze Empfehlungen (Object.recommendations):', data.recommendations.length);
          setRecommendations(data.recommendations);
        } else {
          console.log('❌ Unerwartetes Datenformat:', data);
        }
      } else {
        console.log('❌ Response nicht OK:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Fehler beim Laden der Empfehlungen:', error);
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

  const handleFavoriteToggle = async (movieId: number) => {
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

  const handleRatingChange = async (movieId: number, newValue: number | null) => {
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

  const handleDeleteRating = async (movieId: number) => {
    try {
      const response = await fetch(`http://localhost:5157/api/movies/${movieId}/rating`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const updatedMovies = movies.map(m =>
          m.id === movieId ? { ...m, userRating: undefined } : m
        );
        setMovies(updatedMovies);
      }
    } catch (error) {
      console.error('Fehler beim Rating-Löschen:', error);
    }
  };

  if (error) {
    return (
      <Paper sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Empfehlungen Sektion */}
      {recommendations.length > 0 && (
        <Fade in={true}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 3
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Star sx={{ mr: 1, fontSize: 28 }} />
              <Typography variant="h5" fontWeight={600}>
                Beliebte Empfehlungen
              </Typography>
              <Chip
                label={recommendations.length}
                sx={{ ml: 2, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              <Button
                variant="text"
                size="small"
                onClick={() => setShowRecommendations(!showRecommendations)}
                sx={{ ml: 'auto', color: 'white' }}
              >
                {showRecommendations ? 'Ausblenden' : 'Anzeigen'}
              </Button>
            </Box>

            {showRecommendations && (
              <Grid container spacing={2}>
                {recommendations.map((rec, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                    <Card
                      sx={{
                        height: '100%',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 6
                        }
                      }}
                      onClick={() => navigate(`/movie/${rec.movie.id}`)}
                    >
                      <CardContent>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {rec.movie.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {rec.movie.released}
                        </Typography>
                        {rec.movie.rating && (
                          <Chip
                            label={`${rec.movie.rating}/100`}
                            size="small"
                            color="primary"
                            sx={{ mb: 1 }}
                          />
                        )}
                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'primary.main', mb: 1 }}>
                          {rec.reason}
                        </Typography>
                        {rec.movie.summary && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                            {rec.movie.summary.length > 100
                              ? rec.movie.summary.substring(0, 100) + '...'
                              : rec.movie.summary
                            }
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Fade>
      )}

      {/* Filter Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
          Alle Filme ({filteredMovies.length})
        </Typography>

        <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} sx={{ mb: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Titel suchen"
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
          />

          <TextField
            label="Jahr"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
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

          <FormControl size="small" sx={{ minWidth: 140 }}>
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

          <FormControl size="small" sx={{ minWidth: 120 }}>
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
          >
            Zurücksetzen
          </Button>
        </Stack>
      </Paper>

      {/* Movies Grid */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">Lade Filme...</Typography>
        </Box>
      ) : filteredMovies.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {titleFilter || yearFilter || ratingFilter !== 'all'
              ? 'Keine Filme gefunden, die den Filterkriterien entsprechen.'
              : 'Keine Filme verfügbar.'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredMovies.map((movie) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 1, pr: 1 }}>
                      {movie.title}
                    </Typography>
                    <IconButton
                      onClick={() => handleFavoriteToggle(movie.id)}
                      color="error"
                      size="small"
                    >
                      {movie.isFavorite ? <Favorite /> : <FavoriteBorder />}
                    </IconButton>
                  </Box>

                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip label={movie.released} size="small" variant="outlined" />
                    {movie.rating && (
                      <Chip
                        label={`${movie.rating}/100`}
                        size="small"
                        color="primary"
                      />
                    )}
                  </Stack>

                  {movie.tagline && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontStyle: 'italic', mb: 1 }}
                    >
                      "{movie.tagline}"
                    </Typography>
                  )}

                  {movie.actors && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Cast:</strong> {movie.actors.substring(0, 50)}
                      {movie.actors.length > 50 ? '...' : ''}
                    </Typography>
                  )}

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Meine Bewertung:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating
                        value={movie.userRating || 0}
                        max={10}
                        onChange={(_, newValue) => handleRatingChange(movie.id, newValue)}
                        size="small"
                      />
                      {movie.userRating && (
                        <>
                          <Typography variant="caption">
                            {movie.userRating}/10
                          </Typography>
                          <IconButton
                            onClick={() => handleDeleteRating(movie.id)}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<InfoOutlined />}
                    onClick={() => navigate(`/movie/${movie.id}`)}
                  >
                    Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default AllMoviesList;
