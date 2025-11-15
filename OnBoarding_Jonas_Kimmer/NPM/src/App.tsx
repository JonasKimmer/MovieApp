import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Paper, Typography } from '@mui/material';

import AllMoviesList from './components/AllMoviesList';
import MovieDetails from './components/MovieDetails';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function HomePage() {
  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Movie Database
        </Typography>
        
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Entdecken Sie Filme, bewerten Sie sie und erhalten Sie personalisierte Empfehlungen
        </Typography>
        
        <AllMoviesList />
      </Paper>
    </Container>
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