import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { 
  Camera, 
  Check, 
  Clock, 
  KeyRound, 
  Mail, 
  ShieldCheck, 
  Trash2, 
  Upload, 
  User, 
  Sparkles,
  Bell,
  Volume2,
  VolumeX,
  Play
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';
import { Avatar } from './Avatar';
import { isNotificationSoundEnabled, setNotificationSoundEnabled, playNotificationSound } from '../lib/sound';

interface ProfilePageProps {
  profile: Profile | null;
  onProfileUpdated: (updated: Profile) => void;
}

export function ProfilePage({ profile, onProfileUpdated }: ProfilePageProps) {
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [savingName, setSavingName] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(isNotificationSoundEnabled);
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleSoundChange = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setSoundEnabled(customEvent.detail);
    };
    window.addEventListener('tourflow_sound_setting_changed', handleSoundChange);
    return () => window.removeEventListener('tourflow_sound_setting_changed', handleSoundChange);
  }, []);

  function handleToggleSound(enabled: boolean) {
    setSoundEnabled(enabled);
    setNotificationSoundEnabled(enabled);
    if (enabled) {
      playNotificationSound(true);
    }
    setMessage({
      type: 'success',
      text: `Đã ${enabled ? 'bật' : 'tắt'} âm thanh thông báo thành công!`
    });
  }

  function handleTestSound() {
    setIsPlayingTest(true);
    playNotificationSound(true);
    setTimeout(() => setIsPlayingTest(false), 900);
  }

  if (!profile) {
    return <div className="loading-state">Đang tải thông tin hồ sơ...</div>;
  }

  // Cập nhật họ và tên hiển thị
  async function handleSaveName(e: FormEvent) {
    e.preventDefault();
    if (!profile) return;
    const trimmed = displayName.trim();
    if (!trimmed) {
      setMessage({ type: 'error', text: 'Vui lòng nhập họ và tên hợp lệ.' });
      return;
    }

    setSavingName(true);
    setMessage(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          display_name: trimmed,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
        .select('*')
        .single();

      if (error) throw error;
      if (data) {
        onProfileUpdated(data as Profile);
        setMessage({ type: 'success', text: 'Đã cập nhật họ và tên thành công!' });
      }
    } catch (err: any) {
      console.error('Lỗi khi cập nhật tên:', err);
      setMessage({ type: 'error', text: err.message || 'Không thể lưu tên lúc này.' });
    } finally {
      setSavingName(false);
    }
  }

// Thuật toán cắt vuông chính giữa và nén tối ưu ảnh đại diện bằng HTML5 Canvas
async function compressAvatarImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const TARGET_SIZE = 512;
      const minDim = Math.min(img.width, img.height);
      const sx = (img.width - minDim) / 2;
      const sy = (img.height - minDim) / 2;

      const canvas = document.createElement('canvas');
      canvas.width = TARGET_SIZE;
      canvas.height = TARGET_SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Không thể khởi tạo bộ xử lý hình ảnh.'));
        return;
      }

      // Nền trắng phòng trường hợp ảnh PNG có nền trong suốt
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);
      ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, TARGET_SIZE, TARGET_SIZE);

      canvas.toBlob(
        blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Lỗi trong quá trình nén ảnh.'));
          }
        },
        'image/jpeg',
        0.86
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Không thể đọc file ảnh. Vui lòng chọn ảnh khác.'));
    };
    img.src = objectUrl;
  });
}

// Trích xuất đường dẫn tương đối trong storage bucket từ URL public
function getStoragePathFromUrl(url?: string | null, bucket: string = 'avatars'): string | null {
  if (!url) return null;
  try {
    const bucketMarker = `/${bucket}/`;
    const index = url.indexOf(bucketMarker);
    if (index !== -1) {
      const pathWithQuery = url.slice(index + bucketMarker.length);
      return decodeURIComponent(pathWithQuery.split('?')[0]);
    }
  } catch (e) {
    console.error('Lỗi khi bóc tách đường dẫn storage:', e);
  }
  return null;
}

