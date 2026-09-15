import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  ExternalLink, 
  PlusCircle, 
  RefreshCw, 
  Trash2, 
  Info,
  Radio,
  Volume2,
  VolumeX
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ActivityLog, Profile } from '../types';
import { Avatar } from './Avatar';
import { playNotificationSound, isNotificationSoundEnabled, setNotificationSoundEnabled } from '../lib/sound';

interface NotificationBellProps {
  profile: Profile | null;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(diffInSeconds) || diffInSeconds < 0) return 'Vừa xong';
  if (diffInSeconds < 60) return 'Vừa xong';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} ngày trước`;

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getActionMiniIcon(actionType: string) {
  switch (actionType) {
    case 'create_order':
      return <PlusCircle size={9} strokeWidth={2.6} />;
    case 'update_status':
    case 'update_order':
      return <RefreshCw size={8} strokeWidth={2.6} />;
    case 'delete_order':
      return <Trash2 size={8} strokeWidth={2.6} />;
    default:
      return <Info size={8} strokeWidth={2.6} />;
  }
}

export function NotificationBell({ profile }: NotificationBellProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isRinging, setIsRinging] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(isNotificationSoundEnabled);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSoundChange = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setSoundEnabled(customEvent.detail);
    };
    window.addEventListener('tourflow_sound_setting_changed', handleSoundChange);
    return () => window.removeEventListener('tourflow_sound_setting_changed', handleSoundChange);
  }, []);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    setNotificationSoundEnabled(nextState);
    if (nextState) {
      playNotificationSound(true);
    }
  };

  const storageKey = profile ? `tourflow_notif_last_read_${profile.id}` : null;

  // Lấy danh sách thông báo ban đầu
  const loadNotifications = useCallback(async () => {
    if (!profile) return;
    try {
      let query = supabase
        .from('activity_logs')
        .select(`
          *,
          actor:profiles!activity_logs_actor_id_fkey(display_name, username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      // Nếu là Saler: chỉ lấy thông báo liên quan đến bản thân (đơn của mình hoặc do mình thao tác)
      // Saler A và Saler B tuyệt đối không nhận thông báo của nhau
      if (profile.role !== 'admin') {
        query = query.or(`target_user_id.eq.${profile.id},actor_id.eq.${profile.id}`);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Lỗi khi tải thông báo:', error);
        return;
      }

      const fetchedLogs = (data || []) as ActivityLog[];
      setLogs(fetchedLogs);

      // Đếm số thông báo chưa đọc dựa trên mốc lưu trữ
      const lastRead = storageKey ? localStorage.getItem(storageKey) : null;
      if (lastRead) {
        const lastReadTime = new Date(lastRead).getTime();
        const unread = fetchedLogs.filter(
          log => new Date(log.created_at).getTime() > lastReadTime
        ).length;
        setUnreadCount(unread);
      } else {
        setUnreadCount(Math.min(fetchedLogs.length, 9));
      }
    } catch (e) {
      console.error('Lỗi notification bell:', e);
    }
  }, [profile, storageKey]);

  // Đánh dấu tất cả là đã đọc
  const markAllAsRead = useCallback(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, new Date().toISOString());
    }
    setUnreadCount(0);
  }, [storageKey]);

  // Lắng nghe Realtime qua Supabase WebSocket
  useEffect(() => {
    if (!profile) return;

    loadNotifications();

    const channel = supabase
      .channel(`realtime-bell-global-${profile.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_logs' },
        async payload => {
          const newRow = payload.new as ActivityLog;

          // PHÂN QUYỀN NHẬN THÔNG BÁO VÀ ÂM THANH:
          // 1. Admin nhận từ tất cả Salers và từ chính Admin.
          // 2. Saler chỉ nhận từ Admin (thao tác trên đơn của Saler đó) và từ chính mình.
          // 3. Saler A và Saler B TUYỆT ĐỐI KHÔNG nhận thông báo của nhau.
          const isRelevantToMe =
            profile.role === 'admin' ||
            newRow.target_user_id === profile.id ||
            newRow.actor_id === profile.id;

          if (!isRelevantToMe) {
            return;
          }

          // Lấy thông tin profile người thực hiện (nếu có)
          if (newRow.actor_id) {
            try {
              const { data: actorProfile } = await supabase
                .from('profiles')
                .select('display_name, username, avatar_url')
                .eq('id', newRow.actor_id)
                .maybeSingle();

              if (actorProfile) {
                newRow.actor = actorProfile;
              }
            } catch {
              // fallback
            }
          }

          // Thêm log mới vào đầu danh sách
          setLogs(prev => [newRow, ...prev.slice(0, 19)]);
          setUnreadCount(prev => prev + 1);

          // Kích hoạt hiệu ứng rung chuông và PHÁT ÂM THANH THÔNG BÁO
          setIsRinging(true);
          playNotificationSound();
          setTimeout(() => setIsRinging(false), 1200);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, loadNotifications]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Bật/tắt dropdown
  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && unreadCount > 0) {
      // Tự động đánh dấu đã đọc khi người dùng mở chuông xem
      markAllAsRead();
    }
  };

  const handleNavigateToDetails = () => {
    setIsOpen(false);
    if (profile?.role === 'admin') {
      navigate('/admin/activity');
    } else {
      navigate('/orders');
    }
  };

  const handleItemClick = (log: ActivityLog) => {
    setIsOpen(false);
    const match = log.description.match(/ORD-[A-Za-z0-9]+/i);
    if (['create_order', 'update_status', 'update_order'].includes(log.action_type) && match) {
      navigate(`/orders/${match[0]}`);
    } else {
      handleNavigateToDetails();
    }
  };

  return (
    <div className="notif-bell-container" ref={dropdownRef}>
      <button
        className={`notif-bell-btn ${isRinging ? 'ring-active' : ''} ${isOpen ? 'open' : ''}`}
        onClick={handleToggle}
        title={unreadCount > 0 ? `${unreadCount} thông báo mới` : 'Thông báo'}
        aria-label="Thông báo hoạt động"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="notif-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <div className="notif-header-title">
              <b>Thông báo hoạt động</b>
              <span className="notif-live-indicator">
                <Radio size={11} className="notif-live-icon" /> Realtime
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className={`notif-sound-btn ${soundEnabled ? 'active' : ''}`}
                onClick={toggleSound}
                title={soundEnabled ? 'Âm thanh thông báo: Đang bật (Bấm để tắt)' : 'Âm thanh thông báo: Đang tắt (Bấm để bật)'}
                aria-label="Bật/Tắt âm thanh thông báo"
              >
                {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
              </button>

              {unreadCount > 0 ? (
                <button
                  className="notif-mark-read-btn"
                  onClick={markAllAsRead}
                  title="Đánh dấu tất cả đã đọc"
                >
                  <CheckCheck size={14} /> Đã đọc
                </button>
              ) : (
                <span className="notif-role-tag">
                  {profile?.role === 'admin' ? 'Hệ thống' : 'Đơn của bạn'}
                </span>
              )}
            </div>
          </div>

          <div className="notif-list">
            {logs.length === 0 ? (
              <div className="notif-empty">
                <div className="notif-empty-icon">
                  <Bell size={24} />
                </div>
                <b>Chưa có thông báo nào</b>
                <p>Nhật ký các thao tác tạo và cập nhật đơn tour sẽ hiển thị ngay tại đây.</p>
              </div>
            ) : (
              logs.map(log => {
                const isMyAction = profile && log.actor_id === profile.id;
                const actorName = isMyAction
                  ? 'Bạn'
                  : (log.actor?.display_name || log.actor?.username || 'Quản trị viên');
                const avatarSrc = isMyAction ? (profile?.avatar_url || log.actor?.avatar_url) : log.actor?.avatar_url;
                const avatarName = isMyAction ? (profile?.display_name || profile?.username) : (log.actor?.display_name || log.actor?.username);

                return (
                  <div
                    key={log.id}
                    className="notif-item"
                    onClick={() => handleItemClick(log)}
                  >
                    <div className="notif-avatar-wrapper">
                      <Avatar
                        src={avatarSrc}
                        name={avatarName}
                        size="xs"
                        className="notif-avatar"
                      />
                      <span className={`notif-action-badge action-${log.action_type || 'default'}`}>
                        {getActionMiniIcon(log.action_type)}
                      </span>
                    </div>
                    <div className="notif-item-content">
                      <div className="notif-item-text">
                        <span className={`notif-actor ${isMyAction ? 'actor-me' : ''}`}>
                          {actorName}
                        </span>{' '}
                        {log.description}
                      </div>
                      <div className="notif-item-time">
                        <Clock size={11} />
                        <span>{formatRelativeTime(log.created_at)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="notif-footer">
            <button className="notif-view-all-btn" onClick={handleNavigateToDetails}>
              <span>
                {profile?.role === 'admin'
                  ? 'Xem toàn bộ lịch sử hệ thống'
                  : 'Xem danh sách đơn của tôi'}
              </span>
              <ExternalLink size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
