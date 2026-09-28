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
  toggleTheme: () => { },
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
  PieChart,
  Pie,
  Legend,
  LabelList
} from "recharts";
import {
  Activity,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
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
  PhoneCall,
  ArrowRight,
  Download,
  Globe,
  Share2,
  Calendar,
  Plane,
  Sparkles,
  UserRound,
  FileUp,
  Eye,
  MapPin,
  RotateCcw,
  History,
  AlertTriangle,
} from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase";
import type {
  ActivityLog,
  Order,
  OrderStatus,
  Profile,
  Role,
  Tour,
  RoomType,
  TourType,
  Customer,
  CustomerReturnVisit,
  CustomerHistoryData,
} from "@/types";
import { NotificationBell } from "./components/NotificationBell";
import { Avatar } from "./components/Avatar";
import { ProfilePage } from "./components/ProfilePage";
import { AdminSettingsPage } from "./components/AdminSettingsPage";
import { StarRating } from "./components/StarRating";
import { DestinationMultiSelect } from "./components/DestinationMultiSelect";
import { CountryFlag } from "./components/CountryFlag";
import { ALL_COUNTRIES } from "@/lib/countries";
import {
  MonthMultiSelector,
  parseTourMonths,
  formatDepartureMonths,
  SPANISH_MONTHS,
  formatSpanishMonthKey,
} from "./components/MonthMultiSelector";
import {
  CustomerSelectionSection,
  type CustomerSelectionState,
} from "./components/CustomerSelectionSection";
import { CustomerHistoryModal } from "./components/CustomerHistoryModal";
import {
  createNewCustomerWithFirstVisit,
  createCustomerReturnVisit,
  getCustomerHistory,
} from "./services/customerService";


const statusMeta: Record<OrderStatus, { label: string; varPrefix: string }> = {
  new: { label: "Mới", varPrefix: "new" },
  consulting: { label: "Đang tư vấn", varPrefix: "consulting" },
  closed: { label: "Đã chốt", varPrefix: "closed" },
  cancelled: { label: "Đã hủy", varPrefix: "cancelled" },
};

const monthMeta: Record<string, { label: string }> = {
  all: { label: "Tất cả các tháng" },
  this_month: { label: "Tháng này" },
  next_month: { label: "Tháng tới" },
  next_3_months: { label: "3 tháng tới" },
  this_year: { label: "Năm nay" },
  next_year: { label: "Năm sau" },
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
  title,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  title?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={`button button-${variant} ${className}`}
      title={title}
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
      {item.label}
    </span>
  );
}

function TourTypeBadge({ type }: { type?: TourType | string | null }) {
  const isPrivado = type === "privado";
  return (
    <span
      className={`tour-type-badge ${isPrivado ? "privado" : "grupal"}`}
      title={isPrivado ? "Tour privado" : "Tour grupal"}
    >
      {isPrivado ? (
        <UserRound size={12} strokeWidth={2.2} />
      ) : (
        <Users size={12} strokeWidth={2.2} />
      )}
      <span>{isPrivado ? "Privado" : "Grupal"}</span>
    </span>
  );
}

function getFileNameFromPath(path?: string | null): string {
  if (!path) return "";
  const parts = path.split("/");
  const fileName = parts[parts.length - 1];
  return fileName.replace(/^\d+-/, "");
}

