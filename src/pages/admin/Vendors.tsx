import { useEffect, useState } from 'react';
import { Alert, Button, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { apiRequest } from '../../utils/api';

type Vendor = {
  _id: string;
  name: string;
  email: string;
  companyName: string;
  isApproved: boolean;
};

function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadVendors = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiRequest<{ vendors: Vendor[] }>('/admin/vendors');
      setVendors(response.vendors);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load vendors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadVendors();
  }, []);

  const approveVendor = async (vendorId: string) => {
    try {
      await apiRequest(`/admin/approve-vendor/${vendorId}`, { method: 'PUT' });
      await loadVendors();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to approve vendor.');
    }
  };

  const rejectVendor = async (vendorId: string) => {
    try {
      await apiRequest(`/admin/reject-vendor/${vendorId}`, { method: 'PUT' });
      await loadVendors();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to reject vendor.');
    }
  };

  if (loading) return <Typography>Loading vendors...</Typography>;

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        Vendor Management
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {vendors.length === 0 ? (
        <Typography color="text.secondary">No vendors found.</Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Company Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor._id}>
                <TableCell>{vendor.name}</TableCell>
                <TableCell>{vendor.email}</TableCell>
                <TableCell>{vendor.companyName || '-'}</TableCell>
                <TableCell>{vendor.isApproved ? 'Approved' : 'Pending'}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" onClick={() => approveVendor(vendor._id)}>
                      Approve
                    </Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => rejectVendor(vendor._id)}>
                      Reject
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Stack>
  );
}

export default Vendors;