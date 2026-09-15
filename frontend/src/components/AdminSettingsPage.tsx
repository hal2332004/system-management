import React, { useState, useEffect, FormEvent } from 'react';
import { 
  Compass, 
  Hotel, 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Check, 
  X, 
  AlertCircle, 
  Power,
  RotateCcw
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Tour, RoomType } from '../types';

export function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'tours' | 'room_types'>('tours');

  // Tours state
  const [tours, setTours] = useState<Tour[]>([]);
  const [newTourName, setNewTourName] = useState('');
  const [tourSearch, setTourSearch] = useState('');
  const [editingTourId, setEditingTourId] = useState<string | null>(null);
  const [editingTourName, setEditingTourName] = useState('');

  // Room Types state
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [newRoomTypeName, setNewRoomTypeName] = useState('');
  const [roomTypeSearch, setRoomTypeSearch] = useState('');
  const [editingRoomTypeId, setEditingRoomTypeId] = useState<string | null>(null);
  const [editingRoomTypeName, setEditingRoomTypeName] = useState('');

  // General state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [toursRes, roomTypesRes] = await Promise.all([
        supabase.from('tours').select('*').order('name', { ascending: true }),
        supabase.from('room_types').select('*').order('name', { ascending: true }),
      ]);

      if (toursRes.error) throw toursRes.error;
      if (roomTypesRes.error) throw roomTypesRes.error;

      setTours((toursRes.data || []) as Tour[]);
      setRoomTypes((roomTypesRes.data || []) as RoomType[]);
    } catch (err: any) {
      console.error('Error loading settings definitions:', err);
      setFeedback({ type: 'error', text: 'Không thể tải danh sách cấu hình: ' + (err.message || '') });
    } finally {
      setLoading(false);
    }
  }

  // Auto clear feedback after 4s
  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(t);
  }, [feedback]);

  // ==========================
  // TOURS HANDLERS
  // ==========================
  async function handleAddTour(e: FormEvent) {
    e.preventDefault();
    const trimmed = newTourName.trim();
    if (!trimmed) return;

    // Check duplicate
    if (tours.some(t => t.name.toLowerCase() === trimmed.toLowerCase())) {
      setFeedback({ type: 'error', text: `Tour "${trimmed}" đã tồn tại trong danh sách!` });
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('tours')
        .insert({ name: trimmed, is_active: true })
        .select('*')
        .single();

      if (error) throw error;
      if (data) {
        setTours(prev => [data as Tour, ...prev]);
        setNewTourName('');
        setFeedback({ type: 'success', text: `Đã thêm tour "${trimmed}" thành công!` });
      }
    } catch (err: any) {
      console.error('Error adding tour:', err);
      setFeedback({ type: 'error', text: 'Lỗi khi thêm tour: ' + (err.message || '') });
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleTour(tour: Tour) {
    const updatedStatus = !tour.is_active;
    try {
      const { error } = await supabase
        .from('tours')
        .update({ is_active: updatedStatus, updated_at: new Date().toISOString() })
        .eq('id', tour.id);

      if (error) throw error;
      setTours(prev => prev.map(t => t.id === tour.id ? { ...t, is_active: updatedStatus } : t));
      setFeedback({
        type: 'success',
        text: `Đã ${updatedStatus ? 'kích hoạt' : 'tạm dừng'} tour "${tour.name}".`
      });
    } catch (err: any) {
      console.error('Error toggling tour:', err);
      setFeedback({ type: 'error', text: 'Không thể cập nhật trạng thái tour.' });
    }
  }

  async function handleSaveEditTour(tourId: string) {
    const trimmed = editingTourName.trim();
    if (!trimmed) return;

    try {
      const { error } = await supabase
        .from('tours')
        .update({ name: trimmed, updated_at: new Date().toISOString() })
        .eq('id', tourId);

      if (error) throw error;
      setTours(prev => prev.map(t => t.id === tourId ? { ...t, name: trimmed } : t));
      setEditingTourId(null);
      setEditingTourName('');
      setFeedback({ type: 'success', text: `Đã cập nhật tên tour thành "${trimmed}".` });
    } catch (err: any) {
      console.error('Error updating tour:', err);
      setFeedback({ type: 'error', text: 'Không thể đổi tên tour: ' + (err.message || '') });
    }
  }

  async function handleDeleteTour(tour: Tour) {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tour "${tour.name}"?\n(Lưu ý: Nếu tour đã được sử dụng trong các đơn hiện tại, tên tour trên đơn cũ vẫn được giữ nguyên.)`)) {
      return;
    }

    try {
      const { error } = await supabase.from('tours').delete().eq('id', tour.id);
      if (error) throw error;

      setTours(prev => prev.filter(t => t.id !== tour.id));
      setFeedback({ type: 'success', text: `Đã xóa tour "${tour.name}".` });
    } catch (err: any) {
      console.error('Error deleting tour:', err);
      setFeedback({ type: 'error', text: 'Không thể xóa tour: ' + (err.message || '') });
    }
  }

  // ==========================
  // ROOM TYPES HANDLERS
  // ==========================
  async function handleAddRoomType(e: FormEvent) {
    e.preventDefault();
    const trimmed = newRoomTypeName.trim();
    if (!trimmed) return;

    // Check duplicate
    if (roomTypes.some(r => r.name.toLowerCase() === trimmed.toLowerCase())) {
      setFeedback({ type: 'error', text: `Dạng phòng "${trimmed}" đã tồn tại trong danh sách!` });
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('room_types')
        .insert({ name: trimmed, is_active: true })
        .select('*')
        .single();

      if (error) throw error;
      if (data) {
        setRoomTypes(prev => [data as RoomType, ...prev]);
        setNewRoomTypeName('');
        setFeedback({ type: 'success', text: `Đã thêm dạng phòng "${trimmed}" thành công!` });
      }
    } catch (err: any) {
      console.error('Error adding room type:', err);
      setFeedback({ type: 'error', text: 'Lỗi khi thêm dạng phòng: ' + (err.message || '') });
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleRoomType(roomType: RoomType) {
    const updatedStatus = !roomType.is_active;
    try {
      const { error } = await supabase
        .from('room_types')
        .update({ is_active: updatedStatus, updated_at: new Date().toISOString() })
        .eq('id', roomType.id);

      if (error) throw error;
      setRoomTypes(prev => prev.map(r => r.id === roomType.id ? { ...r, is_active: updatedStatus } : r));
      setFeedback({
        type: 'success',
        text: `Đã ${updatedStatus ? 'kích hoạt' : 'tạm dừng'} dạng phòng "${roomType.name}".`
      });
    } catch (err: any) {
      console.error('Error toggling room type:', err);
      setFeedback({ type: 'error', text: 'Không thể cập nhật trạng thái dạng phòng.' });
    }
  }

  async function handleSaveEditRoomType(roomTypeId: string) {
    const trimmed = editingRoomTypeName.trim();
    if (!trimmed) return;

    try {
      const { error } = await supabase
        .from('room_types')
        .update({ name: trimmed, updated_at: new Date().toISOString() })
        .eq('id', roomTypeId);

      if (error) throw error;
      setRoomTypes(prev => prev.map(r => r.id === roomTypeId ? { ...r, name: trimmed } : r));
      setEditingRoomTypeId(null);
      setEditingRoomTypeName('');
      setFeedback({ type: 'success', text: `Đã cập nhật dạng phòng thành "${trimmed}".` });
    } catch (err: any) {
      console.error('Error updating room type:', err);
      setFeedback({ type: 'error', text: 'Không thể đổi tên dạng phòng: ' + (err.message || '') });
    }
  }

  async function handleDeleteRoomType(roomType: RoomType) {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa dạng phòng "${roomType.name}"?\n(Lưu ý: Các đơn cũ đã chọn dạng phòng này vẫn giữ nguyên thông tin.)`)) {
      return;
    }

    try {
      const { error } = await supabase.from('room_types').delete().eq('id', roomType.id);
      if (error) throw error;

      setRoomTypes(prev => prev.filter(r => r.id !== roomType.id));
      setFeedback({ type: 'success', text: `Đã xóa dạng phòng "${roomType.name}".` });
    } catch (err: any) {
      console.error('Error deleting room type:', err);
      setFeedback({ type: 'error', text: 'Không thể xóa dạng phòng: ' + (err.message || '') });
    }
  }

  // Filtered lists
  const filteredTours = tours.filter(t => t.name.toLowerCase().includes(tourSearch.toLowerCase()));
  const filteredRoomTypes = roomTypes.filter(r => r.name.toLowerCase().includes(roomTypeSearch.toLowerCase()));

  const activeToursCount = tours.filter(t => t.is_active).length;
  const activeRoomTypesCount = roomTypes.filter(r => r.is_active).length;

  return (
    <div className="admin-settings-container">
      {/* Title */}
      <div className="page-header">
        <div>
          <h1>Cài đặt hệ thống</h1>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div className={`form-feedback ${feedback.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '18px' }}>
          {feedback.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="settings-tab-nav">
        <button
          type="button"
          className={`settings-tab-btn ${activeTab === 'tours' ? 'active' : ''}`}
          onClick={() => setActiveTab('tours')}
        >
          <Compass size={17} />
          <span>Tour du lịch</span>
          <b className="tab-pill-count">{activeToursCount}/{tours.length}</b>
        </button>

        <button
          type="button"
          className={`settings-tab-btn ${activeTab === 'room_types' ? 'active' : ''}`}
          onClick={() => setActiveTab('room_types')}
        >
          <Hotel size={17} />
          <span>Dạng phòng (Type Room)</span>
          <b className="tab-pill-count">{activeRoomTypesCount}/{roomTypes.length}</b>
        </button>
      </div>

      {/* TAB 1: TOURS */}
      {activeTab === 'tours' && (
        <div className="settings-content-grid">
          {/* Form thêm tour */}
          <section className="card settings-add-card">
            <div className="card-title">
              <span className="section-icon"><Compass size={17} /></span>
              <div>
                <h2>Thêm tour mới</h2>
                <p>Tour mới sẽ lập tức xuất hiện trong danh sách lựa chọn khi tạo đơn.</p>
              </div>
            </div>

            <form onSubmit={handleAddTour} className="settings-add-form">
              <div className="search-field" style={{ flex: 1, maxWidth: 'none' }}>
                <input
                  value={newTourName}
                  onChange={e => setNewTourName(e.target.value)}
                  placeholder="Nhập tên tour..."
                  required
                />
              </div>
              <button type="submit" className="button button-primary" disabled={saving || !newTourName.trim()}>
                <Plus size={16} /> Thêm tour
              </button>
            </form>
          </section>

          {/* Danh sách tour */}
          <section className="card settings-list-card">
            <div className="settings-list-header">
              <div>
                <h2>Danh sách Tour du lịch ({filteredTours.length})</h2>
                <p>Quản lý các gói tour mở bán trong hệ thống</p>
              </div>
              <div className="search-field" style={{ width: '260px' }}>
                <Search size={15} />
                <input
                  value={tourSearch}
                  onChange={e => setTourSearch(e.target.value)}
                  placeholder="Tìm kiếm tour..."
                />
              </div>
            </div>

            {loading ? (
              <div className="loading-state">Đang tải danh sách tour...</div>
            ) : filteredTours.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <Compass size={28} />
                <p>Không tìm thấy tour nào.</p>
              </div>
            ) : (
              <div className="settings-table-wrap">
                <table className="settings-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50%' }}>TÊN TOUR</th>
                      <th style={{ width: '20%' }}>TRẠNG THÁI</th>
                      <th style={{ width: '15%' }}>NGÀY TẠO</th>
                      <th style={{ width: '15%', textAlign: 'right' }}>THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTours.map(tour => {
                      const isEditing = editingTourId === tour.id;
                      return (
                        <tr key={tour.id}>
                          <td>
                            {isEditing ? (
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                  type="text"
                                  className="mini-input"
                                  value={editingTourName}
                                  onChange={e => setEditingTourName(e.target.value)}
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  className="action-btn-mini save"
                                  onClick={() => handleSaveEditTour(tour.id)}
                                  title="Lưu"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  type="button"
                                  className="action-btn-mini cancel"
                                  onClick={() => setEditingTourId(null)}
                                  title="Hủy"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <span className="definition-name">{tour.name}</span>
                            )}
                          </td>
                          <td>
                            <span className={`status-pill ${tour.is_active ? 'active' : 'inactive'}`}>
                              <i /> {tour.is_active ? 'Đang mở bán' : 'Tạm dừng'}
                            </span>
                          </td>
                          <td className="muted">
                            {new Date(tour.created_at).toLocaleDateString('vi-VN')}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="settings-row-actions">
                              <button
                                type="button"
                                className="action-btn-mini"
                                onClick={() => handleToggleTour(tour)}
                                title={tour.is_active ? 'Tạm dừng mở bán' : 'Kích hoạt mở bán'}
                              >
                                <Power size={14} style={{ color: tour.is_active ? '#10b981' : '#888' }} />
                              </button>
                              <button
                                type="button"
                                className="action-btn-mini"
                                onClick={() => {
                                  setEditingTourId(tour.id);
                                  setEditingTourName(tour.name);
                                }}
                                title="Sửa tên"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                className="action-btn-mini danger"
                                onClick={() => handleDeleteTour(tour)}
                                title="Xóa tour"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 2: ROOM TYPES */}
      {activeTab === 'room_types' && (
        <div className="settings-content-grid">
          {/* Form thêm dạng phòng */}
          <section className="card settings-add-card">
            <div className="card-title">
              <span className="section-icon"><Hotel size={17} /></span>
              <div>
                <h2>Thêm dạng phòng mới</h2>
                <p>Dạng phòng mới sẽ tự động hiển thị trong ô lựa chọn phòng của đơn tour.</p>
              </div>
            </div>

            <form onSubmit={handleAddRoomType} className="settings-add-form">
              <div className="search-field" style={{ flex: 1, maxWidth: 'none' }}>
                <input
                  value={newRoomTypeName}
                  onChange={e => setNewRoomTypeName(e.target.value)}
                  placeholder="Nhập tên dạng phòng..."
                  required
                />
              </div>
              <button type="submit" className="button button-primary" disabled={saving || !newRoomTypeName.trim()}>
                <Plus size={16} /> Thêm dạng phòng
              </button>
            </form>
          </section>

          {/* Danh sách dạng phòng */}
          <section className="card settings-list-card">
            <div className="settings-list-header">
              <div>
                <h2>Danh mục dạng phòng ({filteredRoomTypes.length})</h2>
                <p>Các kiểu loại phòng áp dụng cho các đơn đặt tour</p>
              </div>
              <div className="search-field" style={{ width: '260px' }}>
                <Search size={15} />
                <input
                  value={roomTypeSearch}
                  onChange={e => setRoomTypeSearch(e.target.value)}
                  placeholder="Tìm dạng phòng..."
                />
              </div>
            </div>

            {loading ? (
              <div className="loading-state">Đang tải danh mục dạng phòng...</div>
            ) : filteredRoomTypes.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <Hotel size={28} />
                <p>Chưa có dạng phòng nào được thiết lập.</p>
              </div>
            ) : (
              <div className="settings-table-wrap">
                <table className="settings-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50%' }}>DẠNG PHÒNG (ROOM TYPE)</th>
                      <th style={{ width: '20%' }}>TRẠNG THÁI</th>
                      <th style={{ width: '15%' }}>NGÀY TẠO</th>
                      <th style={{ width: '15%', textAlign: 'right' }}>THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoomTypes.map(roomType => {
                      const isEditing = editingRoomTypeId === roomType.id;
                      return (
                        <tr key={roomType.id}>
                          <td>
                            {isEditing ? (
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                  type="text"
                                  className="mini-input"
                                  value={editingRoomTypeName}
                                  onChange={e => setEditingRoomTypeName(e.target.value)}
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  className="action-btn-mini save"
                                  onClick={() => handleSaveEditRoomType(roomType.id)}
                                  title="Lưu"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  type="button"
                                  className="action-btn-mini cancel"
                                  onClick={() => setEditingRoomTypeId(null)}
                                  title="Hủy"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <span className="definition-name">{roomType.name}</span>
                            )}
                          </td>
                          <td>
                            <span className={`status-pill ${roomType.is_active ? 'active' : 'inactive'}`}>
                              <i /> {roomType.is_active ? 'Đang áp dụng' : 'Tạm dừng'}
                            </span>
                          </td>
                          <td className="muted">
                            {new Date(roomType.created_at).toLocaleDateString('vi-VN')}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="settings-row-actions">
                              <button
                                type="button"
                                className="action-btn-mini"
                                onClick={() => handleToggleRoomType(roomType)}
                                title={roomType.is_active ? 'Tạm dừng áp dụng' : 'Kích hoạt lại'}
                              >
                                <Power size={14} style={{ color: roomType.is_active ? '#10b981' : '#888' }} />
                              </button>
                              <button
                                type="button"
                                className="action-btn-mini"
                                onClick={() => {
                                  setEditingRoomTypeId(roomType.id);
                                  setEditingRoomTypeName(roomType.name);
                                }}
                                title="Sửa tên"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                className="action-btn-mini danger"
                                onClick={() => handleDeleteRoomType(roomType)}
                                title="Xóa dạng phòng"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
