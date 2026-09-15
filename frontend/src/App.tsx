import { createContext, useContext, FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext<{ theme: string; toggleTheme: () => void }>({ theme: 'dark', toggleTheme: () => { } });
export function useTheme() { return useContext(ThemeContext); }
import { BrowserRouter, Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Activity, ArrowLeft, ArrowUp, ArrowDown, ArrowUpDown, BarChart3, Bell, CalendarDays, Check, ChevronDown, CircleDollarSign, ClipboardList, Eye, FileText, KeyRound, LayoutDashboard, Lock, LogIn, LogOut, Mail, Menu, MoreHorizontal, Pencil, Phone, Plus, Search, Settings, ShieldCheck, Trash2, TrendingUp, User, Users, X, Sun, Moon } from 'lucide-react';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import type { ActivityLog, Order, OrderStatus, Profile, Role } from '@/types';

const statusMeta: Record<OrderStatus, { label: string; varPrefix: string }> = {
  new: { label: 'Mới', varPrefix: 'new' },
  confirmed: { label: 'Đã xác nhận', varPrefix: 'confirmed' },
  deposited: { label: 'Đã cọc', varPrefix: 'deposited' },
  completed: { label: 'Hoàn thành', varPrefix: 'completed' },
  cancelled: { label: 'Đã hủy', varPrefix: 'cancelled' },
};

function Logo({ compact = false }: { compact?: boolean }) {
  return <Link to="/" className="brand"><span className="brand-mark"><ShieldCheck size={18} /></span>{!compact && <span>TourFlow <b>CRM</b></span>}</Link>;
}

function Button({ children, variant = 'primary', className = '', type = 'button', onClick, disabled = false }: { children: ReactNode; variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; className?: string; type?: 'button' | 'submit'; onClick?: () => void; disabled?: boolean }) {
  return <button type={type} onClick={onClick} disabled={disabled} className={`button button-${variant} ${className}`}>{children}</button>;
}

function Badge({ status }: { status: OrderStatus }) { const item = statusMeta[status]; return <span className="status-badge" style={{ color: `var(--status-${item.varPrefix}-text)`, background: `var(--status-${item.varPrefix}-bg)` }}><i style={{ background: `var(--status-${item.varPrefix}-text)` }} />{item.label}</span>; }
function Card({ children, className = '' }: { children: ReactNode; className?: string }) { return <section className={`card ${className}`}>{children}</section>; }
function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: ReactNode; description?: ReactNode; actions?: ReactNode }) { return <div className="page-header"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description && <div className="page-description">{description}</div>}</div>{actions && <div className="header-actions">{actions}</div>}</div>; }
function Input({ label, value, onChange, placeholder, type = 'text', icon, required = false }: { label?: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; icon?: ReactNode; required?: boolean }) { return <label className="field">{label && <span>{label}{required && <em> *</em>}</span>}<div className="input-wrap">{icon && <span className="input-icon">{icon}</span>}<input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} /></div></label>; }
function Select({ label, value, onChange, children }: { label?: string; value: string; onChange: (value: string) => void; children: ReactNode }) { return <label className="field">{label && <span>{label}</span>}<div className="select-wrap"><select value={value} onChange={e => onChange(e.target.value)}>{children}</select><ChevronDown size={15} /></div></label>; }

function AuthPage({ mode }: { mode: 'login' | 'forgot' }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchParams.get('locked') === 'true') {
      setError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
    }
  }, [searchParams]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');

    if (mode === 'forgot') {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(identifier, { redirectTo: `${window.location.origin}/reset-password` });
      setBusy(false);
      if (resetError) setError('Không thể gửi email lúc này. Vui lòng thử lại.');
      else setMessage('Nếu email đã được đăng ký, chúng tôi đã gửi link đặt lại mật khẩu.');
      return;
    }

    // Xác định email: nếu không có @ thì tra username → lấy email thông qua hàm RPC bảo mật
    let loginEmail = identifier.trim();
    if (!loginEmail.includes('@')) {
      const { data: lookedUpEmail, error: lookupError } = await supabase.rpc('get_email_by_username', {
        p_username: loginEmail,
      });
      if (lookupError || !lookedUpEmail) {
        setError('Tên đăng nhập hoặc mật khẩu không đúng.');
        setBusy(false);
        return;
      }
      loginEmail = lookedUpEmail;
    }

    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
    if (loginError || !data.user) {
      setBusy(false);
      if (loginError?.message?.toLowerCase().includes('banned')) {
        setError('Tài khoản này đã bị khóa. Vui lòng liên hệ quản trị viên.');
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không đúng.');
      }
      return;
    }

    // Kiểm tra thêm trạng thái is_active từ bảng profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_active')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profile && profile.is_active === false) {
      await supabase.auth.signOut();
      setBusy(false);
      setError('Tài khoản này đã bị khóa. Vui lòng liên hệ quản trị viên.');
      return;
    }

    setBusy(false);
    navigate('/');
  }

  return (
    <main className="auth-shell">
      <div className="auth-decoration decoration-one" />
      <div className="auth-decoration decoration-two" />
      <div className="auth-brand"><Logo /><span className="secure-label"><Lock size={12} /> Không gian làm việc bảo mật</span></div>
      <Card className="auth-card">
        {mode === 'login' ? (
          <>
            <div className="auth-heading">
              <div className="auth-icon"><ShieldCheck size={22} /></div>
              <h1>Chào mừng trở lại</h1>
              <p>Đăng nhập để quản lý đơn tour của bạn.</p>
            </div>
            <form onSubmit={submit}>
              <Input
                label="Username hoặc Email"
                value={identifier}
                onChange={setIdentifier}
                placeholder="username hoặc you@company.com"
                icon={<User size={16} />}
                required
              />
              <label className="field">
                <span>Mật khẩu</span>
                <div className="input-wrap">
                  <span className="input-icon"><KeyRound size={16} /></span>
                  <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Nhập mật khẩu" required />
                  <button type="button" className="input-action" onClick={() => setShow(!show)}>{show ? 'Ẩn' : 'Hiện'}</button>
                </div>
              </label>
              <div className="form-row">
                <label className="check"><input type="checkbox" /> Ghi nhớ đăng nhập</label>
                <Link to="/forgot-password">Quên mật khẩu?</Link>
              </div>
              {error && <div className="form-error">{error}</div>}
              <Button type="submit" className="full-button" disabled={busy}>
                {busy ? 'Đang đăng nhập...' : 'Đăng nhập'} <ArrowLeft size={16} className="arrow-right" />
              </Button>
            </form>
            <div className="auth-foot">Tài khoản được cấp bởi quản trị viên</div>
          </>
        ) : (
          <>
            <div className="auth-heading">
              <div className="auth-icon"><KeyRound size={22} /></div>
              <h1>Quên mật khẩu?</h1>
              <p>Nhập email công việc để nhận link đặt lại mật khẩu.</p>
            </div>
            <form onSubmit={submit}>
              <Input label="Email công việc" value={identifier} onChange={setIdentifier} placeholder="you@company.com" type="email" icon={<Mail size={16} />} required />
              {error && <div className="form-error">{error}</div>}
              {message && <div className="form-success"><Check size={15} />{message}</div>}
              <Button type="submit" className="full-button" disabled={busy}>{busy ? 'Đang gửi...' : 'Gửi link đặt lại'}</Button>
            </form>
            <Link to="/login" className="back-link"><ArrowLeft size={15} /> Quay lại đăng nhập</Link>
          </>
        )}
      </Card>
      <div className="auth-footer">© 2026 TourFlow CRM · Dành cho đội ngũ nội bộ</div>
    </main>
  );
}

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [orderCount, setOrderCount] = useState<number>(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        const p = data as Profile | null;
        if (p && p.is_active === false) {
          await supabase.auth.signOut();
          navigate('/login?locked=true');
          return;
        }
        setProfile(p);
        const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('owner_id', user.id);
        setOrderCount(count || 0);
      } catch (e) {
        console.error('Sidebar user error:', e);
      }
    })();
  }, []);

  // Tự động đóng menu tài khoản khi click chuột ra ngoài
  useEffect(() => {
    if (!userMenuOpen) return;
    function handleOutside(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (target && !target.closest('.user-popup-menu') && !target.closest('.user-menu-button')) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [userMenuOpen]);

  const isAdmin = profile?.role === 'admin';
  const nav = isAdmin
    ? [
      { label: 'Tổng quan', to: '/dashboard', icon: <LayoutDashboard size={18} /> },
      { label: 'Tất cả đơn tour', to: '/admin/orders', icon: <ClipboardList size={18} /> },
      { label: 'Nhân viên Sale', to: '/admin/salers', icon: <Users size={18} /> },
      { label: 'Lịch sử hoạt động hệ thống', to: '/admin/activity', icon: <Activity size={18} /> },
    ]
    : [
      { label: 'Đơn của tôi', to: '/orders', icon: <ClipboardList size={18} /> },
      { label: 'Tạo đơn mới', to: '/orders/new', icon: <Plus size={18} /> },
    ];

  async function logout() {
    sessionStorage.removeItem('skip_recovery');
    await supabase.auth.signOut();
    navigate('/login');
  }

  return (
    <>
      <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)}>
        <Menu size={20} />
      </button>
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-top">
          <Logo />
          <button className="sidebar-close" onClick={() => setMobileOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <div className="workspace">
          <div className="workspace-dot">T</div>
          <div>
            <b>TourFlow Vietnam</b>
            <span>Không gian nội bộ</span>
          </div>
          <ChevronDown size={14} />
        </div>
        <nav>
          <span className="nav-label">Workspace</span>
          {nav.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={location.pathname === item.to ? 'active' : ''}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.to === '/orders' && orderCount > 0 && <span className="nav-count">{orderCount}</span>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          {userMenuOpen && (
            <div className="user-popup-menu">
              <b>Tài khoản</b>
              <button
                type="button"
                className={location.pathname.includes('change-password') ? 'active' : ''}
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/settings/change-password');
                }}
              >
                <Settings size={14} />
                <span>Đổi mật khẩu</span>
              </button>
              <button
                type="button"
                onClick={() => { toggleTheme(); setUserMenuOpen(false); }}
              >
                {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
                <span>{theme === 'light' ? 'Giao diện tối' : 'Giao diện sáng'}</span>
              </button>
              <button
                type="button"
                className="logout-btn-menu"
                onClick={logout}
              >
                <LogOut size={14} />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
          <div className="user-mini">
            <div className="avatar">{(profile?.display_name || 'NV').slice(0, 2).toUpperCase()}</div>
            <div>
              <b>{profile?.display_name || 'Nhân viên Sale'}</b>
              <span>{isAdmin ? 'Quản trị viên' : 'Nhân viên'}</span>
            </div>
            <button
              type="button"
              className={`user-menu-button ${userMenuOpen ? 'active' : ''}`}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              title="Tùy chọn tài khoản"
            >
              <MoreHorizontal size={17} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const today = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' });

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        if (data) setProfile(data as Profile);
      } catch (e) {
        console.error('AppLayout profile error:', e);
      }
    })();
  }, []);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-shell">
        <div className="topbar">
          <div className="top-actions" style={{ marginLeft: 'auto' }}>
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Chuyển sang giao diện tối' : 'Chuyển sang giao diện sáng'}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button className="icon-button" title="Thông báo"><Bell size={18} /><i /></button>
            <div className="top-date"><CalendarDays size={15} /> {today}</div>
          </div>
        </div>
        <div className="content"><Outlet /></div>
      </div>
    </div>
  );
}

