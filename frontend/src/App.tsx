import {
  createContext,
  useContext,
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

const ThemeContext = createContext<{ theme: string; toggleTheme: () => void }>({
  theme: "dark",
  toggleTheme: () => {},
});
export function useTheme() {
  return useContext(ThemeContext);
}
import {
  BrowserRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
  useOutletContext,
} from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";
import {
  Activity,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  ExternalLink,
  Eye,
  FileText,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogIn,
  LogOut,
  Mail,
  Menu,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Trash2,
  TrendingUp,
  User,
  Users,
  X,
  Sun,
  Moon,
  Compass,
  BedDouble,
  Copy,
  CheckCheck,
  Clock,
  PhoneCall,
  ArrowRight,
} from "lucide-react";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import type {
  ActivityLog,
  Order,
  OrderStatus,
  Profile,
  Role,
  Tour,
  RoomType,
} from "@/types";
import { NotificationBell } from "./components/NotificationBell";
import { Avatar } from "./components/Avatar";
import { ProfilePage } from "./components/ProfilePage";
import { AdminSettingsPage } from "./components/AdminSettingsPage";
import { StarRating } from "./components/StarRating";

const statusMeta: Record<OrderStatus, { label: string; varPrefix: string }> = {
  new: { label: "Mới", varPrefix: "new" },
  consulting: { label: "Đang tư vấn", varPrefix: "consulting" },
  closed: { label: "Đã chốt", varPrefix: "closed" },
  cancelled: { label: "Đã hủy", varPrefix: "cancelled" },
};

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="brand">
      <span className="brand-mark">
        <ShieldCheck size={18} />
      </span>
      {!compact && (
        <span>
          TourFlow <b>CRM</b>
        </span>
      )}
    </Link>
  );
}

function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  onClick,
  disabled = false,
  style,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={`button button-${variant} ${className}`}
    >
      {children}
    </button>
  );
}

function Badge({ status }: { status: OrderStatus }) {
  const item = statusMeta[status] || statusMeta.new;
  return (
    <span
      className="status-badge"
      style={{
        color: `var(--status-${item.varPrefix}-text)`,
        background: `var(--status-${item.varPrefix}-bg)`,
      }}
    >
      <i style={{ background: `var(--status-${item.varPrefix}-text)` }} />
      {item.label}
    </span>
  );
}
function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`card ${className}`}>{children}</section>;
}
function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <div className="page-description">{description}</div>}
      </div>
      {actions && <div className="header-actions">{actions}</div>}
    </div>
  );
}
function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  required = false,
  min,
  max,
  step,
  inputMode,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  icon?: ReactNode;
  required?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  inputMode?:
    | "none"
    | "text"
    | "tel"
    | "url"
    | "email"
    | "numeric"
    | "decimal"
    | "search";
}) {
  return (
    <label className="field">
      {label && (
        <span>
          {label}
          {required && <em> *</em>}
        </span>
      )}
      <div className="input-wrap">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
          step={step}
          inputMode={inputMode}
        />
      </div>
    </label>
  );
}
function Select({
  label,
  value,
  onChange,
  children,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="field">
      {label && <span>{label}</span>}
      <div className="select-wrap">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {children}
        </select>
        <ChevronDown size={15} />
      </div>
    </label>
  );
}

function AuthPage({ mode }: { mode: "login" | "forgot" }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (searchParams.get("locked") === "true") {
      setError("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
    }
  }, [searchParams]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    if (mode === "forgot") {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        identifier,
        { redirectTo: `${window.location.origin}/reset-password` },
      );
      setBusy(false);
      if (resetError)
        setError("Không thể gửi email lúc này. Vui lòng thử lại.");
      else
        setMessage(
          "Nếu email đã được đăng ký, chúng tôi đã gửi link đặt lại mật khẩu.",
        );
      return;
    }

    // Xác định email: nếu không có @ thì tra username → lấy email thông qua hàm RPC bảo mật
    let loginEmail = identifier.trim();
    if (!loginEmail.includes("@")) {
      const { data: lookedUpEmail, error: lookupError } = await supabase.rpc(
        "get_email_by_username",
        {
          p_username: loginEmail,
        },
      );
      if (lookupError || !lookedUpEmail) {
        setError("Tên đăng nhập hoặc mật khẩu không đúng.");
        setBusy(false);
        return;
      }
      loginEmail = lookedUpEmail;
    }

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });
    if (loginError || !data.user) {
      setBusy(false);
      if (loginError?.message?.toLowerCase().includes("banned")) {
        setError("Tài khoản này đã bị khóa. Vui lòng liên hệ quản trị viên.");
      } else {
        setError("Tên đăng nhập hoặc mật khẩu không đúng.");
      }
      return;
    }

    // Kiểm tra thêm trạng thái is_active từ bảng profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_active")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profile && profile.is_active === false) {
      await supabase.auth.signOut();
      setBusy(false);
      setError("Tài khoản này đã bị khóa. Vui lòng liên hệ quản trị viên.");
      return;
    }

    setBusy(false);
    navigate("/");
  }

  return (
    <main className="auth-shell">
      <div className="auth-decoration decoration-one" />
      <div className="auth-decoration decoration-two" />
      <div className="auth-brand">
        <Logo />
        <span className="secure-label">
          <Lock size={12} /> Không gian làm việc bảo mật
        </span>
      </div>
      <Card className="auth-card">
        {mode === "login" ? (
          <>
            <div className="auth-heading">
              <div className="auth-icon">
                <ShieldCheck size={22} />
              </div>
              <h1>Chào mừng trở lại</h1>
              <p>Đăng nhập để quản lý đơn tour của bạn.</p>
            </div>
            <form onSubmit={submit}>
              <Input
                label="Username hoặc Email"
                value={identifier}
                onChange={setIdentifier}
                placeholder="Nhập username hoặc email"
                icon={<User size={16} />}
                required
              />
              <label className="field">
                <span>Mật khẩu</span>
                <div className="input-wrap">
                  <span className="input-icon">
                    <KeyRound size={16} />
                  </span>
                  <input
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    required
                  />
                  <button
                    type="button"
                    className="input-action"
                    onClick={() => setShow(!show)}
                  >
                    {show ? "Ẩn" : "Hiện"}
                  </button>
                </div>
              </label>
              <div className="form-row">
                <label className="check">
                  <input type="checkbox" /> Ghi nhớ đăng nhập
                </label>
                <Link to="/forgot-password">Quên mật khẩu?</Link>
              </div>
              {error && <div className="form-error">{error}</div>}
              <Button type="submit" className="full-button" disabled={busy}>
                {busy ? "Đang đăng nhập..." : "Đăng nhập"}{" "}
                <ArrowLeft size={16} className="arrow-right" />
              </Button>
            </form>
            <div className="auth-foot">
              Tài khoản được cấp bởi quản trị viên
            </div>
          </>
        ) : (
          <>
            <div className="auth-heading">
              <div className="auth-icon">
                <KeyRound size={22} />
              </div>
              <h1>Quên mật khẩu?</h1>
              <p>Nhập email công việc để nhận link đặt lại mật khẩu.</p>
            </div>
            <form onSubmit={submit}>
              <Input
                label="Email công việc"
                value={identifier}
                onChange={setIdentifier}
                placeholder="Nhập email công việc"
                type="email"
                icon={<Mail size={16} />}
                required
              />
              {error && <div className="form-error">{error}</div>}
              {message && (
                <div className="form-success">
                  <Check size={15} />
                  {message}
                </div>
              )}
              <Button type="submit" className="full-button" disabled={busy}>
                {busy ? "Đang gửi..." : "Gửi link đặt lại"}
              </Button>
            </form>
            <Link to="/login" className="back-link">
              <ArrowLeft size={15} /> Quay lại đăng nhập
            </Link>
          </>
        )}
      </Card>
      <div className="auth-footer">
        © 2026 TourFlow CRM · Dành cho đội ngũ nội bộ
      </div>
    </main>
  );
}

