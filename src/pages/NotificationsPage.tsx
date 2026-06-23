import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Fade,
  IconButton,
  Skeleton,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { apiRequest } from '../utils/api';
import { getStoredUser } from '../utils/auth';
import { syncSocketAuth } from '../utils/socket';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

type NotificationsResponse = {
  notifications: NotificationItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  unreadCount: number;
};

const typeIconMap: Record<string, JSX.Element> = {
  booking_confirmed: <ReceiptLongRoundedIcon fontSize="small" />,
  payment_success: <PaymentsRoundedIcon fontSize="small" />,
  payment_failed: <ErrorOutlineRoundedIcon fontSize="small" />,
  refund_processed: <DoneAllRoundedIcon fontSize="small" />,
  booking_cancelled: <ReceiptLongRoundedIcon fontSize="small" />,
  refund_failed: <ErrorOutlineRoundedIcon fontSize="small" />,
  admin_alert: <CampaignRoundedIcon fontSize="small" />,
};

const typeLabelMap: Record<string, string> = {
  booking_confirmed: 'Booking',
  payment_success: 'Payment',
  payment_failed: 'Payment issue',
  refund_processed: 'Refund',
  booking_cancelled: 'Cancellation',
  refund_failed: 'Refund issue',
  admin_alert: 'Admin alert',
};

