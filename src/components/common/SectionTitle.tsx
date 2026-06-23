import { Stack, Typography } from '@mui/material';

type SectionTitleProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

function SectionTitle({ eyebrow, title, subtitle }: SectionTitleProps) {
  return (
    <Stack spacing={1.25} sx={{ maxWidth: 760, mb: 3 }}>
      <Typography variant="overline" color="primary" sx={{ letterSpacing: '0.18em', fontWeight: 700 }}>
        {eyebrow}
      </Typography>
      <Typography variant="h3" component="h2" sx={{ fontSize: { xs: '1.9rem', md: '2.55rem' } }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography color="text.secondary" sx={{ fontSize: '1.02rem' }}>
          {subtitle}
        </Typography>
      )}
    </Stack>
  );
}

export default SectionTitle;
