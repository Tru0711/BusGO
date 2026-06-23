import { useEffect, useState } from 'react';
import { Alert, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { apiRequest } from '../../utils/api';

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'vendor' | 'admin';
};

function Users() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<{ users: AdminUser[] }>('/admin/users')
      .then((response) => setUsers(response.users))
      .catch((fetchError) => setError(fetchError instanceof Error ? fetchError.message : 'Failed to load users.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Typography>Loading users...</Typography>;

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        User Management
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {users.length === 0 ? (
        <Typography color="text.secondary">No users found.</Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Stack>
  );
}

export default Users;