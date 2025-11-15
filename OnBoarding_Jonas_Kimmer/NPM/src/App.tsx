import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Box, Typography, AppBar, Toolbar } from '@mui/material';
import { Movie as MovieIcon } from '@mui/icons-material';

import AllMoviesList from './components/AllMoviesList';
import MovieDetails from './components/MovieDetails';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#e50914',
      dark: '#b20710',
      light: '#ff1e2a',
    },
    secondary: {
      main: '#221f1f',
      light: '#3a3737',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h6: {
      fontWeight: 400,
      fontSize: '1.1rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 4px 8px rgba(0,0,0,0.08)',
    '0px 6px 12px rgba(0,0,0,0.1)',
    '0px 8px 16px rgba(0,0,0,0.12)',
    '0px 10px 20px rgba(0,0,0,0.14)',
    '0px 12px 24px rgba(0,0,0,0.16)',
    '0px 14px 28px rgba(0,0,0,0.18)',
    '0px 16px 32px rgba(0,0,0,0.2)',
    ...Array(16).fill('0px 2px 4px rgba(0,0,0,0.1)'),
  ],
});

function HomePage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'secondary.main' }}>
        <Toolbar>
          <MovieIcon sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Movie Database
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom sx={{ color: 'secondary.main' }}>
            Entdecken Sie Ihre nächsten Lieblingsfilme
          </Typography>

          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Bewerten Sie Filme und erhalten Sie personalisierte Empfehlungen
          </Typography>
        </Box>

        <AllMoviesList />
      </Container>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;