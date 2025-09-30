import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  flex: 1,
  backgroundColor: 'black',
  color: 'grey.200',
  borderRadius: '0.6rem',
  borderStyle: 'solid',
  borderWidth: '0.13rem',
  borderColor: theme.palette.success.main,
  overflowY: 'auto',
  fontFamily: 'SF Mono, Consolas, monospace',
  fontSize: 14,
  minHeight: '90vh',
  height: '90vh',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
}));

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<object>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<object>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth={false} sx={{ flex: 1, display: 'flex', flexDirection: 'column', mt: 3 }}>
          <Box sx={{ position: 'relative', overflow: 'hidden' }}>
            <StyledPaper>
              <Box sx={{ p: 2, flex: 1, textAlign: 'center' }}>
                <Typography variant="h1" color="error">
                  {this.state.error?.name || 'Error'}
                </Typography>
                <Box bgcolor="error" padding={2} borderRadius={6}>
                  <Typography variant="body1">An unexpected error occurred</Typography>
                  <br />
                  <Typography variant="body2">{this.state.error?.message || 'Unknown error'}</Typography>
                </Box>
                <Box marginTop={2}>
                  <Button 
                    variant="contained" 
                    onClick={this.handleReset}
                    sx={{ 
                      backgroundColor: 'success.main',
                      '&:hover': { backgroundColor: 'success.dark' }
                    }}
                  >
                    Try Again
                  </Button>
                </Box>
              </Box>
            </StyledPaper>
          </Box>
          <Typography variant="caption" color="grey.400" align="center" paddingTop={1}>
            All Rights Reserved &copy; 2025
          </Typography>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;