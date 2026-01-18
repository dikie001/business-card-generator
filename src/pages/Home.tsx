import { saveAs } from "file-saver";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { toPng } from "html-to-image";
import {
  Briefcase,
  ChevronDown,
  Copy,
  Download,
  Grid,
  Image as ImageIcon,
  Layout,
  LayoutTemplate,
  Minus,
  Move,
  Palette,
  Plus,
  QrCode,
  Settings,
  Smartphone,
  Trash2,
  Type,
  Undo,
} from "lucide-react";
import React, { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";

// ==========================================
// 1. TYPES & CONSTANTS
// ==========================================

type ElementType = "text" | "image" | "qr";
type BackgroundType = "solid" | "gradient" | "mesh";
type GradientDirection = "br" | "r" | "b" | "tr" | "tl";

interface CardElement {
  id: string;
  type: ElementType;
  content: string;
  x: number;
  y: number;
  width?: number; // For images/qr
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
  thumbnail: string; // CSS color string for preview
  state: Partial<CardState>; // Partial state to merge
}

const FONTS = [
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Playfair Display", value: '"Playfair Display", serif' },
  { name: "Roboto Mono", value: '"Roboto Mono", monospace' },
  { name: "Oswald", value: '"Oswald", sans-serif' },
];

const generateId = () => `el-${Math.random().toString(36).substr(2, 9)}`;

// --- READY-MADE TEMPLATES LIBRARY ---

const TEMPLATES: Template[] = [
  {
    id: "tech-lead",
    name: "Tech Lead",
    category: "Professional",
    thumbnail: "linear-gradient(to bottom right, #0f172a, #334155)",
    state: {
      background: {
        type: "gradient",
        color1: "#0f172a",
        color2: "#334155",
        color3: "#1e293b",
        direction: "br",
        noise: 0.05,
        blur: 0,
      },
      elements: [
        {
          id: "tl-1",
          type: "text",
          content: "DIKIE DEV",
          x: 40,
          y: 50,
          fontSize: 32,
          fontWeight: 800,
          color: "#ffffff",
          fontFamily: "Inter, sans-serif",
          opacity: 1,
          letterSpacing: -1,
          rotation: 0,
          zIndex: 10,
        },
        {
          id: "tl-2",
          type: "text",
          content: "Senior Software Engineer",
          x: 40,
          y: 95,
          fontSize: 14,
          fontWeight: 500,
          color: "#94a3b8",
          fontFamily: "Inter, sans-serif",
          opacity: 1,
          letterSpacing: 1,
          rotation: 0,
          zIndex: 10,
        },
        {
          id: "tl-3",
          type: "text",
          content: "dikie@example.com",
          x: 40,
          y: 230,
          fontSize: 14,
          fontWeight: 400,
          color: "#ffffff",
          fontFamily: "Inter, sans-serif",
          opacity: 0.8,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 10,
        },
        {
          id: "tl-4",
          type: "text",
          content: "+1 (555) 000-0000",
          x: 40,
          y: 255,
          fontSize: 14,
          fontWeight: 400,
          color: "#94a3b8",
          fontFamily: "Inter, sans-serif",
          opacity: 0.8,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 10,
        },
        {
          id: "tl-5",
          type: "qr",
          content: "https://dikie.dev",
          x: 450,
          y: 50,
          width: 100,
          height: 100,
          fontSize: 0,
          fontWeight: 0,
          color: "",
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
    id: "swiss-minimal",
    name: "Swiss Studio",
    category: "Minimalist",
    thumbnail: "#f1f5f9",
    state: {
      background: {
        type: "solid",
        color1: "#f1f5f9",
        color2: "#ffffff",
        color3: "",
        direction: "br",
        noise: 0,
        blur: 0,
      },
      elements: [
        {
          id: "sm-1",
          type: "text",
          content: "M.",
          x: 40,
          y: 30,
          fontSize: 120,
          fontWeight: 900,
          color: "#0f172a",
          fontFamily: "Inter, sans-serif",
          opacity: 1,
          letterSpacing: -8,
          rotation: 0,
          zIndex: 1,
        },
        {
          id: "sm-2",
          type: "text",
          content: "Morgan Creative",
          x: 300,
          y: 60,
          fontSize: 24,
          fontWeight: 700,
          color: "#0f172a",
          fontFamily: "Inter, sans-serif",
          opacity: 1,
          letterSpacing: -1,
          rotation: 0,
          zIndex: 10,
        },
        {
          id: "sm-3",
          type: "text",
          content: "Art Direction & Design",
          x: 300,
          y: 95,
          fontSize: 12,
          fontWeight: 500,
          color: "#64748b",
          fontFamily: "Inter, sans-serif",
          opacity: 1,
          letterSpacing: 2,
          rotation: 0,
          zIndex: 10,
        },
        {
          id: "sm-4",
          type: "qr",
          content: "portfolio",
          x: 480,
          y: 230,
          width: 80,
          height: 80,
          fontSize: 0,
          fontWeight: 0,
          color: "",
          fontFamily: "",
          opacity: 1,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 5,
        },
        {
          id: "sm-5",
          type: "text",
          content: "EST. 2024",
          x: 40,
          y: 280,
          fontSize: 10,
          fontWeight: 700,
          color: "#94a3b8",
          fontFamily: "Inter, sans-serif",
          opacity: 1,
          letterSpacing: 4,
          rotation: 0,
          zIndex: 10,
        },
      ],
    },
  },
  {
    id: "cyber-neon",
    name: "Cyberpunk",
    category: "Creative",
    thumbnail: "linear-gradient(to right, #2e0228, #180326)",
    state: {
      background: {
        type: "gradient",
        color1: "#2e0228",
        color2: "#180326",
        color3: "",
        direction: "br",
        noise: 0.3,
        blur: 0,
      },
      elements: [
        {
          id: "cn-1",
          type: "text",
          content: "NEO_SYSTEMS",
          x: 30,
          y: 120,
          fontSize: 42,
          fontWeight: 700,
          color: "#d946ef",
          fontFamily: '"Oswald", sans-serif',
          opacity: 1,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 10,
        },
        {
          id: "cn-2",
          type: "text",
          content: "SYSTEM_ADMIN // ROOT",
          x: 30,
          y: 175,
          fontSize: 14,
          fontWeight: 400,
          color: "#22d3ee",
          fontFamily: '"Roboto Mono", monospace',
          opacity: 1,
          letterSpacing: 1,
          rotation: 0,
          zIndex: 10,
        },
        {
          id: "cn-3",
          type: "text",
          content: "ID: 994-22-X",
          x: 450,
          y: 280,
          fontSize: 12,
          fontWeight: 400,
          color: "#e879f9",
          fontFamily: '"Roboto Mono", monospace',
          opacity: 0.6,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 10,
        },
        {
          id: "cn-4",
          type: "text",
          content: "ACCESS GRANTED",
          x: 430,
          y: 40,
          fontSize: 10,
          fontWeight: 700,
          color: "#22d3ee",
          fontFamily: '"Roboto Mono", monospace',
          opacity: 1,
          letterSpacing: 2,
          rotation: 0,
          zIndex: 10,
        },
      ],
    },
  },
  {
    id: "elegant-serif",
    name: "Executive Gold",
    category: "Luxury",
    thumbnail: "#1a1a1a",
    state: {
      background: {
        type: "solid",
        color1: "#0a0a0a",
        color2: "#000000",
        color3: "",
        direction: "br",
        noise: 0.05,
        blur: 0,
      },
      elements: [
        {
          id: "es-1",
          type: "text",
          content: "Alexander",
          x: 260,
          y: 100,
          fontSize: 48,
          fontWeight: 400,
          color: "#fbbf24",
          fontFamily: '"Playfair Display", serif',
          opacity: 1,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 10,
        },
        {
          id: "es-2",
          type: "text",
          content: "Hamilton",
          x: 300,
          y: 150,
          fontSize: 48,
          fontWeight: 400,
          color: "#fbbf24",
          fontFamily: '"Playfair Display", serif',
          opacity: 1,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 10,
        },
        {
          id: "es-3",
          type: "text",
          content: "CEO & Founder",
          x: 40,
          y: 280,
          fontSize: 12,
          fontWeight: 400,
          color: "#a3a3a3",
          fontFamily: "Inter, sans-serif",
          opacity: 1,
          letterSpacing: 2,
          rotation: 0,
          zIndex: 10,
        },
        {
          id: "es-4",
          type: "text",
          content: "Hamilton Corp.",
          x: 450,
          y: 280,
          fontSize: 12,
          fontWeight: 700,
          color: "#fbbf24",
          fontFamily: "Inter, sans-serif",
          opacity: 1,
          letterSpacing: 1,
          rotation: 0,
          zIndex: 10,
        },
        {
          id: "es-5",
          type: "text",
          content: "H",
          x: 40,
          y: 30,
          fontSize: 80,
          fontWeight: 400,
          color: "#262626",
          fontFamily: '"Playfair Display", serif',
          opacity: 1,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 1,
        },
      ],
    },
  },
  {
    id: "gradient-blur",
    name: "Aura Mesh",
    category: "Creative",
    thumbnail:
      "radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%)",
    state: {
      background: {
        type: "mesh",
        color1: "#000000",
        color2: "#000000",
        color3: "",
        direction: "br",
        noise: 0.1,
        blur: 40,
      },
      elements: [
        {
          id: "gb-1",
          type: "text",
          content: "creative",
          x: 40,
          y: 40,
          fontSize: 14,
          fontWeight: 600,
          color: "#ffffff",
          fontFamily: "Inter, sans-serif",
          opacity: 0.5,
          letterSpacing: 2,
          rotation: 0,
          zIndex: 10,
        },
        {
          id: "gb-2",
          type: "text",
          content: "Studio",
          x: 40,
          y: 180,
          fontSize: 64,
          fontWeight: 300,
          color: "#ffffff",
          fontFamily: "Inter, sans-serif",
          opacity: 1,
          letterSpacing: -3,
          rotation: 0,
          zIndex: 10,
        },
        {
          id: "gb-3",
          type: "text",
          content: "Design",
          x: 40,
          y: 240,
          fontSize: 64,
          fontWeight: 300,
          color: "#e879f9",
          fontFamily: '"Playfair Display", serif',
          opacity: 1,
          letterSpacing: -3,
          rotation: 0,
          zIndex: 10,
        },
        {
          id: "gb-4",
          type: "text",
          content: "Tokyo • NY • London",
          x: 420,
          y: 40,
          fontSize: 10,
          fontWeight: 600,
          color: "#ffffff",
          fontFamily: "Inter, sans-serif",
          opacity: 0.6,
          letterSpacing: 1,
          rotation: 0,
          zIndex: 10,
        },
      ],
    },
  },
  {
    id: "corporate-blue",
    name: "Trust Blue",
    category: "Professional",
    thumbnail: "#eff6ff",
    state: {
      background: {
        type: "solid",
        color1: "#eff6ff",
        color2: "#ffffff",
        color3: "",
        direction: "br",
        noise: 0,
        blur: 0,
      },
      elements: [
        {
          id: "cb-1",
          type: "text",
          content: "John Doe",
          x: 220,
          y: 120,
          fontSize: 28,
          fontWeight: 700,
          color: "#1e3a8a",
          fontFamily: "Inter, sans-serif",
          opacity: 1,
          letterSpacing: -1,
          rotation: 0,
          zIndex: 10,
        },
        {
          id: "cb-2",
          type: "text",
          content: "Cloud Architect",
          x: 220,
          y: 160,
          fontSize: 14,
          fontWeight: 500,
          color: "#3b82f6",
          fontFamily: "Inter, sans-serif",
          opacity: 1,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 10,
        },
        {
          id: "cb-3",
          type: "qr",
          content: "contact",
          x: 60,
          y: 100,
          width: 120,
          height: 120,
          fontSize: 0,
          fontWeight: 0,
          color: "",
          fontFamily: "",
          opacity: 1,
          letterSpacing: 0,
          rotation: 0,
          zIndex: 10,
        },
        {
          id: "cb-4",
          type: "text",
          content: "Solutions Inc.",
          x: 450,
          y: 300,
          fontSize: 14,
          fontWeight: 700,
          color: "#93c5fd",
          fontFamily: "Inter, sans-serif",
          opacity: 1,
          letterSpacing: 1,
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
  selectedId: "tl-1",
};

// ==========================================
// 2. UTILS & HELPERS
// ==========================================

const getQRCodePath = () =>
  "M4 4h6v6H4V4zm2 2v2h2V6H6zm-2 8h6v6H4v-6zm2 2v2h2v-2H6zm8-10h6v6h-6V4zm2 2v2h2V6h-2zM4 20h2v-2H4v2zm2-2h2v-2H6v2zm4 2h2v-2h-2v2zm2-2h2v-2h-2v2zm-2-4h2v-2h-2v2zm2-2h2v-2h-2v2zm-2 2h2v-2h-2v2zm10 8h2v-2h-2v2zm2-2h2v-2h-2v2zm-2-4h2v-2h-2v2zm-4 6h2v-2h-2v2zm2 2h2v-2h-2v2z";

// ==========================================
// 3. UI LIBRARY (Custom, Type Safe)
// ==========================================

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1 block">
    {children}
  </label>
);

interface SliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  label?: string;
}

const Slider = ({ value, min, max, onChange, label }: SliderProps) => (
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

interface ColorInputProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
}

const ColorInput = ({ value, onChange, label }: ColorInputProps) => (
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

interface SelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { name: string; value: string }[];
  label?: string;
}

const Select = ({ value, onChange, options, label }: SelectProps) => (
  <div className="mb-4">
    {label && <Label>{label}</Label>}
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-white appearance-none focus:border-indigo-500 outline-none"
      >
        {options.map((opt) => (
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

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  icon?: React.ElementType;
  className?: string;
  disabled?: boolean;
}

const Button = ({
  onClick,
  children,
  active,
  variant = "secondary",
  icon: Icon,
  className,
  disabled,
}: ButtonProps) => {
  const baseStyle =
    "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
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
  // --- State ---
  const [state, setState] = useState<CardState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<"tools" | "templates">(
    "templates"
  ); // Default to templates
  const cardRef = useRef<HTMLDivElement>(null);

  // --- History Management ---
  const pushHistory = useCallback(
    (newState: CardState) => {
      // We only save specific parts of state to history to save memory
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
        width: newState.width,
        height: newState.height,
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
    // When applying a template, we reset history to avoid weird undo states between completely different designs
    setState({
      ...state,
      ...template.state,
      selectedId: null,
      history: [],
      historyIndex: -1,
    });
  };

  // --- Actions ---

  const addElement = (type: ElementType) => {
    const newEl: CardElement = {
      id: generateId(),
      type,
      content:
        type === "text"
          ? "New Text"
          : type === "qr"
          ? "https://website.com"
          : "https://via.placeholder.com/100",
      x: state.width / 2 - 50,
      y: state.height / 2 - 20,
      fontSize: 18,
      fontWeight: 500,
      color: "#ffffff",
      fontFamily: "Inter, sans-serif",
      opacity: 1,
      letterSpacing: 0,
      rotation: 0,
      zIndex: state.elements.length + 1,
      width: type !== "text" ? 80 : undefined,
      height: type !== "text" ? 80 : undefined,
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

    // Temporarily hide grid/selection handles via CSS class or logic if needed
    const prevGrid = state.showGrid;
    const prevSelected = state.selectedId;

    setState((prev) => ({ ...prev, showGrid: false, selectedId: null }));

    // Allow React render cycle to flush
    setTimeout(async () => {
      if (cardRef.current) {
        const dataUrl = await toPng(cardRef.current, { pixelRatio: 3 });
        saveAs(dataUrl, "card-architect-pro.png");
        // Restore
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
            zIndex: state.elements.length + 1,
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
    [state.width, state.height, state.elements.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    noClick: true,
  });

  const selectedEl = state.elements.find((el) => el.id === state.selectedId);

  // ==========================================
  // 5. RENDER
  // ==========================================

  return (
    <div className="flex h-screen w-screen bg-[#09090b] text-slate-300 font-sans overflow-hidden">
      {/* --- LEFT SIDEBAR: NAVIGATION & TOOLS --- */}
      <div className="w-16 border-r border-white/10 flex flex-col items-center py-6 gap-4 bg-[#0c0c0e] z-20">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-2">
          <LayoutTemplate className="text-white" size={20} />
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col gap-2 w-full px-2">
          <Tooltip text="Templates">
            <ToolBtn
              icon={Layout}
              active={activeTab === "templates"}
              onClick={() => setActiveTab("templates")}
            />
          </Tooltip>
          <Tooltip text="Editor Tools">
            <ToolBtn
              icon={Grid}
              active={activeTab === "tools"}
              onClick={() => setActiveTab("tools")}
            />
          </Tooltip>
        </div>

        <div className="h-px w-8 bg-white/10 my-2" />

        {/* Context Tools (Only show when Editor is active) */}
        {activeTab === "tools" && (
          <div className="flex flex-col gap-4 w-full px-2 animate-in fade-in duration-300">
            <Tooltip text="Add Text">
              <ToolBtn icon={Type} onClick={() => addElement("text")} />
            </Tooltip>
            <Tooltip text="Upload Image">
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

      {/* --- SECONDARY SIDEBAR (TEMPLATES) --- */}
      {activeTab === "templates" && (
        <div className="w-72 border-r border-white/10 bg-[#0c0c0e] flex flex-col z-10 animate-in slide-in-from-left-4 duration-200">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pick a Template
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

      {/* --- CENTER: CANVAS --- */}
      <div
        className="flex-1 flex flex-col relative bg-[#18181b]"
        {...getRootProps()}
      >
        {/* Top Bar */}
        <div className="h-16 border-b border-white/10 bg-[#0c0c0e] flex items-center justify-between px-6 z-10">
          <div>
            <h1 className="text-white font-bold text-sm tracking-wide">
              Untitled Card
            </h1>
            <p className="text-[10px] text-slate-500">Auto-saving enabled</p>
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
            <Button variant="ghost" icon={Smartphone} onClick={() => {}}>
              Preview
            </Button>
            <Button variant="primary" icon={Download} onClick={handleDownload}>
              Export PNG
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-20 relative bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:16px_16px]">
          <input {...getInputProps()} />
          {isDragActive && (
            <div className="absolute inset-0 z-50 bg-indigo-500/20 backdrop-blur-sm flex items-center justify-center border-4 border-indigo-500 border-dashed m-4 rounded-xl">
              <div className="text-white font-bold text-xl">
                Drop Image Here
              </div>
            </div>
          )}

          <div
            ref={cardRef}
            className="relative shadow-2xl overflow-hidden group transition-all duration-300"
            style={{
              width: state.width,
              height: state.height,
              background: getBackgroundStyle(state.background),
              borderRadius: "24px",
            }}
            onClick={() => setState({ ...state, selectedId: null })}
          >
            {/* Grid Overlay */}
            {state.showGrid && (
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                  backgroundSize: "40px 40px",
                }}
              />
            )}

            {/* Noise Overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.05]"
              style={{
                filter: "contrast(300%) brightness(100%)",
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              }}
            />

            {/* Elements */}
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

        {/* Zoom Controls */}
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

      {/* --- RIGHT SIDEBAR: PROPERTIES --- */}
      <div className="w-80 bg-[#0c0c0e] border-l border-white/10 flex flex-col z-20 overflow-y-auto custom-scrollbar">
        {/* Layer Header */}
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Settings size={14} /> Properties
          </h2>
        </div>

        {selectedEl ? (
          <div className="p-6 space-y-8 animate-in slide-in-from-right-4 duration-200">
            {/* Element Specific Controls */}

            {/* TEXT CONTROLS */}
            {selectedEl.type === "text" && (
              <section className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <Label>Text Content</Label>
                  <Button
                    variant="danger"
                    icon={Trash2}
                    onClick={() => deleteElement(selectedEl.id)}
                    className="px-2 py-1 h-6"
                  >
                    Remove
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
                    label="Typography"
                    options={FONTS}
                    value={selectedEl.fontFamily}
                    onChange={(v) =>
                      updateElement(selectedEl.id, { fontFamily: v })
                    }
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Slider
                      label="Size"
                      min={10}
                      max={200}
                      value={selectedEl.fontSize}
                      onChange={(v) =>
                        updateElement(selectedEl.id, { fontSize: v })
                      }
                    />
                    <Slider
                      label="Weight"
                      min={100}
                      max={900}
                      value={selectedEl.fontWeight}
                      onChange={(v) =>
                        updateElement(selectedEl.id, { fontWeight: v })
                      }
                    />
                  </div>
                  <Slider
                    label="Letter Spacing"
                    min={-5}
                    max={10}
                    value={selectedEl.letterSpacing}
                    onChange={(v) =>
                      updateElement(selectedEl.id, { letterSpacing: v })
                    }
                  />
                  <ColorInput
                    label="Color"
                    value={selectedEl.color}
                    onChange={(v) => updateElement(selectedEl.id, { color: v })}
                  />
                </div>
              </section>
            )}

            {/* IMAGE/QR CONTROLS */}
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
                    Remove
                  </Button>
                </div>
                {selectedEl.type === "qr" && (
                  <input
                    type="text"
                    value={selectedEl.content}
                    onChange={(e) =>
                      updateElement(selectedEl.id, { content: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full bg-slate-800 border-slate-700 rounded px-3 py-2 text-xs mb-4 text-white"
                  />
                )}
                <div className="grid grid-cols-2 gap-3">
                  <Slider
                    label="Width"
                    min={20}
                    max={300}
                    value={selectedEl.width || 100}
                    onChange={(v) => updateElement(selectedEl.id, { width: v })}
                  />
                  <Slider
                    label="Height"
                    min={20}
                    max={300}
                    value={selectedEl.height || 100}
                    onChange={(v) =>
                      updateElement(selectedEl.id, { height: v })
                    }
                  />
                </div>
              </section>
            )}

            {/* COMMON CONTROLS */}
            <section className="space-y-4 pt-4 border-t border-white/5">
              <Label>Transform</Label>
              <div className="grid grid-cols-2 gap-3">
                <Slider
                  label="Opacity"
                  min={0}
                  max={1}
                  value={selectedEl.opacity}
                  onChange={(v) => updateElement(selectedEl.id, { opacity: v })}
                />
                <Slider
                  label="Rotate"
                  min={-180}
                  max={180}
                  value={selectedEl.rotation}
                  onChange={(v) =>
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
                      x: state.width / 2 - 50,
                      y: state.height / 2 - 20,
                    })
                  }
                >
                  Center
                </Button>
                <Button
                  className="flex-1"
                  icon={Copy}
                  onClick={() => addElement(selectedEl.type)}
                >
                  Duplicate
                </Button>
              </div>
            </section>
          </div>
        ) : (
          <div className="p-6 space-y-8">
            {/* Background Settings */}
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
                    onChange={(v) => updateBackground({ color1: v })}
                  />
                  {state.background.type === "gradient" && (
                    <>
                      <ColorInput
                        label="Secondary Color"
                        value={state.background.color2}
                        onChange={(v) => updateBackground({ color2: v })}
                      />
                      <Select
                        label="Direction"
                        value={state.background.direction}
                        onChange={(v) =>
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
                  label="Noise Grain"
                  min={0}
                  max={0.5}
                  value={state.background.noise}
                  onChange={(v) => updateBackground({ noise: v })}
                />
                <Slider
                  label="Blur Effect"
                  min={0}
                  max={50}
                  value={state.background.blur}
                  onChange={(v) => updateBackground({ blur: v })}
                />
              </div>
            </section>

            {/* Layout Settings */}
            <section className="pt-4 border-t border-white/5">
              <Label>Card Dimensions</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="bg-slate-800 p-2 rounded text-center">
                  <div className="text-[10px] text-slate-500">W</div>
                  <div className="text-sm font-mono">{state.width}px</div>
                </div>
                <div className="bg-slate-800 p-2 rounded text-center">
                  <div className="text-[10px] text-slate-500">H</div>
                  <div className="text-sm font-mono">{state.height}px</div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 6. HELPER COMPONENTS
// ==========================================

const DraggableElement = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
}: {
  element: CardElement;
  isSelected: boolean;
  onSelect: (e: any) => void;
  onUpdate: (u: any) => void;
}) => {
  const controls = useDragControls();

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragControls={controls}
      onDragEnd={(_, info) => {
        onUpdate({
          x: element.x + info.offset.x,
          y: element.y + info.offset.y,
        });
      }}
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
      style={
        {
          // Position is handled by motion animate
        }
      }
    >
      {/* Selection Handles */}
      {isSelected && (
        <>
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-indigo-500 border-2 border-white rounded-full z-50 shadow-sm" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-indigo-500 border-2 border-white rounded-full z-50 shadow-sm" />
        </>
      )}

      {/* Text Element */}
      {element.type === "text" && (
        <div
          className="whitespace-nowrap px-2 py-1"
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

      {/* Image Element */}
      {element.type === "image" && (
        <img
          src={element.content}
          alt="User Asset"
          className="pointer-events-none rounded-lg object-cover"
          style={{ width: element.width, height: element.height }}
        />
      )}

      {/* QR Element */}
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

interface ToolBtnProps {
  icon: React.ElementType;
  onClick: () => void;
  text?: string;
  active?: boolean;
  disabled?: boolean;
}

const ToolBtn = ({
  icon: Icon,
  onClick,
  text,
  active,
  disabled,
}: ToolBtnProps) => (
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

const Tooltip = ({
  children,
  text,
}: {
  children: React.ReactNode;
  text: string;
}) => (
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
    const dirMap: Record<string, string> = {
      br: "to bottom right",
      r: "to right",
      b: "to bottom",
    };
    return `linear-gradient(${dirMap[bg.direction]}, ${bg.color1}, ${
      bg.color2
    })`;
  }

  if (bg.type === "mesh") {
    return `
      radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
      radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), 
      radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%)
    `;
  }

  return "#000";
};