function Sidebar({ profile }: { profile: Profile | null }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [orderCount, setOrderCount] = useState<number>(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const { count } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("owner_id", user.id);
        setOrderCount(count || 0);
      } catch (e) {
        console.error("Sidebar order count error:", e);
      }
    })();
  }, [profile]);

  // Tự động đóng menu tài khoản khi click chuột ra ngoài
  useEffect(() => {
    if (!userMenuOpen) return;
    function handleOutside(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        !target.closest(".user-popup-menu") &&
        !target.closest(".user-menu-button")
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [userMenuOpen]);

  const isAdmin = profile?.role === "admin";
  const nav = isAdmin
    ? [
        {
          label: "Tổng quan",
          to: "/dashboard",
          icon: <LayoutDashboard size={18} />,
        },
        {
          label: "Tất cả đơn tour",
          to: "/admin/orders",
          icon: <ClipboardList size={18} />,
        },
        {
          label: "Nhân viên Sale",
          to: "/admin/salers",
          icon: <Users size={18} />,
        },
        {
          label: "Lịch sử hoạt động hệ thống",
          to: "/admin/activity",
          icon: <Activity size={18} />,
        },
        {
          label: "Cài đặt hệ thống",
          to: "/admin/settings",
          icon: <Settings size={18} />,
        },
      ]
    : [
        {
          label: "Đơn của tôi",
          to: "/orders",
          icon: <ClipboardList size={18} />,
        },
        { label: "Tạo đơn mới", to: "/orders/new", icon: <Plus size={18} /> },
      ];

  async function logout() {
    sessionStorage.removeItem("skip_recovery");
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <>
      <button
        className="mobile-menu"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Menu size={20} />
      </button>
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-top">
          <Logo />
          <button
            className="sidebar-close"
            onClick={() => setMobileOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <nav>
          <span className="nav-label">Workspace</span>
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={location.pathname === item.to ? "active" : ""}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.to === "/orders" && orderCount > 0 && (
                <span className="nav-count">{orderCount}</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          {userMenuOpen && (
            <div className="user-popup-menu">
              <b>Tài khoản</b>
              <button
                type="button"
                className={location.pathname === "/profile" ? "active" : ""}
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate("/profile");
                }}
              >
                <User size={14} />
                <span>Hồ sơ cá nhân</span>
              </button>
              {isAdmin && (
                <button
                  type="button"
                  className={
                    location.pathname === "/admin/settings" ? "active" : ""
                  }
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate("/admin/settings");
                  }}
                >
                  <Settings size={14} />
                  <span>Cài đặt hệ thống</span>
                </button>
              )}
              <button
                type="button"
                className={
                  location.pathname.includes("change-password") ? "active" : ""
                }
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate("/settings/change-password");
                }}
              >
                <KeyRound size={14} />
                <span>Đổi mật khẩu</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleTheme();
                  setUserMenuOpen(false);
                }}
              >
                {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
                <span>
                  {theme === "light" ? "Giao diện tối" : "Giao diện sáng"}
                </span>
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
          <div
            className="user-mini"
            onClick={() => navigate("/profile")}
            style={{ cursor: "pointer" }}
            title="Nhấn để xem hồ sơ cá nhân"
          >
            <Avatar src={profile?.avatar_url} name={profile?.display_name} />
            <div>
              <b>{profile?.display_name || "Nhân viên Sale"}</b>
              <span>{isAdmin ? "Quản trị viên" : "Nhân viên"}</span>
            </div>
            <button
              type="button"
              className={`user-menu-button ${userMenuOpen ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setUserMenuOpen(!userMenuOpen);
              }}
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
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const today = new Date().toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setLoadingProfile(false);
          return;
        }
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        const p = data as Profile | null;
        if (p && p.is_active === false) {
          await supabase.auth.signOut();
          navigate("/login?locked=true");
          return;
        }
        if (p) setProfile(p);
      } catch (e) {
        console.error("AppLayout profile error:", e);
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, [navigate]);

  if (loadingProfile) {
    return <div className="loading-screen">Đang tải cấu hình tài khoản...</div>;
  }

  return (
    <div className="app-shell">
      <Sidebar profile={profile} />
      <div className="main-shell">
        <div className="topbar">
          <div className="top-actions" style={{ marginLeft: "auto" }}>
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={
                theme === "light"
                  ? "Chuyển sang giao diện tối"
                  : "Chuyển sang giao diện sáng"
              }
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <NotificationBell profile={profile} />
            <div className="top-date">
              <CalendarDays size={15} /> {today}
            </div>
          </div>
        </div>
        <div className="content">
          <Outlet context={{ profile, setProfile }} />
        </div>
      </div>
    </div>
  );
}

const dateMeta: Record<string, { label: string }> = {
  all: { label: "Tất cả thời gian" },
  today: { label: "Hôm nay" },
  yesterday: { label: "Hôm qua" },
  "7days": { label: "7 ngày qua" },
  "30days": { label: "30 ngày qua" },
  this_month: { label: "Tháng này" },
  last_month: { label: "Tháng trước" },
};

function OrdersPage({ admin = false }: { admin?: boolean }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [queryName, setQueryName] = useState("");
  const [queryPhone, setQueryPhone] = useState("");
  const [queryEmail, setQueryEmail] = useState("");
  const [queryTour, setQueryTour] = useState("");
  const [querySaler, setQuerySaler] = useState("");
  const [status, setStatus] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [dateType, setDateType] = useState<"booking_date" | "tour_date">(
    "tour_date",
  );
  const [specificDate, setSpecificDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showDateFilters, setShowDateFilters] = useState(false);
  const [salers, setSalers] = useState<Profile[]>([]);
  const [showSalerDropdown, setShowSalerDropdown] = useState(false);
  const [salerSearchQuery, setSalerSearchQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const PAGE_SIZE = 10;

  async function load() {
    setLoading(true);
    let request = supabase
      .from("orders")
      .select("*, owner:profiles(display_name, username, avatar_url)")
      .order("created_at", { ascending: false });
    const { data: user } = await supabase.auth.getUser();
    if (user?.user) {
      setCurrentUserId(user.user.id);
      if (!admin) request = request.eq("owner_id", user.user.id);
    }
    const { data } = await request;
    setOrders((data || []) as Order[]);

    if (admin) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("*")
        .order("display_name", { ascending: true });
      if (profilesData) setSalers(profilesData as Profile[]);
    }

    setLoading(false);
  }
  useEffect(() => {
    load();
    const channel = supabase
      .channel("realtime-orders-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          load();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [admin]);

  useEffect(() => {
    setPage(1);
  }, [
    queryName,
    queryPhone,
    queryEmail,
    queryTour,
    querySaler,
    status,
    dateRange,
    dateType,
    specificDate,
    orders,
    sortOrder,
  ]);

  const filtered = useMemo(() => {
    const list = orders.filter((order) => {
      const matchName =
        !queryName ||
        (order.customer_name || "")
          .toLowerCase()
          .includes(queryName.toLowerCase());
      const matchPhone =
        !queryPhone || (order.customer_phone || "").includes(queryPhone);
      const matchEmail =
        !queryEmail ||
        (order.customer_email || "")
          .toLowerCase()
          .includes(queryEmail.toLowerCase());
      const matchTour =
        !queryTour ||
        (order.tour_name || "").toLowerCase().includes(queryTour.toLowerCase());
      const matchSaler =
        !admin ||
        !querySaler ||
        order.owner_id === querySaler;

      let matchDate = true;
      if (dateRange !== "all") {
        const targetDate = new Date(
          dateType === "booking_date" ? order.booking_date : order.tour_date,
        );
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        if (dateRange === "today") {
          matchDate =
            targetDate >= today &&
            targetDate <=
              new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate(),
                23,
                59,
                59,
                999,
              );
        } else if (dateRange === "yesterday") {
          const yest = new Date(today);
          yest.setDate(today.getDate() - 1);
          matchDate = targetDate >= yest && targetDate < today;
        } else if (dateRange === "7days") {
          const d7 = new Date(today);
          d7.setDate(today.getDate() - 7);
          const endOfToday = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            23,
            59,
            59,
            999,
          );
          matchDate = targetDate >= d7 && targetDate <= endOfToday;
        } else if (dateRange === "30days") {
          const d30 = new Date(today);
          d30.setDate(today.getDate() - 30);
          const endOfToday = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            23,
            59,
            59,
            999,
          );
          matchDate = targetDate >= d30 && targetDate <= endOfToday;
        } else if (dateRange === "this_month") {
          const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
          const lastDay = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59,
            999,
          );
          matchDate = targetDate >= firstDay && targetDate <= lastDay;
        } else if (dateRange === "last_month") {
          const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastDay = new Date(
            now.getFullYear(),
            now.getMonth(),
            0,
            23,
            59,
            59,
            999,
          );
          matchDate = targetDate >= firstDay && targetDate <= lastDay;
        } else if (dateRange === "specific_day" && specificDate) {
          const selected = new Date(specificDate);
          matchDate =
            targetDate.getFullYear() === selected.getFullYear() &&
            targetDate.getMonth() === selected.getMonth() &&
            targetDate.getDate() === selected.getDate();
        }
      }

      return (
        matchName &&
        matchPhone &&
        matchEmail &&
        matchTour &&
        matchSaler &&
        matchDate &&
        (status === "all" || order.status === status)
      );
    });

    return list.sort((a, b) => {
      let dateA = new Date(
        dateType === "booking_date" ? a.booking_date : a.tour_date,
      ).getTime();
      let dateB = new Date(
        dateType === "booking_date" ? b.booking_date : b.tour_date,
      ).getTime();
      if (isNaN(dateA)) dateA = new Date(a.created_at).getTime();
      if (isNaN(dateB)) dateB = new Date(b.created_at).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [
    orders,
    queryName,
    queryPhone,
    queryEmail,
    queryTour,
    querySaler,
    status,
    dateRange,
    dateType,
    specificDate,
    admin,
    sortOrder,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (target && !target.closest(".filter-dropdown") && !target.closest(".saler-dropdown")) {
        setShowFilters(false);
        setShowDateFilters(false);
        setShowSalerDropdown(false);
      }
    }
    if (showFilters || showDateFilters || showSalerDropdown) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showFilters, showDateFilters, showSalerDropdown]);

  return (
    <>
      <PageHeader
        title={admin ? "Tất cả đơn tour" : "Đơn tour của tôi"}
        actions={
          !admin && (
            <Button onClick={() => navigate("/orders/new")}>
              <Plus size={16} /> Tạo đơn mới
            </Button>
          )
        }
      />
      <Card className="orders-card">
        <div className="toolbar">
          <div className="filter-row">
            <div className="search-field">
              <input
                value={queryName}
                onChange={(e) => setQueryName(e.target.value)}
                placeholder="Tên khách hàng"
              />
            </div>
            <div className="search-field">
              <input
                value={queryPhone}
                onChange={(e) => setQueryPhone(e.target.value)}
                placeholder="Số điện thoại"
              />
            </div>
            <div className="search-field">
              <input
                value={queryEmail}
                onChange={(e) => setQueryEmail(e.target.value)}
                placeholder="Email"
              />
            </div>
            <div className="search-field">
              <input
                value={queryTour}
                onChange={(e) => setQueryTour(e.target.value)}
                placeholder="Tên tour"
              />
            </div>
            {admin && (
              <div className="saler-dropdown" style={{ position: "relative" }}>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowSalerDropdown(!showSalerDropdown);
                    setShowFilters(false);
                    setShowDateFilters(false);
                  }}
                  style={{ minWidth: 200, justifyContent: "space-between" }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {querySaler
                      ? salers.find((s) => s.id === querySaler)?.display_name || "Nhân viên Sale"
                      : "Tất cả nhân viên Sale"}
                  </span>
                  <ChevronDown size={15} />
                </Button>
                {showSalerDropdown && (
                  <div className="dropdown-panel" style={{ minWidth: 250, zIndex: 10, position: 'absolute', top: '100%', marginTop: 8, left: 0 }}>
                    <div style={{ padding: "8px", borderBottom: "1px solid var(--border)" }}>
                      <input
                        type="text"
                        placeholder="Tìm theo tên/email..."
                        value={salerSearchQuery}
                        onChange={(e) => setSalerSearchQuery(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          border: "1px solid var(--border)",
                          background: "var(--background)",
                          color: "var(--text)",
                        }}
                        autoFocus
                      />
                    </div>
                    <div style={{ maxHeight: 200, overflowY: "auto" }}>
                      <button
                        className={!querySaler ? "active" : ""}
                        onClick={() => {
                          setQuerySaler("");
                          setShowSalerDropdown(false);
                          setSalerSearchQuery("");
                        }}
                      >
                        Tất cả nhân viên Sale
                      </button>
                      {salers
                        .filter(
                          (s) =>
                            s.display_name.toLowerCase().includes(salerSearchQuery.toLowerCase()) ||
                            (s.email && s.email.toLowerCase().includes(salerSearchQuery.toLowerCase()))
                        )
                        .map((s) => (
                          <button
                            key={s.id}
                            className={querySaler === s.id ? "active" : ""}
                            onClick={() => {
                              setQuerySaler(s.id);
                              setShowSalerDropdown(false);
                              setSalerSearchQuery("");
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {s.avatar_url ? (
                                <img src={s.avatar_url} alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--border)' }} />
                              )}
                              <span>{s.display_name}</span>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="toolbar-actions">
            <div className="filter-dropdown">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowFilters(!showFilters);
                  setShowDateFilters(false);
                }}
              >
                <span
                  className="filter-dot"
                  style={{
                    background:
                      status === "all"
                        ? "var(--text-dim)"
                        : `var(--status-${statusMeta[status as OrderStatus].varPrefix}-text)`,
                  }}
                />
                {status === "all"
                  ? "Tất cả trạng thái"
                  : statusMeta[status as OrderStatus].label}
                <ChevronDown size={15} />
              </Button>
              {showFilters && (
                <div className="dropdown-panel">
                  <b>Lọc theo trạng thái</b>
                  {(["all", ...Object.keys(statusMeta)] as string[]).map(
                    (item) => (
                      <button
                        key={item}
                        onClick={() => {
                          setStatus(item);
                          setShowFilters(false);
                        }}
                      >
                        {status === item && <Check size={14} />}
                        {item === "all"
                          ? "Tất cả trạng thái"
                          : statusMeta[item as OrderStatus].label}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>
            <div className="filter-dropdown">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDateFilters(!showDateFilters);
                  setShowFilters(false);
                }}
                className="date-button"
              >
                <CalendarDays size={16} />{" "}
                {dateRange === "all"
                  ? dateType === "booking_date"
                    ? "Ngày tạo đơn"
                    : "Ngày đi tour"
                  : dateRange === "specific_day" && specificDate
                    ? new Date(specificDate).toLocaleDateString("vi-VN")
                    : dateMeta[dateRange]?.label}{" "}
                <ChevronDown size={14} />
              </Button>
              {showDateFilters && (
                <div className="dropdown-panel">
                  <b>Loại ngày</b>
                  <div
                    style={{
                      display: "flex",
                      gap: "5px",
                      padding: "0 8px 10px",
                      borderBottom: "1px solid var(--border-row)",
                      marginBottom: "5px",
                    }}
                  >
                    <button
                      style={{
                        flex: 1,
                        padding: "6px",
                        textAlign: "center",
                        background:
                          dateType === "booking_date"
                            ? "var(--nav-active-bg)"
                            : "transparent",
                        color:
                          dateType === "booking_date"
                            ? "var(--nav-active-text)"
                            : "var(--text-dim)",
                        borderRadius: "5px",
                        fontSize: "10px",
                        justifyContent: "center",
                      }}
                      onClick={() => setDateType("booking_date")}
                    >
                      Ngày tạo đơn
                    </button>
                    <button
                      style={{
                        flex: 1,
                        padding: "6px",
                        textAlign: "center",
                        background:
                          dateType === "tour_date"
                            ? "var(--nav-active-bg)"
                            : "transparent",
                        color:
                          dateType === "tour_date"
                            ? "var(--nav-active-text)"
                            : "var(--text-dim)",
                        borderRadius: "5px",
                        fontSize: "10px",
                        justifyContent: "center",
                      }}
                      onClick={() => setDateType("tour_date")}
                    >
                      Ngày đi tour
                    </button>
                  </div>
                  <b>Thứ tự sắp xếp</b>
                  <div
                    style={{
                      display: "flex",
                      gap: "5px",
                      padding: "0 8px 10px",
                      borderBottom: "1px solid var(--border-row)",
                      marginBottom: "5px",
                    }}
                  >
                    <button
                      style={{
                        flex: 1,
                        padding: "6px",
                        textAlign: "center",
                        background:
                          sortOrder === "desc"
                            ? "var(--nav-active-bg)"
                            : "transparent",
                        color:
                          sortOrder === "desc"
                            ? "var(--nav-active-text)"
                            : "var(--text-dim)",
                        borderRadius: "5px",
                        fontSize: "10px",
                        justifyContent: "center",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                      onClick={() => setSortOrder("desc")}
                    >
                      <ArrowDown size={11} /> Giảm dần
                    </button>
                    <button
                      style={{
                        flex: 1,
                        padding: "6px",
                        textAlign: "center",
                        background:
                          sortOrder === "asc"
                            ? "var(--nav-active-bg)"
                            : "transparent",
                        color:
                          sortOrder === "asc"
                            ? "var(--nav-active-text)"
                            : "var(--text-dim)",
                        borderRadius: "5px",
                        fontSize: "10px",
                        justifyContent: "center",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                      onClick={() => setSortOrder("asc")}
                    >
                      <ArrowUp size={11} /> Tăng dần
                    </button>
                  </div>
                  <b>Lọc thời gian</b>
                  {Object.keys(dateMeta).map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setDateRange(item);
                        setSpecificDate("");
                        setShowDateFilters(false);
                      }}
                    >
                      {dateRange === item && <Check size={14} />}
                      {dateMeta[item].label}
                    </button>
                  ))}
                  <div
                    style={{
                      marginTop: "5px",
                      borderTop: "1px solid var(--border-row)",
                      paddingTop: "5px",
                    }}
                  >
                    <b>Ngày cụ thể</b>
                    <div style={{ padding: "0 8px", marginBottom: "5px" }}>
                      <input
                        type="date"
                        value={specificDate}
                        onChange={(e) => {
                          setSpecificDate(e.target.value);
                          if (e.target.value) setDateRange("specific_day");
                          setShowDateFilters(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          fontSize: "11px",
                          background: "var(--bg-input)",
                          color: "var(--text-main)",
                          border: "1px solid var(--border-input)",
                          borderRadius: "5px",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="table-meta">
          <span>
            <b>{filtered.length}</b> đơn tour
          </span>
          <span className="live-status">
            <i /> Cập nhật trực tiếp
          </span>
        </div>
        {loading ? (
          <div className="loading-state">Đang tải dữ liệu...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <ClipboardList size={30} />
            <h3>Không tìm thấy kết quả</h3>
            <p>Thử thay đổi điều kiện lọc.</p>
            {!admin && (
              <Button onClick={() => navigate("/orders/new")}>
                <Plus size={16} /> Tạo đơn đầu tiên
              </Button>
            )}
          </div>
        ) : (
          <div className="table-scroll">
            <table className="orders-table">
              <thead>
                <tr>
                  <th
                    style={{
                      width: "12%",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                    onClick={() => {
                      if (dateType === "booking_date") {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      } else {
                        setDateType("booking_date");
                        setSortOrder("desc");
                      }
                    }}
                    title="Bấm để chuyển chiều sắp xếp Ngày tạo đơn"
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      NGÀY TẠO ĐƠN{" "}
                      {dateType === "booking_date" ? (
                        sortOrder === "asc" ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        )
                      ) : (
                        <ArrowUpDown size={11} style={{ opacity: 0.4 }} />
                      )}
                    </div>
                  </th>
                  <th style={{ width: admin ? "18%" : "23%" }}>KHÁCH HÀNG</th>
                  <th style={{ width: admin ? "15%" : "17%" }}>
                    SỐ ĐIỆN THOẠI
                  </th>
                  {admin && <th style={{ width: "17%" }}>NHÂN VIÊN SALE</th>}
                  <th style={{ width: admin ? "20%" : "22%" }}>TOUR</th>
                  <th
                    style={{
                      width: "12%",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                    onClick={() => {
                      if (dateType === "tour_date") {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      } else {
                        setDateType("tour_date");
                        setSortOrder("desc");
                      }
                    }}
                    title="Bấm để chuyển chiều sắp xếp Ngày đi tour"
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      NGÀY ĐI TOUR{" "}
                      {dateType === "tour_date" ? (
                        sortOrder === "asc" ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        )
                      ) : (
                        <ArrowUpDown size={11} style={{ opacity: 0.4 }} />
                      )}
                    </div>
                  </th>
                  <th style={{ width: "14%" }}>TRẠNG THÁI</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="clickable-row"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <td className="muted">
                      {new Date(order.booking_date).toLocaleDateString("vi-VN")}
                    </td>
                    <td>
                      <span
                        className="customer-name-pure"
                        title={order.customer_name || "Khách hàng"}
                      >
                        {order.customer_name || "Chưa đặt tên"}
                      </span>
                    </td>
                    <td>
                      {order.customer_phone ? (
                        <span
                          className="customer-phone"
                          title={`Số điện thoại: ${order.customer_phone}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Phone size={12} /> {order.customer_phone}
                        </span>
                      ) : (
                        <span className="customer-phone customer-phone-empty">
                          <Phone size={12} /> Chưa có SĐT
                        </span>
                      )}
                    </td>
                    {admin && (
                      <td>
                        <div className="owner-cell">
                          <Avatar
                            src={order.owner?.avatar_url}
                            name={order.owner?.display_name}
                            size="sm"
                          />
                          <b>{order.owner?.display_name || "Chưa phân công"}</b>
                        </div>
                      </td>
                    )}
                    <td>
                      <b className="tour-cell">{order.tour_name}</b>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          flexWrap: "wrap",
                          marginTop: "3px",
                        }}
                      >
                        {order.num_guests && (
                          <span
                            className="guest-badge"
                            title={`Số lượng khách: ${order.num_guests} người`}
                          >
                            <Users size={10} /> {order.num_guests} khách
                          </span>
                        )}
                        {order.rating && (
                          <span
                            className="rating-badge"
                            title={`Hạng sao khách sạn: ${order.rating} sao`}
                          >
                            <Star size={10} className="star-filled" />{" "}
                            {order.rating}★
                          </span>
                        )}
                      </div>
                      {order.room_type && (
                        <span
                          className="room-type-badge"
                          title={`Dạng phòng: ${order.room_type}`}
                        >
                          {order.room_type}
                        </span>
                      )}
                    </td>
                    <td className="muted">
                      {new Date(order.tour_date).toLocaleDateString("vi-VN")}
                    </td>
                    <td>
                      <Badge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="table-footer">
          <span>
            Hiển thị {paginatedOrders.length} / {filtered.length} kết quả
          </span>
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={p === page ? "current" : ""}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            {totalPages > 1 && (
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                style={{
                  opacity: page >= totalPages ? 0.4 : 1,
                  cursor: page >= totalPages ? "not-allowed" : "pointer",
                }}
                title="Trang tiếp"
              >
                <ArrowLeft size={14} className="flip" />
              </button>
            )}
          </div>
        </div>
      </Card>
    </>
  );
}

function OrderForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    tour_name: "",
    room_type: "",
    num_guests: "1",
    rating: 5,
    booking_date: new Date().toISOString().slice(0, 10),
    tour_date: "",
    status: "new" as OrderStatus,
    notes: "",
  });
  const [tours, setTours] = useState<Tour[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [currentOwner, setCurrentOwner] = useState<{
    display_name: string;
    username: string;
    avatar_url?: string | null;
  } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Tải danh sách tour và dạng phòng được định nghĩa trong Settings
    Promise.all([
      supabase.from("tours").select("*").order("name"),
      supabase.from("room_types").select("*").order("name"),
    ])
      .then(([toursRes, roomTypesRes]) => {
        if (toursRes.data) setTours(toursRes.data as Tour[]);
        if (roomTypesRes.data) setRoomTypes(roomTypesRes.data as RoomType[]);
      })
      .catch((err) => {
        console.error("Lỗi khi tải danh sách tour/dạng phòng:", err);
      });
  }, []);

  useEffect(() => {
    if (id) {
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          id,
        );
      let q = supabase
        .from("orders")
        .select("*, owner:profiles(display_name, username, avatar_url)");
      q = isUuid ? q.eq("id", id) : q.eq("order_code", id);
      q.maybeSingle().then(({ data }) => {
        if (data) {
          setForm({
            customer_name: data.customer_name,
            customer_phone: data.customer_phone,
            customer_email: data.customer_email || "",
            tour_name: data.tour_name,
            room_type: data.room_type || "",
            num_guests:
              data.num_guests !== null && data.num_guests !== undefined
                ? String(data.num_guests)
                : "1",
            rating: data.rating ?? 5,
            booking_date: data.booking_date,
            tour_date: data.tour_date,
            status: data.status,
            notes: data.notes || "",
          });
          setCurrentOwner(data.owner || null);
        }
      });
    }
  }, [id]);

  function update(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (form.tour_date < form.booking_date) {
      setError("Ngày đi tour phải từ ngày tạo đơn trở đi.");
      return;
    }
    if (!form.tour_name.trim()) {
      setError("Vui lòng chọn tour du lịch.");
      return;
    }
    setBusy(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      setBusy(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_active")
      .eq("id", user.id)
      .maybeSingle();
    if (profile && !profile.is_active) {
      setError("Tài khoản của bạn đã bị khóa.");
      setBusy(false);
      return;
    }

    const parsedGuests = parseInt(String(form.num_guests).trim(), 10);
    const safeGuests =
      !isNaN(parsedGuests) && parsedGuests > 0 ? parsedGuests : 1;

    let result;
    if (editing) {
      // Khi sửa đơn: Giữ nguyên người phụ trách (owner_id) ban đầu, tuyệt đối KHÔNG ghi đè bằng user.id của người sửa
      const updatePayload = {
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        customer_email: form.customer_email || null,
        tour_name: form.tour_name,
        room_type: form.room_type ? form.room_type.trim() : null,
        num_guests: safeGuests,
        rating:
          Number(form.rating) >= 1 && Number(form.rating) <= 5
            ? Math.floor(Number(form.rating))
            : 5,
        booking_date: form.booking_date,
        tour_date: form.tour_date,
        status: form.status,
        notes: form.notes || null,
        updated_at: new Date().toISOString(),
      };
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          id!,
        );
      let query = supabase.from("orders").update(updatePayload);
      query = isUuid ? query.eq("id", id) : query.eq("order_code", id);
      result = await query;
    } else {
      // Khi tạo mới: Gán người tạo làm owner_id ban đầu
      const insertPayload = {
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        customer_email: form.customer_email || null,
        tour_name: form.tour_name,
        room_type: form.room_type ? form.room_type.trim() : null,
        num_guests: safeGuests,
        rating:
          Number(form.rating) >= 1 && Number(form.rating) <= 5
            ? Math.floor(Number(form.rating))
            : 5,
        booking_date: form.booking_date,
        tour_date: form.tour_date,
        status: form.status,
        notes: form.notes || null,
        owner_id: user.id,
      };
      result = await supabase.from("orders").insert(insertPayload);
    }

    setBusy(false);
    if (result.error) {
      setError(`Lỗi: ${result.error.message}`);
      return;
    }
    navigate(editing ? `/orders/${id}` : "/orders");
  }

  return (
    <>
      <PageHeader
        title={editing ? "Chỉnh sửa đơn tour" : "Tạo đơn tour mới"}
        actions={
          <Button variant="secondary" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Quay lại
          </Button>
        }
      />
      <form onSubmit={submit} className="form-layout">
        {editing && currentOwner && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 14px",
              background: "var(--bg-card-alt)",
              borderRadius: "8px",
              border: "1px solid var(--border-alt)",
            }}
          >
            <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
              Nhân viên phụ trách:
            </span>
            <Avatar
              src={currentOwner.avatar_url}
              name={currentOwner.display_name}
              size="xs"
            />
            <b style={{ fontSize: "11px", color: "var(--text-main)" }}>
              {currentOwner.display_name}
            </b>
            <span
              className="mono"
              style={{ fontSize: "10px", color: "var(--mono-color)" }}
            >
              @{currentOwner.username}
            </span>
          </div>
        )}
        <Card>
          <div className="card-title">
            <span className="section-icon">
              <User size={17} />
            </span>
            <div>
              <h2>Thông tin khách hàng</h2>
              <p>Thông tin liên hệ của khách hàng.</p>
            </div>
          </div>
          <div className="form-grid two">
            <Input
              label="Họ và tên"
              value={form.customer_name}
              onChange={(v) => update("customer_name", v)}
              placeholder="Nhập họ và tên"
              required
            />
            <Input
              label="Số điện thoại"
              value={form.customer_phone}
              onChange={(v) => update("customer_phone", v)}
              placeholder="Nhập số điện thoại"
              icon={<Phone size={15} />}
              required
            />
          </div>
          <Input
            label="Email"
            value={form.customer_email}
            onChange={(v) => update("customer_email", v)}
            placeholder="Nhập email"
            type="email"
            icon={<Mail size={15} />}
          />
        </Card>
        <Card>
          <div className="card-title">
            <span className="section-icon">
              <ClipboardList size={17} />
            </span>
            <div>
              <h2>Thông tin đơn tour</h2>
              <p>Lịch trình và trạng thái đặt tour.</p>
            </div>
          </div>
          <div className="form-grid two">
            <Select
              label="Tên tour"
              value={form.tour_name}
              onChange={(v) => update("tour_name", v)}
            >
              <option value="">-- Chọn tour du lịch --</option>
              {editing &&
                form.tour_name &&
                !tours.some(
                  (t) => t.is_active && t.name === form.tour_name,
                ) && <option value={form.tour_name}>{form.tour_name}</option>}
              {tours
                .filter((t) => t.is_active)
                .map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
            </Select>

            <Select
              label="Dạng phòng (Type Room)"
              value={form.room_type}
              onChange={(v) => update("room_type", v)}
            >
              <option value="">-- Chọn dạng phòng (Tùy chọn) --</option>
              {editing &&
                form.room_type &&
                !roomTypes.some(
                  (r) => r.is_active && r.name === form.room_type,
                ) && <option value={form.room_type}>{form.room_type}</option>}
              {roomTypes
                .filter((r) => r.is_active)
                .map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
            </Select>
          </div>
          <div className="form-grid two">
            <Input
              label="Số lượng khách"
              type="text"
              inputMode="numeric"
              value={form.num_guests}
              onChange={(v) => {
                // Chỉ nhận các ký tự số, loại bỏ hoàn toàn nút mũi tên tăng giảm
                const digits = v.replace(/[^0-9]/g, "");
                update("num_guests", digits);
              }}
              icon={<Users size={15} />}
              placeholder="Nhập số lượng khách"
              required
            />
            <div className="field">
              <span>
                Hạng sao khách sạn<em> *</em>
              </span>
              <StarRating
                value={form.rating}
                onChange={(r) => setForm((p) => ({ ...p, rating: r }))}
              />
            </div>
          </div>
          <div className="form-grid two">
            <Input
              label="Ngày tạo đơn"
              value={form.booking_date}
              onChange={(v) => update("booking_date", v)}
              type="date"
              required
            />
            <Input
              label="Ngày đi tour"
              value={form.tour_date}
              onChange={(v) => update("tour_date", v)}
              type="date"
              required
            />
          </div>
          <Select
            label="Trạng thái"
            value={form.status}
            onChange={(v) => update("status", v)}
          >
            {Object.entries(statusMeta).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </Select>
        </Card>
        <Card>
          <div className="card-title">
            <span className="section-icon">
              <FileText size={17} />
            </span>
            <div>
              <h2>Ghi chú</h2>
              <p>Yêu cầu đặc biệt hoặc thông tin cần lưu ý.</p>
            </div>
          </div>
          <label className="field">
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Nhập ghi chú..."
            />
          </label>
        </Card>
        {error && <div className="form-error">{error}</div>}
        <div className="form-actions">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Hủy
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Lưu đơn tour"}{" "}
            <Check size={16} />
          </Button>
        </div>
      </form>
    </>
  );
}

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setCurrentUserId(user.id);
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (data?.role === "admin") setIsAdmin(true);
    });
  }, []);

  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      );
    let q = supabase
      .from("orders")
      .select("*, owner:profiles(display_name, username, avatar_url)");
    q = isUuid ? q.eq("id", id) : q.eq("order_code", id);
    q.maybeSingle().then(({ data }) => {
      setOrder(data as Order | null);
      setLoading(false);
    });
  }, [id]);

  // Click outside to close status dropdown
  useEffect(() => {
    if (!statusDropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (target && !target.closest(".od-status-dropdown-wrap")) {
        setStatusDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [statusDropdownOpen]);

  if (loading) return <div className="loading-state">Đang tải đơn tour...</div>;
  if (!order) {
    return (
      <div className="empty-state">
        <ClipboardList size={32} />
        <h3>Đơn tour không tồn tại</h3>
        <p>Đơn tour này có thể đã bị xóa hoặc bạn không có quyền truy cập.</p>
        <Button
          variant="secondary"
          onClick={() => navigate(isAdmin ? "/admin/orders" : "/orders")}
          style={{ marginTop: "14px" }}
        >
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const canDelete =
    isAdmin || (currentUserId && order.owner_id === currentUserId);

  async function handleDelete() {
    if (
      !order ||
      !window.confirm(`Bạn có chắc chắn muốn xóa đơn tour ${order.order_code}?`)
    )
      return;
    const { error } = await supabase.from("orders").delete().eq("id", order.id);
    if (error) {
      alert(`Không thể xóa đơn: ${error.message}`);
      return;
    }
    navigate(isAdmin ? "/admin/orders" : "/orders");
  }

  async function handleQuickRate(newRating: number) {
    if (!order) return;
    setOrder((prev) => (prev ? { ...prev, rating: newRating } : null));
    await supabase
      .from("orders")
      .update({ rating: newRating, updated_at: new Date().toISOString() })
      .eq("id", order.id);
  }

  async function handleQuickStatus(newStatus: OrderStatus) {
    if (!order || order.status === newStatus) return;
    setOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    setStatusDropdownOpen(false);
    await supabase
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", order.id);
  }

  function handleCopy(text: string, type: "code" | "phone" | "id") {
    navigator.clipboard.writeText(text);
    if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1800);
    } else if (type === "phone") {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 1800);
    } else {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 1800);
    }
  }

  // Days countdown calculation
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tDay = new Date(order.tour_date);
  tDay.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil(
    (tDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Customer initials
  const customerInitials = (order.customer_name || "KH")
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div className="od-shell">
      {/* Breadcrumb & Navigation */}
      <div className="od-breadcrumb">
        <Link to={isAdmin ? "/admin/orders" : "/orders"}>Đơn tour</Link>
        <span>/</span>
        <span>{order.order_code}</span>
      </div>

      {/* Header Card */}
      <div className="od-header-card">
        <div className="od-header-left">
          <div className="od-code-box">
            <span className="od-code-text">{order.order_code}</span>
            <button
              type="button"
              className="od-copy-btn"
              onClick={() => handleCopy(order.order_code, "code")}
              title="Sao chép mã đơn"
            >
              {copiedCode ? (
                <CheckCheck size={16} color="#10b981" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>

          {/* Interactive Status Dropdown */}
          <div className="od-status-dropdown-wrap">
            <div
              className="od-status-trigger"
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              title="Bấm để đổi nhanh trạng thái"
            >
              <Badge status={order.status} />
              <ChevronDown
                size={14}
                style={{
                  color: "var(--text-dim)",
                  transform: statusDropdownOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.15s",
                }}
              />
            </div>

            {statusDropdownOpen && (
              <div className="od-status-menu">
                {(Object.keys(statusMeta) as OrderStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`od-status-menu-item ${order.status === st ? "selected" : ""}`}
                    onClick={() => handleQuickStatus(st)}
                  >
                    <i
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: `var(--status-${statusMeta[st].varPrefix}-text)`,
                        display: "inline-block",
                      }}
                    />
                    <span>{statusMeta[st].label}</span>
                    {order.status === st && (
                      <Check size={14} style={{ marginLeft: "auto" }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="od-header-actions">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Quay lại
          </Button>
          <Button onClick={() => navigate(`/orders/${order.id}/edit`)}>
            <Pencil size={16} /> Chỉnh sửa
          </Button>
          {canDelete && (
            <Button variant="danger" onClick={handleDelete}>
              <Trash2 size={16} /> Xóa đơn
            </Button>
          )}
        </div>
      </div>

      {/* Lifecycle Progress Pipeline */}
      <div className="od-pipeline-card">
        <div className="od-pipeline-title-row">
          <span className="od-pipeline-title">Tiến trình xử lý đơn tour</span>
          {order.status === "cancelled" && (
            <span
              style={{
                fontSize: "11px",
                color: "var(--error-text)",
                fontWeight: 600,
              }}
            >
              Đơn đang ở trạng thái Đã hủy
            </span>
          )}
        </div>

        {order.status === "cancelled" ? (
          <div className="od-cancelled-banner">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Badge status="cancelled" />
              <span>
                Đơn tour này đã bị hủy. Bạn có thể kích hoạt lại bằng cách chọn
                trạng thái tư vấn.
              </span>
            </div>
            <Button
              variant="secondary"
              onClick={() => handleQuickStatus("consulting")}
              style={{ fontSize: "11px", minHeight: "32px" }}
            >
              Chuyển sang Đang tư vấn
            </Button>
          </div>
        ) : (
          <div className="od-pipeline-steps">
            {[
              {
                key: "new",
                stepNum: 1,
                title: "Mới",
                desc: "Đơn vừa tiếp nhận",
              },
              {
                key: "consulting",
                stepNum: 2,
                title: "Đang tư vấn",
                desc: "Đang trao đổi lịch trình",
              },
              {
                key: "closed",
                stepNum: 3,
                title: "Đã chốt",
                desc: "Chốt tour thành công",
              },
            ].map((st, idx) => {
              const isActive = order.status === st.key;
              const stepIndex = ["new", "consulting", "closed"].indexOf(
                order.status,
              );
              const isCompleted = stepIndex >= idx;

              return (
                <button
                  key={st.key}
                  type="button"
                  className={`od-step-btn ${isActive ? "active" : ""}`}
                  onClick={() => handleQuickStatus(st.key as OrderStatus)}
                  title={`Bấm để chuyển trạng thái thành ${st.title}`}
                >
                  <div
                    className="od-step-number"
                    style={{
                      background: isCompleted
                        ? `var(--status-${statusMeta[st.key as OrderStatus].varPrefix}-text)`
                        : undefined,
                      color: isCompleted ? "#ffffff" : undefined,
                    }}
                  >
                    {isCompleted && !isActive ? (
                      <Check size={14} />
                    ) : (
                      st.stepNum
                    )}
                  </div>
                  <div className="od-step-content">
                    <span className="od-step-label">{st.title}</span>
                    <span className="od-step-sub">{st.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4 Metric Cards */}
      <div className="od-metrics-grid">
        <div className="od-metric-card">
          <div className="od-metric-icon blue">
            <Compass size={20} />
          </div>
          <div className="od-metric-info">
            <span className="od-metric-label">Tour du lịch</span>
            <span className="od-metric-val" title={order.tour_name}>
              {order.tour_name}
            </span>
          </div>
        </div>

        <div className="od-metric-card">
          <div className="od-metric-icon amber">
            <Users size={20} />
          </div>
          <div className="od-metric-info">
            <span className="od-metric-label">Số lượng khách</span>
            <span className="od-metric-val">
              {order.num_guests ? `${order.num_guests} khách` : "1 khách"}
            </span>
          </div>
        </div>

        <div className="od-metric-card">
          <div className="od-metric-icon purple">
            <BedDouble size={20} />
          </div>
          <div className="od-metric-info">
            <span className="od-metric-label">Dạng phòng</span>
            <span className="od-metric-val">
              {order.room_type || "Tiêu chuẩn"}
            </span>
          </div>
        </div>

        <div className="od-metric-card">
          <div className="od-metric-icon green">
            <CalendarDays size={20} />
          </div>
          <div className="od-metric-info">
            <span className="od-metric-label">Ngày khởi hành</span>
            <span className="od-metric-val">
              {new Date(order.tour_date).toLocaleDateString("vi-VN")}
            </span>
          </div>
        </div>

        <div className="od-metric-card">
          <div className="od-metric-icon amber">
            <Star size={20} className="star-filled" />
          </div>
          <div className="od-metric-info">
            <span className="od-metric-label">Hạng sao</span>
            <span className="od-metric-val">
              {order.rating ? `${order.rating} sao` : "5 sao"}
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Column: Trip Overview & Notes */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Timeline Card */}
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] p-6 shadow-sm">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-[var(--text-dim)] mb-6">
              Hành trình chuyến đi
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
              <div className="text-center md:text-left w-full md:w-auto">
                <div className="text-[11px] text-[var(--text-dim)] uppercase tracking-widest mb-2">
                  Ngày tạo đơn
                </div>
                <div className="text-lg font-bold text-[var(--text-heading)]">
                  {new Date(order.booking_date).toLocaleDateString("vi-VN")}
                </div>
              </div>

              <div className="flex-1 px-4 md:px-8 flex flex-col items-center gap-3 w-full md:w-auto">
                <span
                  className="text-xs font-semibold px-4 py-1.5 rounded-full"
                  style={{
                    background: "var(--status-new-bg)",
                    color: "var(--status-new-text)",
                    border: "1px solid var(--status-new-text)",
                  }}
                >
                  {diffDays > 0
                    ? `Còn ${diffDays} ngày nữa khởi hành`
                    : diffDays === 0
                      ? "Khởi hành hôm nay 🎉"
                      : "Đã khởi hành"}
                </span>

                {/* Horizontal line for desktop */}
                <div className="hidden md:flex w-full items-center gap-2">
                  <div
                    className="flex-1 h-[1px] opacity-30 border-t border-dashed"
                    style={{ borderColor: "var(--text-main)" }}
                  />
                  <ArrowRight size={16} style={{ color: "var(--text-dim)" }} />
                </div>
                {/* Vertical line for mobile */}
                <div
                  className="flex md:hidden h-8 w-[1px] opacity-30 border-l border-dashed"
                  style={{ borderColor: "var(--text-main)" }}
                />
              </div>

              <div className="text-center md:text-right w-full md:w-auto">
                <div className="text-[11px] text-[var(--text-dim)] uppercase tracking-widest mb-2">
                  Ngày đi tour
                </div>
                <div className="text-lg font-bold text-[var(--text-heading)]">
                  {new Date(order.tour_date).toLocaleDateString("vi-VN")}
                </div>
              </div>
            </div>
          </div>

          {/* Notes Card */}
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] p-6 shadow-sm flex flex-col h-full">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-[var(--text-dim)] mb-4">
              Ghi chú
            </h2>
            <div className="text-[13px] leading-relaxed whitespace-pre-wrap bg-[var(--bg-body)] p-4 rounded-lg border border-[var(--border-subtle)] text-[var(--text-main)] flex-1">
              {order.notes ? (
                order.notes
              ) : (
                <span className="italic opacity-60">
                  Chưa có ghi chú cho đơn tour này.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Staff */}
        <div className="flex flex-col gap-6">
          {/* Customer Card */}
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] p-6 shadow-sm">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-[var(--text-dim)] mb-6">
              Thông tin khách hàng
            </h2>

            <div className="flex items-center gap-4 mb-4">
              <div>
                <span className="text-[11px] text-[var(--text-dim)] uppercase tracking-widest block mb-1">
                  Tên khách hàng
                </span>
                <h3 className="text-lg font-bold text-[var(--text-heading)]">
                  {order.customer_name}
                </h3>
              </div>
            </div>

            <div className="bg-[var(--bg-body)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
              <div className="flex items-center justify-between p-3.5 transition-colors hover:bg-[var(--bg-hover)]">
                <div className="flex items-center gap-3 text-[13px] text-[var(--text-main)]">
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                    <Phone size={14} />
                  </div>
                  <span className="font-medium">{order.customer_phone}</span>
                </div>
                <div className="flex gap-1">
                  <a
                    href={`tel:${order.customer_phone}`}
                    className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-md transition-colors"
                    title="Gọi điện"
                  >
                    <PhoneCall size={14} />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopy(order.customer_phone, "phone")}
                    className="p-1.5 text-[var(--text-dim)] hover:bg-[var(--border-subtle)] rounded-md transition-colors"
                    title="Copy"
                  >
                    {copiedPhone ? (
                      <CheckCheck size={14} style={{ color: "#10b981" }} />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              </div>

              {order.customer_email ? (
                <div className="flex items-center justify-between p-3.5 border-t border-[var(--border-subtle)] border-dashed transition-colors hover:bg-[var(--bg-hover)]">
                  <div className="flex items-center gap-3 text-[13px] text-[var(--text-main)]">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center">
                      <Mail size={14} />
                    </div>
                    <span
                      className="font-medium truncate max-w-[150px]"
                      title={order.customer_email}
                    >
                      {order.customer_email}
                    </span>
                  </div>
                  <a
                    href={`mailto:${order.customer_email}`}
                    className="p-1.5 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-md transition-colors"
                    title="Gửi email"
                  >
                    <Mail size={14} />
                  </a>
                </div>
              ) : (
                <div className="flex items-center p-3.5 border-t border-[var(--border-subtle)] border-dashed text-xs italic text-[var(--text-dim)] opacity-60">
                  Chưa cập nhật email
                </div>
              )}
            </div>
          </div>

          {/* Staff Card */}
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] p-6 shadow-sm">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-[var(--text-dim)] mb-6">
              Nhân sự phụ trách
            </h2>
            <div className="flex items-center gap-4">
              <Avatar
                src={order.owner?.avatar_url}
                name={order.owner?.display_name}
                size="md"
              />
              <div className="flex flex-col">
                <b className="text-[14px] text-[var(--text-heading)]">
                  {order.owner?.display_name || "Chưa phân công"}
                </b>
              </div>
            </div>
          </div>

          {/* Meta Info */}
          <div className="px-4 flex flex-col gap-3 text-xs text-[var(--text-dim)]">
            <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-2">
              <span>Ngày tạo đơn</span>
              <span className="font-medium text-[var(--text-main)]">
                {new Date(order.created_at).toLocaleString("vi-VN")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Cập nhật lần cuối</span>
              <span className="font-medium text-[var(--text-main)]">
                {new Date(order.updated_at).toLocaleString("vi-VN")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomBarTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: { name: string; count: number; percent: number; color: string };
  }>;
}) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="saler-chart-tooltip">
        <div className="tooltip-header">
          <span className="tooltip-indicator" style={{ background: data.color }} />
          <strong>{data.name}</strong>
        </div>
        <div className="tooltip-row">
          <span>Số lượng:</span>
          <b>{data.count} đơn</b>
        </div>
        <div className="tooltip-row">
          <span>Tỷ lệ:</span>
          <span>{data.percent}%</span>
        </div>
      </div>
    );
  }
  return null;
}

function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [salers, setSalers] = useState<Profile[]>([]);
  const [selectedSaler, setSelectedSaler] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("7");

  function loadDashboardData() {
    supabase
      .from("orders")
      .select("*")
      .then(({ data }) => setOrders((data || []) as Order[]));

    supabase
      .from("profiles")
      .select("id, display_name, username, role, is_active")
      .order("display_name", { ascending: true })
      .then(({ data }) => setSalers((data || []) as Profile[]));
  }

  useEffect(() => {
    loadDashboardData();

    const channel = supabase
      .channel("realtime-dashboard-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          loadDashboardData();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const counts = Object.keys(statusMeta).map((status) => ({
    status: status as OrderStatus,
    count: orders.filter((o) => o.status === status).length,
  }));
  const total = orders.length;

  // Lọc dữ liệu cho thẻ "Hiệu suất Saler"
  const filteredSalerOrders = useMemo(() => {
    let list = orders;
    if (selectedSaler !== "all") {
      list = list.filter((o) => o.owner_id === selectedSaler);
    }
    if (timeRange !== "all") {
      const days = parseInt(timeRange, 10);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      cutoff.setHours(0, 0, 0, 0);
      list = list.filter((o) => {
        const d = new Date(o.created_at || o.booking_date);
        return d >= cutoff;
      });
    }
    return list;
  }, [orders, selectedSaler, timeRange]);

  const salerTotal = filteredSalerOrders.length;
  const salerNew = filteredSalerOrders.filter((o) => o.status === "new").length;
  const salerConsulting = filteredSalerOrders.filter((o) => o.status === "consulting").length;
  const salerClosed = filteredSalerOrders.filter((o) => o.status === "closed").length;
  const salerCancelled = filteredSalerOrders.filter((o) => o.status === "cancelled").length;

  const salerConversionRate =
    salerTotal > 0 ? Math.round((salerClosed / salerTotal) * 100) : 0;

  const salerChartData = [
    {
      key: "new",
      name: "Mới",
      count: salerNew,
      color: "#38bdf8",
      percent: salerTotal ? Math.round((salerNew / salerTotal) * 100) : 0,
    },
    {
      key: "consulting",
      name: "Đang tư vấn",
      count: salerConsulting,
      color: "#f59e0b",
      percent: salerTotal ? Math.round((salerConsulting / salerTotal) * 100) : 0,
    },
    {
      key: "closed",
      name: "Đã chốt",
      count: salerClosed,
      color: "#10b981",
      percent: salerTotal ? Math.round((salerClosed / salerTotal) * 100) : 0,
    },
    {
      key: "cancelled",
      name: "Đã hủy",
      count: salerCancelled,
      color: "#f43f5e",
      percent: salerTotal ? Math.round((salerCancelled / salerTotal) * 100) : 0,
    },
  ];

  return (
    <>
      <PageHeader title="Tổng quan" />
      <div className="kpi-grid">
        <Kpi
          icon={<ClipboardList />}
          label="Tổng đơn tour"
          value={String(total || 0)}
          color="blue"
        />
        <Kpi
          icon={<TrendingUp />}
          label="Đang tư vấn"
          value={String(orders.filter((o) => o.status === "consulting").length)}
          color="amber"
        />
        <Kpi
          icon={<Check />}
          label="Đã chốt"
          value={String(orders.filter((o) => o.status === "closed").length)}
          color="green"
        />
        <Kpi
          icon={<CircleDollarSign />}
          label="Tỷ lệ chốt đơn"
          value={
            total
              ? `${Math.round((orders.filter((o) => o.status === "closed").length / total) * 100)}%`
              : "0%"
          }
          color="violet"
        />
      </div>
      <div className="dashboard-grid">
        <Card>
          <div className="card-heading-row">
            <div>
              <h2>Đơn theo trạng thái</h2>
              <p>Phân bổ toàn bộ đơn tour</p>
            </div>
            <MoreHorizontal size={18} />
          </div>
          <div className="status-chart">
            {counts.map((item) => (
              <div className="chart-row" key={item.status}>
                <div className="chart-label">
                  <i
                    style={{
                      background: `var(--status-${statusMeta[item.status].varPrefix}-text)`,
                    }}
                  />
                  {statusMeta[item.status].label}
                  <b>{item.count}</b>
                </div>
                <div className="bar-track">
                  <span
                    style={{
                      width: `${total ? Math.max(4, (item.count / Math.max(total, 1)) * 100) : 4}%`,
                      background: `var(--status-${statusMeta[item.status].varPrefix}-text)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="saler-perf-card">
          <div className="card-heading-row saler-perf-heading">
            <div>
              <h2>Hiệu suất Saler</h2>
              <p>
                {salerTotal > 0 ? (
                  <>
                    Tổng <strong>{salerTotal}</strong> đơn · Tỷ lệ chốt:{" "}
                    <span className="conversion-highlight">{salerConversionRate}%</span>
                  </>
                ) : (
                  "Thống kê đơn theo nhân viên và trạng thái"
                )}
              </p>
            </div>
            <div className="saler-filters">
              <select
                className="mini-select saler-select"
                value={selectedSaler}
                onChange={(e) => setSelectedSaler(e.target.value)}
                title="Chọn nhân viên cần xem"
              >
                <option value="all">Tất cả nhân viên</option>
                {salers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.display_name || s.username}
                  </option>
                ))}
              </select>
              <select
                className="mini-select"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                title="Khoảng thời gian"
              >
                <option value="7">7 ngày qua</option>
                <option value="14">14 ngày qua</option>
                <option value="30">30 ngày qua</option>
                <option value="all">Tất cả</option>
              </select>
            </div>
          </div>

          <div className="saler-metric-pills">
            {salerChartData.map((item) => (
              <div key={item.key} className="saler-metric-pill">
                <span className="pill-dot" style={{ background: item.color }} />
                <span className="pill-label">{item.name}</span>
                <b className="pill-count">{item.count}</b>
                <span className="pill-percent">({item.percent}%)</span>
              </div>
            ))}
          </div>

          <div className="saler-chart-container">
            {salerTotal === 0 ? (
              <div className="saler-chart-empty">
                <BarChart3 size={28} />
                <span>Không có dữ liệu đơn tour trong khoảng thời gian này</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={salerChartData}
                  margin={{ top: 12, right: 12, left: -24, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border-subtle)"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="var(--text-dim)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "var(--border-subtle)" }}
                  />
                  <YAxis
                    stroke="var(--text-dim)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<CustomBarTooltip />}
                    cursor={{ fill: "var(--bg-card-hover)", opacity: 0.5 }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {salerChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
function Kpi({
  icon,
  label,
  value,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Card className="kpi-card">
      <div className={`kpi-icon ${color}`}>{icon}</div>
      <span className="kpi-label">{label}</span>
      <strong>{value}</strong>
    </Card>
  );
}

// Tự sinh username từ tên hiển thị: bỏ dấu, viết thường, nối bằng dấu chấm, thêm 4 ký tự ngẫu nhiên
function generateUsername(displayName: string): string {
  const normalized = displayName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .trim()
    .split(/\s+/)
    .join(".");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${normalized}.${suffix}`;
}

function SalersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    username: "",
    email: "",
    password: "",
  });
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Tự động thu gọn menu thao tác khi click chuột ra ngoài
  useEffect(() => {
    if (!openMenu) return;
    function handleOutsideClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        !target.closest(".dropdown-panel") &&
        !target.closest(".more-button")
      ) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [openMenu]);

  // State cho modal Chỉnh sửa thông tin nhân viên
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [editForm, setEditForm] = useState({
    display_name: "",
    username: "",
    email: "",
    role: "saler" as Role,
    password: "",
  });
  const [editFormError, setEditFormError] = useState("");

  function load() {
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setProfiles((data || []) as Profile[]));
  }
  useEffect(() => {
    load();
  }, []);

  const filtered = profiles.filter((p) =>
    `${p.display_name} ${p.username} ${p.email}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  // Khi tên thay đổi, tự sinh username (trừ khi admin đã sửa tay)
  function handleDisplayNameChange(v: string) {
    setForm((p) => ({
      ...p,
      display_name: v,
      username: usernameEdited
        ? p.username
        : v.trim()
          ? generateUsername(v)
          : "",
    }));
  }

  function handleUsernameChange(v: string) {
    setUsernameEdited(true);
    setForm((p) => ({
      ...p,
      username: v.toLowerCase().replace(/[^a-z0-9._-]/g, ""),
    }));
  }

  function closeModal() {
    setShowModal(false);
    setForm({ display_name: "", username: "", email: "", password: "" });
    setUsernameEdited(false);
    setFormError("");
  }

  function openEdit(profile: Profile) {
    setEditingProfile(profile);
    setEditForm({
      display_name: profile.display_name,
      username: profile.username || "",
      email: profile.email,
      role: profile.role,
      password: "",
    });
    setEditFormError("");
    setOpenMenu(null);
  }

  function closeEditModal() {
    setEditingProfile(null);
    setEditFormError("");
  }

  async function createSaler(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setBusy(true);

    if (!form.username.trim()) {
      setFormError("Username không được để trống.");
      setBusy(false);
      return;
    }

    // Kiểm tra username đã tồn tại chưa
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("username", form.username.trim())
      .maybeSingle();
    if (existing) {
      setFormError("Username này đã được sử dụng. Vui lòng chọn tên khác.");
      setBusy(false);
      return;
    }

    // Tạo user trên Supabase Auth
    const { data: createData, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: form.email,
        password: form.password,
        email_confirm: true,
        user_metadata: { full_name: form.display_name },
      });
    if (createError || !createData?.user) {
      setFormError(createError?.message || "Không thể tạo tài khoản.");
      setBusy(false);
      return;
    }

    // Cập nhật username vào profiles (trigger đã tạo profile, nhưng username do trigger sinh ngẫu nhiên)
    await supabaseAdmin
      .from("profiles")
      .update({ username: form.username.trim().toLowerCase() })
      .eq("id", createData.user.id);

    setBusy(false);
    closeModal();
    load();
  }

  async function updateSaler(e: FormEvent) {
    e.preventDefault();
    if (!editingProfile) return;
    setEditFormError("");
    setBusy(true);

    const cleanDisplayName = editForm.display_name.trim();
    const cleanUsername = editForm.username.trim().toLowerCase();
    const cleanEmail = editForm.email.trim().toLowerCase();

    if (!cleanDisplayName) {
      setEditFormError("Họ và tên không được để trống.");
      setBusy(false);
      return;
    }
    if (!cleanUsername) {
      setEditFormError("Username không được để trống.");
      setBusy(false);
      return;
    }
    if (!cleanEmail) {
      setEditFormError("Email không được để trống.");
      setBusy(false);
      return;
    }

    // Kiểm tra trùng username với người khác
    if (cleanUsername !== (editingProfile.username || "").toLowerCase()) {
      const { data: existingUser } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .ilike("username", cleanUsername)
        .neq("id", editingProfile.id)
        .maybeSingle();
      if (existingUser) {
        setEditFormError("Username này đã được tài khoản khác sử dụng.");
        setBusy(false);
        return;
      }
    }

    // Kiểm tra trùng email với người khác
    if (cleanEmail !== editingProfile.email.toLowerCase()) {
      const { data: existingEmail } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .ilike("email", cleanEmail)
        .neq("id", editingProfile.id)
        .maybeSingle();
      if (existingEmail) {
        setEditFormError("Email này đã được tài khoản khác sử dụng.");
        setBusy(false);
        return;
      }
    }

    // Cập nhật Supabase Auth
    const authPayload: {
      email?: string;
      password?: string;
      user_metadata?: { full_name: string };
    } = {
      user_metadata: { full_name: cleanDisplayName },
    };
    if (cleanEmail !== editingProfile.email.toLowerCase()) {
      authPayload.email = cleanEmail;
    }
    if (editForm.password && editForm.password.trim().length > 0) {
      if (editForm.password.length < 6) {
        setEditFormError("Mật khẩu mới cần tối thiểu 6 ký tự.");
        setBusy(false);
        return;
      }
      authPayload.password = editForm.password;
    }

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      editingProfile.id,
      authPayload,
    );
    if (authError) {
      setEditFormError(
        authError.message || "Không thể cập nhật tài khoản Auth.",
      );
      setBusy(false);
      return;
    }

    // Cập nhật bảng profiles
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        display_name: cleanDisplayName,
        username: cleanUsername,
        email: cleanEmail,
        role: editForm.role,
      })
      .eq("id", editingProfile.id);

    if (profileError) {
      setEditFormError(
        profileError.message || "Không thể cập nhật hồ sơ nhân viên.",
      );
      setBusy(false);
      return;
    }

    setBusy(false);
    closeEditModal();
    load();
  }

  async function toggleActive(profile: Profile) {
    if (profile.role === "admin") return;
    const nextActive = !profile.is_active;

    // 1. Cập nhật bảng profiles dùng supabaseAdmin để đảm bảo quyền
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ is_active: nextActive })
      .eq("id", profile.id);

    if (profileError) {
      alert("Không thể cập nhật trạng thái: " + profileError.message);
      return;
    }

    // 2. Đồng bộ trạng thái khóa/mở khóa tới Supabase Auth
    try {
      await supabaseAdmin.auth.admin.updateUserById(profile.id, {
        ban_duration: nextActive ? "none" : "876600h",
      });
    } catch (err) {
      console.error("Không thể đồng bộ trạng thái ban tới Supabase Auth:", err);
    }

    setOpenMenu(null);
    load();
  }

  return (
    <>
      <PageHeader
        title="Nhân viên Sale"
        actions={
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} /> Tạo nhân viên mới
          </Button>
        }
      />

      {/* Modal Tạo nhân viên mới */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Tạo nhân viên Sale</h2>
                <p>Tài khoản sẽ được kích hoạt ngay lập tức.</p>
              </div>
              <button className="modal-close" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={createSaler}>
              <Input
                label="Họ và tên"
                value={form.display_name}
                onChange={handleDisplayNameChange}
                placeholder="Nhập họ và tên"
                required
              />
              <div style={{ position: "relative" }}>
                <Input
                  label="Username đăng nhập"
                  value={form.username}
                  onChange={handleUsernameChange}
                  placeholder="Nhập username"
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
                onChange={(v) => setForm((p) => ({ ...p, email: v }))}
                placeholder="Nhập email"
                type="email"
                icon={<Mail size={15} />}
                required
              />
              <Input
                label="Mật khẩu tạm thời"
                value={form.password}
                onChange={(v) => setForm((p) => ({ ...p, password: v }))}
                placeholder="Tối thiểu 6 ký tự"
                type="password"
                icon={<KeyRound size={15} />}
                required
              />
              {formError && <div className="form-error">{formError}</div>}
              <div className="form-actions">
                <Button variant="secondary" type="button" onClick={closeModal}>
                  Hủy
                </Button>
                <Button type="submit" disabled={busy}>
                  {busy ? "Đang tạo..." : "Tạo tài khoản"} <Check size={15} />
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chỉnh sửa thông tin nhân viên */}
      {editingProfile && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Chỉnh sửa nhân viên</h2>
                <p>
                  Cập nhật thông tin tài khoản của {editingProfile.display_name}
                  .
                </p>
              </div>
              <button className="modal-close" onClick={closeEditModal}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={updateSaler}>
              <Input
                label="Họ và tên"
                value={editForm.display_name}
                onChange={(v) =>
                  setEditForm((p) => ({ ...p, display_name: v }))
                }
                placeholder="Nhập họ và tên"
                required
              />
              <Input
                label="Username đăng nhập"
                value={editForm.username}
                onChange={(v) =>
                  setEditForm((p) => ({
                    ...p,
                    username: v.toLowerCase().replace(/[^a-z0-9._-]/g, ""),
                  }))
                }
                placeholder="Nhập username"
                icon={<User size={15} />}
                required
              />
              <Input
                label="Email đăng nhập"
                value={editForm.email}
                onChange={(v) => setEditForm((p) => ({ ...p, email: v }))}
                placeholder="Nhập email"
                type="email"
                icon={<Mail size={15} />}
                required
              />
              <Select
                label="Vai trò hệ thống"
                value={editForm.role}
                onChange={(v) =>
                  setEditForm((p) => ({ ...p, role: v as Role }))
                }
              >
                <option value="saler">Nhân viên Sale (Sale Executive)</option>
                <option value="admin">Quản trị viên (Admin)</option>
              </Select>
              <Input
                label="Mật khẩu mới (Tùy chọn)"
                value={editForm.password}
                onChange={(v) => setEditForm((p) => ({ ...p, password: v }))}
                placeholder="Để trống nếu không muốn đổi mật khẩu"
                type="password"
                icon={<KeyRound size={15} />}
              />
              {editFormError && (
                <div className="form-error">{editFormError}</div>
              )}
              <div className="form-actions">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={closeEditModal}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={busy}>
                  {busy ? "Đang lưu..." : "Lưu thay đổi"} <Check size={15} />
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Card>
        <div className="toolbar">
          <div className="search-field">
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm tên, username hoặc email..."
            />
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>NHÂN VIÊN</th>
                <th>USERNAME</th>
                <th>EMAIL</th>
                <th>VAI TRÒ</th>
                <th>TRẠNG THÁI</th>
                <th>NGÀY THAM GIA</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state compact">
                      <Users size={28} />
                      <h3>Chưa có nhân viên nào</h3>
                      <p>Bấm "Tạo nhân viên mới" để bắt đầu.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((profile, index) => (
                  <tr
                    key={profile.id}
                    style={{
                      position: "relative",
                      zIndex: openMenu === profile.id ? 40 : 1,
                    }}
                  >
                    <td>
                      <div className="owner-cell">
                        <Avatar
                          src={profile.avatar_url}
                          name={profile.display_name}
                          size="sm"
                        />
                        <b>{profile.display_name}</b>
                      </div>
                    </td>
                    <td className="mono">@{profile.username}</td>
                    <td className="muted">{profile.email}</td>
                    <td>
                      <span className="role-pill">
                        {profile.role === "admin" ? "Admin" : "Sale Executive"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`active-pill ${profile.is_active ? "on" : "off"}`}
                      >
                        <i />
                        {profile.is_active ? "Đang hoạt động" : "Đã khóa"}
                      </span>
                    </td>
                    <td className="muted">
                      {new Date(profile.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td
                      style={{
                        position: "relative",
                        zIndex: openMenu === profile.id ? 50 : 1,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          position: "relative",
                          zIndex: openMenu === profile.id ? 60 : 1,
                        }}
                      >
                        <div className="row-actions">
                          <button
                            className="more-button"
                            onClick={() =>
                              setOpenMenu(
                                openMenu === profile.id ? null : profile.id,
                              )
                            }
                            title="Thao tác"
                          >
                            <MoreHorizontal size={17} />
                          </button>
                        </div>
                        {openMenu === profile.id && (
                          <div
                            className="dropdown-panel"
                            style={{
                              right: 0,
                              top:
                                index >= filtered.length - 2 &&
                                filtered.length > 2
                                  ? "auto"
                                  : "110%",
                              bottom:
                                index >= filtered.length - 2 &&
                                filtered.length > 2
                                  ? "110%"
                                  : "auto",
                              minWidth: 180,
                              zIndex: 1000,
                            }}
                          >
                            <b>Thao tác</b>
                            <button
                              type="button"
                              onClick={() => openEdit(profile)}
                            >
                              <Pencil size={13} /> Chỉnh sửa thông tin
                            </button>
                            {profile.role !== "admin" && (
                              <button
                                type="button"
                                onClick={() => toggleActive(profile)}
                              >
                                {profile.is_active ? (
                                  <>
                                    <Lock size={13} /> Khóa tài khoản
                                  </>
                                ) : (
                                  <>
                                    <Check size={13} /> Mở khóa tài khoản
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function removeVietnameseTones(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

function ActivityPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadLogs() {
    const { data } = await supabase
      .from("activity_logs")
      .select(
        "*, actor:profiles!activity_logs_actor_id_fkey(display_name, username, avatar_url)",
      )
      .order("created_at", { ascending: false })
      .limit(150);
    setLogs((data || []) as ActivityLog[]);
    setLoading(false);
  }

  useEffect(() => {
    loadLogs();
    const channel = supabase
      .channel("realtime-activity-logs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activity_logs" },
        () => {
          loadLogs();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredLogs = useMemo(() => {
    if (!query.trim()) return logs;
    const q = query.trim().toLowerCase();
    const qNorm = removeVietnameseTones(q);

    return logs.filter((log) => {
      const name = (log.actor?.display_name || "").toLowerCase();
      const nameNorm = removeVietnameseTones(name);
      const username = (log.actor?.username || "").toLowerCase();
      const desc = (log.description || "").toLowerCase();
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
        title="Lịch sử hoạt động"
        actions={
          <span className="live-status large">
            <i /> LIVE · Đang cập nhật
          </span>
        }
      />
      <Card>
        <div
          className="activity-filters"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div className="search-field">
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm nhân viên Sale..."
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-dim)",
                  cursor: "pointer",
                  display: "flex",
                  padding: 0,
                }}
                title="Xóa tìm kiếm"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
            Hiển thị <b>{filteredLogs.length}</b>{" "}
            {query ? `/ ${logs.length}` : ""} hoạt động
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
                <Button
                  variant="secondary"
                  onClick={() => setQuery("")}
                  style={{ marginTop: "10px" }}
                >
                  Xóa tìm kiếm
                </Button>
              </div>
            ) : (
              filteredLogs.map((log) => {
                const match = log.description.match(/ORD-[A-Za-z0-9]+/i);
                const orderCode = match ? match[0] : null;
                const isNavigable =
                  ["create_order", "update_status", "update_order"].includes(
                    log.action_type,
                  ) && !!orderCode;

                return (
                  <div
                    className={`activity-item ${log.action_type} ${isNavigable ? "clickable" : ""}`}
                    key={log.id}
                    onClick={
                      isNavigable
                        ? () => navigate(`/orders/${orderCode}`)
                        : undefined
                    }
                    title={
                      isNavigable
                        ? `Nhấn để xem chi tiết đơn tour ${orderCode}`
                        : undefined
                    }
                  >
                    <span className="activity-time">
                      {new Date(log.created_at).toLocaleTimeString("vi-VN")}
                    </span>
                    <Avatar
                      src={log.actor?.avatar_url}
                      name={log.actor?.display_name}
                      size="sm"
                    />
                    <div className="activity-item-content">
                      <b>
                        {log.actor?.display_name || "Hệ thống"}{" "}
                        <span className="mono">
                          @{log.actor?.username || "system"}
                        </span>
                      </b>
                      <p>{log.description}</p>
                    </div>
                    <span className="activity-date">
                      {new Date(log.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </Card>
    </>
  );
}

function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!current) {
      setError("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }
    if (next.length < 8) {
      setError("Mật khẩu mới cần ít nhất 8 ký tự.");
      return;
    }
    if (next !== confirm) {
      setError("Mật khẩu xác nhận chưa khớp.");
      return;
    }
    if (current === next) {
      setError("Mật khẩu mới phải khác mật khẩu hiện tại.");
      return;
    }

    setBusy(true);

    // Lấy email của user đang đăng nhập
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user?.email) {
      setError("Không thể lấy thông tin tài khoản. Vui lòng đăng nhập lại.");
      setBusy(false);
      return;
    }

    // Xác minh mật khẩu hiện tại bằng cách thử đăng nhập lại
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: current,
    });

    if (signInError) {
      setError("Mật khẩu hiện tại không đúng.");
      setBusy(false);
      return;
    }

    // Mật khẩu hiện tại đúng → tiến hành cập nhật
    const { error: updateError } = await supabase.auth.updateUser({
      password: next,
    });
    setBusy(false);

    if (updateError) {
      setError("Không thể đổi mật khẩu lúc này. Vui lòng thử lại.");
    } else {
      setMessage("Đổi mật khẩu thành công!");
      setCurrent("");
      setNext("");
      setConfirm("");
    }
  }

  return (
    <>
      <PageHeader title="Đổi mật khẩu" />
      <Card className="password-card">
        <div className="card-title">
          <span className="section-icon">
            <Lock size={17} />
          </span>
          <div>
            <h2>Cập nhật mật khẩu</h2>
            <p>
              Mật khẩu mới nên có ít nhất 8 ký tự và khác mật khẩu hiện tại.
            </p>
          </div>
        </div>
        <form onSubmit={submit}>
          <Input
            label="Mật khẩu hiện tại"
            value={current}
            onChange={setCurrent}
            type="password"
            required
          />
          <Input
            label="Mật khẩu mới"
            value={next}
            onChange={setNext}
            type="password"
            required
          />
          <Input
            label="Xác nhận mật khẩu mới"
            value={confirm}
            onChange={setConfirm}
            type="password"
            required
          />
          {error && <div className="form-error">{error}</div>}
          {message && (
            <div className="form-success">
              <Check size={15} />
              {message}
            </div>
          )}
          <div className="form-actions">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setCurrent("");
                setNext("");
                setConfirm("");
                setError("");
                setMessage("");
              }}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Đang xác minh..." : "Lưu thay đổi"}
            </Button>
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
    if (sessionStorage.getItem("skip_recovery") === "true") {
      return;
    }

    if (
      window.location.hash.includes("type=recovery") ||
      window.location.search.includes("type=recovery")
    ) {
      if (location.pathname !== "/reset-password") {
        navigate("/reset-password", { replace: true });
      }
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        if (sessionStorage.getItem("skip_recovery") !== "true") {
          navigate("/reset-password", { replace: true });
        }
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [navigate, location.pathname]);

  return null;
}

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [directBusy, setDirectBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    sessionStorage.removeItem("skip_recovery");
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session));
      setChecking(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setHasSession(true);
        }
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (password.length < 8) {
      setError("Mật khẩu mới cần ít nhất 8 ký tự.");
      return;
    }
    if (password !== confirm) {
      setError("Mật khẩu xác nhận chưa khớp.");
      return;
    }
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) {
      setError(
        "Không thể cập nhật mật khẩu. Link có thể đã hết hạn hoặc không hợp lệ.",
      );
    } else {
      sessionStorage.setItem("skip_recovery", "true");
      window.history.replaceState(null, "", "/");
      setMessage(
        "Đặt mật khẩu mới thành công! Đang chuyển hướng vào trang của bạn...",
      );
      setTimeout(() => navigate("/"), 1200);
    }
  }

  function handleDirectLogin() {
    setDirectBusy(true);
    sessionStorage.setItem("skip_recovery", "true");
    window.history.replaceState(null, "", "/");
    navigate("/", { replace: true });
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
        <span className="secure-label">
          <Lock size={12} /> Khôi phục tài khoản
        </span>
      </div>
      <Card className="auth-card">
        {!hasSession ? (
          <div className="auth-heading">
            <div className="auth-icon">
              <Lock size={22} />
            </div>
            <h1>Liên kết không hợp lệ</h1>
            <p>Liên kết đặt lại mật khẩu đã hết hạn hoặc không tồn tại.</p>
            <div style={{ marginTop: "1.5rem" }}>
              <Link
                to="/forgot-password"
                className="button button-primary full-button"
              >
                Yêu cầu link mới <ArrowLeft size={16} className="arrow-right" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="auth-heading">
              <div className="auth-icon">
                <Lock size={22} />
              </div>
              <h1>Đặt lại mật khẩu</h1>
              <p>
                Bạn có thể đặt mật khẩu mới hoặc tiếp tục vào thẳng hệ thống.
              </p>
            </div>
            <form onSubmit={submit}>
              <label className="field">
                <span>
                  Mật khẩu mới <em> *</em>
                </span>
                <div className="input-wrap">
                  <span className="input-icon">
                    <KeyRound size={16} />
                  </span>
                  <input
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập ít nhất 8 ký tự"
                    required
                  />
                  <button
                    type="button"
                    className="input-action"
                    onClick={() => setShow(!show)}
                  >
                    {show ? "Ẩn" : "Hiện"}
                  </button>
                </div>
              </label>

              <label className="field">
                <span>
                  Xác nhận mật khẩu mới <em> *</em>
                </span>
                <div className="input-wrap">
                  <span className="input-icon">
                    <KeyRound size={16} />
                  </span>
                  <input
                    type={show ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    required
                  />
                </div>
              </label>

              {error && <div className="form-error">{error}</div>}
              {message && (
                <div className="form-success">
                  <Check size={15} />
                  {message}
                </div>
              )}

              <Button
                type="submit"
                className="full-button"
                disabled={busy || directBusy}
              >
                {busy ? "Đang cập nhật..." : "Cập nhật mật khẩu"}{" "}
                <ArrowLeft size={16} className="arrow-right" />
              </Button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  margin: "14px 0",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: "var(--border-row)",
                  }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--text-dim)",
                    fontWeight: 600,
                  }}
                >
                  Hoặc
                </span>
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: "var(--border-row)",
                  }}
                />
              </div>

              <Button
                type="button"
                variant="secondary"
                className="full-button"
                disabled={busy || directBusy}
                onClick={handleDirectLogin}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <LogIn size={16} />{" "}
                {directBusy
                  ? "Đang vào hệ thống..."
                  : "Không đổi mật khẩu, vào hệ thống ngay"}
              </Button>
            </form>
          </>
        )}
      </Card>
      <div className="auth-footer">
        © 2026 TourFlow CRM · Dành cho đội ngũ nội bộ
      </div>
    </main>
  );
}

function ProtectedRoute() {
  const [authStatus, setAuthStatus] = useState<
    "loading" | "authorized" | "locked" | "unauthenticated"
  >("loading");

  useEffect(() => {
    let mounted = true;

    async function check() {
      try {
        const { data: sessionData, error: sessionErr } =
          await supabase.auth.getSession();
        if (!mounted) return;
        if (sessionErr || !sessionData?.session) {
          setAuthStatus("unauthenticated");
          return;
        }

        const user = sessionData.session.user;
        if (!user) {
          setAuthStatus("unauthenticated");
          return;
        }

        // Kiểm tra nhanh trạng thái is_active
        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("is_active")
          .eq("id", user.id)
          .maybeSingle();

        if (!mounted) return;

        if (!profileErr && profile && profile.is_active === false) {
          await supabase.auth.signOut();
          setAuthStatus("locked");
          return;
        }

        setAuthStatus("authorized");
      } catch (err) {
        console.error("Lỗi khi kiểm tra phiên đăng nhập:", err);
        if (mounted) {
          const { data } = await supabase.auth.getSession();
          setAuthStatus(data?.session ? "authorized" : "unauthenticated");
        }
      }
    }

    check();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, current) => {
        if (!mounted) return;
        if (!current) {
          setAuthStatus("unauthenticated");
        } else {
          setAuthStatus("authorized");
        }
      },
    );

    // Timeout an toàn: đảm bảo không bao giờ bị kẹt màn hình loading quá 1.5 giây
    const timeout = setTimeout(() => {
      if (mounted) {
        setAuthStatus((prev) => (prev === "loading" ? "authorized" : prev));
      }
    }, 1500);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      listener.subscription.unsubscribe();
    };
  }, []);

  if (sessionStorage.getItem("skip_recovery") !== "true") {
    if (
      window.location.hash.includes("type=recovery") ||
      window.location.search.includes("type=recovery")
    ) {
      return <Navigate to="/reset-password" replace />;
    }
  }

  if (authStatus === "loading")
    return <div className="loading-screen">Đang tải TourFlow...</div>;
  if (authStatus === "locked")
    return <Navigate to="/login?locked=true" replace />;
  if (authStatus === "unauthenticated") return <Navigate to="/login" replace />;
  return <AppLayout />;
}

function App() {
  const [theme, setTheme] = useState<string>(
    () => localStorage.getItem("theme") || "dark",
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
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
            <Route path="profile" element={<ProfileRoute />} />
            <Route path="admin/settings" element={<AdminSettingsRoute />} />
            <Route
              path="settings/change-password"
              element={<ChangePassword />}
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeContext.Provider>
  );
}

function ProfileRoute() {
  const { profile, setProfile } = useOutletContext<{
    profile: Profile | null;
    setProfile: (p: Profile) => void;
  }>();
  return <ProfilePage profile={profile} onProfileUpdated={setProfile} />;
}

function AdminSettingsRoute() {
  const { profile } = useOutletContext<{ profile: Profile | null }>();
  if (profile && profile.role !== "admin") {
    return <Navigate to="/orders" replace />;
  }
  return <AdminSettingsPage />;
}

function RoleRedirect() {
  const [role, setRole] = useState<Role | null>(null);
  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setRole("saler");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      setRole((data?.role as Role) || "saler");
    })();
  }, []);
  if (!role)
    return (
      <div className="loading-screen">Đang chuẩn bị không gian làm việc...</div>
    );
  return <Navigate to={role === "admin" ? "/dashboard" : "/orders"} replace />;
}
export default App;