function RequestSourceBadge({
  source,
  sourceOther,
}: {
  source: string | null;
  sourceOther?: string | null;
}) {
  if (!source) return null;
  const srcConfig: Record<
    string,
    { bg: string; iconOnly?: boolean; label: string; icon: React.ReactNode }
  > = {
    FACEBOOK: {
      bg: "#1877F2",
      label: "",
      icon: (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    INSTAGRAM: {
      bg: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
      label: "",
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    WHATSAPP: {
      bg: "#25D366",
      label: "",
      icon: (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
    EMAIL: {
      bg: "#EA4335",
      label: "",
      icon: (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
          <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
        </svg>
      ),
    },
    RETURNING_CUSTOMER: {
      bg: "#8b5cf6",
      label: "",
      icon: (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
        </svg>
      ),
    },
    OTHER: {
      bg: "#6b7280",
      label: "",
      icon: (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="6" cy="12" r="1.5" />
          <circle cx="18" cy="12" r="1.5" />
        </svg>
      ),
    },
  };
  const cfg = srcConfig[source];
  if (!cfg) return null;
  const tooltip =
    source === "OTHER" && sourceOther
      ? `Nguồn: ${sourceOther}`
      : `Nguồn: ${cfg.label || source}`;
  return (
    <span
      title={tooltip}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: cfg.label ? "4px" : "0",
        fontSize: "11px",
        padding: cfg.label ? "2px 6px" : "2px 4px",
        borderRadius: "5px",
        background: cfg.bg,
        color: "white",
        fontWeight: 600,
        lineHeight: "16px",
        letterSpacing: "0.01em",
        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        flexShrink: 0,
      }}
    >
      {cfg.icon}
      {cfg.label}
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
  required,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="field">
      {label && (
        <span>
          {label} {required && <span style={{ color: "var(--error-text, #ef4444)" }}>*</span>}
        </span>
      )}
      <div className="select-wrap">
        <select value={value} onChange={(e) => onChange(e.target.value)} required={required}>
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
                  setMobileOpen(false);
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
                    setMobileOpen(false);
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
                  setMobileOpen(false);
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
            onClick={() => {
              setMobileOpen(false);
              navigate("/profile");
            }}
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
          .select("id, username, display_name, email, role, is_active, avatar_url, created_at, updated_at")
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
    "booking_date",
  );
  const [specificDate, setSpecificDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showDateFilters, setShowDateFilters] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [salers, setSalers] = useState<Profile[]>([]);
  const [showSalerDropdown, setShowSalerDropdown] = useState(false);
  const [salerSearchQuery, setSalerSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const PAGE_SIZE = 10;

  const [customerFilter, setCustomerFilter] = useState<"all" | "new" | "returning">("all");
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [customerHistoryData, setCustomerHistoryData] = useState<CustomerHistoryData | null>(null);
  const [loadingCustomerHistory, setLoadingCustomerHistory] = useState(false);

  async function openCustomerHistory(customerId: string) {
    setHistoryModalOpen(true);
    setLoadingCustomerHistory(true);
    try {
      const data = await getCustomerHistory(customerId);
      setCustomerHistoryData(data);
    } catch (err) {
      console.error("Lỗi khi tải lịch sử khách hàng:", err);
    } finally {
      setLoadingCustomerHistory(false);
    }
  }

  const [selectedFilterMonths, setSelectedFilterMonths] = useState<string[]>([]);
  const [filterPickerYear, setFilterPickerYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const depMonth = searchParams.get("departureMonth") || searchParams.get("month");
    if (depMonth) {
      setDateType("tour_date");
      const parsed = parseTourMonths(depMonth);
      setSelectedFilterMonths(parsed);
      setSpecificDate(depMonth);
      setDateRange("all");
      setShowDateFilters(true);
    }
  }, [searchParams]);

  const toggleFilterMonth = (monthNum: number, year: number) => {
    const key = `${String(monthNum).padStart(2, "0")}/${year}`;
    setSelectedFilterMonths((prev) => {
      let updated: string[];
      if (prev.includes(key)) {
        updated = prev.filter((m) => m !== key);
      } else {
        updated = [...prev, key];
      }
      updated.sort((a, b) => {
        const [ma, ya] = a.split("/").map(Number);
        const [mb, yb] = b.split("/").map(Number);
        if (ya !== yb) return (ya || 0) - (yb || 0);
        return (ma || 0) - (mb || 0);
      });
      return updated;
    });
    setDateRange("all");
  };

  const removeFilterMonth = (key: string) => {
    setSelectedFilterMonths((prev) => prev.filter((m) => m !== key));
  };

  const clearFilterMonths = () => {
    setSelectedFilterMonths([]);
    setSpecificDate("");
    if (searchParams.has("departureMonth") || searchParams.has("month")) {
      searchParams.delete("departureMonth");
      searchParams.delete("month");
      setSearchParams(searchParams);
    }
  };

  const activeSearchCount = [
    Boolean(queryName),
    Boolean(queryPhone),
    Boolean(queryEmail),
    Boolean(queryTour),
    Boolean(querySaler),
  ].filter(Boolean).length;

  async function load() {
    setLoading(true);
    let request = supabase
      .from("orders")
      .select("*, owner:profiles(display_name, username, avatar_url), customer:customers(id, customer_code, full_name, phone, email, country), return_visit:customer_return_visits(id, visit_number)")
      .order("created_at", { ascending: false });
    const { data: user } = await supabase.auth.getUser();
    if (user?.user) {
      if (!admin) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.user.id)
          .maybeSingle();
        if (prof?.role !== "admin") {
          request = request.eq("owner_id", user.user.id);
        }
      }
    }
    const { data } = await request;
    setOrders((data || []) as Order[]);

    if (admin) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, username, display_name, email, role, is_active, avatar_url, created_at, updated_at")
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
    selectedFilterMonths,
    orders,
    sortOrder,
  ]);

  const filtered = useMemo(() => {
    const list = orders.filter((order) => {
      const matchName =
        !queryName ||
        (order.customer_name || "")
          .toLowerCase()
          .includes(queryName.toLowerCase()) ||
        (order.customer?.customer_code || "")
          .toLowerCase()
          .includes(queryName.toLowerCase()) ||
        (order.order_code || "")
          .toLowerCase()
          .includes(queryName.toLowerCase()) ||
        (order.customer_phone || "")
          .toLowerCase()
          .includes(queryName.toLowerCase()) ||
        (order.customer_email || "")
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
        (order.tour_name || "").toLowerCase().includes(queryTour.toLowerCase()) ||
        (order.private_tour_name || "").toLowerCase().includes(queryTour.toLowerCase());
      const matchSaler =
        !admin ||
        !querySaler ||
        order.owner_id === querySaler;

      let matchCustomerType = true;
      if (customerFilter === "new") {
        matchCustomerType = !order.return_visit || order.return_visit.visit_number === 1;
      } else if (customerFilter === "returning") {
        matchCustomerType = Boolean(order.return_visit && order.return_visit.visit_number > 1);
      }

      let matchDate = true;
      if (dateType === "tour_date") {
        const orderMonths = parseTourMonths(order.tour_date);
        const now = new Date();
        const curY = now.getFullYear();
        const curM = now.getMonth() + 1;
        const curMonthKey = `${String(curM).padStart(2, "0")}/${curY}`;

        if (selectedFilterMonths.length > 0) {
          // MULTI-MONTH OR FILTER: Khách có bất kỳ tháng nào nằm trong các tháng đã chọn (Lọc tức thì)
          matchDate = orderMonths.some((m) => selectedFilterMonths.includes(m));
        } else if (dateRange !== "all") {
          if (dateRange === "this_month") {
            matchDate = orderMonths.includes(curMonthKey);
          } else if (dateRange === "next_month") {
            const nextM = curM === 12 ? 1 : curM + 1;
            const nextY = curM === 12 ? curY + 1 : curY;
            const nextMonthKey = `${String(nextM).padStart(2, "0")}/${nextY}`;
            matchDate = orderMonths.includes(nextMonthKey);
          } else if (dateRange === "next_3_months") {
            const next3: string[] = [];
            for (let i = 0; i < 3; i++) {
              const d = new Date(curY, now.getMonth() + i, 1);
              next3.push(
                `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`,
              );
            }
            matchDate = orderMonths.some((m) => next3.includes(m));
          } else if (dateRange === "this_year") {
            matchDate = orderMonths.some((m) => m.endsWith(`/${curY}`));
          } else if (dateRange === "next_year") {
            matchDate = orderMonths.some((m) => m.endsWith(`/${curY + 1}`));
          } else if (specificDate) {
            let targetMonth = specificDate;
            if (/^\d{4}-\d{1,2}/.test(specificDate)) {
              const [y, m] = specificDate.split("-");
              targetMonth = `${m.padStart(2, "0")}/${y}`;
            } else if (/^\d{1,2}\/\d{4}$/.test(specificDate)) {
              const [m, y] = specificDate.split("/");
              targetMonth = `${m.padStart(2, "0")}/${y}`;
            }
            matchDate = orderMonths.includes(targetMonth);
          }
        }
      } else {
        // dateType === "booking_date"
        if (dateRange !== "all") {
          const targetDate = new Date(order.booking_date);
          const now = new Date();
          const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
          );
          if (dateRange === "today") {
            const endOfToday = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate(),
              23,
              59,
              59,
              999,
            );
            matchDate = targetDate >= today && targetDate <= endOfToday;
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
      }

      return (
        matchName &&
        matchPhone &&
        matchEmail &&
        matchTour &&
        matchSaler &&
        matchDate &&
        matchCustomerType &&
        (status === "all" || order.status === status)
      );
    });

    return list.sort((a, b) => {
      let dateA = 0;
      let dateB = 0;
      if (dateType === "booking_date") {
        dateA = new Date(a.booking_date).getTime();
        dateB = new Date(b.booking_date).getTime();
        if (isNaN(dateA)) dateA = new Date(a.created_at).getTime();
        if (isNaN(dateB)) dateB = new Date(b.created_at).getTime();
        if (dateA === dateB) {
          const timeA = new Date(a.created_at || 0).getTime();
          const timeB = new Date(b.created_at || 0).getTime();
          return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
        }
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        const monthsA = parseTourMonths(a.tour_date);
        if (monthsA.length > 0) {
          const [mA, yA] = monthsA[0].split("/").map(Number);
          dateA = new Date(yA, mA - 1, 1).getTime();
        } else {
          dateA = new Date(a.created_at).getTime();
        }
        const monthsB = parseTourMonths(b.tour_date);
        if (monthsB.length > 0) {
          const [mB, yB] = monthsB[0].split("/").map(Number);
          dateB = new Date(yB, mB - 1, 1).getTime();
        } else {
          dateB = new Date(b.created_at).getTime();
        }
        if (isNaN(dateA)) dateA = new Date(a.created_at).getTime();
        if (isNaN(dateB)) dateB = new Date(b.created_at).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
    });
  }, [
    orders,
    queryName,
    queryPhone,
    queryEmail,
    queryTour,
    querySaler,
    status,
    customerFilter,
    dateRange,
    dateType,
    specificDate,
    selectedFilterMonths,
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
      if (target && !target.closest(".filter-dropdown") && !target.closest(".saler-dropdown") && !target.closest(".export-dropdown")) {
        setShowFilters(false);
        setShowDateFilters(false);
        setShowSalerDropdown(false);
        setShowExportDropdown(false);
      }
    }
    if (showFilters || showDateFilters || showSalerDropdown || showExportDropdown) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showFilters, showDateFilters, showSalerDropdown, showExportDropdown]);

  function exportData(format: "csv" | "xlsx") {
    if (!orders || orders.length === 0) {
      alert("Không có dữ liệu để xuất.");
      return;
    }

    const dataToExport = orders.map((o: Order) => {
      const country = o.customer_country
        ? ALL_COUNTRIES.find((c) => c.code === o.customer_country)?.name || o.customer_country
        : "";
      const source = o.request_source === "OTHER" && o.request_source_other
        ? `Khác (${o.request_source_other})`
        : o.request_source || "";

      return {
        "Mã đơn": o.order_code,
        "Mã khách hàng": o.customer?.customer_code || "",
        "Lần quay lại": o.return_visit?.visit_number ? `Lần #${o.return_visit.visit_number}` : "Lần #1",
        "Ngày tạo đơn": o.booking_date ? new Date(o.booking_date).toLocaleDateString("vi-VN") : "",
        "Người tạo": o.owner?.display_name || "",
        "Khách hàng": o.customer_name,
        "Số điện thoại": o.customer_phone,
        "Email": o.customer_email || "",
        "Quốc tịch": country,
        "Destino": (o.destinations && o.destinations.length > 0) ? o.destinations.join(", ") : "Chưa có",
        "Nguồn khách": source,
        "Sản phẩm đã gửi": o.tour_name,
        "Loại tour": o.tour_type === "privado" ? "Tour privado" : "Tour grupal",
        "Tên tour riêng": o.tour_type === "privado" ? (o.private_tour_name || "") : "",
        "Loại phòng": o.room_type || "",
        "Số khách": o.num_guests || 1,
        "Tháng khởi hành": parseTourMonths(o.tour_date).join(', ') || o.tour_date || "",
        "Trạng thái": statusMeta[o.status]?.label || o.status,
        "Đánh giá (Sao)": o.rating ? `${o.rating}★` : "",
        "Ghi chú": o.notes || "",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    const fileName = `Danh_Sach_Don_Tour_${new Date().getTime()}`;
    XLSX.writeFile(workbook, `${fileName}.${format}`);
  }

  return (
    <>
      <PageHeader
        title={admin ? "Tất cả đơn tour" : "Đơn tour của tôi"}
        actions={
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div className="filter-dropdown export-dropdown" style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => {
                  setShowExportDropdown(!showExportDropdown);
                  setShowFilters(false);
                  setShowDateFilters(false);
                  setShowSalerDropdown(false);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-dim)",
                  padding: "8px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                title="Xuất dữ liệu"
              >
                <Download size={18} />
              </button>
              {showExportDropdown && (
                <div className="dropdown-panel" style={{ right: 0, left: "auto" }}>
                  <button onClick={() => { exportData("xlsx"); setShowExportDropdown(false); }}>
                    Xuất Excel (XLSX)
                  </button>
                  <button onClick={() => { exportData("csv"); setShowExportDropdown(false); }}>
                    Xuất CSV
                  </button>
                </div>
              )}
            </div>
            {!admin && (
              <Button onClick={() => navigate("/orders/new")}>
                <Plus size={16} /> Tạo đơn mới
              </Button>
            )}
          </div>
        }
      />
      <Card className="orders-card">
        <div className="toolbar">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <Button
              variant={showSearchBar || activeSearchCount > 0 ? "primary" : "secondary"}
              onClick={() => setShowSearchBar(!showSearchBar)}
              style={{ gap: "8px", fontWeight: 600 }}
              title="Bấm để mở hoặc ẩn thanh tìm kiếm"
            >
              <Search size={14} />
              <span>Tìm kiếm</span>
              {activeSearchCount > 0 && (
                <span className="search-active-pill">
                  {activeSearchCount}
                </span>
              )}
              <ChevronDown
                size={14}
                style={{
                  transform: showSearchBar ? "rotate(180deg)" : "rotate(0)",
                  transition: "transform 0.2s ease",
                }}
              />
            </Button>
            {activeSearchCount > 0 && (
              <Button
                variant="ghost"
                onClick={() => {
                  setQueryName("");
                  setQueryPhone("");
                  setQueryEmail("");
                  setQueryTour("");
                  setQuerySaler("");
                }}
                title="Xóa tất cả tìm kiếm"
                style={{ fontSize: "11px", color: "var(--text-muted)", gap: "4px" }}
              >
                <X size={13} />
                <span>Xóa tìm kiếm</span>
              </Button>
            )}
          </div>
          <div className="toolbar-actions">
            {/* Bộ lọc Khách mới vs Khách quay lại (Requirements 2 & 17) */}
            <div
              style={{
                display: "inline-flex",
                background: "var(--bg-card-alt)",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)",
                padding: "2px",
                gap: "2px",
              }}
            >
              <button
                type="button"
                onClick={() => setCustomerFilter("all")}
                style={{
                  padding: "5px 9px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: customerFilter === "all" ? "var(--btn-primary-bg, #2563eb)" : "transparent",
                  color: customerFilter === "all" ? "#ffffff" : "var(--text-dim)",
                  transition: "all 0.15s",
                }}
              >
                Tất cả khách
              </button>
              <button
                type="button"
                onClick={() => setCustomerFilter("new")}
                style={{
                  padding: "5px 9px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: customerFilter === "new" ? "var(--btn-primary-bg, #2563eb)" : "transparent",
                  color: customerFilter === "new" ? "#ffffff" : "var(--text-dim)",
                  transition: "all 0.15s",
                }}
                title="Khách hàng tạo đơn lần đầu tiên (Lần #1)"
              >
                Khách mới
              </button>
              <button
                type="button"
                onClick={() => setCustomerFilter("returning")}
                style={{
                  padding: "5px 9px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: customerFilter === "returning" ? "#7c3aed" : "transparent",
                  color: customerFilter === "returning" ? "#ffffff" : "var(--text-dim)",
                  transition: "all 0.15s",
                }}
                title="Khách hàng đã quay lại từ lần #2 trở lên"
              >
                Khách quay lại
              </button>
            </div>

            <div className="filter-dropdown">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowFilters(!showFilters);
                  setShowDateFilters(false);
                  setShowExportDropdown(false);
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
                  setShowExportDropdown(false);
                }}
                className="date-button"
                title={
                  dateType === "tour_date" && selectedFilterMonths.length > 0
                    ? `Tháng đi tour: ${selectedFilterMonths.map(formatSpanishMonthKey).join(", ")}`
                    : undefined
                }
              >
                <CalendarDays size={16} />{" "}
                {dateType === "tour_date" && selectedFilterMonths.length > 0
                  ? selectedFilterMonths.length === 1
                    ? `Tháng đi tour · ${formatSpanishMonthKey(selectedFilterMonths[0])}`
                    : `Tháng đi tour · ${formatSpanishMonthKey(selectedFilterMonths[0])} +${selectedFilterMonths.length - 1}`
                  : dateRange === "all"
                    ? dateType === "booking_date"
                      ? "Ngày tạo đơn"
                      : "Tháng đi tour"
                    : dateType === "tour_date"
                      ? monthMeta[dateRange]?.label || "Tháng đi tour"
                      : dateRange === "specific_day" && specificDate
                        ? new Date(specificDate).toLocaleDateString("vi-VN")
                        : dateMeta[dateRange]?.label}{" "}
                <ChevronDown size={14} />
              </Button>
              {showDateFilters && (
                <div className="dropdown-panel date-filter-panel">
                  <div className="filter-section-title">Tiêu chí thời gian</div>
                  <div className="filter-segmented-control">
                    <button
                      type="button"
                      className={`filter-segment-btn ${dateType === "booking_date" ? "active" : ""}`}
                      onClick={() => {
                        setDateType("booking_date");
                        setDateRange("all");
                        setSpecificDate("");
                        setSelectedFilterMonths([]);
                      }}
                    >
                      Ngày tạo đơn
                    </button>
                    <button
                      type="button"
                      className={`filter-segment-btn ${dateType === "tour_date" ? "active" : ""}`}
                      onClick={() => {
                        setDateType("tour_date");
                        setDateRange("all");
                        setSpecificDate("");
                      }}
                    >
                      Tháng đi tour
                    </button>
                  </div>

                  {dateType === "tour_date" ? (
                    <>
                      <div className="filter-section-title">Khoảng thời gian</div>
                      <div className="filter-preset-list">
                        {Object.keys(monthMeta).map((item) => (
                          <button
                            key={item}
                            type="button"
                            className={`filter-preset-btn ${dateRange === item && selectedFilterMonths.length === 0 ? "active" : ""}`}
                            onClick={() => {
                              setDateRange(item);
                              setSelectedFilterMonths([]);
                              setSpecificDate("");
                              setShowDateFilters(false);
                            }}
                          >
                            <span>{monthMeta[item].label}</span>
                            {dateRange === item && selectedFilterMonths.length === 0 && <Check size={14} />}
                          </button>
                        ))}
                      </div>

                      <div className="filter-divider" />

                      <div className="filter-section-title">
                        <span>Chọn tháng cụ thể</span>
                        {selectedFilterMonths.length > 0 && (
                          <span style={{ fontSize: "10px", color: "var(--brand-primary, #3b82f6)", fontWeight: 700, textTransform: "none" }}>
                            Đang lọc {selectedFilterMonths.length} tháng
                          </span>
                        )}
                      </div>

                      {/* Year Navigator */}
                      <div className="cal-year-nav">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFilterPickerYear((y) => y - 1);
                          }}
                          title="Năm trước"
                        >
                          ‹
                        </button>
                        <span className="cal-year-title">Năm {filterPickerYear}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFilterPickerYear((y) => y + 1);
                          }}
                          title="Năm tiếp theo"
                        >
                          ›
                        </button>
                      </div>

                      {/* 4x3 Month Grid with Spanish Abbreviations */}
                      <div className="cal-month-grid">
                        {SPANISH_MONTHS.map((sp) => {
                          const monthKey = `${String(sp.num).padStart(2, "0")}/${filterPickerYear}`;
                          const isSelected = selectedFilterMonths.includes(monthKey);
                          return (
                            <button
                              key={sp.num}
                              type="button"
                              className={isSelected ? "selected" : ""}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFilterMonth(sp.num, filterPickerYear);
                              }}
                              title={`${sp.full} (${monthKey})`}
                            >
                              {sp.short}
                            </button>
                          );
                        })}
                      </div>

                      {/* Footer Actions (Instant Reactive Filter - No Apply Button) */}
                      <div className="cal-footer">
                        <button
                          type="button"
                          className="cal-clear-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearFilterMonths();
                          }}
                          style={{
                            visibility: selectedFilterMonths.length > 0 ? "visible" : "hidden",
                          }}
                        >
                          Xóa chọn ({selectedFilterMonths.length})
                        </button>
                        {selectedFilterMonths.length > 0 ? (
                          <span style={{ fontSize: "11px", color: "var(--brand-primary, #3b82f6)", fontWeight: 600 }}>
                            Đang lọc {selectedFilterMonths.length} tháng
                          </span>
                        ) : (
                          <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                            Chọn tháng để lọc ngay
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="filter-section-title">Lọc thời gian</div>
                      <div className="filter-preset-list">
                        {Object.keys(dateMeta).map((item) => (
                          <button
                            key={item}
                            type="button"
                            className={`filter-preset-btn ${dateRange === item && !specificDate ? "active" : ""}`}
                            onClick={() => {
                              setDateRange(item);
                              setSpecificDate("");
                              setShowDateFilters(false);
                            }}
                          >
                            <span>{dateMeta[item].label}</span>
                            {dateRange === item && !specificDate && <Check size={14} />}
                          </button>
                        ))}
                      </div>

                      <div className="filter-divider" />

                      <div className="filter-section-title">Ngày cụ thể</div>
                      <div style={{ padding: "0 4px 6px" }}>
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
                            padding: "8px 10px",
                            fontSize: "12px",
                            background: "var(--bg-input)",
                            color: "var(--text-main)",
                            border: "1px solid var(--border-input)",
                            borderRadius: "6px",
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {showSearchBar && (
          <div className="toolbar-search-expanded">
            <div className="filter-row">
              <div className="search-field">
                <Search size={13} style={{ color: "var(--text-dim)", flexShrink: 0 }} />
                <input
                  value={queryName}
                  onChange={(e) => setQueryName(e.target.value)}
                  placeholder="Tên khách hàng..."
                />
                {queryName && (
                  <button
                    type="button"
                    onClick={() => setQueryName("")}
                    className="search-clear-btn"
                    title="Xóa"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              <div className="search-field">
                <Phone size={13} style={{ color: "var(--text-dim)", flexShrink: 0 }} />
                <input
                  value={queryPhone}
                  onChange={(e) => setQueryPhone(e.target.value)}
                  placeholder="Số điện thoại..."
                />
                {queryPhone && (
                  <button
                    type="button"
                    onClick={() => setQueryPhone("")}
                    className="search-clear-btn"
                    title="Xóa"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              <div className="search-field">
                <Mail size={13} style={{ color: "var(--text-dim)", flexShrink: 0 }} />
                <input
                  value={queryEmail}
                  onChange={(e) => setQueryEmail(e.target.value)}
                  placeholder="Email..."
                />
                {queryEmail && (
                  <button
                    type="button"
                    onClick={() => setQueryEmail("")}
                    className="search-clear-btn"
                    title="Xóa"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              <div className="search-field">
                <Compass size={13} style={{ color: "var(--text-dim)", flexShrink: 0 }} />
                <input
                  value={queryTour}
                  onChange={(e) => setQueryTour(e.target.value)}
                  placeholder="Tên sản phẩm đã gửi..."
                />
                {queryTour && (
                  <button
                    type="button"
                    onClick={() => setQueryTour("")}
                    className="search-clear-btn"
                    title="Xóa"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              {admin && (
                <div className="saler-dropdown" style={{ position: "relative" }}>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowSalerDropdown(!showSalerDropdown);
                      setShowFilters(false);
                      setShowDateFilters(false);
                      setShowExportDropdown(false);
                    }}
                    style={{ minWidth: 180, justifyContent: "space-between" }}
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
          </div>
        )}
        <div className="table-meta">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span>
              <b>{filtered.length}</b> đơn tour
            </span>
            {dateType === "tour_date" && selectedFilterMonths.length > 0 && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  padding: "3px 10px",
                  borderRadius: "14px",
                  background: "var(--brand-primary, #0ea5e9)",
                  color: "#ffffff",
                  fontWeight: 600,
                  boxShadow: "0 1px 3px rgba(14, 165, 233, 0.3)",
                }}
              >
                <span>
                  📅 Đang lọc Tháng khởi hành ({selectedFilterMonths.length}):{" "}
                  <strong>{selectedFilterMonths.map(formatSpanishMonthKey).join(", ")}</strong>
                </span>
                <button
                  type="button"
                  onClick={clearFilterMonths}
                  style={{
                    background: "rgba(255,255,255,0.25)",
                    border: "none",
                    borderRadius: "50%",
                    width: "16px",
                    height: "16px",
                    color: "#ffffff",
                    cursor: "pointer",
                    padding: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    lineHeight: 1,
                    marginLeft: "2px",
                  }}
                  title="Bỏ lọc các tháng này"
                >
                  ✕
                </button>
              </span>
            )}
            {dateType === "booking_date" && specificDate && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  padding: "3px 10px",
                  borderRadius: "14px",
                  background: "var(--brand-primary, #0ea5e9)",
                  color: "#ffffff",
                  fontWeight: 600,
                  boxShadow: "0 1px 3px rgba(14, 165, 233, 0.3)",
                }}
              >
                <span>
                  📅 Đang lọc Ngày: <strong>{new Date(specificDate).toLocaleDateString("vi-VN")}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSpecificDate("");
                    setDateRange("all");
                  }}
                  style={{
                    background: "rgba(255,255,255,0.25)",
                    border: "none",
                    borderRadius: "50%",
                    width: "16px",
                    height: "16px",
                    color: "#ffffff",
                    cursor: "pointer",
                    padding: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    lineHeight: 1,
                    marginLeft: "2px",
                  }}
                  title="Bỏ lọc ngày này"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
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
          <>
            <div className="orders-table-desktop">
              <div className="table-scroll">
            <table className="orders-table">
              <thead>
                <tr>
                  <th
                    style={{
                      width: admin ? '9%' : '10%',
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
                  <th style={{ width: admin ? '14%' : '16%' }}>KHÁCH HÀNG</th>
                  <th style={{ width: admin ? '6%' : '7%', textAlign: 'center' }}>QUỐC TỊCH</th>
                  <th style={{ width: admin ? '9%' : '10%' }}>
                    SỐ ĐIỆN THOẠI
                  </th>
                  {admin && <th style={{ width: '11%' }}>NHÂN VIÊN SALE</th>}
                  <th style={{ width: admin ? '17%' : '19%' }}>SẢN PHẨM ĐÃ GỬI</th>
                  <th style={{ width: admin ? '5%' : '6%', textAlign: 'center' }}>SỐ LƯỢNG</th>
                  <th
                    style={{
                      width: admin ? '10%' : '11%',
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
                    title="Bấm để chuyển chiều sắp xếp Tháng khởi hành"
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      THÁNG KHỞI HÀNH{" "}
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
                  <th style={{ width: admin ? '8%' : '9%' }}>LOẠI TOUR</th>
                  <th style={{ width: admin ? '11%' : '12%' }}>TRẠNG THÁI</th>
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
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span
                          className="customer-name-pure"
                          title={order.customer_name || "Khách hàng"}
                        >
                          {order.customer_name || "Chưa đặt tên"}
                        </span>
                        {order.return_visit && order.return_visit.visit_number > 1 && (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (order.customer_id) openCustomerHistory(order.customer_id);
                              }}
                              style={{
                                fontSize: "10px",
                                fontWeight: 600,
                                padding: "1px 6px",
                                borderRadius: "4px",
                                background: "rgba(139, 92, 246, 0.12)",
                                color: "#8b5cf6",
                                border: "1px solid rgba(139, 92, 246, 0.25)",
                                cursor: order.customer_id ? "pointer" : "default",
                                transition: "all 0.15s",
                              }}
                              onMouseEnter={(e) => {
                                if (order.customer_id) {
                                  e.currentTarget.style.background = "rgba(139, 92, 246, 0.22)";
                                  e.currentTarget.style.borderColor = "#8b5cf6";
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "rgba(139, 92, 246, 0.12)";
                                e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.25)";
                              }}
                              title={order.customer_id ? `Khách hàng quay lại lần ${order.return_visit.visit_number - 1} (Nhấp xem lịch sử)` : `Khách hàng quay lại lần ${order.return_visit.visit_number - 1}`}
                            >
                              Quay lại lần {order.return_visit.visit_number - 1}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {order.customer_country ? (() => {
                        const c = ALL_COUNTRIES.find(x => x.code === order.customer_country);
                        const countryName = c?.name || order.customer_country;
                        return (
                          <div
                            className="nationality-flag-badge"
                            title={`Quốc tịch: ${countryName}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '3px 6px',
                              borderRadius: '5px',
                              background: 'var(--bg-card-alt, rgba(255,255,255,0.03))',
                              border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
                              cursor: 'pointer',
                              transition: 'transform 0.15s ease, border-color 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.1)';
                              e.currentTarget.style.borderColor = 'var(--accent-primary, #60a5fa)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.borderColor = 'var(--border-subtle, rgba(255,255,255,0.08))';
                            }}
                          >
                            <CountryFlag code={order.customer_country} name={countryName} size="md" />
                          </div>
                        );
                      })() : <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>—</span>}
                    </td>
                    <td>
                      {order.customer_phone ? (
                        <span
                          className="customer-phone"
                          title={`Số điện thoại: ${order.customer_phone}`}
                        >
                          {order.customer_phone}
                        </span>
                      ) : (
                        <span className="muted">—</span>
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
                    <td style={{ overflow: 'hidden' }}>
                      <b className="tour-cell" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }} title={order.tour_name}>
                        {order.tour_name}
                      </b>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {order.num_guests ? (
                        <span
                          className="customer-phone"
                          title={`Số lượng: ${order.num_guests}`}
                        >
                          {order.num_guests}
                        </span>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td>
                      {(() => {
                        const info = formatDepartureMonths(order.tour_date);
                        return info.count > 0 ? (
                          <span
                            className="customer-phone"
                            title={info.fullText}
                          >
                            {info.all[0]}
                          </span>
                        ) : (
                          <span className="muted">—</span>
                        );
                      })()}
                    </td>
                    <td>
                      <span
                        className="customer-phone"
                        title={order.tour_type === "privado" ? "Tour privado" : "Tour grupal"}
                      >
                        {order.tour_type === "privado" ? "Privado" : "Grupal"}
                      </span>
                    </td>
                    <td>
                      <Badge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="orders-cards-mobile">
          {paginatedOrders.map((order) => {
            const countryObj = order.customer_country
              ? ALL_COUNTRIES.find((x) => x.code === order.customer_country)
              : null;
            const countryDisplay = countryObj ? `${countryObj.flag} ${countryObj.name}` : order.customer_country;

            return (
              <div
                key={order.id}
                className="order-card-item"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <div className="order-card-header">
                  <div className="order-card-customer">
                    <span className="customer-name-pure">
                      {order.customer_name || "Chưa đặt tên"}
                    </span>
                    <span className="order-code-badge">
                      #{order.order_code} {order.return_visit && order.return_visit.visit_number > 1 ? `· Quay lại lần ${order.return_visit.visit_number - 1}` : ''} · {new Date(order.booking_date).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <Badge status={order.status} />
                </div>

                <div className="order-card-tour">
                  <Compass size={14} className="order-card-tour-icon" />
                  <span className="order-card-tour-name">{order.tour_name}</span>
                </div>

                <div className="order-card-badges">
                  <TourTypeBadge type={order.tour_type} />
                  {order.num_guests && (
                    <span className="guest-badge" title={`Số lượng: ${order.num_guests} khách`}>
                      <Users size={10} /> {order.num_guests} khách
                    </span>
                  )}
                  {countryDisplay && (
                    <span className="country-badge" style={{ fontSize: "11px", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                      <Globe size={11} /> {countryDisplay}
                    </span>
                  )}
                </div>

                <div className="order-card-footer">
                  <div className="order-card-contact">
                    {order.customer_phone ? (
                      <a
                        href={`tel:${order.customer_phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="order-phone-pill"
                        title="Gọi điện thoại"
                      >
                        <Phone size={11} /> {order.customer_phone}
                      </a>
                    ) : (
                      <span className="muted" style={{ fontSize: "11px" }}>—</span>
                    )}
                    {admin && order.owner && (
                      <div className="order-owner-mini">
                        <Avatar
                          src={order.owner?.avatar_url}
                          name={order.owner?.display_name}
                          size="xs"
                        />
                        <span>{order.owner?.display_name || "Chưa phân công"}</span>
                      </div>
                    )}
                  </div>

                  <div className="order-card-dates">
                    <span className="order-tour-date" title="Tháng khởi hành">
                      <CalendarDays size={11} /> {formatDepartureMonths(order.tour_date).primary}
                    </span>
                    <ChevronRight size={15} className="order-card-arrow" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </>
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

      <CustomerHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        data={customerHistoryData}
        loading={loadingCustomerHistory}
      />
    </>
  );
}

function CountrySelect({
  value,
  onChange,
  label = "Quốc tịch",
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const selectedCountry = ALL_COUNTRIES.find((c) => c.code === value);
  const displayValue = selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : "";

  const filtered = ALL_COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="field" style={{ position: "relative" }}>
      <span>{label}</span>
      <div
        className="input-wrap"
        onClick={() => setOpen(true)}
      >
        <input
          type="text"
          placeholder="Tìm quốc tịch..."
          value={open ? search : displayValue}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
            if (!e.target.value) onChange("");
          }}
          onFocus={() => {
            setSearch("");
            setOpen(true);
          }}
          onBlur={() => {
            setTimeout(() => setOpen(false), 200);
          }}
        />
        <ChevronDown size={15} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} />
      </div>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            maxHeight: "200px",
            overflowY: "auto",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            zIndex: 10,
            marginTop: "4px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {filtered.map((c) => (
            <div
              key={c.code}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                background: value === c.code ? "var(--bg-hover)" : "transparent",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onClick={() => {
                onChange(c.code);
                setSearch("");
                setOpen(false);
              }}
              onMouseDown={(e) => e.preventDefault()}
            >
              <CountryFlag code={c.code} size="sm" />
              <span>{c.name}</span>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding: "8px 12px", color: "var(--text-dim)" }}>Không tìm thấy</div>}
        </div>
      )}
    </div>
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
    customer_country: "",
    destinations: [] as string[],
    request_source: "",
    request_source_other: "",
    tour_type: "grupal" as TourType,
    private_tour_name: "",
    private_tour_pdf_path: null as string | null,
  });
  const [newPdfFile, setNewPdfFile] = useState<File | null>(null);
  const [removeExistingPdf, setRemoveExistingPdf] = useState(false);
  const [existingPdfSignedUrl, setExistingPdfSignedUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState("");
  const [tours, setTours] = useState<Tour[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [currentOwner, setCurrentOwner] = useState<{
    display_name: string;
    username: string;
    avatar_url?: string | null;
  } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [customerState, setCustomerState] = useState<CustomerSelectionState>({
    mode: "new",
    selectedCustomer: null,
    returnVisitDecision: "new_visit",
    existingVisitId: null,
    targetVisitNumber: 1,
  });
  const [initialCustomer, setInitialCustomer] = useState<Customer | null>(null);
  const [initialVisit, setInitialVisit] = useState<CustomerReturnVisit | null>(null);
  const [existingOrderCustomerId, setExistingOrderCustomerId] = useState<string | null>(null);

  useEffect(() => {
    // Tải danh sách tour và dạng phòng được định nghĩa trong Settings
    Promise.all([
      supabase.from("tours").select("id, name, is_active").order("name"),
      supabase.from("room_types").select("id, name, is_active").order("name"),
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
        .select("*, owner:profiles(display_name, username, avatar_url), customer:customers(*), return_visit:customer_return_visits(*)");
      q = isUuid ? q.eq("id", id) : q.eq("order_code", id);
      q.maybeSingle().then(({ data }) => {
        if (data) {
          setExistingOrderCustomerId(data.customer_id || null);
          if (data.customer) {
            setInitialCustomer(data.customer as Customer);
          }
          if (data.return_visit) {
            setInitialVisit(data.return_visit as CustomerReturnVisit);
          }

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
            customer_country: data.customer_country || "",
            destinations: Array.isArray(data.destinations) ? data.destinations : [],
            request_source: data.request_source || "",
            request_source_other: data.request_source_other || "",
            tour_type: (data.tour_type as TourType) || "grupal",
            private_tour_name: data.private_tour_name || "",
            private_tour_pdf_path: data.private_tour_pdf_path || null,
          });
          setCurrentOwner(data.owner || null);

          if (data.private_tour_pdf_path) {
            supabase.storage
              .from("private-tour-programs")
              .createSignedUrl(data.private_tour_pdf_path, 3600)
              .then(({ data: signedData }) => {
                if (signedData?.signedUrl) {
                  setExistingPdfSignedUrl(signedData.signedUrl);
                }
              });
          }
        }
      });
    }
  }, [id]);

  function update(key: keyof typeof form, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setPdfError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setPdfError("Chỉ chấp nhận file định dạng PDF (.pdf). Vui lòng chọn lại.");
      e.target.value = "";
      return;
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setPdfError("Tên file phải có đuôi mở rộng .pdf.");
      e.target.value = "";
      return;
    }

    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setPdfError("Dung lượng file PDF vượt quá giới hạn 20MB.");
      e.target.value = "";
      return;
    }

    setNewPdfFile(file);
    setRemoveExistingPdf(false);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.tour_name.trim()) {
      setError("Vui lòng chọn hoặc nhập sản phẩm đã gửi.");
      return;
    }
    const departureMonths = parseTourMonths(form.tour_date);
    if (departureMonths.length === 0) {
      setError("Vui lòng chọn ít nhất 1 tháng khởi hành mong muốn.");
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

    const isPrivado = form.tour_type === "privado";
    const privateTourName = isPrivado ? form.private_tour_name.trim() || null : null;

    let result;
    if (editing) {
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          id!,
        );

      let finalPdfPath: string | null = form.private_tour_pdf_path;

      // If switched to grupal or removed existing PDF
      if (!isPrivado || removeExistingPdf) {
        finalPdfPath = null;
      }

      // If user selected a new PDF file to upload:
      if (isPrivado && newPdfFile) {
        const orderIdentifier = id!;
        const cleanName = newPdfFile.name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-zA-Z0-9._-]/g, "_");
        const uploadPath = `${orderIdentifier}/${Date.now()}-${cleanName}`;

        const { error: uploadErr } = await supabase.storage
          .from("private-tour-programs")
          .upload(uploadPath, newPdfFile, {
            contentType: "application/pdf",
            upsert: false,
          });

        if (uploadErr) {
          setError(`Lỗi upload PDF: ${uploadErr.message}`);
          setBusy(false);
          return;
        }

        finalPdfPath = uploadPath;
      }

      // Khi sửa đơn: Giữ nguyên người phụ trách (owner_id) ban đầu, tuyệt đối KHÔNG ghi đè bằng user.id của người sửa
      if (existingOrderCustomerId) {
        await supabase
          .from("customers")
          .update({
            full_name: form.customer_name.trim(),
            phone: form.customer_phone ? form.customer_phone.trim() : null,
            email: form.customer_email ? form.customer_email.trim() : null,
            country: form.customer_country || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingOrderCustomerId);
      }

      // Xử lý đợt tương tác / return_visit_id khi sửa đơn
      const resolvedReturnVisitId =
        customerState.selectedVisitId ||
        customerState.existingVisitId ||
        initialVisit?.id ||
        null;

      const updatePayload = {
        return_visit_id: resolvedReturnVisitId,
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
        customer_country: form.customer_country || null,
        destinations: form.destinations || [],
        request_source: form.request_source || null,
        request_source_other: form.request_source_other || null,
        tour_type: form.tour_type,
        private_tour_name: privateTourName,
        private_tour_pdf_path: finalPdfPath,
        updated_at: new Date().toISOString(),
      };

      let query = supabase.from("orders").update(updatePayload);
      query = isUuid ? query.eq("id", id) : query.eq("order_code", id);
      result = await query;

      if (!result.error) {
        // If old PDF existed and was replaced or removed:
        if (
          form.private_tour_pdf_path &&
          form.private_tour_pdf_path !== finalPdfPath
        ) {
          await supabase.storage
            .from("private-tour-programs")
            .remove([form.private_tour_pdf_path]);
        }
      }
    } else {
      // Khi tạo mới:
      let resolvedCustomerId: string | null = null;
      let resolvedReturnVisitId: string | null = null;

      try {
        if (customerState.mode === "new" || !customerState.selectedCustomer) {
          // Tạo khách hàng mới + Return Visit #1
          const { customer: newCust, visit: firstVisit } =
            await createNewCustomerWithFirstVisit({
              full_name: form.customer_name,
              phone: form.customer_phone,
              email: form.customer_email,
              country: form.customer_country,
            });
          resolvedCustomerId = newCust.id;
          resolvedReturnVisitId = firstVisit.id;
        } else {
          // Khách hàng cũ
          resolvedCustomerId = customerState.selectedCustomer.id;

          // Cập nhật thông tin khách hàng mới nhất nếu có chỉnh sửa trên form
          await supabase
            .from("customers")
            .update({
              full_name: form.customer_name.trim(),
              phone: form.customer_phone ? form.customer_phone.trim() : null,
              email: form.customer_email ? form.customer_email.trim() : null,
              country: form.customer_country || null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", resolvedCustomerId);

          if (customerState.selectedVisitId || customerState.existingVisitId) {
            resolvedReturnVisitId =
              customerState.selectedVisitId || customerState.existingVisitId;
          } else {
            // Tạo Return Visit mới cho khách
            const newVisit = await createCustomerReturnVisit(
              customerState.selectedCustomer.id,
              `Đơn tour: ${form.tour_name}`
            );
            resolvedReturnVisitId = newVisit.id;
          }
        }
      } catch (cusErr: any) {
        setError(`Lỗi quản lý khách hàng: ${cusErr.message || cusErr}`);
        setBusy(false);
        return;
      }

      const newOrderId = crypto.randomUUID();
      let uploadedPdfPath: string | null = null;

      if (isPrivado && newPdfFile) {
        const cleanName = newPdfFile.name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-zA-Z0-9._-]/g, "_");
        const uploadPath = `${newOrderId}/${Date.now()}-${cleanName}`;

        const { error: uploadErr } = await supabase.storage
          .from("private-tour-programs")
          .upload(uploadPath, newPdfFile, {
            contentType: "application/pdf",
            upsert: false,
          });

        if (uploadErr) {
          setError(`Lỗi upload PDF: ${uploadErr.message}`);
          setBusy(false);
          return;
        }

        uploadedPdfPath = uploadPath;
      }

      const insertPayload = {
        id: newOrderId,
        customer_id: resolvedCustomerId,
        return_visit_id: resolvedReturnVisitId,
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
        customer_country: form.customer_country || null,
        destinations: form.destinations || [],
        request_source: form.request_source || null,
        request_source_other: form.request_source_other || null,
        tour_type: form.tour_type,
        private_tour_name: privateTourName,
        private_tour_pdf_path: uploadedPdfPath,
        owner_id: user.id,
      };

      result = await supabase.from("orders").insert(insertPayload);

      if (result.error && uploadedPdfPath) {
        await supabase.storage
          .from("private-tour-programs")
          .remove([uploadedPdfPath]);
      }
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
              <p>Quản lý định danh khách hàng & nhận diện khách quay lại.</p>
            </div>
          </div>

          <CustomerSelectionSection
            tourDate={form.tour_date}
            excludeOrderId={editing ? id : undefined}
            initialCustomer={initialCustomer}
            initialVisit={initialVisit}
            isEditing={editing}
            customerPhone={form.customer_phone}
            customerEmail={form.customer_email}
            onCustomerStateChange={setCustomerState}
            onCustomerSelected={(cust) => {
              setForm((prev) => ({
                ...prev,
                customer_name: cust.full_name,
                customer_phone: cust.phone || prev.customer_phone,
                customer_email: cust.email || prev.customer_email,
                customer_country: cust.country || prev.customer_country,
              }));
            }}
          />

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
              <h2>Thông tin sản phẩm & dịch vụ</h2>
              <p>Lịch trình, loại tour và trạng thái đặt tour.</p>
            </div>
          </div>

          {/* Trường Chọn Loại tour */}
          <div className="field" style={{ marginBottom: "16px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-heading)", display: "block", marginBottom: "6px" }}>
              Loại tour<em> *</em>
            </span>
            <div className="tour-type-selector-grid">
              <div
                className={`tour-type-option-card ${form.tour_type === "grupal" ? "selected" : ""}`}
                onClick={() => {
                  update("tour_type", "grupal");
                  setPdfError("");
                }}
              >
                <div className="tour-type-radio-circle">
                  {form.tour_type === "grupal" && <div className="tour-type-radio-dot" />}
                </div>
                <div className="tour-type-option-content">
                  <div className="tour-type-option-title">
                    <Users size={15} style={{ color: "#2563eb" }} />
                    <span>Tour grupal</span>
                  </div>
                  <span className="tour-type-option-desc">Tour ghép đoàn lịch trình tiêu chuẩn</span>
                </div>
              </div>

              <div
                className={`tour-type-option-card ${form.tour_type === "privado" ? "selected privado" : ""}`}
                onClick={() => {
                  update("tour_type", "privado");
                  setPdfError("");
                }}
              >
                <div className="tour-type-radio-circle">
                  {form.tour_type === "privado" && <div className="tour-type-radio-dot" />}
                </div>
                <div className="tour-type-option-content">
                  <div className="tour-type-option-title">
                    <UserRound size={15} style={{ color: "#7c3aed" }} />
                    <span>Tour privado</span>
                  </div>
                  <span className="tour-type-option-desc">Tour riêng có tên riêng & PDF chương trình</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cấu hình cho Tour Privado: Tên tour riêng & Upload PDF */}
          {form.tour_type === "privado" && (
            <div
              style={{
                background: "rgba(139, 92, 246, 0.04)",
                border: "1px dashed rgba(139, 92, 246, 0.3)",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <UserRound size={16} style={{ color: "#7c3aed" }} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-heading)" }}>
                  Cấu hình Tour Privado (Tour riêng)
                </span>
              </div>

              <Input
                label="Tên tour riêng"
                value={form.private_tour_name}
                onChange={(v) => update("private_tour_name", v)}
                placeholder="Ví dụ: Vietnam - Tailandia 18 días"
              />

              <div className="field">
                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-heading)", display: "block", marginBottom: "6px" }}>
                  Chương trình tour (PDF)
                </span>

                {newPdfFile ? (
                  <div className="pdf-preview-box">
                    <div className="pdf-file-info">
                      <div className="pdf-file-icon">
                        <FileText size={20} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div className="pdf-file-name" title={newPdfFile.name}>
                          {newPdfFile.name}
                        </div>
                        <div className="pdf-file-meta">
                          {(newPdfFile.size / 1024 / 1024).toFixed(2)} MB · File mới chuẩn bị lưu
                        </div>
                      </div>
                    </div>
                    <div className="pdf-actions">
                      <label className="btn btn-secondary" style={{ cursor: "pointer", fontSize: "12px", padding: "6px 12px" }}>
                        Thay file
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          style={{ display: "none" }}
                          onChange={handleFileSelect}
                        />
                      </label>
                      <button
                        type="button"
                        className="btn btn-danger"
                        style={{ fontSize: "12px", padding: "6px 12px" }}
                        onClick={() => {
                          setNewPdfFile(null);
                          setPdfError("");
                        }}
                      >
                        Hủy chọn
                      </button>
                    </div>
                  </div>
                ) : form.private_tour_pdf_path && !removeExistingPdf ? (
                  <div className="pdf-preview-box">
                    <div className="pdf-file-info">
                      <div className="pdf-file-icon">
                        <FileText size={20} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div className="pdf-file-name" title={getFileNameFromPath(form.private_tour_pdf_path)}>
                          {getFileNameFromPath(form.private_tour_pdf_path)}
                        </div>
                        <div className="pdf-file-meta">
                          Chương trình tour hiện tại trên hệ thống
                        </div>
                      </div>
                    </div>
                    <div className="pdf-actions">
                      {existingPdfSignedUrl && (
                        <a
                          href={existingPdfSignedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                          style={{ fontSize: "12px", padding: "6px 12px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                        >
                          <Eye size={13} /> Xem
                        </a>
                      )}
                      <label className="btn btn-secondary" style={{ cursor: "pointer", fontSize: "12px", padding: "6px 12px" }}>
                        Thay file
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          style={{ display: "none" }}
                          onChange={handleFileSelect}
                        />
                      </label>
                      <button
                        type="button"
                        className="btn btn-danger"
                        style={{ fontSize: "12px", padding: "6px 12px" }}
                        onClick={() => {
                          setRemoveExistingPdf(true);
                          setPdfError("");
                        }}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="pdf-upload-dropzone">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      style={{ display: "none" }}
                      onChange={handleFileSelect}
                    />
                    <FileUp size={28} style={{ color: "#8b5cf6" }} />
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-main)" }}>
                      Chọn file PDF chương trình tour
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                      Hỗ trợ file định dạng .pdf (Tối đa 20MB)
                    </div>
                  </label>
                )}

                {pdfError && (
                  <div style={{ fontSize: "11px", color: "var(--error-text)", marginTop: "6px", fontWeight: 500 }}>
                    {pdfError}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Destino (Multi-select) */}
          <div style={{ marginBottom: "16px" }}>
            <DestinationMultiSelect
              value={form.destinations}
              onChange={(v) => update("destinations", v)}
            />
          </div>

          <div className="form-grid two">
            <Select
              label="Sản phẩm đã gửi"
              value={form.tour_name}
              onChange={(v) => update("tour_name", v)}
              required
            >
              <option value="">-- Chọn sản phẩm đã gửi --</option>
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
          </div>
          <MonthMultiSelector
            label="Tháng khởi hành mong muốn"
            value={form.tour_date}
            onChange={(v) => update("tour_date", v)}
            required
          />
        </Card>
        <Card>
          <div className="card-title">
            <span className="section-icon">
              <Compass size={17} />
            </span>
            <div>
              <h2>Thông tin tiếp thị</h2>
              <p>Nguồn gốc khách hàng và chiến dịch.</p>
            </div>
          </div>
          <div className="form-grid two">
            <CountrySelect
              value={form.customer_country}
              onChange={(v) => update("customer_country", v)}
            />

            <Select
              label="Nguồn request"
              value={form.request_source}
              onChange={(v) => {
                update("request_source", v);
                if (v !== "OTHER") update("request_source_other", "");
              }}
            >
              <option value="">-- Chọn nguồn --</option>
              <option value="FACEBOOK">Facebook</option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="EMAIL">Email</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="RETURNING_CUSTOMER">Khách cũ</option>
              <option value="OTHER">Khác</option>
            </Select>
          </div>
          {form.request_source === "OTHER" && (
            <Input
              label="Nguồn cụ thể"
              value={form.request_source_other}
              onChange={(v) => update("request_source_other", v)}
              required
            />
          )}
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

function OrderDetailSourceBadge({
  source,
  other,
}: {
  source?: string | null;
  other?: string | null;
}) {
  if (!source) {
    return (
      <span className="italic text-xs text-[var(--text-dim)] opacity-60">
        Chưa cập nhật nguồn khách
      </span>
    );
  }

  const configs: Record<
    string,
    { bg: string; label: string; icon: React.ReactNode }
  > = {
    FACEBOOK: {
      bg: "#1877F2",
      label: "Facebook",
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    INSTAGRAM: {
      bg: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
      label: "Instagram",
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    WHATSAPP: {
      bg: "#25D366",
      label: "WhatsApp",
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
    EMAIL: {
      bg: "#EA4335",
      label: "Email",
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
          <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
        </svg>
      ),
    },
    RETURNING_CUSTOMER: {
      bg: "#8b5cf6",
      label: "Khách cũ",
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
        </svg>
      ),
    },
    OTHER: {
      bg: "#64748b",
      label: other ? `Khác: ${other}` : "Khác",
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
          <circle cx="12" cy="12" r="2" />
          <circle cx="5" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      ),
    },
  };

  const cfg = configs[source] || {
    bg: "#64748b",
    label: source,
    icon: <Share2 size={12} />,
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "12px",
        padding: "3px 8px",
        borderRadius: "6px",
        background: cfg.bg,
        color: "#ffffff",
        fontWeight: 600,
        lineHeight: "16px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
      }}
    >
      {cfg.icon}
      <span>{cfg.label}</span>
    </span>
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
  const [copiedCustomerCode, setCopiedCustomerCode] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [customerHistoryData, setCustomerHistoryData] = useState<CustomerHistoryData | null>(null);
  const [loadingCustomerHistory, setLoadingCustomerHistory] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [pdfSignedUrl, setPdfSignedUrl] = useState<string | null>(null);
  const [loadingPdfUrl, setLoadingPdfUrl] = useState(false);

  async function openCustomerHistory(customerId: string) {
    setHistoryModalOpen(true);
    setLoadingCustomerHistory(true);
    try {
      const data = await getCustomerHistory(customerId);
      setCustomerHistoryData(data);
    } catch (err) {
      console.error("Lỗi khi tải lịch sử khách hàng:", err);
    } finally {
      setLoadingCustomerHistory(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      );
    let q = supabase
      .from("orders")
      .select("*, owner:profiles(display_name, username, avatar_url), customer:customers(*), return_visit:customer_return_visits(*)");
    q = isUuid ? q.eq("id", id) : q.eq("order_code", id);
    q.maybeSingle().then(({ data }) => {
      setOrder(data as Order | null);
      setLoading(false);
    });
  }, [id]);

  // Sinh signed URL bảo mật cho file PDF chương trình tour nếu có
  useEffect(() => {
    if (order?.private_tour_pdf_path) {
      setLoadingPdfUrl(true);
      supabase.storage
        .from("private-tour-programs")
        .createSignedUrl(order.private_tour_pdf_path, 3600)
        .then(({ data, error }) => {
          setLoadingPdfUrl(false);
          if (data?.signedUrl) {
            setPdfSignedUrl(data.signedUrl);
          } else if (error) {
            console.error("Lỗi khi tạo signed URL PDF:", error);
          }
        });
    } else {
      setPdfSignedUrl(null);
    }
  }, [order?.private_tour_pdf_path]);

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

    // Xóa file PDF trong storage nếu có
    if (order.private_tour_pdf_path) {
      await supabase.storage
        .from("private-tour-programs")
        .remove([order.private_tour_pdf_path]);
    }

    const { error } = await supabase.from("orders").delete().eq("id", order.id);
    if (error) {
      alert(`Không thể xóa đơn: ${error.message}`);
      return;
    }
    navigate(isAdmin ? "/admin/orders" : "/orders");
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

  function handleCopy(text: string, type: "code" | "phone") {
    navigator.clipboard.writeText(text);
    if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1800);
    } else if (type === "phone") {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 1800);
    }
  }

  // Departure months calculation
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const departureMonths = parseTourMonths(order.tour_date);
  let departureBadgeText = "Chưa có tháng đi tour";
  let departureStatusType: "current" | "future" | "past" | "none" = "none";
  if (departureMonths.length > 0) {
    const firstM = departureMonths[0];
    const [mNum, yNum] = firstM.split("/").map(Number);
    const targetMonthDate = new Date(yNum, mNum - 1, 1);
    const currentMonthDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthDiff =
      (targetMonthDate.getFullYear() - currentMonthDate.getFullYear()) * 12 +
      (targetMonthDate.getMonth() - currentMonthDate.getMonth());
    if (monthDiff > 0) {
      departureBadgeText = `Dự kiến khởi hành sau ${monthDiff} tháng (${firstM})`;
      departureStatusType = "future";
    } else if (monthDiff === 0) {
      departureBadgeText = `Khởi hành trong tháng này 🎉 (${firstM})`;
      departureStatusType = "current";
    } else {
      departureBadgeText = `Tháng khởi hành đã qua (${firstM})`;
      departureStatusType = "past";
    }
  }

  const departureRangeText =
    departureMonths.length === 0
      ? "Chưa xác định"
      : departureMonths.length === 1
      ? departureMonths[0]
      : `${departureMonths[0]} → ${departureMonths[departureMonths.length - 1]}`;

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
            <span className="od-metric-label">Sản phẩm đã gửi</span>
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
            <span className="od-metric-label">Tháng khởi hành</span>
            <span
              className="od-metric-val"
              title={formatDepartureMonths(order.tour_date).fullText}
            >
              {departureRangeText}
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

        <div className="od-metric-card">
          <div className={`od-metric-icon ${order.tour_type === "privado" ? "purple" : "blue"}`}>
            {order.tour_type === "privado" ? <UserRound size={20} /> : <Users size={20} />}
          </div>
          <div className="od-metric-info">
            <span className="od-metric-label">Loại tour</span>
            <span className="od-metric-val">
              <TourTypeBadge type={order.tour_type} />
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Column: Trip Overview & Notes */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Timeline Card */}
          <div className="od-timeline-card">
            {/* Left: Ngày tạo đơn */}
            <div className="od-timeline-point left">
              <span className="od-timeline-label">
                Ngày tạo đơn
              </span>
              <div className="od-timeline-date">
                {new Date(order.booking_date).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </div>
            </div>

            {/* Middle: Transit Line & Status Badge */}
            <div className="od-timeline-connector">
              <span className={`od-timeline-badge ${departureStatusType}`}>
                {departureBadgeText}
              </span>
              <div className="od-timeline-line-wrap">
                <div className="od-timeline-line" />
                <ArrowRight size={15} className="od-timeline-arrow" />
              </div>
            </div>

            {/* Right: Tháng khởi hành */}
            <div className="od-timeline-point right">
              <span className="od-timeline-label">
                Tháng khởi hành
              </span>
              <div
                className="od-timeline-date"
                title={departureMonths.length > 0 ? departureMonths.join(" · ") : undefined}
              >
                {departureRangeText}
              </div>
            </div>
          </div>

          {/* Thông tin Tour Privado (Tour riêng) */}
          {order.tour_type === "privado" && (
            <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <UserRound size={17} />
                  </div>
                  <div>
                    <h2 className="text-[13px] font-bold uppercase tracking-wider text-[var(--text-heading)]">
                      Thông tin Tour Privado
                    </h2>
                    <span className="text-[11px] text-[var(--text-dim)]">
                      Chi tiết tour riêng dành cho khách hàng
                    </span>
                  </div>
                </div>
                <TourTypeBadge type="privado" />
              </div>

              <div className="flex flex-col gap-3">
                <div className="p-3.5 bg-[var(--bg-body)] rounded-lg border border-[var(--border-subtle)]">
                  <span className="text-[10px] uppercase font-semibold text-[var(--text-dim)] tracking-wider block mb-1">
                    Tên tour riêng
                  </span>
                  <span className="text-[14px] font-bold text-[var(--text-heading)]">
                    {order.private_tour_name || "Chưa đặt tên riêng cho tour"}
                  </span>
                </div>

                {order.private_tour_pdf_path ? (
                  <div className="od-pdf-card">
                    <div className="pdf-file-info">
                      <div className="pdf-file-icon">
                        <FileText size={20} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <span className="pdf-file-name" title={getFileNameFromPath(order.private_tour_pdf_path)}>
                          {getFileNameFromPath(order.private_tour_pdf_path)}
                        </span>
                        <span className="pdf-file-meta block">
                          Chương trình tour PDF đính kèm
                        </span>
                      </div>
                    </div>
                    <div className="pdf-actions">
                      {pdfSignedUrl ? (
                        <a
                          href={pdfSignedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                          style={{ fontSize: "12px", padding: "7px 14px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
                        >
                          <Eye size={14} /> Xem PDF
                        </a>
                      ) : (
                        <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                          {loadingPdfUrl ? "Đang tạo liên kết an toàn..." : "Không thể tạo liên kết"}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[var(--bg-body)] rounded-lg border border-dashed border-[var(--border-subtle)] text-center text-[12px] text-[var(--text-dim)]">
                    Chưa tải lên file PDF chương trình tour.
                  </div>
                )}
              </div>
            </div>
          )}

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

            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <span className="text-[11px] text-[var(--text-dim)] uppercase tracking-widest block mb-1">
                  Tên khách hàng
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-[var(--text-heading)]">
                    {order.customer_name}
                  </h3>
                  {order.customer?.customer_code && (
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background: "rgba(139, 92, 246, 0.12)",
                        color: "#8b5cf6",
                        border: "1px solid rgba(139, 92, 246, 0.25)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                      title="Mã định danh khách hàng (Customer ID)"
                    >
                      <span>{order.customer.customer_code}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(order.customer!.customer_code);
                          setCopiedCustomerCode(true);
                          setTimeout(() => setCopiedCustomerCode(false), 2000);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "inherit",
                          cursor: "pointer",
                          padding: 0,
                          display: "inline-flex",
                        }}
                        title="Sao chép mã khách hàng"
                      >
                        {copiedCustomerCode ? (
                          <CheckCheck size={12} color="#10b981" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </span>
                  )}
                </div>
              </div>

              {order.customer_id && (
                <button
                  type="button"
                  onClick={() => openCustomerHistory(order.customer_id!)}
                  className="btn btn-secondary"
                  style={{
                    fontSize: "11px",
                    padding: "6px 10px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                  title="Xem toàn bộ lịch sử các đợt quay lại của khách hàng"
                >
                  <History size={13} />
                  <span>Lịch sử khách</span>
                </button>
              )}
            </div>

            {/* Return Visit Banner */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: "var(--bg-body)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "8px",
                marginBottom: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <RotateCcw size={13} style={{ color: "#7c3aed" }} />
                <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                  Đợt quay lại:
                </span>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "5px",
                  background: (order.return_visit?.visit_number || 1) > 1 ? "rgba(139, 92, 246, 0.15)" : "rgba(37, 99, 235, 0.15)",
                  color: (order.return_visit?.visit_number || 1) > 1 ? "#7c3aed" : "#2563eb",
                }}
              >
                {(order.return_visit?.visit_number || 1) > 1
                  ? `Quay lại lần ${(order.return_visit?.visit_number || 1) - 1}`
                  : "Lần đầu (Khách mới)"}
              </span>
            </div>

            <div className="bg-[var(--bg-body)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
              {/* Phone */}
              <div className="flex items-center justify-between p-3.5 transition-colors hover:bg-[var(--bg-hover)]">
                <div className="flex items-center gap-3 text-[13px] text-[var(--text-main)]">
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Phone size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] font-semibold leading-tight">
                      Số điện thoại
                    </span>
                    <span className="font-medium mt-0.5">{order.customer_phone}</span>
                  </div>
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

              {/* Email */}
              <div className="flex items-center justify-between p-3.5 border-t border-[var(--border-subtle)] border-dashed transition-colors hover:bg-[var(--bg-hover)]">
                <div className="flex items-center gap-3 text-[13px] text-[var(--text-main)]">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Mail size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] font-semibold leading-tight">
                      Email
                    </span>
                    {order.customer_email ? (
                      <span
                        className="font-medium truncate max-w-[170px] mt-0.5"
                        title={order.customer_email}
                      >
                        {order.customer_email}
                      </span>
                    ) : (
                      <span className="italic text-xs text-[var(--text-dim)] opacity-60 mt-0.5">
                        Chưa cập nhật email
                      </span>
                    )}
                  </div>
                </div>
                {order.customer_email && (
                  <a
                    href={`mailto:${order.customer_email}`}
                    className="p-1.5 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-md transition-colors"
                    title="Gửi email"
                  >
                    <Mail size={14} />
                  </a>
                )}
              </div>

              {/* Quốc tịch */}
              <div className="flex items-center justify-between p-3.5 border-t border-[var(--border-subtle)] border-dashed transition-colors hover:bg-[var(--bg-hover)]">
                <div className="flex items-center gap-3 text-[13px] text-[var(--text-main)]">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Globe size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] font-semibold leading-tight">
                      Quốc tịch
                    </span>
                    {order.customer_country ? (() => {
                      const countryObj = ALL_COUNTRIES.find(
                        (c) => c.code === order.customer_country
                      );
                      return (
                        <span className="font-medium flex items-center gap-2 mt-0.5">
                          <CountryFlag code={order.customer_country} size="md" />
                          <span>{countryObj?.name || order.customer_country}</span>
                        </span>
                      );
                    })() : (
                      <span className="italic text-xs text-[var(--text-dim)] opacity-60 mt-0.5">
                        Chưa cập nhật quốc tịch
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Destino */}
              <div className="flex items-center justify-between p-3.5 border-t border-[var(--border-subtle)] border-dashed transition-colors hover:bg-[var(--bg-hover)]">
                <div className="flex items-start gap-3 text-[13px] text-[var(--text-main)] w-full">
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin size={14} />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] font-semibold leading-tight">
                      Destino
                    </span>
                    {order.destinations && order.destinations.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {order.destinations.map((d) => (
                          <span
                            key={d}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="italic text-xs text-[var(--text-dim)] opacity-60 mt-0.5">
                        Chưa có
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Nguồn khách */}
              <div className="flex items-center justify-between p-3.5 border-t border-[var(--border-subtle)] border-dashed transition-colors hover:bg-[var(--bg-hover)]">
                <div className="flex items-center gap-3 text-[13px] text-[var(--text-main)]">
                  <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center flex-shrink-0">
                    <Share2 size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] font-semibold leading-tight">
                      Nguồn khách
                    </span>
                    <div className="mt-1">
                      <OrderDetailSourceBadge
                        source={order.request_source}
                        other={order.request_source_other}
                      />
                    </div>
                  </div>
                </div>
              </div>
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

      {/* Customer History Modal */}
      <CustomerHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        data={customerHistoryData}
        loading={loadingCustomerHistory}
      />
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

function CustomCountryBarTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="saler-chart-tooltip">
        <div className="tooltip-header" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Globe size={15} style={{ color: "var(--text-dim)" }} />
          <strong>{data.name}</strong>
        </div>
        <div className="tooltip-row">
          <span>Số đơn tour:</span>
          <b>{data.orders} đơn</b>
        </div>
      </div>
    );
  }
  return null;
}

const MARKETING_SOURCE_CONFIG: Record<
  string,
  { name: string; color: string; bg: string; icon: React.ReactNode }
> = {
  FACEBOOK: {
    name: "Facebook",
    color: "#1877F2",
    bg: "#1877F2",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  INSTAGRAM: {
    name: "Instagram",
    color: "#E1306C",
    bg: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  WHATSAPP: {
    name: "WhatsApp",
    color: "#25D366",
    bg: "#25D366",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  EMAIL: {
    name: "Email",
    color: "#EA4335",
    bg: "#EA4335",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
      </svg>
    ),
  },
  RETURNING_CUSTOMER: {
    name: "Khách cũ",
    color: "#8b5cf6",
    bg: "#8b5cf6",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
      </svg>
    ),
  },
  OTHER: {
    name: "Khác",
    color: "#64748b",
    bg: "#64748b",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
        <circle cx="12" cy="12" r="2" />
        <circle cx="5" cy="12" r="2" />
        <circle cx="19" cy="12" r="2" />
      </svg>
    ),
  },
  UNKNOWN: {
    name: "Chưa rõ",
    color: "#94a3b8",
    bg: "#94a3b8",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
};

function CustomSourcePieTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: any[];
  total: number;
}) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const pct = total > 0 ? Math.round((data.count / total) * 100) : 0;
    return (
      <div
        className="saler-chart-tooltip"
        style={{
          background: "var(--bg-card, #ffffff)",
          border: "1px solid var(--border-subtle, #e2e8f0)",
          boxShadow: "0 12px 28px rgba(0, 0, 0, 0.25)",
          position: "relative",
          zIndex: 100,
          opacity: 1,
        }}
      >
        <div className="tooltip-header" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "16px",
              height: "16px",
              borderRadius: "4px",
              background: data.bg,
              color: "white",
              flexShrink: 0,
            }}
          >
            {data.icon}
          </span>
          <strong>{data.name}</strong>
        </div>
        <div className="tooltip-row">
          <span>Số đơn tour:</span>
          <b>{data.count} đơn</b>
        </div>
        <div className="tooltip-row">
          <span>Tỷ trọng:</span>
          <span>{pct}%</span>
        </div>
      </div>
    );
  }
  return null;
}

