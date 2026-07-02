import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

const theme = createTheme({
  typography: {
    fontFamily: '"Play", "Inter", sans-serif',
  },
  palette: {
    primary: {
      main: '#9155FD', // Materio Purple
      light: '#9E69FD',
      dark: '#804BDF',
      contrastText: '#FFF',
    },
    secondary: {
      main: '#8A8D93',
      light: '#A0A3A9',
      dark: '#797C82',
    },
    background: {
      default: '#F4F5FA',
      paper: '#FFFFFF',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(145, 85, 253, 0.4)',
          }
        },
      },
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
