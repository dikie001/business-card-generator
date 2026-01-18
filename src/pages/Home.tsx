import { saveAs } from "file-saver";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { toPng } from "html-to-image";
import {
  Briefcase,
  ChevronDown,
  Circle,
  Copy,
  Download,
  Globe,
  Grid,
  Image as ImageIcon,
  Layout,
  LayoutTemplate,
  Mail,
  MapPin,
  Minus,
  Move,
  Palette,
  Phone,
  Plus,
  QrCode,
  Settings,
  Smartphone,
  Square,
  Trash2,
  Type,
  Undo,
} from "lucide-react";
import React, { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";

// ==========================================
// 1. TYPES & CONSTANTS
// ==========================================

type ElementType = "text" | "image" | "qr" | "box" | "circle" | "icon";
type IconType = "phone" | "mail" | "globe" | "map-pin" | "briefcase";
type BackgroundType = "solid" | "gradient" | "mesh";
type GradientDirection = "br" | "r" | "b" | "tr" | "tl";

interface CardElement {
  id: string;
  type: ElementType;
  content: string; // Text content, Image URL, or Icon Name
  x: number;
  y: number;
  width?: number;
  height?: number;
  // Style Props
  fontSize: number;
  fontWeight: number;
  color: string;
  fontFamily: string;
  opacity: number;
  letterSpacing: number;
  rotation: number;
  zIndex: number;
  borderRadius?: number;
  iconType?: IconType; // Specific for icon elements
}

interface BackgroundSettings {
  type: BackgroundType;
  color1: string;
  color2: string;
  color3: string;
  direction: GradientDirection;
  noise: number; // 0-1
  blur: number; // 0-100
}

interface CardState {
  elements: CardElement[];
  selectedId: string | null;
  background: BackgroundSettings;
  width: number;
  height: number;
  scale: number;
  showGrid: boolean;
  history: Omit<CardState, "history" | "historyIndex">[];
  historyIndex: number;
}

interface Template {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  state: Partial<CardState>;
}

const FONTS = [
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Playfair Display", value: '"Playfair Display", serif' },
  { name: "Roboto Mono", value: '"Roboto Mono", monospace' },
  { name: "Oswald", value: '"Oswald", sans-serif' },
  { name: "Lato", value: '"Lato", sans-serif' },
  { name: "Montserrat", value: '"Montserrat", sans-serif' },
];

const generateId = () => `el-${Math.random().toString(36).substr(2, 9)}`;

// ==========================================
// 2. PROFESSIONAL TEMPLATES
// ==========================================

const TEMPLATES: Template[] = [
  {
    id: "executive-luxury",
    name: "Executive Gold",
    category: "Premium",
    thumbnail: "linear-gradient(135deg, #111 0%, #333 100%)",
    state: {
      background: {
        type: "solid",
        color1: "#09090b",
        color2: "",
        color3: "",
        direction: "br",
        noise: 0.05,
        blur: 0,
      },
      elements: [
        // --- GOLD ACCENTS ---
        // Top Border
        {
          id: "ex-b1",
          type: "box",
          content: "",
          x: 20,
          y: 20,
          width: 560,
          height: 2,
          fontSize: 0,
          fontWeight: 0,
          color: "#fbbf24",
          fontFamily: "",
          opacity: 1,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 1,
          borderRadius: 0,
        },
        // Bottom Border
        {
          id: "ex-b2",
          type: "box",
          content: "",
          x: 20,
          y: 328,
          width: 560,
          height: 2,
          fontSize: 0,
          fontWeight: 0,
          color: "#fbbf24",
          fontFamily: "",
          opacity: 1,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 1,
          borderRadius: 0,
        },
        // Vertical Divider
        {
          id: "ex-div",
          type: "box",
          content: "",
          x: 340,
          y: 60,
          width: 1,
          height: 230,
          fontSize: 0,
          fontWeight: 0,
          color: "#3f3f46",
          fontFamily: "",
          opacity: 1,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 1,
          borderRadius: 0,
        },

        // --- IDENTITY SECTION (LEFT) ---
        {
          id: "ex-name",
          type: "text",
          content: "RICHARD STERLING",
          x: 40,
          y: 130,
          width: 300,
          height: 0,
          fontSize: 32,
          fontWeight: 700,
          color: "#fbbf24",
          fontFamily: '"Playfair Display", serif',
          opacity: 1,
          letterSpacing: 1,
          rotation: 0,
          zIndex: 10,
        },
        {
          id: "ex-title",
          type: "text",
          content: "Senior Executive Partner",
          x: 40,
          y: 170,
          width: 300,
          height: 0,
          fontSize: 12,
          fontWeight: 500,
          color: "#d4d4d8",
          fontFamily: "Inter, sans-serif",
          opacity: 1,
          letterSpacing: 3,
          rotation: 0,
          zIndex: 10,
        },

        {
          id: "ex-logo-box",
          type: "box",
          content: "",
          x: 40,
          y: 50,
          width: 40,
          height: 40,
          fontSize: 0,
          fontWeight: 0,
          color: "#fbbf24",
          fontFamily: "",
          opacity: 0.1,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 1,
          borderRadius: 4,
        },
        {
          id: "ex-logo-txt",
          type: "text",
          content: "S",
          x: 50,
          y: 52,
          width: 0,
          height: 0,
          fontSize: 24,
          fontWeight: 900,
          color: "#fbbf24",
          fontFamily: '"Playfair Display", serif',
          opacity: 1,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 10,
        },

        // --- CONTACT DETAILS (RIGHT) ---
        // Phone
        {
          id: "ex-ic1",
          type: "icon",
          iconType: "phone",
          content: "",
          x: 370,
          y: 80,
          width: 16,
          height: 16,
          fontSize: 0,
          fontWeight: 0,
          color: "#fbbf24",
          fontFamily: "",
          opacity: 1,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 10,
        },
        {
          id: "ex-tx1",
          type: "text",
          content: "+1 (555) 123-4567",
          x: 400,
          y: 78,
          width: 0,
          height: 0,
          fontSize: 11,
          fontWeight: 400,
          color: "#e4e4e7",
          fontFamily: "Inter, sans-serif",
          opacity: 1,
          letterSpacing: 0.5,
          rotation: 0,
          zIndex: 10,
        },

        // Email
        {
          id: "ex-ic2",
          type: "icon",
          iconType: "mail",
          content: "",
          x: 370,
          y: 110,
          width: 16,
          height: 16,
          fontSize: 0,
          fontWeight: 0,
          color: "#fbbf24",
          fontFamily: "",
          opacity: 1,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 10,
        },
        {
          id: "ex-tx2",
          type: "text",
          content: "richard@sterling.com",
          x: 400,
          y: 108,
          width: 0,
          height: 0,
          fontSize: 11,
          fontWeight: 400,
          color: "#e4e4e7",
          fontFamily: "Inter, sans-serif",
          opacity: 1,
          letterSpacing: 0.5,
          rotation: 0,
          zIndex: 10,
        },

        // Web
        {
          id: "ex-ic3",
          type: "icon",
          iconType: "globe",
          content: "",
          x: 370,
          y: 140,
          width: 16,
          height: 16,
          fontSize: 0,
          fontWeight: 0,
          color: "#fbbf24",
          fontFamily: "",
          opacity: 1,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 10,
        },
        {
          id: "ex-tx3",
          type: "text",
          content: "www.sterling.corp",
          x: 400,
          y: 138,
          width: 0,
          height: 0,
          fontSize: 11,
          fontWeight: 400,
          color: "#e4e4e7",
          fontFamily: "Inter, sans-serif",
          opacity: 1,
          letterSpacing: 0.5,
          rotation: 0,
          zIndex: 10,
        },

        // Address
        {
          id: "ex-ic4",
          type: "icon",
          iconType: "map-pin",
          content: "",
          x: 370,
          y: 170,
          width: 16,
          height: 16,
          fontSize: 0,
          fontWeight: 0,
          color: "#fbbf24",
          fontFamily: "",
          opacity: 1,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 10,
        },
        {
          id: "ex-tx4",
          type: "text",
          content: "100 Wall Street,\nNew York, NY 10005",
          x: 400,
          y: 168,
          width: 0,
          height: 0,
          fontSize: 11,
          fontWeight: 400,
          color: "#e4e4e7",
          fontFamily: "Inter, sans-serif",
          opacity: 1,
          letterSpacing: 0.5,
          rotation: 0,
          zIndex: 10,
        },

        // QR Code
        {
          id: "ex-qr",
          type: "qr",
          content: "https://dikie.dev",
          x: 480,
          y: 230,
          width: 80,
          height: 80,
          fontSize: 0,
          fontWeight: 0,
          color: "#ffffff",
          fontFamily: "",
          opacity: 1,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 10,
        },
      ],
    },
  },
  {
    id: "clean-corporate",
    name: "Modern Corporate",
    category: "Business",
    thumbnail: "#f8fafc",
    state: {
      background: {
        type: "solid",
        color1: "#ffffff",
        color2: "",
        color3: "",
        direction: "br",
        noise: 0,
        blur: 0,
      },
      elements: [
        {
          id: "cc-bg",
          type: "box",
          content: "",
          x: 0,
          y: 0,
          width: 220,
          height: 350,
          fontSize: 0,
          fontWeight: 0,
          color: "#0f172a",
          fontFamily: "",
          opacity: 1,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 0,
          borderRadius: 0,
        },
        {
          id: "cc-logo",
          type: "text",
          content: "DIKIE.",
          x: 40,
          y: 40,
          width: 0,
          height: 0,
          fontSize: 28,
          fontWeight: 800,
          color: "#ffffff",
          fontFamily: "Inter, sans-serif",
          opacity: 1,
          letterSpacing: -1,
          rotation: 0,
          zIndex: 10,
        },
        {
          id: "cc-tag",
          type: "text",
          content: "Design Solutions",
          x: 40,
          y: 75,
          width: 0,
          height: 0,
          fontSize: 10,
          fontWeight: 400,
          color: "#94a3b8",
          fontFamily: "Inter, sans-serif",
          opacity: 1,
          letterSpacing: 2,
          rotation: 0,
          zIndex: 10,
        },

        {
          id: "cc-qr",
          type: "qr",
          content: "contact",
          x: 40,
          y: 240,
          width: 80,
          height: 80,
          fontSize: 0,
          fontWeight: 0,
          color: "#ffffff",
          fontFamily: "",
          opacity: 1,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 10,
        },

        {
          id: "cc-name",
          type: "text",
          content: "ALEXANDER SMITH",
          x: 260,
          y: 60,
          width: 0,
          height: 0,
          fontSize: 24,
          fontWeight: 800,
          color: "#0f172a",
          fontFamily: "Inter, sans-serif",
          opacity: 1,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 10,
        },
        {
          id: "cc-role",
          type: "text",
          content: "Lead Developer",
          x: 260,
          y: 90,
          width: 0,
          height: 0,
          fontSize: 14,
          fontWeight: 600,
          color: "#3b82f6",
          fontFamily: "Inter, sans-serif",
          opacity: 1,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 10,
        },

        {
          id: "cc-l1",
          type: "box",
          content: "",
          x: 260,
          y: 110,
          width: 40,
          height: 4,
          fontSize: 0,
          fontWeight: 0,
          color: "#3b82f6",
          fontFamily: "",
          opacity: 1,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 1,
          borderRadius: 2,
        },

        {
          id: "cc-p",
          type: "icon",
          iconType: "phone",
          content: "",
          x: 260,
          y: 150,
          width: 14,
          height: 14,
          fontSize: 0,
          fontWeight: 0,
          color: "#64748b",
          fontFamily: "",
          opacity: 1,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 10,
        },
        {
          id: "cc-pt",
          type: "text",
          content: "+1 234 567 890",
          x: 290,
          y: 148,
          width: 0,
          height: 0,
          fontSize: 12,
          fontWeight: 500,
          color: "#334155",
          fontFamily: "Inter, sans-serif",
          opacity: 1,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 10,
        },

        {
          id: "cc-e",
          type: "icon",
          iconType: "mail",
          content: "",
          x: 260,
          y: 180,
          width: 14,
          height: 14,
          fontSize: 0,
          fontWeight: 0,
          color: "#64748b",
          fontFamily: "",
          opacity: 1,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 10,
        },
        {
          id: "cc-et",
          type: "text",
          content: "hello@dikie.dev",
          x: 290,
          y: 178,
          width: 0,
          height: 0,
          fontSize: 12,
          fontWeight: 500,
          color: "#334155",
          fontFamily: "Inter, sans-serif",
          opacity: 1,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 10,
        },

        {
          id: "cc-w",
          type: "icon",
          iconType: "globe",
          content: "",
          x: 260,
          y: 210,
          width: 14,
          height: 14,
          fontSize: 0,
          fontWeight: 0,
          color: "#64748b",
          fontFamily: "",
          opacity: 1,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 10,
        },
        {
          id: "cc-wt",
          type: "text",
          content: "www.dikie.dev",
          x: 290,
          y: 208,
          width: 0,
          height: 0,
          fontSize: 12,
          fontWeight: 500,
          color: "#334155",
          fontFamily: "Inter, sans-serif",
          opacity: 1,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 10,
        },
      ],
    },
  },
];

const INITIAL_STATE: CardState = {
  ...(TEMPLATES[0].state as any),
  width: 600,
  height: 350,
  scale: 1,
  showGrid: true,
  history: [],
  historyIndex: -1,
  selectedId: null,
};

// ==========================================
// 3. UI COMPONENTS
// ==========================================

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1 block">
    {children}
  </label>
);

