import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/router';

export default function Custom500() {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <Typography variant="h1" component="h1" gutterBottom>
        500
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom>
        Server Error
      </Typography>
      <Button variant="contained" onClick={() => router.push('/')} sx={{ mt: 2 }}>
        Go Home
      </Button>
    </Box>
  );
}