function CustomSourceXAxisTick({ x, y, payload }: any) {
  const name = payload?.value;
  const conf =
    Object.values(MARKETING_SOURCE_CONFIG).find((c) => c.name === name) ||
    MARKETING_SOURCE_CONFIG[name] || {
      name: name || "",
      color: "#64748b",
      bg: "#64748b",
      icon: null,
    };

  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={-40} y={4} width={80} height={46} style={{ overflow: "visible" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "3px",
            textAlign: "center",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "18px",
              height: "18px",
              borderRadius: "5px",
              background: conf.bg,
              color: "white",
              boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
              flexShrink: 0,
            }}
          >
            {conf.icon}
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 500,
              color: "var(--text-dim)",
              whiteSpace: "nowrap",
              lineHeight: 1,
            }}
          >
            {conf.name}
          </span>
        </div>
      </foreignObject>
    </g>
  );
}

function CustomSourceStatusTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    const conf =
      Object.values(MARKETING_SOURCE_CONFIG).find((c) => c.name === label) ||
      (data?.code && MARKETING_SOURCE_CONFIG[data.code]) || {
        name: label || "",
        color: "#64748b",
        bg: "#64748b",
        icon: null,
      };

    const totalOrders =
      (data?.new || 0) +
      (data?.consulting || 0) +
      (data?.closed || 0) +
      (data?.cancelled || 0);

    const statusItems = [
      { label: "Mới", count: data?.new || 0, color: "var(--status-new-text)" },
      { label: "Đang tư vấn", count: data?.consulting || 0, color: "var(--status-consulting-text)" },
      { label: "Đã chốt", count: data?.closed || 0, color: "var(--status-closed-text)" },
      { label: "Đã hủy", count: data?.cancelled || 0, color: "var(--status-cancelled-text)" },
    ].filter((item) => item.count > 0);

    return (
      <div
        className="saler-chart-tooltip"
        style={{
          background: "var(--bg-card, #ffffff)",
          border: "1px solid var(--border-subtle, #e2e8f0)",
          boxShadow: "0 12px 28px rgba(0, 0, 0, 0.25)",
          minWidth: "155px",
          position: "relative",
          zIndex: 100,
        }}
      >
        <div className="tooltip-header" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "18px",
              height: "18px",
              borderRadius: "4px",
              background: conf.bg,
              color: "white",
              flexShrink: 0,
            }}
          >
            {conf.icon}
          </span>
          <strong>{conf.name}</strong>
          <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--text-dim)", fontWeight: 600 }}>
            {totalOrders} đơn
          </span>
        </div>
        {statusItems.map((st) => (
          <div key={st.label} className="tooltip-row">
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: st.color,
                }}
              />
              {st.label}:
            </span>
            <b>{st.count} đơn</b>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function CustomDepartureMonthTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    const total = data?.total || 0;
    const guests = data?.guests || 0;

    return (
      <div
        className="saler-chart-tooltip"
        style={{
          background: "var(--bg-card, #ffffff)",
          border: "1px solid var(--border-subtle, #e2e8f0)",
          boxShadow: "0 12px 28px rgba(0, 0, 0, 0.25)",
          minWidth: "185px",
          padding: "10px 12px",
          borderRadius: "8px",
          position: "relative",
          zIndex: 100,
        }}
      >
        <div
          className="tooltip-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <strong style={{ fontSize: "13px", color: "var(--text-heading)" }}>
            Tháng {label}
          </strong>
          <span
            style={{
              fontSize: "11px",
              color: "var(--text-dim)",
              fontWeight: 600,
            }}
          >
            {total} đơn · {guests} khách
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            fontSize: "12px",
          }}
        >
          {data?.new > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "var(--status-new-text)",
              }}
            >
              <span>● Mới:</span>
              <b>{data.new} đơn</b>
            </div>
          )}
          {data?.consulting > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "var(--status-consulting-text)",
              }}
            >
              <span>● Đang tư vấn:</span>
              <b>{data.consulting} đơn</b>
            </div>
          )}
          {data?.closed > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "var(--status-closed-text)",
              }}
            >
              <span>● Đã chốt:</span>
              <b>{data.closed} đơn</b>
            </div>
          )}
          {data?.cancelled > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "var(--status-cancelled-text)",
              }}
            >
              <span>● Đã hủy:</span>
              <b>{data.cancelled} đơn</b>
            </div>
          )}
        </div>
        <div
          style={{
            marginTop: "8px",
            paddingTop: "6px",
            borderTop: "1px dashed var(--border-subtle)",
            fontSize: "11px",
            color: "var(--text-dim)",
            textAlign: "center",
          }}
        >
          Bấm vào cột hoặc nút tháng để xem danh sách khách
        </div>
      </div>
    );
  }
  return null;
}

