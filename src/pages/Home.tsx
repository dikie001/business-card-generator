import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Brain,
  Check,
  ChevronRight,
  Flame,
  Globe,
  Headphones,
  Home,
  LayoutDashboard,
  Mic,
  MoreVertical,
  RotateCcw,
  Settings,
  Star,
  Trophy,
  Volume2,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";

// ==========================================
// 1. TYPES & MOCK DATA
// ==========================================

type QuestionType = "multiple-choice" | "translate" | "listen" | "speak";

interface Question {
  id: string;
  type: QuestionType;
  prompt: string; // The German word or audio text
  context?: string; // "Translate this sentence"
  correctAnswer: string;
  options?: string[]; // For multiple choice
  translation?: string; // English meaning
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  xp: number;
  completed: boolean;
  locked: boolean;
}

interface Unit {
  id: string;
  title: string;
  color: string;
  lessons: Lesson[];
}

interface UserStats {
  xp: number;
  streak: number;
  level: string;
  hearts: number;
  crowns: number;
}

// --- MOCK CONTENT ---

const MOCK_STATS: UserStats = {
  xp: 1250,
  streak: 14,
  level: "Explorer",
  hearts: 5,
  crowns: 12,
};

const UNITS: Unit[] = [
  {
    id: "unit-1",
    title: "Unit 1: The Basics",
    color: "bg-emerald-500",
    lessons: [
      {
        id: "l1",
        title: "Greetings",
        description: "Say hello and goodbye",
        xp: 15,
        completed: true,
        locked: false,
        questions: [
          {
            id: "q1",
            type: "multiple-choice",
            prompt: "Hallo",
            context: "Select the correct meaning",
            correctAnswer: "Hello",
            options: ["Hello", "Goodbye", "Thanks"],
          },
          {
            id: "q2",
            type: "translate",
            prompt: "Guten Morgen",
            context: "Translate to English",
            correctAnswer: "Good morning",
            translation: "Good morning",
          },
        ],
      },
      {
        id: "l2",
        title: "Introductions",
        description: "Say who you are",
        xp: 15,
        completed: false,
        locked: false,
        questions: [
          {
            id: "q3",
            type: "translate",
            prompt: "Ich bin Anna",
            context: "Translate this sentence",
            correctAnswer: "I am Anna",
          },
          {
            id: "q4",
            type: "multiple-choice",
            prompt: "Wie geht es dir?",
            context: "What does this mean?",
            correctAnswer: "How are you?",
            options: ["Who are you?", "How are you?", "Where are you?"],
          },
          {
            id: "q5",
            type: "speak",
            prompt: "Danke, gut",
            context: "Speak this sentence",
            correctAnswer: "Danke, gut",
          },
        ],
      },
    ],
  },
  {
    id: "unit-2",
    title: "Unit 2: Food & Drink",
    color: "bg-indigo-500",
    lessons: [
      {
        id: "l3",
        title: "Ordering",
        description: "Order food in a cafe",
        xp: 20,
        completed: false,
        locked: true,
        questions: [],
      },
      {
        id: "l4",
        title: "Breakfast",
        description: "Bread, coffee, and milk",
        xp: 20,
        completed: false,
        locked: true,
        questions: [],
      },
    ],
  },
  {
    id: "unit-3",
    title: "Unit 3: Travel",
    color: "bg-rose-500",
    lessons: [
      {
        id: "l5",
        title: "Tickets",
        description: "Buying train tickets",
        xp: 25,
        completed: false,
        locked: true,
        questions: [],
      },
    ],
  },
];

const VOCABULARY = [
  { de: "Der Apfel", en: "The Apple", type: "Noun" },
  { de: "Gehen", en: "To Go", type: "Verb" },
  { de: "Schön", en: "Beautiful", type: "Adj" },
  { de: "Das Brot", en: "The Bread", type: "Noun" },
  { de: "Die Katze", en: "The Cat", type: "Noun" },
  { de: "Sprechen", en: "To Speak", type: "Verb" },
];

// ==========================================
// 2. COMPONENTS
// ==========================================

