import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Box, Typography, AppBar, Toolbar } from '@mui/material';
import { Movie as MovieIcon } from '@mui/icons-material';

import AllMoviesList from './components/AllMoviesList';
import MovieDetails from './components/MovieDetails';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#E50914',
      dark: '#b20710',
      light: '#ff1e2a',
    },
    secondary: {
      main: '#ffffff',
      dark: '#b3b3b3',
    },
    background: {
      default: '#141414',
      paper: '#181818',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
  },
  typography: {
    fontFamily: '"Netflix Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
    h3: {
      fontWeight: 700,
      fontSize: '2.8rem',
      letterSpacing: '-0.5px',
    },
    h4: {
      fontWeight: 700,
      fontSize: '2rem',
      letterSpacing: '-0.5px',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.1rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#2f2f2f',
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)',
            zIndex: 10,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 4,
        },
      },
    },
  },
});

function HomePage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
          <Typography
            variant="h4"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              color: '#E50914',
              letterSpacing: '-1px'
            }}
          >
            MOVIEFLIX
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
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