import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Paper, Typography, Button, Box, Rating, IconButton, 
  Chip, Divider, Alert, CircularProgress
} from '@mui/material';
import {
  Delete as DeleteIcon, Favorite, FavoriteBorder, ArrowBack
} from '@mui/icons-material';

interface Movie {
  id: number;
  title: string;
  released: number;
  rating?: number;
  userRating?: number;
  summary?: string;
  tagline?: string;
  actors?: string;
  director?: string; // hinzugefügt
  isFavorite?: boolean;
}

function MovieDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const loadMovie = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Lade Film-Details
        const movieResponse = await fetch(`http://localhost:5157/api/movies/${id}`);
        if (!movieResponse.ok) throw new Error('Film nicht gefunden');
        const movieData = await movieResponse.json();
        
        // Lade ALLE Actors separat für Detailseite
        const actorsResponse = await fetch(`http://localhost:5157/api/movies/${id}/actors`);
        if (actorsResponse.ok) {
          const actorsData = await actorsResponse.json();
          const allActorNames = actorsData.map((actor: any) => actor.name).join(", ");
          movieData.actors = allActorNames; // Überschreibe mit allen Actors
        }
        
        setMovie(movieData);
      } catch (err) {
        console.error('Fehler beim Laden:', err);
        setError('Film konnte nicht geladen werden');
      } finally {
        setLoading(false);
      }
    };

    loadMovie();
  }, [id]);

  const handleRatingChange = async (_: any, newValue: number | null) => {
    if (!movie || newValue === null) return;
    
    try {
      const response = await fetch(`http://localhost:5157/api/movies/${movie.id}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newValue)
      });
      
      if (response.ok) {
        setMovie(prev => prev ? { ...prev, userRating: newValue } : null);
      }
    } catch (error) {
      console.error('Fehler beim Rating-Update:', error);
    }
  };

  const handleDeleteRating = async () => {
    if (!movie) return;
    
    try {
      const response = await fetch(`http://localhost:5157/api/movies/${movie.id}/rating`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setMovie(prev => prev ? { ...prev, userRating: undefined } : null);
      }
    } catch (error) {
      console.error('Fehler beim Rating-Löschen:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!movie) return;
    
    try {
      const method = movie.isFavorite ? 'DELETE' : 'POST';
      const response = await fetch(`http://localhost:5157/api/movies/${movie.id}/favorite`, {
        method,
      });
      
      if (response.ok) {
        setMovie(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
      }
    } catch (error) {
      console.error('Fehler beim Favorite-Update:', error);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Lade Film-Details...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Zurück zur Übersicht
        </Button>
      </Container>
    );
  }

  if (!movie) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">Film nicht gefunden.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Button 
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
          >
            Zurück zur Übersicht
          </Button>
          
          <IconButton
            onClick={handleFavoriteToggle}
            color="error"
            size="large"
          >
            {movie.isFavorite ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        </Box>
        
        <Typography variant="h3" gutterBottom>
          {movie.title}
        </Typography>
        
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {movie.released}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Bewertungen
          </Typography>
          
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6">Offizielles Rating:</Typography>
            <Chip
              label={movie.rating ? `${movie.rating}/100` : 'Keine Bewertung'}
              color={movie.rating ? 'primary' : 'default'}
              variant={movie.rating ? 'filled' : 'outlined'}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="h6">Meine Bewertung:</Typography>
            <Rating
              name="movie-user-rating"
              value={movie.userRating || 0}
              max={10}
              onChange={handleRatingChange}
              size="large"
            />
            {movie.userRating && (
              <IconButton 
                onClick={handleDeleteRating}
                size="small"
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {movie.userRating ? `${movie.userRating}/10` : 'Keine Bewertung'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {movie.actors && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Hauptdarsteller
            </Typography>
            <Typography variant="body1">
              {movie.actors}
            </Typography>
          </Box>
        )}

        {movie.director && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Regisseur
            </Typography>
            <Typography variant="body1">
              {movie.director}
            </Typography>
          </Box>
        )}

        {movie.summary && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Beschreibung
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
              {movie.summary}
            </Typography>
          </Box>
        )}

        {movie.tagline && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tagline
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontStyle: 'italic',
                fontSize: '1.1rem',
                color: 'text.secondary' 
              }}
            >
              "{movie.tagline}"
            </Typography>
          </Box>
        )}

        {!movie.summary && !movie.tagline && !movie.actors && (
          <Typography variant="body1" sx={{ mt: 4, color: 'text.secondary', textAlign: 'center' }}>
            Keine weiteren Details verfügbar.
          </Typography>
        )}
      </Paper>
    </Container>
  );
}

export default MovieDetails;