// --- Button Component ---
const Button = ({
  children,
  onClick,
  variant = "primary",
  className,
  disabled,
  size = "md",
}: any) => {
  const base =
    "font-bold rounded-2xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2";

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg w-full",
  };

  const variants = {
    primary:
      "bg-emerald-500 text-white shadow-[0_4px_0_0_#059669] hover:bg-emerald-400 active:shadow-none active:translate-y-1",
    secondary:
      "bg-slate-200 text-slate-700 shadow-[0_4px_0_0_#94a3b8] hover:bg-slate-300 active:shadow-none active:translate-y-1",
    outline:
      "bg-transparent border-2 border-slate-200 text-slate-500 hover:bg-slate-50",
    danger:
      "bg-rose-500 text-white shadow-[0_4px_0_0_#e11d48] hover:bg-rose-400",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-100 shadow-none",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant as keyof typeof variants]} ${
        sizes[size as keyof typeof sizes]
      } ${className} ${
        disabled ? "opacity-50 pointer-events-none grayscale" : ""
      }`}
    >
      {children}
    </button>
  );
};

// --- Quiz Interface ---
const QuizModal = ({
  lesson,
  onClose,
  onComplete,
}: {
  lesson: Lesson;
  onClose: () => void;
  onComplete: (xp: number) => void;
}) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [inputVal, setInputVal] = useState("");

  const question = lesson.questions[currentQIndex];
  const progress = (currentQIndex / lesson.questions.length) * 100;

  const handleCheck = () => {
    let isCorrect = false;

    if (question.type === "multiple-choice") {
      isCorrect = selectedOption === question.correctAnswer;
    } else if (question.type === "translate" || question.type === "speak") {
      // Loose matching for text input
      isCorrect =
        inputVal.toLowerCase().trim() ===
          question.correctAnswer.toLowerCase().trim() ||
        (question.type === "speak" && true); // Always correct for simulated speak in this demo
    }

    setStatus(isCorrect ? "correct" : "wrong");
  };

  const handleNext = () => {
    if (currentQIndex < lesson.questions.length - 1) {
      setCurrentQIndex((p) => p + 1);
      setStatus("idle");
      setSelectedOption(null);
      setInputVal("");
    } else {
      onComplete(lesson.xp);
    }
  };

  // Play sound effect (simulated)
  useEffect(() => {
    if (status === "correct") {
      // In a real app: new Audio('/correct.mp3').play();
    }
  }, [status]);

  return (
    <div className="fixed inset-0 bg-[#09090b] z-50 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-2xl flex items-center gap-4 mb-8">
        <button onClick={onClose}>
          <X className="text-slate-400 hover:text-white" />
        </button>
        <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-emerald-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center text-rose-500 gap-1 font-bold">
          <Brain size={18} fill="currentColor" /> 5
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 w-full max-w-xl flex flex-col items-center justify-center">
        <h2 className="text-2xl text-slate-200 font-bold mb-8 text-center">
          {question.context}
        </h2>

        {/* Prompt Area */}
        <div className="flex items-center gap-4 mb-8">
          {question.type === "listen" || question.type === "speak" ? (
            <div className="w-24 h-24 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border-2 border-indigo-500/50 cursor-pointer hover:bg-indigo-500/30">
              <Volume2 size={32} />
            </div>
          ) : null}

          {question.type !== "listen" && (
            <div className="flex items-center gap-3">
              {question.type === "speak" && <Mic className="text-slate-500" />}
              <span className="text-3xl text-white font-bold">
                {question.prompt}
              </span>
            </div>
          )}
        </div>

        {/* Interaction Area */}
        <div className="w-full space-y-4">
          {question.type === "multiple-choice" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {question.options?.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedOption(opt)}
                  disabled={status !== "idle"}
                  className={`p-4 rounded-xl border-2 text-lg font-medium transition-all ${
                    selectedOption === opt
                      ? "border-indigo-500 bg-indigo-500/20 text-indigo-400"
                      : "border-slate-700 hover:bg-slate-800 text-slate-300"
                  } ${
                    status !== "idle" && opt === question.correctAnswer
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                      : ""
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {(question.type === "translate" || question.type === "speak") && (
            <textarea
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={status !== "idle"}
              placeholder={
                question.type === "speak"
                  ? "Type what you say..."
                  : "Type in English..."
              }
              className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-4 text-white text-lg focus:border-indigo-500 outline-none h-32 resize-none"
            />
          )}
        </div>
      </div>

      {/* Footer / Feedback */}
      <div
        className={`w-full fixed bottom-0 left-0 border-t border-slate-800 p-4 md:p-8 transition-colors ${
          status === "correct"
            ? "bg-emerald-900/30 border-emerald-500/30"
            : status === "wrong"
            ? "bg-rose-900/30 border-rose-500/30"
            : "bg-[#09090b]"
        }`}
      >
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          {status === "idle" ? (
            <div className="flex-1 flex justify-end">
              <Button
                onClick={handleCheck}
                disabled={
                  (question.type === "multiple-choice" && !selectedOption) ||
                  ((question.type === "translate" ||
                    question.type === "speak") &&
                    !inputVal)
                }
                size="lg"
              >
                Check Answer
              </Button>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    status === "correct" ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                >
                  {status === "correct" ? (
                    <Check className="text-white" size={24} />
                  ) : (
                    <X className="text-white" size={24} />
                  )}
                </div>
                <div>
                  <h3
                    className={`font-bold text-lg ${
                      status === "correct"
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {status === "correct" ? "Excellent!" : "Incorrect"}
                  </h3>
                  {status === "wrong" && (
                    <p className="text-rose-200 text-sm">
                      Correct answer: {question.correctAnswer}
                    </p>
                  )}
                </div>
              </div>
              <Button
                onClick={handleNext}
                variant={status === "correct" ? "primary" : "danger"}
              >
                Continue
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. MAIN APP
// ==========================================

export default function GermanLearningApp() {
  const [activeTab, setActiveTab] = useState<
    "learn" | "practice" | "leaderboard" | "profile"
  >("learn");
  const [stats, setStats] = useState<UserStats>(MOCK_STATS);
  const [activeUnitId, setActiveUnitId] = useState<string>(UNITS[0].id);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [xpGained, setXpGained] = useState(0);

  // Lesson Completion Handler
  const completeLesson = (xp: number) => {
    setXpGained(xp);
    // Simulate updating backend
    setStats((prev) => ({
      ...prev,
      xp: prev.xp + xp,
      crowns: prev.crowns + 1,
    }));
    // Close modal after delay or show summary screen
    setTimeout(() => {
      setActiveLesson(null);
      setXpGained(0);
    }, 2000);
  };

  return (
    <div className="flex min-h-screen bg-[#09090b] text-slate-100 font-sans">
      {/* --- SIDEBAR --- */}
      <nav className="w-20 md:w-64 border-r border-slate-800 p-4 flex flex-col fixed h-full bg-[#0c0c0e] z-10 hidden md:flex">
        <div className="mb-8 px-4 flex items-center gap-3 text-emerald-500">
          <Globe size={32} />
          <span className="text-2xl font-bold tracking-tight hidden md:block">
            Deutsch<span className="text-white">Go</span>
          </span>
        </div>

        <div className="space-y-2 flex-1">
          {[
            { id: "learn", label: "Learn", icon: Home },
            { id: "practice", label: "Practice", icon: Brain },
            { id: "leaderboard", label: "Leaderboard", icon: Trophy },
            { id: "profile", label: "Profile", icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold uppercase tracking-wide text-xs md:text-sm ${
                activeTab === item.id
                  ? "bg-indigo-500/10 text-indigo-400 border-2 border-indigo-500/50"
                  : "text-slate-400 hover:bg-slate-800 border-2 border-transparent"
              }`}
            >
              <item.icon size={20} />
              <span className="hidden md:block">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* --- MOBILE NAV (Bottom) --- */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#0c0c0e] border-t border-slate-800 z-50 flex justify-around p-3">
        <button
          onClick={() => setActiveTab("learn")}
          className={
            activeTab === "learn" ? "text-emerald-500" : "text-slate-500"
          }
        >
          <Home />
        </button>
        <button
          onClick={() => setActiveTab("practice")}
          className={
            activeTab === "practice" ? "text-emerald-500" : "text-slate-500"
          }
        >
          <Brain />
        </button>
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={
            activeTab === "leaderboard" ? "text-emerald-500" : "text-slate-500"
          }
        >
          <Trophy />
        </button>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 md:pl-64">
        {/* Top Header (Stats) */}
        <header className="sticky top-0 bg-[#09090b]/90 backdrop-blur-md border-b border-slate-800 p-4 z-40 flex justify-between items-center md:px-8">
          <div className="md:hidden font-bold text-emerald-500">DeutschGo</div>
          <div className="flex items-center gap-4 md:gap-8 mx-auto md:mx-0">
            <div className="flex items-center gap-2 text-slate-400">
              <img
                src="https://flagcdn.com/w40/de.png"
                className="w-6 h-4 rounded-sm"
                alt="German"
              />
            </div>
            <div className="flex items-center gap-2 text-orange-500 font-bold">
              <Flame size={20} fill="currentColor" /> {stats.streak}
            </div>
            <div className="flex items-center gap-2 text-yellow-500 font-bold">
              <Star size={20} fill="currentColor" /> {stats.xp}
            </div>
          </div>
        </header>

        {/* View Router */}
        <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24">
          {/* 1. LEARN VIEW */}
          {activeTab === "learn" && (
            <div className="space-y-8">
              {UNITS.map((unit) => (
                <div key={unit.id} className="relative">
                  {/* Unit Header */}
                  <div
                    className={`${unit.color} rounded-2xl p-4 md:p-6 mb-6 text-white shadow-lg flex justify-between items-center`}
                  >
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold mb-1">
                        {unit.title}
                      </h2>
                      <p className="opacity-90">
                        {unit.lessons.length} Lessons
                      </p>
                    </div>
                    <BookOpen size={32} className="opacity-50" />
                  </div>

                  {/* Lessons Path */}
                  <div className="flex flex-col items-center gap-6">
                    {unit.lessons.map((lesson, idx) => (
                      <div key={lesson.id} className="relative group">
                        <button
                          disabled={lesson.locked}
                          onClick={() =>
                            !lesson.locked && setActiveLesson(lesson)
                          }
                          className={`w-20 h-20 rounded-full flex items-center justify-center border-b-4 transition-transform active:translate-y-1 relative z-10 ${
                            lesson.locked
                              ? "bg-slate-800 border-slate-700 text-slate-600"
                              : lesson.completed
                              ? "bg-emerald-500 border-emerald-600 text-white"
                              : "bg-indigo-500 border-indigo-600 text-white"
                          }`}
                        >
                          {lesson.completed ? (
                            <Check size={32} strokeWidth={3} />
                          ) : lesson.locked ? (
                            <Brain size={32} />
                          ) : (
                            <Star size={32} fill="currentColor" />
                          )}
                        </button>

                        {/* Title Tooltip */}
                        <div className="absolute top-2 left-24 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 w-48 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity">
                          <h3 className="font-bold text-sm text-white">
                            {lesson.title}
                          </h3>
                          <p className="text-xs text-slate-400">
                            {lesson.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. PRACTICE VIEW (Flashcards) */}
          {activeTab === "practice" && (
            <div className="max-w-xl mx-auto">
              <h1 className="text-2xl font-bold text-white mb-6">
                Vocabulary Review
              </h1>
              <div className="grid gap-4">
                {VOCABULARY.map((card, i) => (
                  <FlashCard
                    key={i}
                    de={card.de}
                    en={card.en}
                    type={card.type}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 3. LEADERBOARD VIEW */}
          {activeTab === "leaderboard" && (
            <div className="max-w-xl mx-auto bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white">Diamond League</h2>
              </div>
              {[
                { name: "Hans", xp: 1450, avatar: "bg-blue-500" },
                {
                  name: "You",
                  xp: stats.xp,
                  avatar: "bg-emerald-500",
                  active: true,
                },
                { name: "Maria", xp: 980, avatar: "bg-purple-500" },
                { name: "Thomas", xp: 850, avatar: "bg-orange-500" },
              ].map((user, i) => (
                <div
                  key={user.name}
                  className={`flex items-center p-4 hover:bg-white/5 ${
                    user.active ? "bg-slate-800/50" : ""
                  }`}
                >
                  <div className="w-8 font-bold text-slate-500">{i + 1}</div>
                  <div
                    className={`w-10 h-10 rounded-full ${user.avatar} flex items-center justify-center font-bold text-white mr-4`}
                  >
                    {user.name[0]}
                  </div>
                  <div className="flex-1 font-bold text-slate-200">
                    {user.name}
                  </div>
                  <div className="font-mono text-slate-400">{user.xp} XP</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* --- QUIZ OVERLAY --- */}
      <AnimatePresence>
        {activeLesson && (
          <QuizModal
            lesson={activeLesson}
            onClose={() => setActiveLesson(null)}
            onComplete={completeLesson}
          />
        )}
      </AnimatePresence>

      {/* --- XP REWARD OVERLAY --- */}
      <AnimatePresence>
        {xpGained > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-slate-900 border-2 border-yellow-500 p-8 rounded-3xl flex flex-col items-center shadow-2xl shadow-yellow-500/20">
              <Star
                size={64}
                className="text-yellow-500 mb-4 animate-spin-slow"
                fill="currentColor"
              />
              <h2 className="text-3xl font-bold text-yellow-500">
                +{xpGained} XP
              </h2>
              <p className="text-slate-400 mt-2">Lesson Complete!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Helper Component: Flashcard ---
const FlashCard = ({
  de,
  en,
  type,
}: {
  de: string;
  en: string;
  type: string;
}) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      onClick={() => setFlipped(!flipped)}
      className="h-32 w-full perspective-1000 cursor-pointer group"
    >
      <motion.div
        className="relative w-full h-full text-center transition-all duration-500 transform-style-3d"
        animate={{ rotateX: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Front */}
        <div className="absolute inset-0 bg-slate-800 border-2 border-slate-700 rounded-xl flex items-center justify-between px-6 backface-hidden shadow-lg group-hover:border-indigo-500/50">
          <div className="text-left">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1 block">
              {type}
            </span>
            <h3 className="text-xl font-bold text-white">{de}</h3>
          </div>
          <RotateCcw size={16} className="text-slate-600" />
        </div>

        {/* Back */}
        <div className="absolute inset-0 bg-indigo-900 border-2 border-indigo-500 rounded-xl flex items-center justify-center px-6 backface-hidden shadow-lg rotate-x-180">
          <h3 className="text-xl font-bold text-indigo-100">{en}</h3>
        </div>
      </motion.div>
    </div>
  );
};