const Slider = ({ value, min, max, onChange, label }: any) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-1">
      {label && <Label>{label}</Label>}
      <span className="text-xs text-slate-400 font-mono">{value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
    />
  </div>
);

const ColorInput = ({ value, onChange, label }: any) => (
  <div className="mb-4">
    {label && <Label>{label}</Label>}
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded-full border border-slate-600 shadow-sm"
        style={{ backgroundColor: value }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-white font-mono focus:border-indigo-500 outline-none"
      />
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 opacity-0 absolute cursor-pointer"
      />
    </div>
  </div>
);

const Select = ({ value, onChange, options, label }: any) => (
  <div className="mb-4">
    {label && <Label>{label}</Label>}
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-white appearance-none focus:border-indigo-500 outline-none"
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.name}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
    </div>
  </div>
);

const Button = ({
  onClick,
  children,
  active,
  variant = "secondary",
  icon: Icon,
  className,
  disabled,
}: any) => {
  const baseStyle =
    "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  const variants: any = {
    primary:
      "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20",
    secondary: active
      ? "bg-slate-700 text-white ring-1 ring-indigo-500"
      : "bg-slate-800 hover:bg-slate-700 text-slate-300",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400",
    ghost: "bg-transparent hover:bg-white/5 text-slate-400 hover:text-white",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className || ""}`}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
};

// ==========================================
// 4. MAIN COMPONENT LOGIC
// ==========================================

export default function CardArchitectPro() {
  const [state, setState] = useState<CardState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<"tools" | "templates">(
    "templates"
  );
  const cardRef = useRef<HTMLDivElement>(null);

  const pushHistory = useCallback(
    (newState: CardState) => {
      const { elements, background, width, height } = newState;
      const historyEntry = {
        elements,
        background,
        width,
        height,
        scale: newState.scale,
        showGrid: newState.showGrid,
        selectedId: newState.selectedId,
      };
      const prevHistory = state.history.slice(0, state.historyIndex + 1);

      setState((prev) => ({
        ...prev,
        elements: newState.elements,
        background: newState.background,
        history: [...prevHistory, historyEntry],
        historyIndex: prevHistory.length,
      }));
    },
    [state.history, state.historyIndex]
  );

  const undo = () => {
    if (state.historyIndex > 0) {
      const prev = state.history[state.historyIndex - 1];
      setState((current) => ({
        ...current,
        ...prev,
        historyIndex: current.historyIndex - 1,
      }));
    }
  };

  const applyTemplate = (template: Template) => {
    setState({
      ...state,
      ...template.state,
      selectedId: null,
      history: [],
      historyIndex: -1,
    });
  };

  const addElement = (type: ElementType, iconType?: IconType) => {
    const isShape = type === "box" || type === "circle";
    const isIcon = type === "icon";

    const newEl: CardElement = {
      id: generateId(),
      type,
      iconType: iconType,
      content:
        type === "text"
          ? "New Detail"
          : type === "qr"
          ? "https://website.com"
          : "",
      x: state.width / 2 - (isShape ? 50 : 0),
      y: state.height / 2 - 10,
      fontSize: 14,
      fontWeight: 500,
      color: isShape || isIcon ? "#fbbf24" : "#ffffff",
      fontFamily: "Inter, sans-serif",
      opacity: 1,
      letterSpacing: 0,
      rotation: 0,
      zIndex: isShape ? 1 : 10,
      width: isShape ? 100 : type === "qr" ? 80 : isIcon ? 20 : undefined,
      height: isShape ? 100 : type === "qr" ? 80 : isIcon ? 20 : undefined,
      borderRadius: type === "box" ? 0 : undefined,
    };

    setState((prev) => ({
      ...prev,
      elements: [...prev.elements, newEl],
      selectedId: newEl.id,
    }));
  };

  const updateElement = (id: string, updates: Partial<CardElement>) => {
    const updatedElements = state.elements.map((el) =>
      el.id === id ? { ...el, ...updates } : el
    );
    setState({ ...state, elements: updatedElements });
  };

  const deleteElement = (id: string) => {
    setState({
      ...state,
      elements: state.elements.filter((el) => el.id !== id),
      selectedId: null,
    });
  };

  const updateBackground = (updates: Partial<BackgroundSettings>) => {
    setState({ ...state, background: { ...state.background, ...updates } });
  };

  const handleDownload = useCallback(async () => {
    if (cardRef.current === null) return;
    const prevGrid = state.showGrid;
    const prevSelected = state.selectedId;

    setState((prev) => ({ ...prev, showGrid: false, selectedId: null }));

    setTimeout(async () => {
      if (cardRef.current) {
        const dataUrl = await toPng(cardRef.current, { pixelRatio: 3 });
        saveAs(dataUrl, "executive-card.png");
        setState((prev) => ({
          ...prev,
          showGrid: prevGrid,
          selectedId: prevSelected,
        }));
      }
    }, 100);
  }, [state.showGrid, state.selectedId]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const newEl: CardElement = {
            id: generateId(),
            type: "image",
            content: reader.result as string,
            x: state.width / 2 - 50,
            y: state.height / 2 - 50,
            fontSize: 0,
            fontWeight: 0,
            color: "",
            fontFamily: "",
            opacity: 1,
            letterSpacing: 0,
            rotation: 0,
            zIndex: 5,
            width: 100,
            height: 100,
          };
          setState((prev) => ({
            ...prev,
            elements: [...prev.elements, newEl],
            selectedId: newEl.id,
          }));
        };
        reader.readAsDataURL(file);
      }
    },
    [state.width, state.height]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    noClick: true,
  });

  const selectedEl = state.elements.find((el) => el.id === state.selectedId);

  return (
    <div className="flex h-screen w-screen bg-[#09090b] text-slate-300 font-sans overflow-hidden">
      {/* --- LEFT SIDEBAR --- */}
      <div className="w-16 border-r border-white/10 flex flex-col items-center py-6 gap-4 bg-[#0c0c0e] z-20">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-2">
          <LayoutTemplate className="text-white" size={20} />
        </div>

        <div className="flex flex-col gap-2 w-full px-2">
          <Tooltip text="Templates">
            <ToolBtn
              icon={Layout}
              active={activeTab === "templates"}
              onClick={() => setActiveTab("templates")}
            />
          </Tooltip>
          <Tooltip text="Design Tools">
            <ToolBtn
              icon={Grid}
              active={activeTab === "tools"}
              onClick={() => setActiveTab("tools")}
            />
          </Tooltip>
        </div>

        <div className="h-px w-8 bg-white/10 my-2" />

        {/* Tools Tab */}
        {activeTab === "tools" && (
          <div className="flex flex-col gap-4 w-full px-2 animate-in fade-in duration-300">
            <Tooltip text="Add Text">
              <ToolBtn icon={Type} onClick={() => addElement("text")} />
            </Tooltip>

            {/* Icon Group */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-lg">
              <button
                onClick={() => addElement("icon", "phone")}
                className="p-1 hover:bg-indigo-600 rounded flex justify-center"
              >
                <Phone size={14} />
              </button>
              <button
                onClick={() => addElement("icon", "mail")}
                className="p-1 hover:bg-indigo-600 rounded flex justify-center"
              >
                <Mail size={14} />
              </button>
              <button
                onClick={() => addElement("icon", "globe")}
                className="p-1 hover:bg-indigo-600 rounded flex justify-center"
              >
                <Globe size={14} />
              </button>
              <button
                onClick={() => addElement("icon", "map-pin")}
                className="p-1 hover:bg-indigo-600 rounded flex justify-center"
              >
                <MapPin size={14} />
              </button>
            </div>

            <Tooltip text="Add Rectangle">
              <ToolBtn icon={Square} onClick={() => addElement("box")} />
            </Tooltip>
            <Tooltip text="Add Circle">
              <ToolBtn icon={Circle} onClick={() => addElement("circle")} />
            </Tooltip>
            <Tooltip text="Upload Logo">
              <ToolBtn
                icon={ImageIcon}
                onClick={() => document.getElementById("img-upload")?.click()}
              />
              <input
                type="file"
                id="img-upload"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      const newEl: CardElement = {
                        id: generateId(),
                        type: "image",
                        content: reader.result as string,
                        x: 100,
                        y: 100,
                        fontSize: 0,
                        fontWeight: 0,
                        color: "",
                        fontFamily: "",
                        opacity: 1,
                        letterSpacing: 0,
                        rotation: 0,
                        zIndex: 10,
                        width: 100,
                        height: 100,
                      };
                      setState((prev) => ({
                        ...prev,
                        elements: [...prev.elements, newEl],
                        selectedId: newEl.id,
                      }));
                    };
                    reader.readAsDataURL(e.target.files[0]);
                  }
                }}
              />
            </Tooltip>
            <Tooltip text="Add QR Code">
              <ToolBtn icon={QrCode} onClick={() => addElement("qr")} />
            </Tooltip>
            <div className="h-px w-full bg-white/10 my-2" />
            <Tooltip text="Undo">
              <ToolBtn
                icon={Undo}
                onClick={undo}
                disabled={state.historyIndex <= 0}
              />
            </Tooltip>
          </div>
        )}
      </div>

      {/* --- TEMPLATES SIDEBAR --- */}
      {activeTab === "templates" && (
        <div className="w-72 border-r border-white/10 bg-[#0c0c0e] flex flex-col z-10 animate-in slide-in-from-left-4 duration-200">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Professional Cards
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t)}
                className="group w-full text-left bg-slate-900/50 hover:bg-slate-800 rounded-xl p-3 border border-white/5 hover:border-indigo-500/50 transition-all"
              >
                <div
                  className="w-full aspect-video rounded-lg border border-white/10 mb-3 overflow-hidden relative shadow-sm"
                  style={{ background: t.thumbnail }}
                >
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm font-semibold text-slate-200 group-hover:text-white">
                    {t.name}
                  </div>
                  <div className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-400">
                    {t.category}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* --- CANVAS --- */}
      <div
        className="flex-1 flex flex-col relative bg-[#18181b]"
        {...getRootProps()}
      >
        <div className="h-16 border-b border-white/10 bg-[#0c0c0e] flex items-center justify-between px-6 z-10">
          <div>
            <h1 className="text-white font-bold text-sm tracking-wide">
              Card Editor
            </h1>
            <p className="text-[10px] text-slate-500">
              Double-click elements to edit
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              icon={Grid}
              active={state.showGrid}
              onClick={() => setState({ ...state, showGrid: !state.showGrid })}
            >
              Grid
            </Button>
            <Button variant="primary" icon={Download} onClick={handleDownload}>
              Export PNG
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto flex items-center justify-center p-20 relative bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:16px_16px]">
          <input {...getInputProps()} />

          <div
            ref={cardRef}
            className="relative shadow-2xl overflow-hidden group transition-all duration-300"
            style={{
              width: state.width,
              height: state.height,
              background: getBackgroundStyle(state.background),
              borderRadius: "0px",
            }}
            onClick={() => setState({ ...state, selectedId: null })}
          >
            {state.showGrid && (
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                  backgroundSize: "40px 40px",
                }}
              />
            )}

            <div
              className="absolute inset-0 pointer-events-none opacity-[0.05]"
              style={{
                filter: "contrast(300%) brightness(100%)",
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              }}
            />

            <AnimatePresence>
              {state.elements.map((el) => (
                <DraggableElement
                  key={el.id}
                  element={el}
                  isSelected={state.selectedId === el.id}
                  onSelect={(e) => {
                    e.stopPropagation();
                    setState({ ...state, selectedId: el.id });
                  }}
                  onUpdate={(updates) => updateElement(el.id, updates)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-[#0c0c0e] p-2 rounded-lg border border-white/10 shadow-xl">
          <button className="p-1 hover:bg-white/10 rounded">
            <Minus size={14} />
          </button>
          <span className="text-xs font-mono w-8 text-center">100%</span>
          <button className="p-1 hover:bg-white/10 rounded">
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* --- PROPERTIES SIDEBAR --- */}
      <div className="w-80 bg-[#0c0c0e] border-l border-white/10 flex flex-col z-20 overflow-y-auto custom-scrollbar">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Settings size={14} /> Properties
          </h2>
        </div>

        {selectedEl ? (
          <div className="p-6 space-y-8 animate-in slide-in-from-right-4 duration-200">
            {selectedEl.type === "text" && (
              <section className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <Label>Content</Label>
                  <Button
                    variant="danger"
                    icon={Trash2}
                    onClick={() => deleteElement(selectedEl.id)}
                    className="px-2 py-1 h-6"
                  >
                    Delete
                  </Button>
                </div>
                <textarea
                  value={selectedEl.content}
                  onChange={(e) =>
                    updateElement(selectedEl.id, { content: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  rows={3}
                />
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <Select
                    label="Font"
                    options={FONTS}
                    value={selectedEl.fontFamily}
                    onChange={(v: string) =>
                      updateElement(selectedEl.id, { fontFamily: v })
                    }
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Slider
                      label="Size"
                      min={8}
                      max={200}
                      value={selectedEl.fontSize}
                      onChange={(v: number) =>
                        updateElement(selectedEl.id, { fontSize: v })
                      }
                    />
                    <Slider
                      label="Weight"
                      min={100}
                      max={900}
                      value={selectedEl.fontWeight}
                      onChange={(v: number) =>
                        updateElement(selectedEl.id, { fontWeight: v })
                      }
                    />
                  </div>
                  <Slider
                    label="Letter Spacing"
                    min={-5}
                    max={20}
                    value={selectedEl.letterSpacing}
                    onChange={(v: number) =>
                      updateElement(selectedEl.id, { letterSpacing: v })
                    }
                  />
                  <ColorInput
                    label="Text Color"
                    value={selectedEl.color}
                    onChange={(v: string) =>
                      updateElement(selectedEl.id, { color: v })
                    }
                  />
                </div>
              </section>
            )}

            {(selectedEl.type === "box" ||
              selectedEl.type === "circle" ||
              selectedEl.type === "icon") && (
              <section className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <Label>
                    {selectedEl.type === "icon" ? "Icon Style" : "Shape Style"}
                  </Label>
                  <Button
                    variant="danger"
                    icon={Trash2}
                    onClick={() => deleteElement(selectedEl.id)}
                    className="px-2 py-1 h-6"
                  >
                    Delete
                  </Button>
                </div>
                <ColorInput
                  label="Color"
                  value={selectedEl.color}
                  onChange={(v: string) =>
                    updateElement(selectedEl.id, { color: v })
                  }
                />
                <div className="grid grid-cols-2 gap-3">
                  <Slider
                    label="Width"
                    min={10}
                    max={600}
                    value={selectedEl.width}
                    onChange={(v: number) =>
                      updateElement(selectedEl.id, { width: v })
                    }
                  />
                  <Slider
                    label="Height"
                    min={10}
                    max={600}
                    value={selectedEl.height}
                    onChange={(v: number) =>
                      updateElement(selectedEl.id, { height: v })
                    }
                  />
                </div>
                {selectedEl.type === "box" && (
                  <Slider
                    label="Roundness"
                    min={0}
                    max={100}
                    value={selectedEl.borderRadius}
                    onChange={(v: number) =>
                      updateElement(selectedEl.id, { borderRadius: v })
                    }
                  />
                )}
              </section>
            )}

            {(selectedEl.type === "image" || selectedEl.type === "qr") && (
              <section className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <Label>Dimensions</Label>
                  <Button
                    variant="danger"
                    icon={Trash2}
                    onClick={() => deleteElement(selectedEl.id)}
                    className="px-2 py-1 h-6"
                  >
                    Delete
                  </Button>
                </div>
                {selectedEl.type === "qr" && (
                  <input
                    type="text"
                    value={selectedEl.content}
                    onChange={(e) =>
                      updateElement(selectedEl.id, { content: e.target.value })
                    }
                    className="w-full bg-slate-800 border-slate-700 rounded px-3 py-2 text-xs mb-4 text-white"
                  />
                )}
                <div className="grid grid-cols-2 gap-3">
                  <Slider
                    label="Width"
                    min={20}
                    max={300}
                    value={selectedEl.width}
                    onChange={(v: number) =>
                      updateElement(selectedEl.id, { width: v })
                    }
                  />
                  <Slider
                    label="Height"
                    min={20}
                    max={300}
                    value={selectedEl.height}
                    onChange={(v: number) =>
                      updateElement(selectedEl.id, { height: v })
                    }
                  />
                </div>
              </section>
            )}

            <section className="space-y-4 pt-4 border-t border-white/5">
              <Label>Transform & Layer</Label>
              <div className="grid grid-cols-2 gap-3">
                <Slider
                  label="Opacity"
                  min={0}
                  max={1}
                  value={selectedEl.opacity}
                  onChange={(v: number) =>
                    updateElement(selectedEl.id, { opacity: v })
                  }
                />
                <Slider
                  label="Rotate"
                  min={-180}
                  max={180}
                  value={selectedEl.rotation}
                  onChange={(v: number) =>
                    updateElement(selectedEl.id, { rotation: v })
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  icon={Move}
                  onClick={() =>
                    updateElement(selectedEl.id, {
                      x: state.width / 2 - (selectedEl.width || 0) / 2,
                      y: state.height / 2 - 20,
                    })
                  }
                >
                  Center
                </Button>
                <Button
                  className="flex-1"
                  icon={Copy}
                  onClick={() =>
                    addElement(selectedEl.type, selectedEl.iconType)
                  }
                >
                  Clone
                </Button>
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  className="flex-1"
                  onClick={() =>
                    updateElement(selectedEl.id, {
                      zIndex: selectedEl.zIndex + 1,
                    })
                  }
                >
                  Bring Fwd
                </Button>
                <Button
                  className="flex-1"
                  onClick={() =>
                    updateElement(selectedEl.id, {
                      zIndex: Math.max(0, selectedEl.zIndex - 1),
                    })
                  }
                >
                  Send Back
                </Button>
              </div>
            </section>
          </div>
        ) : (
          <div className="p-6 space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-4 text-slate-400">
                <Palette size={16} />
                <span className="text-xs font-bold uppercase">Background</span>
              </div>
              <div className="flex bg-slate-800 p-1 rounded-lg mb-6">
                {["solid", "gradient", "mesh"].map((t) => (
                  <button
                    key={t}
                    onClick={() => updateBackground({ type: t as any })}
                    className={`flex-1 text-[10px] uppercase font-bold py-1.5 rounded-md transition-all ${
                      state.background.type === t
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {state.background.type !== "mesh" && (
                <>
                  <ColorInput
                    label="Primary Color"
                    value={state.background.color1}
                    onChange={(v: string) => updateBackground({ color1: v })}
                  />
                  {state.background.type === "gradient" && (
                    <>
                      <ColorInput
                        label="Secondary Color"
                        value={state.background.color2}
                        onChange={(v: string) =>
                          updateBackground({ color2: v })
                        }
                      />
                      <Select
                        label="Direction"
                        value={state.background.direction}
                        onChange={(v: string) =>
                          updateBackground({ direction: v as any })
                        }
                        options={[
                          { name: "To Bottom Right", value: "br" },
                          { name: "To Right", value: "r" },
                          { name: "To Bottom", value: "b" },
                        ]}
                      />
                    </>
                  )}
                </>
              )}
              <div className="pt-4 border-t border-white/5 space-y-4">
                <Slider
                  label="Noise"
                  min={0}
                  max={0.5}
                  value={state.background.noise}
                  onChange={(v: number) => updateBackground({ noise: v })}
                />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 5. RENDER HELPERS
// ==========================================

const DraggableElement = ({ element, isSelected, onSelect, onUpdate }: any) => {
  const controls = useDragControls();

  const renderIcon = (type: IconType | undefined, color: string) => {
    switch (type) {
      case "phone":
        return <Phone size="100%" color={color} />;
      case "mail":
        return <Mail size="100%" color={color} />;
      case "globe":
        return <Globe size="100%" color={color} />;
      case "map-pin":
        return <MapPin size="100%" color={color} />;
      default:
        return <Briefcase size="100%" color={color} />;
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragControls={controls}
      onDragEnd={(_, info) =>
        onUpdate({ x: element.x + info.offset.x, y: element.y + info.offset.y })
      }
      initial={{ x: element.x, y: element.y, opacity: 0, scale: 0.8 }}
      animate={{
        x: element.x,
        y: element.y,
        opacity: element.opacity,
        scale: 1,
        rotate: element.rotation,
        zIndex: isSelected ? 100 : element.zIndex,
      }}
      onClick={onSelect}
      className={`absolute cursor-move group ${
        isSelected
          ? "ring-1 ring-indigo-500"
          : "hover:ring-1 hover:ring-white/30"
      }`}
    >
      {isSelected && (
        <>
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-indigo-500 border-2 border-white rounded-full z-50 shadow-sm" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-indigo-500 border-2 border-white rounded-full z-50 shadow-sm" />
        </>
      )}

      {element.type === "text" && (
        <div
          className="whitespace-pre-wrap px-2 py-1"
          style={{
            fontSize: `${element.fontSize}px`,
            fontWeight: element.fontWeight,
            color: element.color,
            fontFamily: element.fontFamily,
            letterSpacing: `${element.letterSpacing}px`,
          }}
        >
          {element.content}
        </div>
      )}

      {(element.type === "box" || element.type === "circle") && (
        <div
          style={{
            width: element.width,
            height: element.height,
            backgroundColor: element.color,
            borderRadius:
              element.type === "circle" ? "50%" : `${element.borderRadius}px`,
          }}
        />
      )}

      {element.type === "icon" && (
        <div style={{ width: element.width, height: element.height }}>
          {renderIcon(element.iconType, element.color)}
        </div>
      )}

      {element.type === "image" && (
        <img
          src={element.content}
          alt=""
          className="pointer-events-none rounded-lg object-cover"
          style={{ width: element.width, height: element.height }}
        />
      )}

      {element.type === "qr" && (
        <div
          style={{ width: element.width, height: element.height }}
          className="bg-white p-2 rounded-lg"
        >
          <svg viewBox="0 0 32 32" className="w-full h-full fill-black">
            <path d={getQRCodePath()} />
          </svg>
        </div>
      )}
    </motion.div>
  );
};

const ToolBtn = ({ icon: Icon, onClick, text, active, disabled }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
      active
        ? "bg-indigo-600 text-white"
        : "text-slate-400 hover:bg-white/10 hover:text-white"
    } ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
  >
    <Icon size={20} />
  </button>
);

const Tooltip = ({ children, text }: any) => (
  <div className="group relative flex items-center">
    {children}
    <div className="absolute left-14 bg-slate-800 text-white text-[10px] uppercase font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-slate-700">
      {text}
      <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-slate-700" />
    </div>
  </div>
);

const getBackgroundStyle = (bg: BackgroundSettings) => {
  if (bg.type === "solid") return bg.color1;
  if (bg.type === "gradient") {
    const dirMap: any = {
      br: "to bottom right",
      r: "to right",
      b: "to bottom",
    };
    return `linear-gradient(${dirMap[bg.direction]}, ${bg.color1}, ${
      bg.color2
    })`;
  }
  if (bg.type === "mesh") {
    return `radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%)`;
  }
  return "#000";
};
const getQRCodePath = () =>
  "M4 4h6v6H4V4zm2 2v2h2V6H6zm-2 8h6v6H4v-6zm2 2v2h2v-2H6zm8-10h6v6h-6V4zm2 2v2h2V6h-2zM4 20h2v-2H4v2zm2-2h2v-2H6v2zm4 2h2v-2h-2v2zm2-2h2v-2h-2v2zm-2-4h2v-2h-2v2zm2-2h2v-2h-2v2zm-2 2h2v-2h-2v2zm10 8h2v-2h-2v2zm2-2h2v-2h-2v2zm-2-4h2v-2h-2v2zm-4 6h2v-2h-2v2zm2 2h2v-2h-2v2z";
