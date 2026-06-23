import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import AirlineSeatReclineExtraRoundedIcon from '@mui/icons-material/AirlineSeatReclineExtraRounded';
import BusAlertRoundedIcon from '@mui/icons-material/BusAlertRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import SectionTitle from '../common/SectionTitle';
import { busCategories } from '../../data/homeContent';

const iconMap = [AirlineSeatReclineExtraRoundedIcon, BusAlertRoundedIcon, StarBorderRoundedIcon, WorkspacePremiumRoundedIcon];

function BusCategoriesSection() {
  return (
    <Box component="section" sx={{ scrollMarginTop: 110 }}>
      <SectionTitle
        eyebrow="Bus categories"
        title="Choose the bus type that fits the journey"
        subtitle="A clean category grid helps users understand comfort level before they search."
      />
      <Grid container spacing={2.5}>
        {busCategories.map((category, index) => {
          const Icon = iconMap[index % iconMap.length];

          return (
            <Grid item xs={12} sm={6} lg={3} key={category.title}>
              <Card elevation={0} sx={{ height: '100%', border: '1px solid rgba(17, 50, 74, 0.08)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={1.5}>
                    <Box sx={{ color: 'primary.main' }}>
                      <Icon />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {category.title}
                    </Typography>
                    <Typography color="text.secondary">{category.description}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

export default BusCategoriesSection;