const dateMeta: Record<string, { label: string }> = {
  all: { label: 'Tất cả thời gian' },
  today: { label: 'Hôm nay' },
  yesterday: { label: 'Hôm qua' },
  '7days': { label: '7 ngày qua' },
  '30days': { label: '30 ngày qua' },
  this_month: { label: 'Tháng này' },
  last_month: { label: 'Tháng trước' },
};

function OrdersPage({ admin = false }: { admin?: boolean }) {
  const navigate = useNavigate(); const [orders, setOrders] = useState<Order[]>([]); const [queryName, setQueryName] = useState(''); const [queryPhone, setQueryPhone] = useState(''); const [queryEmail, setQueryEmail] = useState(''); const [queryTour, setQueryTour] = useState(''); const [querySaler, setQuerySaler] = useState(''); const [status, setStatus] = useState('all'); const [dateRange, setDateRange] = useState('all'); const [dateType, setDateType] = useState<'booking_date' | 'tour_date'>('tour_date'); const [specificDate, setSpecificDate] = useState(''); const [loading, setLoading] = useState(true); const [showFilters, setShowFilters] = useState(false); const [showDateFilters, setShowDateFilters] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const PAGE_SIZE = 10;

  async function load() {
    setLoading(true);
    let request = supabase.from('orders').select('*, owner:profiles(display_name, username)').order('created_at', { ascending: false });
    const { data: user } = await supabase.auth.getUser();
    if (user?.user) {
      setCurrentUserId(user.user.id);
      if (!admin) request = request.eq('owner_id', user.user.id);
    }
    const { data } = await request;
    setOrders((data || []) as Order[]);
    setLoading(false);
  }
  useEffect(() => {
    load();
    const channel = supabase
      .channel('realtime-orders-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        load();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [admin]);

  useEffect(() => {
    setPage(1);
  }, [queryName, queryPhone, queryEmail, queryTour, querySaler, status, dateRange, dateType, specificDate, orders, sortOrder]);

  const filtered = useMemo(() => {
    const list = orders.filter(order => {
      const matchName = !queryName || (order.customer_name || '').toLowerCase().includes(queryName.toLowerCase());
      const matchPhone = !queryPhone || (order.customer_phone || '').includes(queryPhone);
      const matchEmail = !queryEmail || (order.customer_email || '').toLowerCase().includes(queryEmail.toLowerCase());
      const matchTour = !queryTour || (order.tour_name || '').toLowerCase().includes(queryTour.toLowerCase());
      const matchSaler = !admin || !querySaler || (order.owner?.display_name || '').toLowerCase().includes(querySaler.toLowerCase()) || (order.owner?.username || '').toLowerCase().includes(querySaler.toLowerCase());

      let matchDate = true;
      if (dateRange !== 'all') {
        const targetDate = new Date(dateType === 'booking_date' ? order.booking_date : order.tour_date);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (dateRange === 'today') {
          matchDate = targetDate >= today && targetDate <= new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
        } else if (dateRange === 'yesterday') {
          const yest = new Date(today); yest.setDate(today.getDate() - 1);
          matchDate = targetDate >= yest && targetDate < today;
        } else if (dateRange === '7days') {
          const d7 = new Date(today); d7.setDate(today.getDate() - 7);
          const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
          matchDate = targetDate >= d7 && targetDate <= endOfToday;
        } else if (dateRange === '30days') {
          const d30 = new Date(today); d30.setDate(today.getDate() - 30);
          const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
          matchDate = targetDate >= d30 && targetDate <= endOfToday;
        } else if (dateRange === 'this_month') {
          const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
          const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
          matchDate = targetDate >= firstDay && targetDate <= lastDay;
        } else if (dateRange === 'last_month') {
          const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastDay = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
          matchDate = targetDate >= firstDay && targetDate <= lastDay;
        } else if (dateRange === 'specific_day' && specificDate) {
          const selected = new Date(specificDate);
          matchDate = targetDate.getFullYear() === selected.getFullYear() && targetDate.getMonth() === selected.getMonth() && targetDate.getDate() === selected.getDate();
        }
      }

      return matchName && matchPhone && matchEmail && matchTour && matchSaler && matchDate && (status === 'all' || order.status === status);
    });

    return list.sort((a, b) => {
      let dateA = new Date(dateType === 'booking_date' ? a.booking_date : a.tour_date).getTime();
      let dateB = new Date(dateType === 'booking_date' ? b.booking_date : b.tour_date).getTime();
      if (isNaN(dateA)) dateA = new Date(a.created_at).getTime();
      if (isNaN(dateB)) dateB = new Date(b.created_at).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [orders, queryName, queryPhone, queryEmail, queryTour, querySaler, status, dateRange, dateType, specificDate, admin, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (target && !target.closest('.filter-dropdown')) {
        setShowFilters(false);
        setShowDateFilters(false);
      }
    }
    if (showFilters || showDateFilters) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showFilters, showDateFilters]);

  return <><PageHeader eyebrow={admin ? 'Quản trị đơn tour' : 'Workspace của tôi'} title={admin ? 'Tất cả đơn tour' : 'Đơn tour của tôi'} description={admin ? 'Theo dõi và quản lý toàn bộ đơn tour trong hệ thống.' : 'Theo dõi tiến độ và chăm sóc khách hàng của bạn.'} actions={!admin && <Button onClick={() => navigate('/orders/new')}><Plus size={16} /> Tạo đơn mới</Button>} />
    <Card className="orders-card"><div className="toolbar"><div className="filter-row"><div className="search-field"><input value={queryName} onChange={e => setQueryName(e.target.value)} placeholder="Tên khách hàng" /></div><div className="search-field"><input value={queryPhone} onChange={e => setQueryPhone(e.target.value)} placeholder="Số điện thoại" /></div><div className="search-field"><input value={queryEmail} onChange={e => setQueryEmail(e.target.value)} placeholder="Email" /></div><div className="search-field"><input value={queryTour} onChange={e => setQueryTour(e.target.value)} placeholder="Tên tour" /></div>{admin && <div className="search-field"><input value={querySaler} onChange={e => setQuerySaler(e.target.value)} placeholder="Nhân viên Sale" /></div>}</div><div className="toolbar-actions"><div className="filter-dropdown"><Button variant="secondary" onClick={() => { setShowFilters(!showFilters); setShowDateFilters(false); }}><span className="filter-dot" style={{ background: status === 'all' ? 'var(--text-dim)' : `var(--status-${statusMeta[status as OrderStatus].varPrefix}-text)` }} />{status === 'all' ? 'Tất cả trạng thái' : statusMeta[status as OrderStatus].label}<ChevronDown size={15} /></Button>{showFilters && <div className="dropdown-panel"><b>Lọc theo trạng thái</b>{(['all', ...Object.keys(statusMeta)] as string[]).map(item => <button key={item} onClick={() => { setStatus(item); setShowFilters(false); }}>{status === item && <Check size={14} />}{item === 'all' ? 'Tất cả trạng thái' : statusMeta[item as OrderStatus].label}</button>)}</div>}</div><div className="filter-dropdown"><Button variant="secondary" onClick={() => { setShowDateFilters(!showDateFilters); setShowFilters(false); }} className="date-button"><CalendarDays size={16} /> {dateRange === 'all' ? (dateType === 'booking_date' ? 'Ngày tạo đơn' : 'Ngày đi tour') : dateRange === 'specific_day' && specificDate ? new Date(specificDate).toLocaleDateString('vi-VN') : dateMeta[dateRange]?.label} <ChevronDown size={14} /></Button>{showDateFilters && <div className="dropdown-panel"><b>Loại ngày</b><div style={{ display: 'flex', gap: '5px', padding: '0 8px 10px', borderBottom: '1px solid var(--border-row)', marginBottom: '5px' }}><button style={{ flex: 1, padding: '6px', textAlign: 'center', background: dateType === 'booking_date' ? 'var(--nav-active-bg)' : 'transparent', color: dateType === 'booking_date' ? 'var(--nav-active-text)' : 'var(--text-dim)', borderRadius: '5px', fontSize: '10px', justifyContent: 'center' }} onClick={() => setDateType('booking_date')}>Ngày tạo đơn</button><button style={{ flex: 1, padding: '6px', textAlign: 'center', background: dateType === 'tour_date' ? 'var(--nav-active-bg)' : 'transparent', color: dateType === 'tour_date' ? 'var(--nav-active-text)' : 'var(--text-dim)', borderRadius: '5px', fontSize: '10px', justifyContent: 'center' }} onClick={() => setDateType('tour_date')}>Ngày đi tour</button></div><b>Thứ tự sắp xếp</b><div style={{ display: 'flex', gap: '5px', padding: '0 8px 10px', borderBottom: '1px solid var(--border-row)', marginBottom: '5px' }}><button style={{ flex: 1, padding: '6px', textAlign: 'center', background: sortOrder === 'desc' ? 'var(--nav-active-bg)' : 'transparent', color: sortOrder === 'desc' ? 'var(--nav-active-text)' : 'var(--text-dim)', borderRadius: '5px', fontSize: '10px', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => setSortOrder('desc')}><ArrowDown size={11} /> Giảm dần</button><button style={{ flex: 1, padding: '6px', textAlign: 'center', background: sortOrder === 'asc' ? 'var(--nav-active-bg)' : 'transparent', color: sortOrder === 'asc' ? 'var(--nav-active-text)' : 'var(--text-dim)', borderRadius: '5px', fontSize: '10px', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => setSortOrder('asc')}><ArrowUp size={11} /> Tăng dần</button></div><b>Lọc thời gian</b>{Object.keys(dateMeta).map(item => <button key={item} onClick={() => { setDateRange(item); setSpecificDate(''); setShowDateFilters(false); }}>{dateRange === item && <Check size={14} />}{dateMeta[item].label}</button>)}<div style={{ marginTop: '5px', borderTop: '1px solid var(--border-row)', paddingTop: '5px' }}><b>Ngày cụ thể</b><div style={{ padding: '0 8px', marginBottom: '5px' }}><input type="date" value={specificDate} onChange={e => { setSpecificDate(e.target.value); if (e.target.value) setDateRange('specific_day'); setShowDateFilters(false); }} style={{ width: '100%', padding: '6px 8px', fontSize: '11px', background: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-input)', borderRadius: '5px', outline: 'none' }} /></div></div></div>}</div></div></div><div className="table-meta"><span><b>{filtered.length}</b> đơn tour</span><span className="live-status"><i /> Cập nhật trực tiếp</span></div>{loading ? <div className="loading-state">Đang tải dữ liệu...</div> : filtered.length === 0 ? <div className="empty-state"><ClipboardList size={30} /><h3>Không tìm thấy kết quả</h3><p>Thử thay đổi điều kiện lọc.</p>{!admin && <Button onClick={() => navigate('/orders/new')}><Plus size={16} /> Tạo đơn đầu tiên</Button>}</div> : <div className="table-scroll"><table className="orders-table"><thead><tr><th style={{ width: '12%', cursor: 'pointer', userSelect: 'none' }} onClick={() => { if (dateType === 'booking_date') { setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); } else { setDateType('booking_date'); setSortOrder('desc'); } }} title="Bấm để chuyển chiều sắp xếp Ngày tạo đơn"><div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>NGÀY TẠO ĐƠN {dateType === 'booking_date' ? (sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={11} style={{ opacity: 0.4 }} />}</div></th><th style={{ width: admin ? '18%' : '23%' }}>KHÁCH HÀNG</th><th style={{ width: admin ? '15%' : '17%' }}>SỐ ĐIỆN THOẠI</th>{admin && <th style={{ width: '17%' }}>NHÂN VIÊN SALE</th>}<th style={{ width: admin ? '20%' : '22%' }}>TOUR</th><th style={{ width: '12%', cursor: 'pointer', userSelect: 'none' }} onClick={() => { if (dateType === 'tour_date') { setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); } else { setDateType('tour_date'); setSortOrder('desc'); } }} title="Bấm để chuyển chiều sắp xếp Ngày đi tour"><div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>NGÀY ĐI TOUR {dateType === 'tour_date' ? (sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={11} style={{ opacity: 0.4 }} />}</div></th><th style={{ width: '14%' }}>TRẠNG THÁI</th></tr></thead><tbody>{paginatedOrders.map((order) => <tr key={order.id} className="clickable-row" onClick={() => navigate(`/orders/${order.id}`)}><td className="muted">{new Date(order.booking_date).toLocaleDateString('vi-VN')}</td><td><span className="customer-name-pure" title={order.customer_name || 'Khách hàng'}>{order.customer_name || 'Chưa đặt tên'}</span></td><td>{order.customer_phone ? <span className="customer-phone" title={`Số điện thoại: ${order.customer_phone}`} onClick={(e) => e.stopPropagation()}><Phone size={12} /> {order.customer_phone}</span> : <span className="customer-phone customer-phone-empty"><Phone size={12} /> Chưa có SĐT</span>}</td>{admin && <td><div className="owner-cell"><span className="avatar small">{(order.owner?.display_name || 'NV').slice(0, 2).toUpperCase()}</span>{order.owner?.display_name || 'Chưa phân công'}</div></td>}<td><b className="tour-cell">{order.tour_name}</b><span className="mono" style={{ display: 'block', fontSize: '10px', color: 'var(--mono-color)', marginTop: '2px' }}>{order.order_code}</span></td><td className="muted">{new Date(order.tour_date).toLocaleDateString('vi-VN')}</td><td><Badge status={order.status} /></td></tr>)}</tbody></table></div>}<div className="table-footer"><span>Hiển thị {paginatedOrders.length} / {filtered.length} kết quả</span><div className="pagination">{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => <button key={p} className={p === page ? 'current' : ''} onClick={() => setPage(p)}>{p}</button>)}{totalPages > 1 && <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={{ opacity: page >= totalPages ? 0.4 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }} title="Trang tiếp"><ArrowLeft size={14} className="flip" /></button>}</div></div></Card></>;
}

function OrderForm() {
  const navigate = useNavigate(); const { id } = useParams(); const editing = Boolean(id); const [form, setForm] = useState({ customer_name: '', customer_phone: '', customer_email: '', tour_name: '', booking_date: new Date().toISOString().slice(0, 10), tour_date: '', status: 'new' as OrderStatus, notes: '' }); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { if (id) supabase.from('orders').select('*').eq('id', id).maybeSingle().then(({ data }) => { if (data) setForm({ customer_name: data.customer_name, customer_phone: data.customer_phone, customer_email: data.customer_email || '', tour_name: data.tour_name, booking_date: data.booking_date, tour_date: data.tour_date, status: data.status, notes: data.notes || '' }); }); }, [id]);
  function update(key: string, value: string) { setForm(prev => ({ ...prev, [key]: value })); }
  async function submit(e: FormEvent) { e.preventDefault(); setError(''); if (form.tour_date < form.booking_date) { setError('Ngày đi tour phải từ ngày tạo đơn trở đi.'); return; } if (!form.tour_name.trim()) { setError('Vui lòng nhập tên tour.'); return; } setBusy(true); const { data: { user } } = await supabase.auth.getUser(); if (!user) { setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'); setBusy(false); return; } const { data: profile } = await supabase.from('profiles').select('is_active').eq('id', user.id).maybeSingle(); if (profile && !profile.is_active) { setError('Tài khoản của bạn đã bị khóa.'); setBusy(false); return; } const payload = { ...form, owner_id: user.id, customer_email: form.customer_email || null, notes: form.notes || null }; const result = editing ? await supabase.from('orders').update(payload).eq('id', id) : await supabase.from('orders').insert(payload); setBusy(false); if (result.error) { setError(`Lỗi: ${result.error.message}`); return; } navigate(editing ? `/orders/${id}` : '/orders'); }
  return <><PageHeader eyebrow={editing ? 'Chỉnh sửa đơn tour' : 'Đơn tour mới'} title={editing ? 'Chỉnh sửa đơn tour' : 'Tạo đơn tour mới'} description="Điền thông tin để lưu lại yêu cầu đặt tour của khách hàng." actions={<Button variant="secondary" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Quay lại</Button>} /><form onSubmit={submit} className="form-layout"><Card><div className="card-title"><span className="section-icon"><User size={17} /></span><div><h2>Thông tin khách hàng</h2><p>Thông tin liên hệ của khách hàng.</p></div></div><div className="form-grid two"><Input label="Họ và tên" value={form.customer_name} onChange={v => update('customer_name', v)} placeholder="Nguyễn Văn An" required /><Input label="Số điện thoại" value={form.customer_phone} onChange={v => update('customer_phone', v)} placeholder="0901 234 567" icon={<Phone size={15} />} required /></div><Input label="Email" value={form.customer_email} onChange={v => update('customer_email', v)} placeholder="email@khachhang.com" type="email" icon={<Mail size={15} />} /></Card><Card><div className="card-title"><span className="section-icon"><ClipboardList size={17} /></span><div><h2>Thông tin đơn tour</h2><p>Lịch trình và trạng thái đặt tour.</p></div></div><Input label="Tên tour" value={form.tour_name} onChange={v => update('tour_name', v)} placeholder="Ví dụ: Tour Đà Lạt 3N2Đ, Phú Quốc 4N3Đ..." required /><div className="form-grid two"><Input label="Ngày tạo đơn" value={form.booking_date} onChange={v => update('booking_date', v)} type="date" required /><Input label="Ngày đi tour" value={form.tour_date} onChange={v => update('tour_date', v)} type="date" required /></div><Select label="Trạng thái" value={form.status} onChange={v => update('status', v)}>{Object.entries(statusMeta).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</Select></Card><Card><div className="card-title"><span className="section-icon"><FileText size={17} /></span><div><h2>Ghi chú</h2><p>Yêu cầu đặc biệt hoặc thông tin cần lưu ý.</p></div></div><label className="field"><textarea value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Ví dụ: Khách yêu cầu phòng đôi, ăn chay..." /></label></Card>{error && <div className="form-error">{error}</div>}<div className="form-actions"><Button variant="secondary" onClick={() => navigate(-1)}>Hủy</Button><Button type="submit" disabled={busy}>{busy ? 'Đang lưu...' : editing ? 'Lưu thay đổi' : 'Lưu đơn tour'} <Check size={16} /></Button></div></form></>;
}

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setCurrentUserId(user.id);
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      if (data?.role === 'admin') setIsAdmin(true);
    });
  }, []);

  useEffect(() => {
    if (id) supabase.from('orders').select('*, owner:profiles(display_name, username)').eq('id', id).maybeSingle().then(({ data }) => setOrder(data as Order | null));
  }, [id]);

  if (!order) return <div className="loading-state">Đang tải đơn tour...</div>;

  const canDelete = isAdmin || (currentUserId && order.owner_id === currentUserId);

  async function handleDelete() {
    if (!order || !window.confirm(`Bạn có chắc chắn muốn xóa đơn tour ${order.order_code}?`)) return;
    const { error } = await supabase.from('orders').delete().eq('id', order.id);
    if (error) {
      alert(`Không thể xóa đơn: ${error.message}`);
      return;
    }
    navigate(isAdmin ? '/admin/orders' : '/orders');
  }

  return (
    <>
      <PageHeader
        title={<span className="detail-title">{order.order_code} <Badge status={order.status} /></span>}
        description={
          <div className="order-dates-meta">
            <div className="meta-row"><span className="meta-label">Tạo lúc</span> <span>{new Date(order.created_at).toLocaleString('vi-VN')}</span></div>
            <div className="meta-row"><span className="meta-label">Cập nhật</span> <span>{new Date(order.updated_at).toLocaleString('vi-VN')}</span></div>
          </div>
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Quay lại</Button>
            <Button onClick={() => navigate(`/orders/${order.id}/edit`)}><Pencil size={16} /> Chỉnh sửa</Button>
            {canDelete && <Button variant="danger" onClick={handleDelete}><Trash2 size={16} /> Xóa đơn tour</Button>}
          </>
        }
      /><div className="detail-grid"><Card><div className="card-title"><span className="section-icon"><User size={17} /></span><h2>Thông tin khách hàng</h2></div><div className="detail-info"><div><span>Họ và tên</span><b>{order.customer_name}</b></div><div><span>Số điện thoại</span><b>{order.customer_phone}</b></div><div><span>Email</span><b>{order.customer_email || 'Chưa cập nhật'}</b></div></div></Card><Card><div className="card-title"><span className="section-icon"><CalendarDays size={17} /></span><h2>Thông tin chuyến đi</h2></div><div className="detail-info"><div><span>Tên tour</span><b>{order.tour_name}</b></div><div><span>Ngày tạo đơn</span><b>{new Date(order.booking_date).toLocaleDateString('vi-VN')}</b></div><div><span>Ngày đi tour</span><b>{new Date(order.tour_date).toLocaleDateString('vi-VN')}</b></div></div></Card><Card className="detail-full"><div className="card-title"><span className="section-icon"><FileText size={17} /></span><h2>Ghi chú</h2></div><p className="notes-text">{order.notes || 'Chưa có ghi chú cho đơn tour này.'}</p></Card></div></>);
}

function Dashboard() { const [orders, setOrders] = useState<Order[]>([]); useEffect(() => { supabase.from('orders').select('*').then(({ data }) => setOrders((data || []) as Order[])); }, []); const counts = Object.keys(statusMeta).map(status => ({ status: status as OrderStatus, count: orders.filter(o => o.status === status).length })); const total = orders.length; return <><PageHeader eyebrow="Tổng quan hệ thống" title="Bảng điều khiển" description="Theo dõi hiệu suất vận hành tour trong nháy mắt." actions={<Button variant="secondary"><CalendarDays size={16} /> Tháng này <ChevronDown size={14} /></Button>} /><div className="kpi-grid"><Kpi icon={<ClipboardList />} label="Tổng đơn tour" value={String(total || 0)} trend="12.5%" color="blue" /><Kpi icon={<TrendingUp />} label="Đơn đang xử lý" value={String(orders.filter(o => ['new', 'confirmed', 'deposited'].includes(o.status)).length)} trend="8.2%" color="amber" /><Kpi icon={<Check />} label="Hoàn thành" value={String(orders.filter(o => o.status === 'completed').length)} trend="16.4%" color="green" /><Kpi icon={<CircleDollarSign />} label="Tỷ lệ hoàn thành" value={total ? `${Math.round(orders.filter(o => o.status === 'completed').length / total * 100)}%` : '0%'} trend="4.8%" color="violet" /></div><div className="dashboard-grid"><Card><div className="card-heading-row"><div><h2>Đơn theo trạng thái</h2><p>Phân bổ toàn bộ đơn tour</p></div><MoreHorizontal size={18} /></div><div className="status-chart">{counts.map(item => <div className="chart-row" key={item.status}><div className="chart-label"><i style={{ background: `var(--status-${statusMeta[item.status].varPrefix}-text)` }} />{statusMeta[item.status].label}<b>{item.count}</b></div><div className="bar-track"><span style={{ width: `${total ? Math.max(4, item.count / Math.max(total, 1) * 100) : 4}%`, background: `var(--status-${statusMeta[item.status].varPrefix}-text)` }} /></div></div>)}</div></Card><Card><div className="card-heading-row"><div><h2>Xu hướng đơn tour</h2><p>Trong 7 ngày gần nhất</p></div><select className="mini-select"><option>7 ngày</option><option>30 ngày</option></select></div><div className="line-chart"><div className="grid-lines"><i /><i /><i /><i /></div><svg viewBox="0 0 600 180" preserveAspectRatio="none"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#60A5FA" stopOpacity=".25" /><stop offset="1" stopColor="#60A5FA" stopOpacity="0" /></linearGradient></defs><path d="M0 145 C45 125, 65 137, 105 112 S165 120, 205 95 S275 119, 315 84 S370 105, 415 72 S475 86, 520 52 S565 62, 600 32 V180 H0Z" fill="url(#chartFill)" /><path d="M0 145 C45 125, 65 137, 105 112 S165 120, 205 95 S275 119, 315 84 S370 105, 415 72 S475 86, 520 52 S565 62, 600 32" fill="none" stroke="#60A5FA" strokeWidth="3" /></svg><div className="chart-days"><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span></div></div></Card></div></>; }
function Kpi({ icon, label, value, trend, color }: { icon: ReactNode; label: string; value: string; trend: string; color: string }) { return <Card className="kpi-card"><div className={`kpi-icon ${color}`}>{icon}</div><span className="kpi-label">{label}</span><strong>{value}</strong><span className="kpi-trend"><TrendingUp size={13} /> {trend} <em>so với tháng trước</em></span></Card>; }

// Tự sinh username từ tên hiển thị: bỏ dấu, viết thường, nối bằng dấu chấm, thêm 4 ký tự ngẫu nhiên
function generateUsername(displayName: string): string {
  const normalized = displayName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .trim()
    .split(/\s+/)
    .join('.');
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${normalized}.${suffix}`;
}

function SalersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ display_name: '', username: '', email: '', password: '' });
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Tự động thu gọn menu thao tác khi click chuột ra ngoài
  useEffect(() => {
    if (!openMenu) return;
    function handleOutsideClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (target && !target.closest('.dropdown-panel') && !target.closest('.more-button')) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [openMenu]);

  // State cho modal Chỉnh sửa thông tin nhân viên
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [editForm, setEditForm] = useState({ display_name: '', username: '', email: '', role: 'saler' as Role, password: '' });
  const [editFormError, setEditFormError] = useState('');

  function load() { supabase.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => setProfiles((data || []) as Profile[])); }
  useEffect(() => { load(); }, []);

  const filtered = profiles.filter(p => `${p.display_name} ${p.username} ${p.email}`.toLowerCase().includes(query.toLowerCase()));

  // Khi tên thay đổi, tự sinh username (trừ khi admin đã sửa tay)
  function handleDisplayNameChange(v: string) {
    setForm(p => ({
      ...p,
      display_name: v,
      username: usernameEdited ? p.username : (v.trim() ? generateUsername(v) : ''),
    }));
  }

  function handleUsernameChange(v: string) {
    setUsernameEdited(true);
    setForm(p => ({ ...p, username: v.toLowerCase().replace(/[^a-z0-9._-]/g, '') }));
  }

  function closeModal() {
    setShowModal(false);
    setForm({ display_name: '', username: '', email: '', password: '' });
    setUsernameEdited(false);
    setFormError('');
  }

  function openEdit(profile: Profile) {
    setEditingProfile(profile);
    setEditForm({
      display_name: profile.display_name,
      username: profile.username || '',
      email: profile.email,
      role: profile.role,
      password: '',
    });
    setEditFormError('');
    setOpenMenu(null);
  }

  function closeEditModal() {
    setEditingProfile(null);
    setEditFormError('');
  }

  async function createSaler(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    setBusy(true);

    if (!form.username.trim()) { setFormError('Username không được để trống.'); setBusy(false); return; }

    // Kiểm tra username đã tồn tại chưa
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .ilike('username', form.username.trim())
      .maybeSingle();
    if (existing) { setFormError('Username này đã được sử dụng. Vui lòng chọn tên khác.'); setBusy(false); return; }

    // Tạo user trên Supabase Auth
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: form.email,
      password: form.password,
      email_confirm: true,
      user_metadata: { full_name: form.display_name },
    });
    if (createError || !createData?.user) {
      setFormError(createError?.message || 'Không thể tạo tài khoản.');
      setBusy(false);
      return;
    }

    // Cập nhật username vào profiles (trigger đã tạo profile, nhưng username do trigger sinh ngẫu nhiên)
    await supabaseAdmin
      .from('profiles')
      .update({ username: form.username.trim().toLowerCase() })
      .eq('id', createData.user.id);

    setBusy(false);
    closeModal();
    load();
  }

  async function updateSaler(e: FormEvent) {
    e.preventDefault();
    if (!editingProfile) return;
    setEditFormError('');
    setBusy(true);

    const cleanDisplayName = editForm.display_name.trim();
    const cleanUsername = editForm.username.trim().toLowerCase();
    const cleanEmail = editForm.email.trim().toLowerCase();

    if (!cleanDisplayName) { setEditFormError('Họ và tên không được để trống.'); setBusy(false); return; }
    if (!cleanUsername) { setEditFormError('Username không được để trống.'); setBusy(false); return; }
    if (!cleanEmail) { setEditFormError('Email không được để trống.'); setBusy(false); return; }

    // Kiểm tra trùng username với người khác
    if (cleanUsername !== (editingProfile.username || '').toLowerCase()) {
      const { data: existingUser } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .ilike('username', cleanUsername)
        .neq('id', editingProfile.id)
        .maybeSingle();
      if (existingUser) {
        setEditFormError('Username này đã được tài khoản khác sử dụng.');
        setBusy(false);
        return;
      }
    }

    // Kiểm tra trùng email với người khác
    if (cleanEmail !== editingProfile.email.toLowerCase()) {
      const { data: existingEmail } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .ilike('email', cleanEmail)
        .neq('id', editingProfile.id)
        .maybeSingle();
      if (existingEmail) {
        setEditFormError('Email này đã được tài khoản khác sử dụng.');
        setBusy(false);
        return;
      }
    }

    // Cập nhật Supabase Auth
    const authPayload: { email?: string; password?: string; user_metadata?: { full_name: string } } = {
      user_metadata: { full_name: cleanDisplayName },
    };
    if (cleanEmail !== editingProfile.email.toLowerCase()) {
      authPayload.email = cleanEmail;
    }
    if (editForm.password && editForm.password.trim().length > 0) {
      if (editForm.password.length < 6) {
        setEditFormError('Mật khẩu mới cần tối thiểu 6 ký tự.');
        setBusy(false);
        return;
      }
      authPayload.password = editForm.password;
    }

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      editingProfile.id,
      authPayload
    );
    if (authError) {
      setEditFormError(authError.message || 'Không thể cập nhật tài khoản Auth.');
      setBusy(false);
      return;
    }

    // Cập nhật bảng profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        display_name: cleanDisplayName,
        username: cleanUsername,
        email: cleanEmail,
        role: editForm.role,
      })
      .eq('id', editingProfile.id);

    if (profileError) {
      setEditFormError(profileError.message || 'Không thể cập nhật hồ sơ nhân viên.');
      setBusy(false);
      return;
    }

    setBusy(false);
    closeEditModal();
    load();
  }

  async function toggleActive(profile: Profile) {
    if (profile.role === 'admin') return;
    const nextActive = !profile.is_active;

    // 1. Cập nhật bảng profiles dùng supabaseAdmin để đảm bảo quyền
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ is_active: nextActive })
      .eq('id', profile.id);

    if (profileError) {
      alert('Không thể cập nhật trạng thái: ' + profileError.message);
      return;
    }

    // 2. Đồng bộ trạng thái khóa/mở khóa tới Supabase Auth
    try {
      await supabaseAdmin.auth.admin.updateUserById(profile.id, {
        ban_duration: nextActive ? 'none' : '876600h',
      });
    } catch (err) {
      console.error('Không thể đồng bộ trạng thái ban tới Supabase Auth:', err);
    }

    setOpenMenu(null);
    load();
  }

  return (
    <>
      <PageHeader eyebrow="Quản trị người dùng" title="Nhân viên Sale" description="Quản lý tài khoản và quyền truy cập của đội ngũ bán hàng." actions={<Button onClick={() => setShowModal(true)}><Plus size={16} /> Tạo nhân viên mới</Button>} />

      {/* Modal Tạo nhân viên mới */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div><h2>Tạo nhân viên Sale</h2><p>Tài khoản sẽ được kích hoạt ngay lập tức.</p></div>
              <button className="modal-close" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={createSaler}>
              <Input
                label="Họ và tên"
                value={form.display_name}
                onChange={handleDisplayNameChange}
                placeholder="Nguyễn Văn An"
                required
              />
              <div style={{ position: 'relative' }}>
                <Input
                  label="Username đăng nhập"
                  value={form.username}
                  onChange={handleUsernameChange}
                  placeholder="nguyen.van.an.xxxx"
                  icon={<User size={15} />}
                  required
                />
                {!usernameEdited && form.username && (
                  <span className="field-hint">Tự sinh — có thể chỉnh sửa</span>
                )}
              </div>
              <Input
                label="Email đăng nhập"
                value={form.email}
                onChange={v => setForm(p => ({ ...p, email: v }))}
                placeholder="nhanvien@tourflow.vn"
                type="email"
                icon={<Mail size={15} />}
                required
              />
              <Input
                label="Mật khẩu tạm thời"
                value={form.password}
                onChange={v => setForm(p => ({ ...p, password: v }))}
                placeholder="Tối thiểu 6 ký tự"
                type="password"
                icon={<KeyRound size={15} />}
                required
              />
              {formError && <div className="form-error">{formError}</div>}
              <div className="form-actions">
                <Button variant="secondary" type="button" onClick={closeModal}>Hủy</Button>
                <Button type="submit" disabled={busy}>{busy ? 'Đang tạo...' : 'Tạo tài khoản'} <Check size={15} /></Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chỉnh sửa thông tin nhân viên */}
      {editingProfile && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div><h2>Chỉnh sửa nhân viên</h2><p>Cập nhật thông tin tài khoản của {editingProfile.display_name}.</p></div>
              <button className="modal-close" onClick={closeEditModal}><X size={18} /></button>
            </div>
            <form onSubmit={updateSaler}>
              <Input
                label="Họ và tên"
                value={editForm.display_name}
                onChange={v => setEditForm(p => ({ ...p, display_name: v }))}
                placeholder="Nguyễn Văn An"
                required
              />
              <Input
                label="Username đăng nhập"
                value={editForm.username}
                onChange={v => setEditForm(p => ({ ...p, username: v.toLowerCase().replace(/[^a-z0-9._-]/g, '') }))}
                placeholder="username_sale"
                icon={<User size={15} />}
                required
              />
              <Input
                label="Email đăng nhập"
                value={editForm.email}
                onChange={v => setEditForm(p => ({ ...p, email: v }))}
                placeholder="nhanvien@tourflow.vn"
                type="email"
                icon={<Mail size={15} />}
                required
              />
              <Select
                label="Vai trò hệ thống"
                value={editForm.role}
                onChange={v => setEditForm(p => ({ ...p, role: v as Role }))}
              >
                <option value="saler">Nhân viên Sale (Sale Executive)</option>
                <option value="admin">Quản trị viên (Admin)</option>
              </Select>
              <Input
                label="Mật khẩu mới (Tùy chọn)"
                value={editForm.password}
                onChange={v => setEditForm(p => ({ ...p, password: v }))}
                placeholder="Để trống nếu không muốn đổi mật khẩu"
                type="password"
                icon={<KeyRound size={15} />}
              />
              {editFormError && <div className="form-error">{editFormError}</div>}
              <div className="form-actions">
                <Button variant="secondary" type="button" onClick={closeEditModal}>Hủy</Button>
                <Button type="submit" disabled={busy}>{busy ? 'Đang lưu...' : 'Lưu thay đổi'} <Check size={15} /></Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Card>
        <div className="toolbar">
          <div className="search-field"><Search size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm tên, username hoặc email..." /></div>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>NHÂN VIÊN</th><th>USERNAME</th><th>EMAIL</th><th>VAI TRÒ</th><th>TRẠNG THÁI</th><th>NGÀY THAM GIA</th><th /></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state compact"><Users size={28} /><h3>Chưa có nhân viên nào</h3><p>Bấm "Tạo nhân viên mới" để bắt đầu.</p></div></td></tr>
              ) : filtered.map((profile, index) => (
                <tr key={profile.id} style={{ position: 'relative', zIndex: openMenu === profile.id ? 40 : 1 }}>
                  <td><div className="owner-cell"><span className="avatar">{(profile.display_name || 'NV').slice(0, 2).toUpperCase()}</span><b>{profile.display_name}</b></div></td>
                  <td className="mono">@{profile.username}</td>
                  <td className="muted">{profile.email}</td>
                  <td><span className="role-pill">{profile.role === 'admin' ? 'Admin' : 'Sale Executive'}</span></td>
                  <td><span className={`active-pill ${profile.is_active ? 'on' : 'off'}`}><i />{profile.is_active ? 'Đang hoạt động' : 'Đã khóa'}</span></td>
                  <td className="muted">{new Date(profile.created_at).toLocaleDateString('vi-VN')}</td>
                  <td style={{ position: 'relative', zIndex: openMenu === profile.id ? 50 : 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative', zIndex: openMenu === profile.id ? 60 : 1 }}>
                      <div className="row-actions">
                        <button className="more-button" onClick={() => setOpenMenu(openMenu === profile.id ? null : profile.id)} title="Thao tác">
                          <MoreHorizontal size={17} />
                        </button>
                      </div>
                      {openMenu === profile.id && (
                        <div
                          className="dropdown-panel"
                          style={{
                            right: 0,
                            top: index >= filtered.length - 2 && filtered.length > 2 ? 'auto' : '110%',
                            bottom: index >= filtered.length - 2 && filtered.length > 2 ? '110%' : 'auto',
                            minWidth: 180,
                            zIndex: 1000
                          }}
                        >
                          <b>Thao tác</b>
                          <button type="button" onClick={() => openEdit(profile)}><Pencil size={13} /> Chỉnh sửa thông tin</button>
                          {profile.role !== 'admin' && (
                            <button type="button" onClick={() => toggleActive(profile)}>
                              {profile.is_active ? <><Lock size={13} /> Khóa tài khoản</> : <><Check size={13} /> Mở khóa tài khoản</>}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadLogs() {
    const { data } = await supabase
      .from('activity_logs')
      .select('*, actor:profiles(display_name, username)')
      .order('created_at', { ascending: false })
      .limit(150);
    setLogs((data || []) as ActivityLog[]);
    setLoading(false);
  }

  useEffect(() => {
    loadLogs();
    const channel = supabase
      .channel('realtime-activity-logs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, () => {
        loadLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredLogs = useMemo(() => {
    if (!query.trim()) return logs;
    const q = query.trim().toLowerCase();
    const qNorm = removeVietnameseTones(q);

    return logs.filter(log => {
      const name = (log.actor?.display_name || '').toLowerCase();
      const nameNorm = removeVietnameseTones(name);
      const username = (log.actor?.username || '').toLowerCase();
      const desc = (log.description || '').toLowerCase();
      const descNorm = removeVietnameseTones(desc);

      return (
        name.includes(q) ||
        nameNorm.includes(qNorm) ||
        username.includes(q) ||
        desc.includes(q) ||
        descNorm.includes(qNorm)
      );
    });
  }, [logs, query]);

  return (
    <>
      <PageHeader
        eyebrow="Theo dõi hệ thống"
        title="Lịch sử hoạt động"
        description="Nhật ký hành động của đội ngũ được cập nhật theo thời gian thực."
        actions={<span className="live-status large"><i /> LIVE · Đang cập nhật</span>}
      />
      <Card>
        <div className="activity-filters" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="search-field">
            <Search size={17} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Tìm nhân viên Sale..."
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', padding: 0 }}
                title="Xóa tìm kiếm"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
            Hiển thị <b>{filteredLogs.length}</b> {query ? `/ ${logs.length}` : ''} hoạt động
          </span>
        </div>
        {loading ? (
          <div className="loading-state">Đang tải nhật ký hoạt động...</div>
        ) : (
          <div className="activity-list">
            {logs.length === 0 ? (
              <div className="empty-state compact">
                <Activity size={28} />
                <h3>Chưa có hoạt động</h3>
                <p>Nhật ký hệ thống sẽ hiển thị tại đây.</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="empty-state compact">
                <Search size={28} />
                <h3>Không tìm thấy hoạt động nào</h3>
                <p>Không có hoạt động nào khớp với nhân viên "{query}".</p>
                <Button variant="secondary" onClick={() => setQuery('')} style={{ marginTop: '10px' }}>
                  Xóa tìm kiếm
                </Button>
              </div>
            ) : (
              filteredLogs.map(log => (
                <div className={`activity-item ${log.action_type}`} key={log.id}>
                  <span className="activity-time">{new Date(log.created_at).toLocaleTimeString('vi-VN')}</span>
                  <span className="avatar small">{(log.actor?.display_name || 'SY').slice(0, 2).toUpperCase()}</span>
                  <div>
                    <b>
                      {log.actor?.display_name || 'Hệ thống'}{' '}
                      <span className="mono">@{log.actor?.username || 'system'}</span>
                    </b>
                    <p>{log.description}</p>
                  </div>
                  <span className="activity-date">{new Date(log.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
              ))
            )}
          </div>
        )}
      </Card>
    </>
  );
}

function ChangePassword() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!current) { setError('Vui lòng nhập mật khẩu hiện tại.'); return; }
    if (next.length < 8) { setError('Mật khẩu mới cần ít nhất 8 ký tự.'); return; }
    if (next !== confirm) { setError('Mật khẩu xác nhận chưa khớp.'); return; }
    if (current === next) { setError('Mật khẩu mới phải khác mật khẩu hiện tại.'); return; }

    setBusy(true);

    // Lấy email của user đang đăng nhập
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.email) {
      setError('Không thể lấy thông tin tài khoản. Vui lòng đăng nhập lại.');
      setBusy(false);
      return;
    }

    // Xác minh mật khẩu hiện tại bằng cách thử đăng nhập lại
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: current,
    });

    if (signInError) {
      setError('Mật khẩu hiện tại không đúng.');
      setBusy(false);
      return;
    }

    // Mật khẩu hiện tại đúng → tiến hành cập nhật
    const { error: updateError } = await supabase.auth.updateUser({ password: next });
    setBusy(false);

    if (updateError) {
      setError('Không thể đổi mật khẩu lúc này. Vui lòng thử lại.');
    } else {
      setMessage('Đổi mật khẩu thành công!');
      setCurrent('');
      setNext('');
      setConfirm('');
    }
  }

  return (
    <>
      <PageHeader eyebrow="Cài đặt tài khoản" title="Đổi mật khẩu" description="Giữ tài khoản của bạn luôn an toàn." />
      <Card className="password-card">
        <div className="card-title">
          <span className="section-icon"><Lock size={17} /></span>
          <div><h2>Cập nhật mật khẩu</h2><p>Mật khẩu mới nên có ít nhất 8 ký tự và khác mật khẩu hiện tại.</p></div>
        </div>
        <form onSubmit={submit}>
          <Input label="Mật khẩu hiện tại" value={current} onChange={setCurrent} type="password" required />
          <Input label="Mật khẩu mới" value={next} onChange={setNext} type="password" required />
          <Input label="Xác nhận mật khẩu mới" value={confirm} onChange={setConfirm} type="password" required />
          {error && <div className="form-error">{error}</div>}
          {message && <div className="form-success"><Check size={15} />{message}</div>}
          <div className="form-actions">
            <Button variant="secondary" type="button" onClick={() => { setCurrent(''); setNext(''); setConfirm(''); setError(''); setMessage(''); }}>Hủy</Button>
            <Button type="submit" disabled={busy}>{busy ? 'Đang xác minh...' : 'Lưu thay đổi'}</Button>
          </div>
        </form>
      </Card>
    </>
  );
}

function AuthRecoveryHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (sessionStorage.getItem('skip_recovery') === 'true') {
      return;
    }

    if (window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery')) {
      if (location.pathname !== '/reset-password') {
        navigate('/reset-password', { replace: true });
      }
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        if (sessionStorage.getItem('skip_recovery') !== 'true') {
          navigate('/reset-password', { replace: true });
        }
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [navigate, location.pathname]);

  return null;
}

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [directBusy, setDirectBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    sessionStorage.removeItem('skip_recovery');
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session));
      setChecking(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setHasSession(true);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    if (password.length < 8) {
      setError('Mật khẩu mới cần ít nhất 8 ký tự.');
      return;
    }
    if (password !== confirm) {
      setError('Mật khẩu xác nhận chưa khớp.');
      return;
    }
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) {
      setError('Không thể cập nhật mật khẩu. Link có thể đã hết hạn hoặc không hợp lệ.');
    } else {
      sessionStorage.setItem('skip_recovery', 'true');
      window.history.replaceState(null, '', '/');
      setMessage('Đặt mật khẩu mới thành công! Đang chuyển hướng vào trang của bạn...');
      setTimeout(() => navigate('/'), 1200);
    }
  }

  function handleDirectLogin() {
    setDirectBusy(true);
    sessionStorage.setItem('skip_recovery', 'true');
    window.history.replaceState(null, '', '/');
    navigate('/', { replace: true });
  }

  if (checking) {
    return <div className="loading-screen">Đang xác thực liên kết...</div>;
  }

  return (
    <main className="auth-shell">
      <div className="auth-decoration decoration-one" />
      <div className="auth-decoration decoration-two" />
      <div className="auth-brand">
        <Logo />
        <span className="secure-label"><Lock size={12} /> Khôi phục tài khoản</span>
      </div>
      <Card className="auth-card">
        {!hasSession ? (
          <div className="auth-heading">
            <div className="auth-icon"><Lock size={22} /></div>
            <h1>Liên kết không hợp lệ</h1>
            <p>Liên kết đặt lại mật khẩu đã hết hạn hoặc không tồn tại.</p>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/forgot-password" className="button button-primary full-button">
                Yêu cầu link mới <ArrowLeft size={16} className="arrow-right" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="auth-heading">
              <div className="auth-icon"><Lock size={22} /></div>
              <h1>Đặt lại mật khẩu</h1>
              <p>Bạn có thể đặt mật khẩu mới hoặc tiếp tục vào thẳng hệ thống.</p>
            </div>
            <form onSubmit={submit}>
              <label className="field">
                <span>Mật khẩu mới <em> *</em></span>
                <div className="input-wrap">
                  <span className="input-icon"><KeyRound size={16} /></span>
                  <input
                    type={show ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Nhập ít nhất 8 ký tự"
                    required
                  />
                  <button type="button" className="input-action" onClick={() => setShow(!show)}>
                    {show ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
              </label>

              <label className="field">
                <span>Xác nhận mật khẩu mới <em> *</em></span>
                <div className="input-wrap">
                  <span className="input-icon"><KeyRound size={16} /></span>
                  <input
                    type={show ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    required
                  />
                </div>
              </label>

              {error && <div className="form-error">{error}</div>}
              {message && <div className="form-success"><Check size={15} />{message}</div>}

              <Button type="submit" className="full-button" disabled={busy || directBusy}>
                {busy ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'} <ArrowLeft size={16} className="arrow-right" />
              </Button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '14px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-row)' }} />
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)', fontWeight: 600 }}>Hoặc</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-row)' }} />
              </div>

              <Button
                type="button"
                variant="secondary"
                className="full-button"
                disabled={busy || directBusy}
                onClick={handleDirectLogin}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <LogIn size={16} /> {directBusy ? 'Đang vào hệ thống...' : 'Không đổi mật khẩu, vào hệ thống ngay'}
              </Button>
            </form>
          </>
        )}
      </Card>
      <div className="auth-footer">© 2026 TourFlow CRM · Dành cho đội ngũ nội bộ</div>
    </main>
  );
}

function ProtectedRoute() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'locked' | 'unauthenticated'>('loading');

  useEffect(() => {
    let mounted = true;

    async function check() {
      try {
        const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
        if (!mounted) return;
        if (sessionErr || !sessionData?.session) {
          setAuthStatus('unauthenticated');
          return;
        }

        const user = sessionData.session.user;
        if (!user) {
          setAuthStatus('unauthenticated');
          return;
        }

        // Kiểm tra nhanh trạng thái is_active
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('is_active')
          .eq('id', user.id)
          .maybeSingle();

        if (!mounted) return;

        if (!profileErr && profile && profile.is_active === false) {
          await supabase.auth.signOut();
          setAuthStatus('locked');
          return;
        }

        setAuthStatus('authorized');
      } catch (err) {
        console.error('Lỗi khi kiểm tra phiên đăng nhập:', err);
        if (mounted) {
          const { data } = await supabase.auth.getSession();
          setAuthStatus(data?.session ? 'authorized' : 'unauthenticated');
        }
      }
    }

    check();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, current) => {
      if (!mounted) return;
      if (!current) {
        setAuthStatus('unauthenticated');
      } else {
        setAuthStatus('authorized');
      }
    });

    // Timeout an toàn: đảm bảo không bao giờ bị kẹt màn hình loading quá 1.5 giây
    const timeout = setTimeout(() => {
      if (mounted) {
        setAuthStatus(prev => (prev === 'loading' ? 'authorized' : prev));
      }
    }, 1500);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      listener.subscription.unsubscribe();
    };
  }, []);

  if (sessionStorage.getItem('skip_recovery') !== 'true') {
    if (window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery')) {
      return <Navigate to="/reset-password" replace />;
    }
  }

  if (authStatus === 'loading') return <div className="loading-screen">Đang tải TourFlow...</div>;
  if (authStatus === 'locked') return <Navigate to="/login?locked=true" replace />;
  if (authStatus === 'unauthenticated') return <Navigate to="/login" replace />;
  return <AppLayout />;
}

function App() {
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <BrowserRouter>
        <AuthRecoveryHandler />
        <Routes>
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/forgot-password" element={<AuthPage mode="forgot" />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<ProtectedRoute />}>
            <Route index element={<RoleRedirect />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/new" element={<OrderForm />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="orders/:id/edit" element={<OrderForm />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="admin/orders" element={<OrdersPage admin />} />
            <Route path="admin/salers" element={<SalersPage />} />
            <Route path="admin/activity" element={<ActivityPage />} />
            <Route path="settings/change-password" element={<ChangePassword />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeContext.Provider>
  );
}

function RoleRedirect() { const [role, setRole] = useState<Role | null>(null); useEffect(() => { (async () => { const { data: { user } } = await supabase.auth.getUser(); if (!user) { setRole('saler'); return; } const { data } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(); setRole((data?.role as Role) || 'saler'); })(); }, []); if (!role) return <div className="loading-screen">Đang chuẩn bị không gian làm việc...</div>; return <Navigate to={role === 'admin' ? '/dashboard' : '/orders'} replace />; }
export default App;
