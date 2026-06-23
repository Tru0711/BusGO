import { Avatar, Card, CardContent, Stack, Typography } from '@mui/material';

type Props = {
  name: string;
  email: string;
  phone: string;
};

function ProfileSummary({ name, email, phone }: Props) {
  return (
    <Card elevation={0} sx={{ border: '1px solid rgba(23,49,59,0.10)', borderRadius: 3 }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>{(name || 'U').charAt(0).toUpperCase()}</Avatar>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Profile Summary</Typography>
          </Stack>
          <Typography>Name: {name}</Typography>
          <Typography>Email: {email}</Typography>
          <Typography>Mobile Number: {phone || 'N/A'}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default ProfileSummary;
