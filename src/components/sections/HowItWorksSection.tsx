import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import SectionTitle from '../common/SectionTitle';
import { bookingSteps } from '../../data/homeContent';

interface Step {
  number: number;
  title: string;
  description: string;
}

function HowItWorksSection() {
  return (
    <Box component="section" id="how-it-works" sx={{ scrollMarginTop: 110 }}>
      <SectionTitle
        eyebrow="How It Works"
        title="A clear four-step booking flow"
        subtitle=""
      />
      <Grid container spacing={2.5}>
        {bookingSteps.map((step: Step) => (
          <Grid item xs={12} sm={6} lg={3} key={step.number}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                border: '1px solid rgba(17, 50, 74, 0.08)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 'auto -20px -20px auto',
                  fontSize: '5.5rem',
                  fontWeight: 800,
                  color: 'rgba(11, 107, 203, 0.06)',
                  lineHeight: 1,
                  pointerEvents: 'none',
                }}
              >
                {step.number}
              </Box>
              <CardContent sx={{ p: 3, position: 'relative' }}>
                <Stack spacing={1.5}>
                  <Typography variant="overline" color="primary" sx={{ fontWeight: 800 }}>
                    Step {step.number}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {step.title}
                  </Typography>
                  <Typography color="text.secondary">{step.description}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default HowItWorksSection;