const relativeTime = (value: string) => {
  const date = new Date(value).getTime();
  const diff = Math.max(0, Date.now() - date);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

function NotificationsPage() {
  const user = useMemo(() => getStoredUser(), []);
  const token = localStorage.getItem('busgoToken');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [pagination, setPagination] = useState<NotificationsResponse['pagination']>({ page: 1, limit: 12, total: 0, totalPages: 0, hasMore: false });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!token || !user) {
      setLoading(false);
      return;
    }

    const socket = syncSocketAuth();
    socket.connect();

    const handleNew = (payload: { notification?: NotificationItem }) => {
      if (!payload.notification) return;
      setNotifications((current) => [payload.notification!, ...current.filter((item) => item.id !== payload.notification!.id)].slice(0, 50));
      if (!payload.notification.isRead) {
        setUnreadCount((current) => current + 1);
      }
      setToast('New notification received.');
    };

    const handleCount = (payload: { unreadCount?: number }) => {
      if (typeof payload.unreadCount === 'number') {
        setUnreadCount(payload.unreadCount);
      }
    };

    socket.on('notification:new', handleNew);
    socket.on('notification:count', handleCount);

    Promise.all([
      apiRequest<NotificationsResponse>('/notifications?limit=12&sort=desc'),
      apiRequest<{ unreadCount: number }>('/notifications/unread-count'),
    ])
      .then(([listResponse, countResponse]) => {
        setNotifications(listResponse.notifications);
        setPagination(listResponse.pagination);
        setUnreadCount(countResponse.unreadCount);
      })
      .catch((fetchError) => setError(fetchError instanceof Error ? fetchError.message : 'Failed to load notifications.'))
      .finally(() => setLoading(false));

    return () => {
      socket.off('notification:new', handleNew);
      socket.off('notification:count', handleCount);
    };
  }, [token, user]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const loadMore = async () => {
    if (!pagination.hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = pagination.page + 1;
      const response = await apiRequest<NotificationsResponse>(`/notifications?page=${nextPage}&limit=${pagination.limit}&sort=desc`);
      setNotifications((current) => [...current, ...response.notifications]);
      setPagination(response.pagination);
      setUnreadCount(response.unreadCount);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load more notifications.');
    } finally {
      setLoadingMore(false);
    }
  };

  const markRead = async (id: string) => {
    setActionLoadingId(id);
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((current) => current.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)));
      setUnreadCount((current) => Math.max(0, current - 1));
      setToast('Notification marked as read.');
    } catch (markError) {
      setError(markError instanceof Error ? markError.message : 'Failed to mark notification as read.');
    } finally {
      setActionLoadingId('');
    }
  };

  const markUnread = async (id: string) => {
    setActionLoadingId(id);
    try {
      await apiRequest(`/notifications/${id}/unread`, { method: 'PATCH' });
      setNotifications((current) => current.map((notification) => (notification.id === id ? { ...notification, isRead: false } : notification)));
      setUnreadCount((current) => current + 1);
      setToast('Notification marked as unread.');
    } catch (markError) {
      setError(markError instanceof Error ? markError.message : 'Failed to mark notification as unread.');
    } finally {
      setActionLoadingId('');
    }
  };

  const deleteNotification = async (id: string) => {
    setActionLoadingId(id);
    try {
      await apiRequest(`/notifications/${id}`, { method: 'DELETE' });
      setNotifications((current) => current.filter((notification) => notification.id !== id));
      setToast('Notification deleted.');
      const unread = await apiRequest<{ unreadCount: number }>('/notifications/unread-count');
      setUnreadCount(unread.unreadCount);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete notification.');
    } finally {
      setActionLoadingId('');
    }
  };

  const markAllRead = async () => {
    try {
      await apiRequest('/notifications/read-all', { method: 'PATCH' });
      setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
      setUnreadCount(0);
      setToast('All notifications marked as read.');
    } catch (allError) {
      setError(allError instanceof Error ? allError.message : 'Failed to mark notifications as read.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f4ee', py: { xs: 3, md: 5 } }}>
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                Notifications
              </Typography>
              <Typography color="text.secondary">
                Track bookings, payments, refunds, and admin alerts in one place.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Chip label={`${unreadCount} unread`} color="primary" variant="outlined" />
              <Button variant="outlined" startIcon={<DoneAllRoundedIcon />} onClick={markAllRead} disabled={unreadCount === 0}>
                Mark all read
              </Button>
            </Stack>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}

          {loading ? (
            <Stack spacing={1.75}>
              {[1, 2, 3, 4].map((item) => (
                <Card key={item} elevation={0} sx={{ border: '1px solid rgba(23,49,59,0.10)' }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Skeleton variant="circular" width={44} height={44} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width="38%" />
                        <Skeleton width="82%" />
                        <Skeleton width="62%" />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : notifications.length === 0 ? (
            <Card elevation={0} sx={{ border: '1px solid rgba(23,49,59,0.10)' }}>
              <CardContent sx={{ py: 8 }}>
                <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(15,118,110,0.12)', color: 'primary.main' }}>
                    <NotificationsRoundedIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    No notifications yet
                  </Typography>
                  <Typography color="text.secondary" sx={{ maxWidth: 460 }}>
                    Booking confirmations, payment updates, refund progress, and admin alerts will appear here automatically.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={1.5}>
              {notifications.map((notification) => (
                <Fade key={notification.id} in timeout={220}>
                  <Card
                    elevation={0}
                    sx={{
                      border: '1px solid rgba(23,49,59,0.10)',
                      bgcolor: notification.isRead ? '#ffffff' : 'rgba(15,118,110,0.03)',
                    }}
                  >
                    <CardContent>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
                        <Avatar sx={{ bgcolor: 'rgba(15,118,110,0.10)', color: 'primary.main' }}>
                          {typeIconMap[notification.type] || <NotificationsRoundedIcon fontSize="small" />}
                        </Avatar>

                        <Box sx={{ flex: 1, width: '100%' }}>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ sm: 'center' }}>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>
                                {notification.title}
                              </Typography>
                              {!notification.isRead && <Chip size="small" color="primary" label="New" />}
                              <Chip size="small" label={typeLabelMap[notification.type] || notification.type} variant="outlined" />
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
                              <AccessTimeRoundedIcon fontSize="small" />
                              <Typography variant="caption">{relativeTime(notification.createdAt)}</Typography>
                            </Stack>
                          </Stack>

                          <Typography sx={{ mt: 1, color: 'text.secondary', lineHeight: 1.7 }}>{notification.message}</Typography>

                          <Divider sx={{ my: 1.75 }} />

                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {notification.isRead ? (
                              <Button size="small" variant="outlined" onClick={() => markUnread(notification.id)} disabled={actionLoadingId === notification.id}>
                                Mark unread
                              </Button>
                            ) : (
                              <Button size="small" variant="contained" onClick={() => markRead(notification.id)} disabled={actionLoadingId === notification.id}>
                                Mark read
                              </Button>
                            )}
                            <IconButton size="small" onClick={() => deleteNotification(notification.id)} disabled={actionLoadingId === notification.id}>
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Fade>
              ))}

              {pagination.hasMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
                  <Button variant="outlined" onClick={loadMore} disabled={loadingMore}>
                    {loadingMore ? 'Loading...' : 'Load more'}
                  </Button>
                </Box>
              )}
            </Stack>
          )}
        </Stack>
      </Container>

      <Snackbar open={Boolean(toast)} autoHideDuration={2200} onClose={() => setToast('')} message={toast} />
    </Box>
  );
}

export default NotificationsPage;