function Dashboard() {
  const navigate = useNavigate();
  const outletCtx = useOutletContext<{ profile: Profile | null }>() || {};
  const isAdmin = outletCtx?.profile?.role === "admin";
  const [orders, setOrders] = useState<Order[]>([]);
  const [salers, setSalers] = useState<Profile[]>([]);
  const [selectedSaler, setSelectedSaler] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("7");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [countryTimeRange, setCountryTimeRange] = useState<string>("all");
  const [countryTopN, setCountryTopN] = useState<string>("5");
  const [activeDrillMonth, setActiveDrillMonth] = useState<string | null>(null);

  function loadDashboardData() {
    supabase
      .from("orders")
      .select("id, order_code, owner_id, customer_id, return_visit_id, tour_name, customer_name, customer_phone, customer_email, booking_date, tour_date, status, tour_type, private_tour_name, private_tour_pdf_path, room_type, num_guests, rating, notes, customer_country, destinations, request_source, request_source_other, created_at, updated_at")
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
    if (selectedCountry !== "all") {
      list = list.filter((o) => (o.customer_country || 'UNKNOWN') === selectedCountry);
    }
    if (selectedSource !== "all") {
      list = list.filter((o) => (o.request_source || 'UNKNOWN') === selectedSource);
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
  }, [orders, selectedSaler, timeRange, selectedCountry, selectedSource]);

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

  const countryData = useMemo(() => {
    let list = orders;
    if (countryTimeRange !== "all") {
      const days = parseInt(countryTimeRange, 10);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      cutoff.setHours(0, 0, 0, 0);
      list = list.filter((o) => {
        const d = new Date(o.created_at || o.booking_date);
        return d >= cutoff;
      });
    }

    const countryMap: Record<
      string,
      { code: string; name: string; flag: string; orders: number }
    > = {};

    list.forEach((o) => {
      const code = o.customer_country || "UNKNOWN";
      if (!countryMap[code]) {
        if (code === "UNKNOWN") {
          countryMap[code] = {
            code,
            name: "Chưa rõ",
            flag: "🌐",
            orders: 0,
          };
        } else {
          const c = ALL_COUNTRIES.find((x) => x.code === code);
          countryMap[code] = {
            code,
            name: c ? c.name : code,
            flag: c ? c.flag : "🌐",
            orders: 0,
          };
        }
      }
      countryMap[code].orders += 1;
    });

    return Object.values(countryMap);
  }, [orders, countryTimeRange]);

  const countryChartData = useMemo(() => {
    const sorted = [...countryData].sort((a, b) => b.orders - a.orders);

    if (countryTopN === "all") return sorted;
    const n = parseInt(countryTopN, 10);
    return sorted.slice(0, n);
  }, [countryData, countryTopN]);

  const sourceData = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      const src = o.request_source || "UNKNOWN";
      counts[src] = (counts[src] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([code, count]) => {
        const conf = MARKETING_SOURCE_CONFIG[code] || {
          name: code,
          color: "#64748b",
          bg: "#64748b",
          icon: (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
              <circle cx="12" cy="12" r="2" />
              <circle cx="5" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          ),
        };
        return {
          code,
          name: conf.name,
          color: conf.color,
          bg: conf.bg,
          icon: conf.icon,
          count,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [orders]);

  const totalSourceOrders = useMemo(() => {
    return sourceData.reduce((acc, curr) => acc + curr.count, 0);
  }, [sourceData]);

  const sourceStatusData = useMemo(() => {
    const map: Record<string, any> = {};
    const labelMap: Record<string, string> = {
      'FACEBOOK': 'Facebook', 'INSTAGRAM': 'Instagram', 'EMAIL': 'Email',
      'WHATSAPP': 'WhatsApp', 'RETURNING_CUSTOMER': 'Khách cũ', 'OTHER': 'Khác', 'UNKNOWN': 'Chưa rõ'
    };
    orders.forEach(o => {
      const code = o.request_source || 'UNKNOWN';
      const src = labelMap[code] || code;
      if (!map[src]) map[src] = { code, name: src, new: 0, consulting: 0, closed: 0, cancelled: 0 };
      map[src][o.status]++;
    });
    return Object.values(map).sort((a, b) => (b.new + b.consulting + b.closed + b.cancelled) - (a.new + a.consulting + a.closed + a.cancelled));
  }, [orders]);

  const departureMonthStats = useMemo(() => {
    const map: Record<
      string,
      {
        month: string;
        total: number;
        guests: number;
        new: number;
        consulting: number;
        closed: number;
        cancelled: number;
        orders: Order[];
      }
    > = {};

    orders.forEach((o) => {
      const months = parseTourMonths(o.tour_date);
      months.forEach((m) => {
        if (!map[m]) {
          map[m] = {
            month: m,
            total: 0,
            guests: 0,
            new: 0,
            consulting: 0,
            closed: 0,
            cancelled: 0,
            orders: [],
          };
        }
        map[m].total += 1;
        map[m].guests += o.num_guests || 1;
        map[m][o.status] = (map[m][o.status] || 0) + 1;
        map[m].orders.push(o);
      });
    });

    return Object.values(map).sort((a, b) => {
      const [mA, yA] = a.month.split("/").map(Number);
      const [mB, yB] = b.month.split("/").map(Number);
      return new Date(yA, mA - 1).getTime() - new Date(yB, mB - 1).getTime();
    });
  }, [orders]);

  const selectedDrillItem = useMemo(() => {
    if (!activeDrillMonth) return null;
    return departureMonthStats.find((item) => item.month === activeDrillMonth) || null;
  }, [departureMonthStats, activeDrillMonth]);

  const totalDepartureRequests = useMemo(() => {
    return departureMonthStats.reduce((acc, curr) => acc + curr.total, 0);
  }, [departureMonthStats]);

  const COLORS = ['#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#fb7185', '#fcd34d', '#4ade80', '#94a3b8'];


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
              <select
                className="mini-select"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                title="Quốc gia"
              >
                <option value="all">Tất cả quốc gia</option>
                {Array.from(new Set(orders.map(o => o.customer_country || 'UNKNOWN'))).map(c => (
                  <option key={c} value={c}>{c === 'UNKNOWN' ? 'Chưa rõ' : ALL_COUNTRIES.find(x => x.code === c)?.name || c}</option>
                ))}
              </select>
              <select
                className="mini-select"
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                title="Nguồn"
              >
                <option value="all">Tất cả nguồn</option>
                <option value="FACEBOOK">Facebook</option>
                <option value="INSTAGRAM">Instagram</option>
                <option value="EMAIL">Email</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="RETURNING_CUSTOMER">Khách cũ</option>
                <option value="OTHER">Khác</option>
                <option value="UNKNOWN">Chưa rõ</option>
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

      {/* Thống kê nhu cầu theo Tháng khởi hành (Thang đo Tháng · Hỗ trợ khách chọn nhiều tháng) */}
      <div className="dashboard-grid single" style={{ marginTop: "24px" }}>
        <Card>
          <div
            className="card-heading-row"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CalendarDays size={20} style={{ color: "var(--brand-primary, #0ea5e9)" }} />
                <h2 style={{ margin: 0 }}>Nhu cầu theo Tháng khởi hành</h2>
              </div>
              <p style={{ marginTop: "4px" }}>
                Phân bổ đơn theo các tháng khách dự kiến khởi hành (thang đo Tháng, hỗ trợ khách chọn nhiều tháng).
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: "12px",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  background: "var(--bg-body)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-dim)",
                  fontWeight: 600,
                }}
              >
                Tổng {totalDepartureRequests} lượt yêu cầu tháng · {departureMonthStats.length} tháng ghi nhận
              </span>
            </div>
          </div>

          {/* Month Quick Selectors */}
          {departureMonthStats.length > 0 && (
            <div style={{ marginTop: "14px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "var(--text-dim)", fontWeight: 600, marginRight: "4px" }}>
                Chọn nhanh tháng:
              </span>
              {departureMonthStats.map((item) => {
                const isSelected = activeDrillMonth === item.month;
                return (
                  <button
                    key={item.month}
                    type="button"
                    onClick={() => setActiveDrillMonth(isSelected ? null : item.month)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: isSelected
                        ? "1px solid var(--brand-primary, #0ea5e9)"
                        : "1px solid var(--border-subtle)",
                      background: isSelected
                        ? "var(--brand-primary, #0ea5e9)"
                        : "var(--bg-body)",
                      color: isSelected ? "#ffffff" : "var(--text-main)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.15s ease",
                    }}
                    title={`Bấm để xem danh sách khách yêu cầu đi tháng ${item.month}`}
                  >
                    <span>{item.month}</span>
                    <span
                      style={{
                        fontSize: "10px",
                        padding: "1px 6px",
                        borderRadius: "10px",
                        background: isSelected
                          ? "rgba(255,255,255,0.25)"
                          : "var(--bg-card)",
                        color: isSelected ? "#ffffff" : "var(--text-dim)",
                      }}
                    >
                      {item.total}
                    </span>
                  </button>
                );
              })}
              {activeDrillMonth && (
                <button
                  type="button"
                  onClick={() => setActiveDrillMonth(null)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    background: "transparent",
                    border: "none",
                    color: "var(--text-dim)",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Bỏ chọn
                </button>
              )}
            </div>
          )}

          {/* Chart Container */}
          <div style={{ height: "260px", marginTop: "16px" }}>
            {departureMonthStats.length === 0 ? (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  color: "var(--text-dim)",
                }}
              >
                <CalendarDays size={32} opacity={0.4} />
                <span style={{ fontSize: "13px" }}>
                  Chưa có dữ liệu tháng khởi hành từ các đơn tour
                </span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={departureMonthStats}
                  margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
                  onClick={(state) => {
                    if (state && state.activeLabel) {
                      setActiveDrillMonth((prev) =>
                        prev === state.activeLabel ? null : String(state.activeLabel),
                      );
                    }
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border-subtle)"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="var(--text-dim)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "var(--border-subtle)" }}
                  />
                  <YAxis
                    stroke="var(--text-dim)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<CustomDepartureMonthTooltip />}
                    cursor={{ fill: "var(--bg-card-hover)", opacity: 0.4 }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                  />
                  <Bar
                    dataKey="new"
                    name="Mới"
                    stackId="monthStack"
                    fill="var(--status-new-text)"
                    radius={[0, 0, 0, 0]}
                    maxBarSize={48}
                  />
                  <Bar
                    dataKey="consulting"
                    name="Đang tư vấn"
                    stackId="monthStack"
                    fill="var(--status-consulting-text)"
                    radius={[0, 0, 0, 0]}
                    maxBarSize={48}
                  />
                  <Bar
                    dataKey="closed"
                    name="Đã chốt"
                    stackId="monthStack"
                    fill="var(--status-closed-text)"
                    radius={[0, 0, 0, 0]}
                    maxBarSize={48}
                  />
                  <Bar
                    dataKey="cancelled"
                    name="Đã hủy"
                    stackId="monthStack"
                    fill="var(--status-cancelled-text)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Drilldown: Danh sách khách hàng có nhu cầu đi trong tháng đã chọn */}
          {activeDrillMonth && selectedDrillItem && (
            <div
              style={{
                marginTop: "20px",
                padding: "16px",
                background: "var(--bg-body)",
                borderRadius: "12px",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginBottom: "14px",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      margin: 0,
                      color: "var(--text-heading)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span>Khách hàng có nhu cầu đi trong Tháng {activeDrillMonth}</span>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        background: "var(--brand-primary, #0ea5e9)",
                        color: "#ffffff",
                        fontWeight: 600,
                      }}
                    >
                      {selectedDrillItem.total} đơn ({selectedDrillItem.guests} khách)
                    </span>
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--text-dim)", margin: "3px 0 0" }}>
                    Danh sách khách hàng đã chọn tháng {activeDrillMonth} làm tháng khởi hành mong muốn.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <Button
                    variant="secondary"
                    onClick={() => setActiveDrillMonth(null)}
                    style={{ fontSize: "12px", minHeight: "32px", padding: "4px 10px" }}
                  >
                    Đóng chi tiết
                  </Button>
                  <Button
                    onClick={() => {
                      const path = isAdmin ? "/admin/orders" : "/orders";
                      navigate(`${path}?departureMonth=${encodeURIComponent(activeDrillMonth)}`);
                    }}
                    style={{
                      fontSize: "12px",
                      minHeight: "32px",
                      padding: "4px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    Xem tại trang Đơn tour <ChevronRight size={14} />
                  </Button>
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="settings-table" style={{ fontSize: "12px", width: "100%" }}>
                  <thead>
                    <tr>
                      <th style={{ width: "14%" }}>MÃ ĐƠN</th>
                      <th style={{ width: "20%" }}>KHÁCH HÀNG</th>
                      <th style={{ width: "16%" }}>SỐ ĐIỆN THOẠI</th>
                      <th style={{ width: "24%" }}>SẢN PHẨM ĐÃ GỬI</th>
                      <th style={{ width: "12%" }}>SỐ KHÁCH</th>
                      <th style={{ width: "14%" }}>TRẠNG THÁI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDrillItem.orders.map((ord) => (
                      <tr
                        key={ord.id}
                        className="clickable-row"
                        onClick={() => navigate(`/orders/${ord.id}`)}
                        title="Bấm để xem chi tiết đơn hàng này"
                      >
                        <td>
                          <span style={{ fontWeight: 600, color: "var(--brand-primary, #0ea5e9)" }}>
                            {ord.order_code}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{ord.customer_name || "—"}</span>
                        </td>
                        <td>
                          <span>{ord.customer_phone || "—"}</span>
                        </td>
                        <td>
                          <b style={{ fontWeight: 500 }} title={ord.tour_name}>
                            {ord.tour_name}
                          </b>
                        </td>
                        <td>
                          <span>{ord.num_guests || 1} khách</span>
                        </td>
                        <td>
                          <Badge status={ord.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Row 1: Số lượng khách theo quốc gia & Đơn theo Nguồn & Trạng thái ngang hàng */}
      <div className="dashboard-grid two" style={{ marginTop: "24px" }}>
        {/* Số lượng khách theo quốc gia (Horizontal Bar Chart) */}
        <Card>
          <div
            className="card-heading-row"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2>Đơn tour theo quốc gia</h2>
              <p>
                Thống kê số lượng đơn tour theo quốc gia người đặt trong khoảng thời gian đã chọn.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <select
                className="mini-select"
                value={countryTopN}
                onChange={(e) => setCountryTopN(e.target.value)}
                title="Lấy Top N quốc gia"
              >
                <option value="5">Top 5</option>
                <option value="10">Top 10</option>
                <option value="15">Top 15</option>
                <option value="all">Tất cả</option>
              </select>

              <select
                className="mini-select"
                value={countryTimeRange}
                onChange={(e) => setCountryTimeRange(e.target.value)}
                title="Khoảng thời gian"
              >
                <option value="7">7 ngày qua</option>
                <option value="14">14 ngày qua</option>
                <option value="30">30 ngày qua</option>
                <option value="90">90 ngày qua</option>
                <option value="all">Tất cả</option>
              </select>
            </div>
          </div>

          <div style={{ height: "330px", marginTop: "16px" }}>
            {countryChartData.length === 0 ? (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  color: "var(--text-dim)",
                }}
              >
                <Globe size={32} opacity={0.4} />
                <span style={{ fontSize: "13px" }}>
                  Không có dữ liệu đơn theo quốc gia trong khoảng thời gian này
                </span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={countryChartData}
                  margin={{ top: 10, right: 35, left: 10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    vertical={true}
                    stroke="var(--border)"
                  />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "var(--text-dim)" }}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 12,
                      fill: "var(--text-main)",
                      fontWeight: 500,
                    }}
                    width={90}
                  />
                  <Tooltip
                    content={<CustomCountryBarTooltip />}
                    cursor={{ fill: "var(--bg-card-hover)", opacity: 0.4 }}
                  />
                  <Bar
                    dataKey="orders"
                    name="Số đơn tour"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={22}
                  >
                    <LabelList
                      dataKey="orders"
                      position="right"
                      style={{
                        fill: "var(--text-main)",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    />
                    {countryChartData.map((_entry, index) => (
                      <Cell
                        key={`cell-c-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Đơn theo Nguồn & Trạng thái */}
        <Card>
          <div className="card-heading-row">
            <div>
              <h2>Đơn theo Nguồn & Trạng thái</h2>
              <p>Hiệu quả từng nguồn theo trạng thái đơn</p>
            </div>
          </div>
          <div style={{ height: "330px", marginTop: "16px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sourceStatusData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  height={48}
                  tick={<CustomSourceXAxisTick />}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "var(--text-dim)" }}
                />
                <Tooltip
                  cursor={{ fill: "var(--bg-card-hover)", opacity: 0.4 }}
                  content={<CustomSourceStatusTooltip />}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "6px" }} />
                <Bar
                  dataKey="new"
                  name="Mới"
                  stackId="a"
                  fill="var(--status-new-text)"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="consulting"
                  name="Đang tư vấn"
                  stackId="a"
                  fill="var(--status-consulting-text)"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="closed"
                  name="Đã chốt"
                  stackId="a"
                  fill="var(--status-closed-text)"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="cancelled"
                  name="Đã hủy"
                  stackId="a"
                  fill="var(--status-cancelled-text)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Row 2: Nguồn tiếp thị đứng 1 mình ở dưới cùng */}
      <div className="dashboard-grid single" style={{ marginTop: "24px" }}>
        <Card>
          <div className="card-heading-row">
            <div>
              <h2>Nguồn tiếp thị</h2>
              <p>Tỷ trọng các nguồn mang lại đơn</p>
            </div>
          </div>
          <div className="marketing-sources-grid">
            <div style={{ height: "260px", position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--text-dim)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Tổng cộng
                </span>
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "var(--text-main)",
                  }}
                >
                  {totalSourceOrders}
                </div>
                <span
                  style={{ fontSize: "11px", color: "var(--text-dim)" }}
                >
                  đơn tour
                </span>
              </div>
              <ResponsiveContainer width="100%" height="100%" style={{ position: "relative", zIndex: 10 }}>
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {sourceData.map((entry) => (
                      <Cell
                        key={`cell-s-${entry.code}`}
                        fill={entry.color}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    wrapperStyle={{ zIndex: 100 }}
                    content={<CustomSourcePieTooltip total={totalSourceOrders} />}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="marketing-sources-cards">
              {sourceData.map((entry) => {
                const pct =
                  totalSourceOrders > 0
                    ? Math.round((entry.count / totalSourceOrders) * 100)
                    : 0;
                return (
                  <div
                    key={entry.code}
                    style={{
                      padding: "12px 14px",
                      background: "var(--bg-body)",
                      borderRadius: "10px",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "22px",
                            height: "22px",
                            borderRadius: "6px",
                            background: entry.bg,
                            color: "white",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                            flexShrink: 0,
                          }}
                        >
                          {entry.icon}
                        </span>
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "var(--text-main)",
                          }}
                        >
                          {entry.name}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "var(--text-heading)",
                        }}
                      >
                        {entry.count} đơn
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          height: "6px",
                          background: "var(--border-subtle)",
                          borderRadius: "3px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            background: entry.color,
                            borderRadius: "3px",
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--text-dim)",
                          fontWeight: 600,
                          minWidth: "30px",
                          textAlign: "right",
                        }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
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

function generateRandomPassword(): string {
  const letters = "abcdefghjkmnpqrstuvwxyz";
  const uppers = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const numbers = "23456789";
  const specials = "!@#$";
  let pass = "";
  pass += uppers[Math.floor(Math.random() * uppers.length)];
  pass += letters[Math.floor(Math.random() * letters.length)];
  pass += numbers[Math.floor(Math.random() * numbers.length)];
  pass += specials[Math.floor(Math.random() * specials.length)];
  const all = letters + uppers + numbers;
  for (let i = 0; i < 5; i++) {
    pass += all[Math.floor(Math.random() * all.length)];
  }
  return pass
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
}

function SalersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [createdAccountInfo, setCreatedAccountInfo] = useState<{
    display_name: string;
    username: string;
    email: string;
    password: string;
  } | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
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
      .select("id, username, display_name, email, role, is_active, avatar_url, created_at, updated_at")
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

  function openCreateModal() {
    const autoPassword = generateRandomPassword();
    setForm({
      display_name: "",
      username: "",
      email: "",
      password: autoPassword,
    });
    setUsernameEdited(false);
    setShowPassword(true);
    setFormError("");
    setShowModal(true);
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

    const finalPassword = form.password.trim();
    const finalUsername = form.username.trim().toLowerCase();
    const finalEmail = form.email.trim();
    const finalDisplayName = form.display_name.trim();

    if (!finalUsername) {
      setFormError("Username không được để trống.");
      setBusy(false);
      return;
    }
    if (!finalEmail) {
      setFormError("Email không được để trống.");
      setBusy(false);
      return;
    }
    if (!finalPassword || finalPassword.length < 6) {
      setFormError("Mật khẩu cần tối thiểu 6 ký tự.");
      setBusy(false);
      return;
    }

    // Gọi RPC để tạo user
    const { error: rpcError } = await supabase.rpc("admin_create_saler", {
      p_email: finalEmail,
      p_password: finalPassword,
      p_display_name: finalDisplayName,
      p_username: finalUsername,
    });

    if (rpcError) {
      setFormError(rpcError.message || "Không thể tạo tài khoản.");
      setBusy(false);
      return;
    }

    setBusy(false);
    closeModal();
    load();

    // Hiển thị modal thông báo tạo tài khoản thành công kèm thông tin username và password để copy
    setCreatedAccountInfo({
      display_name: finalDisplayName || finalUsername,
      username: finalUsername,
      email: finalEmail,
      password: finalPassword,
    });
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

    const payload: any = {
      p_user_id: editingProfile.id,
      p_email: cleanEmail,
      p_display_name: cleanDisplayName,
      p_username: cleanUsername,
      p_role: editForm.role,
    };

    if (editForm.password && editForm.password.trim().length > 0) {
      if (editForm.password.length < 6) {
        setEditFormError("Mật khẩu mới cần tối thiểu 6 ký tự.");
        setBusy(false);
        return;
      }
      payload.p_password = editForm.password;
    }

    const { error: rpcError } = await supabase.rpc("admin_update_saler", payload);

    if (rpcError) {
      setEditFormError(rpcError.message || "Không thể cập nhật hồ sơ nhân viên.");
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

    const { error: rpcError } = await supabase.rpc("admin_toggle_saler_active", {
      p_user_id: profile.id,
      p_is_active: nextActive,
    });

    if (rpcError) {
      alert("Không thể cập nhật trạng thái: " + rpcError.message);
      return;
    }

    setOpenMenu(null);
    load();
  }

  return (
    <>
      <PageHeader
        title="Nhân viên Sale"
        actions={
          <Button onClick={openCreateModal}>
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
              <div className="field">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <span>
                    Mật khẩu đăng nhập <em> *</em>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const newPass = generateRandomPassword();
                      setForm((p) => ({ ...p, password: newPass }));
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--accent-primary)",
                      fontSize: 12,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: 0,
                      fontWeight: 500,
                    }}
                    title="Tạo lại mật khẩu ngẫu nhiên khác"
                  >
                    <RotateCcw size={12} /> Đổi mật khẩu khác
                  </button>
                </div>
                <div
                  className="input-wrap"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  <span className="input-icon">
                    <KeyRound size={15} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, password: e.target.value }))
                    }
                    placeholder="Mật khẩu ngẫu nhiên"
                    required
                    style={{
                      paddingRight: 40,
                      fontFamily: showPassword
                        ? "'JetBrains Mono', monospace"
                        : undefined,
                      letterSpacing: showPassword ? "0.04em" : undefined,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 10,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      padding: 4,
                    }}
                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    <Eye size={15} />
                  </button>
                </div>
              </div>
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

      {/* Modal Thông báo Tạo tài khoản thành công & Copy thông tin */}
      {createdAccountInfo && (
        <div
          className="modal-overlay"
          onClick={() => setCreatedAccountInfo(null)}
        >
          <div
            className="modal"
            style={{ maxWidth: 440, padding: "26px 24px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "rgba(34, 197, 94, 0.15)",
                  color: "var(--accent-success)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Check size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h2 style={{ fontSize: 18, margin: "0 0 6px" }}>
                  Tạo tài khoản thành công!
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: "var(--text-muted)",
                    lineHeight: 1.4,
                  }}
                >
                  Nhân viên <b>{createdAccountInfo.display_name}</b> đã được kích
                  hoạt và sẵn sàng đăng nhập.
                </p>
              </div>
            </div>

            <div
              style={{
                marginTop: 20,
                background: "var(--bg-app)",
                border: "1px solid var(--border-row)",
                borderRadius: 12,
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  Username:
                </span>
                <span
                  className="mono"
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--accent-primary)",
                  }}
                >
                  {createdAccountInfo.username}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  Password:
                </span>
                <span
                  className="mono"
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text-heading)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {createdAccountInfo.password}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px dashed var(--border-row)",
                  paddingTop: 8,
                }}
              >
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  Email:
                </span>
                <span style={{ fontSize: 12, color: "var(--text-main)" }}>
                  {createdAccountInfo.email}
                </span>
              </div>
            </div>

            <p
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                marginTop: 14,
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              Sao chép thông tin tài khoản dưới đây để gửi trực tiếp cho nhân viên.
            </p>

            <div
              style={{
                display: "flex",
                gap: 10,
              }}
            >
              <Button
                variant="primary"
                style={{
                  flex: 1,
                  justifyContent: "center",
                  gap: 8,
                  padding: "10px 16px",
                }}
                onClick={() => {
                  const textToCopy = `Username: ${createdAccountInfo.username}\npassword: ${createdAccountInfo.password}`;
                  navigator.clipboard.writeText(textToCopy);
                  setCopiedSuccess(true);
                  setTimeout(() => setCopiedSuccess(false), 2500);
                }}
              >
                {copiedSuccess ? (
                  <>
                    <CheckCheck size={16} /> Đã sao chép!
                  </>
                ) : (
                  <>
                    <Copy size={16} /> Sao chép thông tin
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                style={{ padding: "10px 18px" }}
                onClick={() => setCreatedAccountInfo(null)}
              >
                Đóng
              </Button>
            </div>
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
        <div className="salers-table-desktop">
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
                  <tr key={profile.id}>
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
                    <td className="mono">{profile.username}</td>
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
                        zIndex: openMenu === profile.id ? 100 : 1,
                        overflow: "visible",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          position: "relative",
                          zIndex: openMenu === profile.id ? 101 : 1,
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
                                index === filtered.length - 1 &&
                                filtered.length > 2
                                  ? "auto"
                                  : "calc(100% + 4px)",
                              bottom:
                                index === filtered.length - 1 &&
                                filtered.length > 2
                                  ? "calc(100% + 4px)"
                                  : "auto",
                              minWidth: 180,
                              zIndex: 1000,
                            }}
                          >
                            <b>Thao tác</b>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenu(null);
                                openEdit(profile);
                              }}
                            >
                              <Pencil size={13} /> Chỉnh sửa thông tin
                            </button>
                            {profile.role !== "admin" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenu(null);
                                  toggleActive(profile);
                                }}
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
      </div>

      <div className="salers-cards-mobile">
        {filtered.length === 0 ? (
          <div className="empty-state compact">
            <Users size={28} />
            <h3>Chưa có nhân viên nào</h3>
            <p>Bấm "Tạo nhân viên mới" để bắt đầu.</p>
          </div>
        ) : (
          filtered.map((p) => (
            <div key={p.id} className="saler-card-item">
              <div className="saler-card-header">
                <div className="saler-card-user">
                  <Avatar src={p.avatar_url} name={p.display_name} size="md" />
                  <div>
                    <div className="saler-card-name">{p.display_name}</div>
                    <div className="saler-card-username mono">{p.username}</div>
                  </div>
                </div>
                <span className={`active-pill ${p.is_active ? "on" : "off"}`}>
                  <i /> {p.is_active ? "Đang hoạt động" : "Đã khóa"}
                </span>
              </div>

              <div className="saler-card-details">
                <div className="saler-detail-item">
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "12px" }}>
                    <Mail size={13} />
                    <span>{p.email}</span>
                  </div>
                </div>
                <div className="saler-detail-item">
                  <span className="role-pill">
                    {p.role === "admin" ? "Admin" : "Sale Executive"}
                  </span>
                  <span className="saler-date-muted">
                    Tham gia: {new Date(p.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>

              <div className="saler-card-actions">
                <Button
                  variant="secondary"
                  onClick={() => openEdit(p)}
                  style={{ flex: 1, padding: "8px 10px", fontSize: "12px", gap: "6px", justifyContent: "center" }}
                >
                  <Pencil size={13} /> Chỉnh sửa
                </Button>
                {p.role !== "admin" && (
                  <Button
                    variant={p.is_active ? "ghost" : "primary"}
                    onClick={() => toggleActive(p)}
                    style={{ flex: 1, padding: "8px 10px", fontSize: "12px", gap: "6px", justifyContent: "center" }}
                  >
                    {p.is_active ? (
                      <>
                        <Lock size={13} /> Khóa
                      </>
                    ) : (
                      <>
                        <Check size={13} /> Mở khóa
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
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