// Xóa ảnh đại diện cũ trên Supabase Storage để tiết kiệm dung lượng
async function deleteOldAvatarsFromStorage(userId: string, keepFilePath?: string, specificOldUrl?: string | null) {
  try {
    const toDelete = new Set<string>();

    // 1. Kiểm tra URL cũ cụ thể
    if (specificOldUrl) {
      const oldPath = getStoragePathFromUrl(specificOldUrl, 'avatars');
      if (oldPath && oldPath !== keepFilePath) {
        toDelete.add(oldPath);
      }
    }

    // 2. Liệt kê tất cả file trong thư mục của user này để xóa các ảnh cũ còn tồn đọng
    const { data: files, error: listError } = await supabase.storage
      .from('avatars')
      .list(userId);

    if (!listError && files && files.length > 0) {
      for (const file of files) {
        const fullPath = `${userId}/${file.name}`;
        if (fullPath !== keepFilePath) {
          toDelete.add(fullPath);
        }
      }
    }

    if (toDelete.size > 0) {
      const pathsToDelete = Array.from(toDelete);
      console.log('Đang xóa các ảnh cũ khỏi Storage để tiết kiệm dung lượng:', pathsToDelete);
      const { error: removeError } = await supabase.storage
        .from('avatars')
        .remove(pathsToDelete);
      if (removeError) {
        console.warn('Lỗi khi xóa ảnh cũ từ storage:', removeError);
      }
    }
  } catch (err) {
    console.warn('Lỗi khi dọn dẹp storage avatar:', err);
  }
}

  // Tải ảnh đại diện lên Supabase Storage với thuật toán nén tự động
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    // Kiểm tra định dạng ảnh
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Chỉ chấp nhận file ảnh định dạng JPG, PNG, WEBP hoặc GIF.' });
      return;
    }

    const previousAvatarUrl = profile.avatar_url;
    setUploadingAvatar(true);
    setMessage(null);

    try {
      // 1. Tự động cắt vuông chính giữa và nén tối ưu về 512x512px sắc nét (nhẹ ~100-200KB)
      const compressedBlob = await compressAvatarImage(file);
      const filePath = `${profile.id}/avatar-${Date.now()}.jpg`;

      // 2. Upload blob đã nén lên bucket avatars
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, compressedBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 3. Lấy link public
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // 4. Cập nhật vào bảng profiles
      const { data: updatedProfile, error: dbError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
        .select('*')
        .single();

      if (dbError) throw dbError;

      if (updatedProfile) {
        onProfileUpdated(updatedProfile as Profile);
        setMessage({ type: 'success', text: 'Đã tối ưu và cập nhật ảnh đại diện thành công!' });

        // 5. Xóa ảnh cũ trên storage để tiết kiệm dung lượng lưu trữ
        await deleteOldAvatarsFromStorage(profile.id, filePath, previousAvatarUrl);
      }
    } catch (err: any) {
      console.error('Lỗi khi tải ảnh:', err);
      setMessage({ type: 'error', text: err.message || 'Không thể tải ảnh đại diện lên lúc này.' });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  // Gỡ ảnh đại diện
  async function handleRemoveAvatar() {
    if (!profile || !profile.avatar_url) return;
    if (!window.confirm('Bạn có chắc chắn muốn gỡ ảnh đại diện hiện tại?')) return;

    const previousAvatarUrl = profile.avatar_url;
    setUploadingAvatar(true);
    setMessage(null);

    try {
      const { data: updatedProfile, error: dbError } = await supabase
        .from('profiles')
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
        .select('*')
        .single();

      if (dbError) throw dbError;

      if (updatedProfile) {
        onProfileUpdated(updatedProfile as Profile);
        setMessage({ type: 'success', text: 'Đã gỡ ảnh đại diện thành công!' });

        // Xóa tất cả ảnh đại diện của user này trong storage để giải phóng dung lượng
        await deleteOldAvatarsFromStorage(profile.id, undefined, previousAvatarUrl);
      }
    } catch (err: any) {
      console.error('Lỗi khi gỡ ảnh:', err);
      setMessage({ type: 'error', text: err.message || 'Không thể gỡ ảnh đại diện lúc này.' });
    } finally {
      setUploadingAvatar(false);
    }
  }

  return (
    <div className="profile-page-wrapper">
      <div className="page-header">
        <div>
          <h1>Hồ sơ cá nhân</h1>
        </div>
      </div>

      {message && (
        <div className={`form-feedback ${message.type === 'success' ? 'success' : 'error'}`}>
          {message.type === 'success' ? <Check size={16} /> : <span style={{ fontWeight: 'bold' }}>!</span>}
          <span>{message.text}</span>
        </div>
      )}

      <div className="profile-grid">
        {/* Cột 1: Ảnh đại diện */}
        <section className="card profile-avatar-card">
          <div className="profile-avatar-top">
            <div className="profile-avatar-container">
              <Avatar
                src={profile.avatar_url}
                name={profile.display_name}
                size="xl"
                className="profile-large-avatar"
              />
              <button
                type="button"
                className="profile-avatar-overlay-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                title="Thay đổi ảnh đại diện"
              >
                <Camera size={18} />
              </button>
            </div>

            <div className="profile-avatar-details">
              <h3>{profile.display_name}</h3>
              <span className="mono">@{profile.username}</span>
              <div className="profile-role-badge">
                <ShieldCheck size={13} />
                <span>{profile.role === 'admin' ? 'Quản trị viên (Admin)' : 'Nhân viên Sale (Sale Executive)'}</span>
              </div>
            </div>
          </div>

          <div className="profile-avatar-actions">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="button button-primary profile-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
            >
              <Upload size={15} />
              <span>{uploadingAvatar ? 'Đang nén & tải lên...' : 'Tải ảnh mới'}</span>
            </button>

            {profile.avatar_url && (
              <button
                type="button"
                className="button button-secondary profile-remove-btn"
                onClick={handleRemoveAvatar}
                disabled={uploadingAvatar}
                title="Gỡ ảnh đại diện"
              >
                <Trash2 size={14} />
                <span>Gỡ ảnh</span>
              </button>
            )}
          </div>
          <span className="profile-avatar-hint">
            Hệ thống tự động cắt vuông và nén ảnh sắc nét, tải lên siêu nhanh.
          </span>
        </section>

        {/* Cột 2: Thông tin chi tiết */}
        <section className="card profile-info-card">
          <h3 className="profile-card-title">
            <User size={17} /> Thông tin tài khoản
          </h3>

          <form onSubmit={handleSaveName} className="profile-form">
            <label className="field">
              <span>Họ và tên hiển thị<em> *</em></span>
              <div className="input-wrap">
                <span className="input-icon"><User size={15} /></span>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Nhập họ và tên..."
                  required
                />
              </div>
            </label>

            <div className="form-grid two">
              <label className="field">
                <span>Username đăng nhập</span>
                <div className="input-wrap disabled-wrap">
                  <span className="input-icon"><span className="mono">@</span></span>
                  <input
                    type="text"
                    value={profile.username}
                    readOnly
                    disabled
                  />
                </div>
              </label>

              <label className="field">
                <span>Email tài khoản</span>
                <div className="input-wrap disabled-wrap">
                  <span className="input-icon"><Mail size={15} /></span>
                  <input
                    type="email"
                    value={profile.email}
                    readOnly
                    disabled
                  />
                </div>
              </label>
            </div>

            <div className="profile-meta-box">
              <div className="profile-meta-item">
                <span className="profile-meta-label">Trạng thái</span>
                <span className="active-pill on">
                  <i /> {profile.is_active ? 'Đang hoạt động' : 'Đã khóa'}
                </span>
              </div>
              <div className="profile-meta-item">
                <span className="profile-meta-label">Ngày tham gia</span>
                <span className="profile-meta-val">
                  <Clock size={13} /> {new Date(profile.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>

            <div className="profile-form-footer">
              <button
                type="submit"
                className="button button-primary"
                disabled={savingName || displayName === profile.display_name}
              >
                {savingName ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* Cài đặt âm thanh thông báo */}
      <section className="card sound-setting-card" style={{ marginTop: '20px' }}>
        <div className="card-title">
          <span className="section-icon"><Bell size={17} /></span>
          <div>
            <h2>Tùy chọn thông báo & âm thanh</h2>
            <p>Cài đặt chuông âm thanh khi có đơn tour mới hoặc hoạt động liên quan đến tài khoản của bạn</p>
          </div>
        </div>

        <div className="sound-setting-row">
          <div className="sound-setting-info">
            <div className={`sound-icon-box ${soundEnabled ? 'active' : 'muted'}`}>
              {soundEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
            </div>
            <div className="sound-setting-text">
              <h3>Âm thanh chuông thông báo (Notification Chime)</h3>
              <p>Phát âm thanh chuông 2 nốt trong trẻo khi nhận thông báo Realtime.</p>
            </div>
          </div>

          <div className="sound-actions">
            <button
              type="button"
              className={`sound-test-btn ${isPlayingTest ? 'playing' : ''}`}
              onClick={handleTestSound}
              title="Nghe thử âm thanh chuông"
            >
              <Play size={13} fill={isPlayingTest ? 'currentColor' : 'none'} />
              <span>{isPlayingTest ? 'Đang phát...' : 'Nghe thử'}</span>
            </button>

            <label className="toggle-switch" title={soundEnabled ? 'Bấm để tắt âm thanh' : 'Bấm để bật âm thanh'}>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={e => handleToggleSound(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>
      </section>
    </div>
  );
}
