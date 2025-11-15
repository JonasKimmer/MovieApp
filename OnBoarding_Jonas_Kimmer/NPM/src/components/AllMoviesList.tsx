import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper, Typography, Button, Rating, IconButton, Box, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  Favorite, FavoriteBorder, Delete as DeleteIcon
} from '@mui/icons-material';
import { MoviesService } from '../services/movies';

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

  // Filter und Sort Logic bleibt gleich...
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
      {/* Einfache Empfehlungen Sektion */}
      {recommendations.length > 0 && (
        <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              💡 Beliebte Empfehlungen ({recommendations.length})
            </Typography>
            <Button 
              variant="text" 
              size="small" 
              onClick={() => setShowRecommendations(!showRecommendations)}
              sx={{ ml: 'auto' }}
            >
              {showRecommendations ? 'Ausblenden' : 'Anzeigen'}
            </Button>
          </Box>
          
          {showRecommendations && (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
              {recommendations.map((rec, index) => (
                <Paper 
                  key={index}
                  sx={{ 
                    p: 2, 
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#e3f2fd' }
                  }}
                  onClick={() => navigate(`/movie/${rec.movie.id}`)}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    {rec.movie.title} ({rec.movie.released})
                  </Typography>
                  {rec.movie.rating && (
                    <Typography variant="body2" color="primary">
                      Rating: {rec.movie.rating}/100
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary' }}>
                    {rec.reason}
                  </Typography>
                  {rec.movie.summary && (
                    <Typography variant="body2" sx={{ mt: 1, fontSize: '0.85rem' }}>
                      {rec.movie.summary.length > 120 
                        ? rec.movie.summary.substring(0, 120) + '...'
                        : rec.movie.summary
                      }
                    </Typography>
                  )}
                </Paper>
              ))}
            </Box>
          )}
        </Paper>
      )}

      {/* Debug Info */}
      {recommendations.length === 0 && (
        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#fff3e0' }}>
          <Typography variant="body2">
            Debug: Keine Empfehlungen geladen. Prüfen Sie die Console für Details.
          </Typography>
        </Paper>
      )}

      {/* Hauptfilmliste bleibt gleich */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Alle Filme ({filteredMovies.length} von {movies.length} Filmen)
        </Typography>
        
        {/* Filter Controls */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Titel filtern"
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
          />
          
          <TextField
            label="Jahr filtern"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Rating filtern</InputLabel>
            <Select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value as any)}
              label="Rating filtern"
            >
              <MenuItem value="all">Alle Ratings</MenuItem>
              <MenuItem value="high">Hoch (80-100)</MenuItem>
              <MenuItem value="medium">Mittel (60-79)</MenuItem>
              <MenuItem value="low">Niedrig (1-59)</MenuItem>
              <MenuItem value="unrated">Ohne Rating</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Sortieren nach</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              label="Sortieren nach"
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
            Filter zurücksetzen
          </Button>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Titel</strong></TableCell>
                <TableCell><strong>Jahr</strong></TableCell>
                <TableCell><strong>Rating</strong></TableCell>
                <TableCell><strong>Hauptdarsteller</strong></TableCell>
                <TableCell><strong>Meine Bewertung</strong></TableCell>
                <TableCell><strong>Aktionen</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography>Lade Filme...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredMovies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">
                      {titleFilter || yearFilter || ratingFilter !== 'all' ? 'Keine Filme gefunden, die den Filterkriterien entsprechen.' : 'Keine Filme verfügbar.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMovies.map((movie) => (
                  <TableRow key={movie.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                        {movie.title}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>{movie.released}</TableCell>
                    
                    <TableCell>
                      {movie.rating ? `${movie.rating}/100` : '–'}
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {movie.actors || '–'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating
                          value={movie.userRating || 0}
                          max={10}
                          onChange={(_, newValue) => handleRatingChange(movie.id, newValue)}
                          size="small"
                        />
                        {movie.userRating && (
                          <IconButton 
                            onClick={() => handleDeleteRating(movie.id)}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                        <Typography variant="caption">
                          {movie.userRating ? `${movie.userRating}/10` : '–'}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          onClick={() => handleFavoriteToggle(movie.id)}
                          color="error"
                          size="small"
                        >
                          {movie.isFavorite ? <Favorite /> : <FavoriteBorder />}
                        </IconButton>
                        
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => navigate(`/movie/${movie.id}`)}
                        >
                          Details
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default AllMoviesList;