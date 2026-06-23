import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Popover,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { apiRequest } from '../../utils/api';
import { getStoredUser } from '../../utils/auth';
import { syncSocketAuth } from '../../utils/socket';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  relatedBooking?: string | null;
  relatedPayment?: string | null;
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

type NotificationBellProps = {
  compact?: boolean;
};

function NotificationBell({ compact = false }: NotificationBellProps) {
  const navigate = useNavigate();
  const user = useMemo(() => getStoredUser(), []);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hydrating, setHydrating] = useState(true);

  const open = Boolean(anchorEl);

  const fetchUnreadCount = async () => {
    const response = await apiRequest<{ unreadCount: number }>('/notifications/unread-count');
    setUnreadCount(response.unreadCount);
  };

  const fetchPreview = async () => {
    setLoading(true);
    try {
      const response = await apiRequest<{ notifications: NotificationItem[] }>('/notifications?limit=5&sort=desc');
      setNotifications(response.notifications);
      await fetchUnreadCount();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !localStorage.getItem('busgoToken')) {
      setHydrating(false);
      return;
    }

    let mounted = true;
    const socket = syncSocketAuth();
    socket.connect();

    const handleNewNotification = (payload: { notification?: NotificationItem }) => {
      if (!mounted || !payload.notification) return;
      setNotifications((current) => [payload.notification!, ...current.filter((item) => item.id !== payload.notification!.id)].slice(0, 5));
      setUnreadCount((current) => current + (payload.notification?.isRead ? 0 : 1));
    };

    const handleCountUpdate = (payload: { unreadCount?: number }) => {
      if (!mounted || typeof payload.unreadCount !== 'number') return;
      setUnreadCount(payload.unreadCount);
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('notification:count', handleCountUpdate);

    fetchUnreadCount()
      .catch(() => undefined)
      .finally(() => {
        if (mounted) {
          setHydrating(false);
        }
      });

    return () => {
      mounted = false;
      socket.off('notification:new', handleNewNotification);
      socket.off('notification:count', handleCountUpdate);
    };
  }, [user]);

  const handleOpen = async (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    await fetchPreview().catch(() => undefined);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markRead = async (notificationId: string) => {
    await apiRequest(`/notifications/${notificationId}/read`, { method: 'PATCH' });
    setNotifications((current) => current.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item)));
    await fetchUnreadCount().catch(() => undefined);
  };

  const markAllRead = async () => {
    await apiRequest('/notifications/read-all', { method: 'PATCH' });
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton onClick={handleOpen} color="inherit" aria-label="open notifications">
          <Badge badgeContent={hydrating ? undefined : unreadCount} color="error" max={99}>
            <NotificationsRoundedIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: { xs: 340, sm: 420 }, maxWidth: '90vw', borderRadius: 3, mt: 1 } }}
      >
        <Box sx={{ p: 2, bgcolor: '#fffdfa' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {unreadCount} unread
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button component={RouterLink} to="/notifications" size="small" onClick={handleClose}>
                Open center
              </Button>
              <Button size="small" variant="outlined" startIcon={<DoneAllRoundedIcon />} onClick={markAllRead} disabled={unreadCount === 0}>
                Mark all read
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ mb: 1.5 }} />

          {loading ? (
            <Stack spacing={1.5}>
              {[1, 2, 3].map((item) => (
                <Stack key={item} direction="row" spacing={1.5} alignItems="flex-start">
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="60%" />
                    <Skeleton width="85%" />
                    <Skeleton width="40%" />
                  </Box>
                </Stack>
              ))}
            </Stack>
          ) : notifications.length === 0 ? (
            <Stack spacing={1.2} alignItems="center" sx={{ py: 4 }}>
              <Avatar sx={{ bgcolor: 'rgba(15,118,110,0.12)', color: 'primary.main' }}>
                <NotificationsRoundedIcon />
              </Avatar>
              <Typography sx={{ fontWeight: 700 }}>No notifications yet</Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Booking, payment, and refund updates will appear here in real time.
              </Typography>
            </Stack>
          ) : (
            <List disablePadding sx={{ maxHeight: 480, overflow: 'auto' }}>
              {notifications.map((notification) => (
                <ListItemButton
                  key={notification.id}
                  alignItems="flex-start"
                  onClick={async () => {
                    if (!notification.isRead) {
                      await markRead(notification.id).catch(() => undefined);
                    }
                    navigate('/notifications');
                    handleClose();
                  }}
                  sx={{
                    mb: 1,
                    borderRadius: 2,
                    border: '1px solid rgba(23,49,59,0.08)',
                    bgcolor: notification.isRead ? '#ffffff' : 'rgba(15,118,110,0.04)',
                  }}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.4 }}>
                        <Avatar sx={{ width: 30, height: 30, bgcolor: 'rgba(15,118,110,0.10)', color: 'primary.main' }}>
                          {typeIconMap[notification.type] || <NotificationsRoundedIcon fontSize="small" />}
                        </Avatar>
                        <Typography sx={{ fontWeight: 700, lineHeight: 1.2 }}>{notification.title}</Typography>
                        {!notification.isRead && <Chip size="small" label="New" color="primary" />}
                      </Stack>
                    }
                    secondary={
                      <Stack spacing={0.8}>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <AccessTimeRoundedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                          <Typography variant="caption" color="text.secondary">
                            {relativeTime(notification.createdAt)}
                          </Typography>
                        </Stack>
                      </Stack>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
}

export default NotificationBell;