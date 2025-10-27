import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ViewType = 'login' | 'home' | 'documents' | 'whiteboard' | 'tasks' | 'chat' | 'video';

interface User {
  name: string;
  email: string;
}

interface Document {
  id: number;
  name: string;
  content: string;
}

interface Task {
  id: number;
  title: string;
  column: 'todo' | 'inprogress' | 'done';
}

interface Message {
  text: string;
  user: 'me' | 'other';
}

interface Tool {
  type: 'pencil' | 'eraser';
}

const App: React.FC = () => {
  // Global states
  const [currentView, setCurrentView] = useState<ViewType>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Module-specific states
  // Documents
  const [docs, setDocs] = useState<Document[]>([
    { id: 1, name: 'Project Proposal', content: '<p>Start editing here...</p>' },
    { id: 2, name: 'Meeting Notes', content: '<p>Collaborate in real-time.</p>' },
  ]);
  const [selectedDoc, setSelectedDoc] = useState(1);
  const docRef = useRef<HTMLDivElement>(null);

  // Whiteboard
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool>({ type: 'pencil' });
  const [color, setColor] = useState('#1F2937');
  const [lineWidth, setLineWidth] = useState(2);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  // Tasks
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Design UI Mockups', column: 'todo' },
    { id: 2, title: 'Review Code', column: 'todo' },
    { id: 3, title: 'Deploy Update', column: 'inprogress' },
    { id: 4, title: 'Write Report', column: 'done' },
  ]);

  // Chat
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Welcome to the team chat!', user: 'other' },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const randomPhrases = [
    "Great progress on the project!",
    "Let's schedule a quick sync.",
    "Updated the timeline—check it out.",
    "Need feedback on this section.",
  ];

  // Video
  const [room, setRoom] = useState('');
  const [inCall, setInCall] = useState(false);
  const [muted, setMuted] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [participants, setParticipants] = useState(1);

  // Persistence with localStorage
  useEffect(() => {
    const savedAuth = localStorage.getItem('isAuthenticated');
    const savedUser = localStorage.getItem('user');
    const savedDocs = localStorage.getItem('docs');
    const savedTasks = localStorage.getItem('tasks');
    const savedMessages = localStorage.getItem('messages');

    if (savedAuth === 'true' && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
      setCurrentView('home');
    }

    if (savedDocs) setDocs(JSON.parse(savedDocs));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedMessages) setMessages(JSON.parse(savedMessages));
  }, []);

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated.toString());
    if (user) localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('docs', JSON.stringify(docs));
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('messages', JSON.stringify(messages));
  }, [isAuthenticated, user, docs, tasks, messages]);

  // Simulate real-time collaboration (multi-user feel without backend)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (currentView === 'chat') {
      interval = setInterval(() => {
        const randomPhrase = randomPhrases[Math.floor(Math.random() * randomPhrases.length)];
        setMessages((prev) => [
          ...prev,
          { text: randomPhrase, user: 'other' as const },
        ]);
      }, 5000);
    }

    if (currentView === 'documents' && docRef.current) {
      interval = setInterval(() => {
        docRef.current!.innerHTML += '<p><strong>Collaborator added:</strong> New insights from team member. Reviewing now.</p>';
        // Trigger state update
        const event = new Event('input', { bubbles: true });
        docRef.current!.dispatchEvent(event);
      }, 10000);
    }

    if (currentView === 'tasks') {
      interval = setInterval(() => {
        setTasks((prev) => {
          const newTasks = [...prev];
          const idx = Math.floor(Math.random() * newTasks.length);
          const task = newTasks[idx];
          const columns: Task['column'][] = ['todo', 'inprogress', 'done'];
          const currentIdx = columns.indexOf(task.column);
          const nextIdx = (currentIdx + 1) % 3;
          newTasks[idx] = { ...task, column: columns[nextIdx] };
          return newTasks;
        });
      }, 8000);
    }

    if (currentView === 'video' && inCall) {
      interval = setInterval(() => {
        setParticipants((prev) => (prev < 4 ? prev + 1 : 1));
      }, 15000);
    }

    return () => clearInterval(interval);
  }, [currentView, inCall]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Documents handlers
  const handleDocChange = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerHTML;
    setDocs((prev) =>
      prev.map((d) => (d.id === selectedDoc ? { ...d, content: newContent } : d))
    );
  }, [selectedDoc]);

  const addNewDoc = () => {
    const newId = docs.length + 1;
    setDocs([...docs, { id: newId, name: `New Document ${newId}`, content: '<p>Start typing...</p>' }]);
    setSelectedDoc(newId);
  };

  // Whiteboard handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (context) {
      setCtx(context);
      // Responsive sizing
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }

      // Tool setup
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      if (currentTool.type === 'eraser') {
        context.globalCompositeOperation = 'destination-out';
        context.lineWidth = 20;
      } else {
        context.globalCompositeOperation = 'source-over';
      }
    }
  }, [color, lineWidth, currentTool]);

  const getMousePos = useCallback((e: MouseEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ctx) return;

    const startDrawing = (e: MouseEvent) => {
      const pos = getMousePos(e, canvas);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      setIsDrawing(true);
    };

    const draw = (e: MouseEvent) => {
      if (!isDrawing) return;
      const pos = getMousePos(e, canvas);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const stopDrawing = () => {
      setIsDrawing(false);
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch support for mobile
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      canvas.dispatchEvent(mouseEvent);
    });
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      canvas.dispatchEvent(mouseEvent);
    });
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      const mouseEvent = new MouseEvent('mouseup', {});
      canvas.dispatchEvent(mouseEvent);
    });

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing as any);
      canvas.removeEventListener('touchmove', draw as any);
      canvas.removeEventListener('touchend', stopDrawing as any);
    };
  }, [isDrawing, ctx, getMousePos]);

  const clearCanvas = () => {
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const exportCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'whiteboard-export.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  // Tasks handlers (native drag-drop)
  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData('taskId', taskId.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newColumn: Task['column']) => {
    e.preventDefault();
    const taskIdString = e.dataTransfer.getData('taskId');
    const taskId = parseInt(taskIdString);
    if (!isNaN(taskId)) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, column: newColumn } : t))
      );
    }
  };

  const addTask = () => {
    const newId = tasks.length + 1;
    setTasks([...tasks, { id: newId, title: `New Task ${newId}`, column: 'todo' as const }]);
  };

  // Chat handlers
  const sendMessage = () => {
    if (input.trim()) {
      setMessages((prev) => [...prev, { text: input, user: 'me' as const }]);
      setInput('');
    }
  };

  // Video handlers (mock with state, stub for real media)
  const joinCall = async () => {
    if (room.trim()) {
      setInCall(true);
      // Stub for real WebRTC: Request media (logs to console for demo)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        console.log('Local stream acquired:', stream); // In real app, attach to <video> ref
      } catch (err) {
        console.error('Media access denied:', err);
      }
    }
  };

  const endCall = () => {
    setInCall(false);
    setRoom('');
    setParticipants(1);
  };

  const toggleMute = () => {
    setMuted(!muted);
    console.log('Mic toggled:', !muted); // Simulate audio track enable/disable
  };

  const toggleVideo = () => {
    setVideoEnabled(!videoEnabled);
    console.log('Video toggled:', !videoEnabled);
  };

  // Logout
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setCurrentView('login' as ViewType);
    setShowDropdown(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
  };

  // Login Component
  const Login: React.FC<{ onLogin: (u: User) => void }> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (email && password) {
        // Fake auth success
        onLogin({ name: 'Alex Rivera', email });
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          <div className="p-8 sm:p-10">
            <div className="mx-auto mb-8 max-w-md text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Collaboration Suite</h1>
              <p className="mt-4 text-base text-gray-600">Securely access your team's workspace.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-6 py-4 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Sign In
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  if (!isAuthenticated) {
    return <Login onLogin={(u) => { setUser(u); setIsAuthenticated(true); }} />;
  }

  // Main Layout Components
  const Header: React.FC = () => (
    <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm backdrop-blur supports-backdrop-blur:bg-white/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-900">Collaboration Suite</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents, tasks..."
                className="block w-64 rounded-full border border-gray-300 bg-white px-4 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400">
                <span className="text-lg">🔍</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => alert('Notifications: 3 new messages!')}
            className="relative p-2 text-gray-500 transition-colors hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span className="text-xl">🔔</span>
            <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-red-500" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 rounded-full bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600" />
              <span>{user?.name}</span>
              <span className="text-lg">▼</span>
            </button>

            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg ring-1 ring-black/5 backdrop-blur"
              >
                <div className="py-1">
                  <button
                    onClick={() => alert('Profile settings opened')}
                    className="w-full px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Profile
                  </button>
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  );

  const Sidebar: React.FC<{ currentView: ViewType; onViewChange: (view: ViewType) => void }> = ({ currentView, onViewChange }) => {
    const navItems = [
      { view: 'home' as ViewType, label: 'Dashboard', icon: '📊' },
      { view: 'documents' as ViewType, label: 'Documents', icon: '📝' },
      { view: 'whiteboard' as ViewType, label: 'Whiteboard', icon: '🖊️' },
      { view: 'tasks' as ViewType, label: 'Tasks', icon: '📋' },
      { view: 'chat' as ViewType, label: 'Chat', icon: '💬' },
      { view: 'video' as ViewType, label: 'Video', icon: '📹' },
    ] as const;

    return (
      <aside className="border-r border-gray-200 bg-white shadow-sm">
        <nav className="flex h-full flex-col space-y-2 p-4 pt-20">
          {navItems.map((item) => (
            <motion.button
              key={item.view}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onViewChange(item.view)}
              className={`flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 ease-in-out ${
                currentView === item.view
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </motion.button>
          ))}
        </nav>
      </aside>
    );
  };

  // View Components
  const HomeView: React.FC = () => {
    const activeTasks = tasks.filter((t) => t.column !== 'done').length;
    const unreadMessages = messages.filter((m) => m.user === 'other').length;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8 p-4 sm:p-6"
      >
        <div className="flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}</h2>
            <p className="text-lg text-gray-600">Here's what's happening with your team today.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 font-semibold text-white transition-all hover:from-blue-700 hover:to-indigo-700"
          >
            Create New Project
          </motion.button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-xl font-bold text-white">📋</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{activeTasks}</span>
            </div>
            <h3 className="mt-4 font-semibold text-gray-900">Active Tasks</h3>
            <p className="text-sm text-gray-600">Team productivity at a glance.</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <span className="text-xl font-bold text-white">💬</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{unreadMessages}</span>
            </div>
            <h3 className="mt-4 font-semibold text-gray-900">Unread Messages</h3>
            <p className="text-sm text-gray-600">Stay connected with your team.</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:col-span-2 lg:col-span-1"
          >
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <span className="text-xl font-bold text-white">📹</span>
              </div>
              <span className="text-2xl font-bold text-purple-600">2</span>
            </div>
            <h3 className="mt-4 font-semibold text-gray-900">Upcoming Meetings</h3>
            <p className="text-sm text-gray-600">Scheduled video conferences.</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100"
          >
            <h3 className="mb-6 text-xl font-semibold text-gray-900">Recent Activity</h3>
            <ul className="space-y-4">
              <motion.li
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center space-x-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 p-4 transition-colors hover:from-gray-100 hover:to-gray-200"
              >
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="flex-1 font-medium text-gray-900">Document updated by team member</span>
                <span className="text-sm text-gray-500">2 min ago</span>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-100 p-4 transition-colors hover:from-blue-100 hover:to-indigo-200"
              >
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="flex-1 font-medium text-gray-900">Task moved to In Progress</span>
                <span className="text-sm text-gray-500">5 min ago</span>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center space-x-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-100 p-4 transition-colors hover:from-green-100 hover:to-emerald-200"
              >
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="flex-1 font-medium text-gray-900">New message in #general</span>
                <span className="text-sm text-gray-500">10 min ago</span>
              </motion.li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl bg-gradient-to-br from-slate-50 to-gray-100 p-6 shadow-sm ring-1 ring-gray-100"
          >
            <h3 className="mb-4 text-xl font-semibold text-gray-900">Quick Actions</h3>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="w-full rounded-xl bg-white px-4 py-3 text-left font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Start a Video Call
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="w-full rounded-xl bg-white px-4 py-3 text-left font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Add New Task
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  const DocumentsView: React.FC = () => (
    <div className="flex h-full flex-col overflow-hidden bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Real-Time Documents</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={addNewDoc}
            className="rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-2.5 font-semibold text-white transition-all hover:from-emerald-700 hover:to-green-700"
          >
            New Document
          </motion.button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Document List */}
        <div className="w-80 flex-shrink-0 border-r border-gray-200 bg-white shadow-sm">
          <div className="p-6">
            <h3 className="mb-4 font-semibold text-gray-900">Your Documents</h3>
            <div className="max-h-[calc(100vh-12rem)] space-y-2 overflow-y-auto">
              {docs.map((doc) => (
                <motion.button
                  key={doc.id}
                  whileHover={{ x: 2 }}
                  onClick={() => setSelectedDoc(doc.id)}
                  className={`w-full rounded-lg p-4 text-left transition-all ${
                    selectedDoc === doc.id
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md'
                      : 'border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  <h4 className="font-medium text-gray-900">{doc.name}</h4>
                  <p className="text-sm text-gray-600">Last edited recently</p>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex flex-1 flex-col overflow-hidden bg-gradient-to-b from-gray-50 to-white">
          <div className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
            <div className="flex items-center space-x-4">
              <h3 className="text-2xl font-bold text-gray-900">{docs.find((d) => d.id === selectedDoc)?.name}</h3>
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white transition-all hover:bg-blue-700"
                onClick={() => console.log('Saving:', docs.find((d) => d.id === selectedDoc)?.content)}
              >
                Save Changes
              </motion.button>
            </div>
          </div>

          <div className="flex flex-1 flex-col overflow-hidden p-6">
            {/* Toolbar */}
            <div className="mb-6 flex space-x-2 rounded-xl bg-white p-2 shadow-sm ring-1 ring-gray-100">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  document.execCommand('bold', false, undefined);
                }}
                className="h-10 w-10 items-center justify-center rounded-lg font-bold text-lg text-gray-700 transition-all hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                B
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  document.execCommand('italic', false, undefined);
                }}
                className="h-10 w-10 items-center justify-center rounded-lg italic text-lg text-gray-700 transition-all hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                I
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  document.execCommand('underline', false, undefined);
                }}
                className="h-10 w-10 items-center justify-center rounded-lg underline text-lg text-gray-700 transition-all hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                U
              </motion.button>
            </div>

            {/* Editor */}
            <div className="relative flex flex-1 overflow-auto rounded-xl bg-white shadow-inner ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-blue-500">
              <div
                ref={docRef}
                contentEditable
                onInput={handleDocChange as any}
                dangerouslySetInnerHTML={{ __html: docs.find((d) => d.id === selectedDoc)?.content || '' }}
                className="h-full min-h-[400px] w-full resize-none overflow-auto rounded-xl p-8 text-base leading-relaxed focus:outline-none"
                suppressContentEditableWarning={true}
              />
              <div className="absolute bottom-4 right-4 rounded-full bg-blue-600 p-3 text-white shadow-lg ring-1 ring-white/20">
                <span className="text-xl">✏️</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const WhiteboardView: React.FC = () => (
    <div className="flex h-full flex-col overflow-hidden bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Collaborative Whiteboard</h2>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setCurrentTool({ type: currentTool.type === 'pencil' ? 'eraser' : 'pencil' })}
              className={`rounded-lg px-4 py-2.5 font-medium transition-all ${
                currentTool.type === 'eraser'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {currentTool.type === 'eraser' ? 'Pencil' : 'Eraser'}
            </motion.button>
            <select
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={1}>Thin</option>
              <option value={3}>Medium</option>
              <option value={8}>Thick</option>
              <option value={15}>Extra Thick</option>
            </select>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-10 cursor-pointer rounded-lg border-0 p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={currentTool.type === 'eraser'}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={clearCanvas}
              className="rounded-lg bg-gradient-to-r from-red-600 to-rose-600 px-6 py-2.5 font-semibold text-white transition-all hover:from-red-700 hover:to-rose-700"
            >
              Clear All
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={exportCanvas}
              className="rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-2.5 font-semibold text-white transition-all hover:from-emerald-700 hover:to-green-700"
            >
              Export PNG
            </motion.button>
          </div>
        </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-white via-gray-50 to-slate-100 p-4">
        <canvas
          ref={canvasRef}
          className="max-h-full max-w-full cursor-crosshair rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200/50 backdrop-blur-sm"
        />
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-white/80 to-transparent p-8 text-center text-gray-500 transition-all">
          <div className="space-y-4">
            <span className="mx-auto block text-6xl">🎨</span>
            <h3 className="text-xl font-semibold text-gray-700">Start Drawing</h3>
            <p className="text-sm">Click and drag to create. Collaborate in real-time with your team.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const TasksView: React.FC = () => {
    const columnLabels = {
      todo: 'To Do',
      inprogress: 'In Progress',
      done: 'Done',
    } as const;

    const columnCounts = {
      todo: tasks.filter((t) => t.column === 'todo').length,
      inprogress: tasks.filter((t) => t.column === 'inprogress').length,
      done: tasks.filter((t) => t.column === 'done').length,
    };

    return (
      <div className="flex h-full flex-col overflow-hidden bg-gray-50">
        <div className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Kanban Task Board</h2>
              <p className="text-sm text-gray-600">Drag tasks between columns to update status. Real-time team updates.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={addTask}
              className="rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-2.5 font-semibold text-white transition-all hover:from-emerald-700 hover:to-green-700"
            >
              + Add Task
            </motion.button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden p-6">
          <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-3 lg:gap-8">
            {(['todo', 'inprogress', 'done'] as Task['column'][]).map((column) => (
              <motion.div
                key={column}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="group relative col-span-1 flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md focus-within:shadow-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-50"
              >
                <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">{columnLabels[column]}</h3>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                      {columnCounts[column]}
                    </span>
                  </div>
                </div>

                <div
                  className="flex flex-1 flex-col overflow-y-auto p-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column)}
                >
                  {tasks
                    .filter((task) => task.column === column)
                    .map((task) => (
                      <motion.div
                        key={task.id}
                        whileHover={{ y: -2, scale: 1.02 }}
                        whileDrag={{ scale: 1.05, zIndex: 10 }}
                        drag
                        dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="group/card mb-4 rounded-xl bg-gradient-to-br from-white to-blue-50 p-4 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md hover:ring-blue-200 cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                      >
                        <h4 className="font-semibold text-gray-900 mb-2">{task.title}</h4>
                        <p className="text-sm text-gray-600">High priority - Assigned to team.</p>
                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                          <span>Due: Tomorrow</span>
                          <div className="flex space-x-1">
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            <span>In Progress</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                  {tasks.filter((t) => t.column === column).length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-1 flex-col items-center justify-center py-8 text-center text-gray-500 transition-all"
                    >
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <span className="text-2xl">📄</span>
                      </div>
                      <h4 className="mb-2 font-medium text-gray-900">No tasks here yet</h4>
                      <p className="text-sm">Drag tasks from other columns or add new ones.</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const ChatView: React.FC = () => (
    <div className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-inner ring-1 ring-gray-200">
      {/* Channels Sidebar */}
      <div className="w-80 flex-shrink-0 border-r border-gray-200 bg-gradient-to-b from-gray-50 to-white shadow-sm">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Channels</h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md transition-all hover:scale-110"
            >
              <span className="text-lg">+</span>
            </motion.button>
          </div>

          <nav className="space-y-2">
            <motion.button
              whileHover={{ x: 4 }}
              className="group w-full rounded-xl p-3 text-left transition-all hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent"
            >
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold">#</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 group-hover:text-blue-600">General</p>
                  <p className="truncate text-xs text-gray-500">Team-wide discussions</p>
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ x: 4 }}
              className="group w-full rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-3 text-left shadow-sm ring-1 ring-blue-200 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent"
            >
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold">#</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-blue-700 group-hover:text-blue-800">Project Alpha</p>
                  <p className="truncate text-xs text-blue-600">Active project chat (12 online)</p>
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ x: 4 }}
              className="group w-full rounded-xl p-3 text-left transition-all hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-transparent"
            >
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold">#</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 group-hover:text-green-600">Design Review</p>
                  <p className="truncate text-xs text-gray-500">UI/UX feedback</p>
                </div>
              </div>
            </motion.button>
          </nav>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex flex-1 flex-col overflow-hidden bg-gradient-to-b from-white via-gray-50 to-slate-50">
        <div className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">#</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Project Alpha</h3>
              <p className="text-sm text-gray-600">12 members, 45 messages today. Real-time updates enabled.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
          <div className="flex flex-col space-y-6 pb-4 md:space-y-8">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex ${message.user === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs rounded-2xl rounded-tr-md p-4 px-4 py-3 shadow-md transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    message.user === 'me'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  <div className="mt-2 flex items-center space-x-2 pt-2 text-xs opacity-75">
                    {message.user === 'me' ? (
                      <span>Just now</span>
                    ) : (
                      <>
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span>Alex Rivera • Just now</span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white px-4 py-4 shadow-lg">
          <div className="flex items-end space-x-4 rounded-2xl bg-gradient-to-r from-gray-50 to-white p-4 shadow-inner ring-1 ring-gray-200/50">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type your message... (Press Enter to send)"
              className="min-h-[44px] flex-1 resize-none rounded-full border-0 bg-transparent p-0 text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              className="h-11 w-11 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="text-xl font-bold">→</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );

  const VideoView: React.FC = () => (
    <div className="flex h-full flex-col space-y-6 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-white/20 backdrop-blur-sm"
      >
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Video Conferencing</h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">Join or start low-latency video calls with screen sharing and real-time collaboration.</p>
        </div>

        {!inCall ? (
          <div className="mx-auto max-w-md space-y-6">
            <div className="relative rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 p-8 text-center">
              <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl">
                <span className="text-4xl font-bold text-white">📹</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">Ready to Connect?</h3>
              <p className="text-gray-600">Enter a room name to start or join a meeting. Supports up to 10 participants.</p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Enter room name (e.g., daily-standup-2024)"
                className="w-full rounded-xl border border-gray-300 px-6 py-4 text-lg placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={joinCall}
                disabled={!room.trim()}
                className="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-4 font-bold text-xl text-white shadow-lg transition-all hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white"
              >
                Join or Start Call
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Video Grid */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {/* Local Video */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative col-span-1 row-span-1 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black p-4 shadow-2xl ring-1 ring-white/20"
              >
                <div className="relative h-64 w-full overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-slate-900">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border-2 border-dashed border-white/30 rounded-xl w-full h-full flex flex-col items-center justify-center text-white/80 backdrop-blur-sm" />
                    <div className="text-center">
                      <span className="text-6xl mb-2 block">👤</span>
                      <p className="text-lg font-semibold">You (Alex Rivera)</p>
                      <p className="text-sm opacity-75">Camera: {videoEnabled ? 'On' : 'Off'}</p>
                    </div>
                  </div>
                </div>

                {/* Self-view PIP */}
                <div className="absolute -bottom-8 -right-4 h-24 w-32 overflow-hidden rounded-xl bg-black/50 ring-2 ring-white/50">
                  <div className="h-full w-full bg-gradient-to-br from-gray-700 to-slate-800 flex items-center justify-center text-white text-sm font-medium">
                    Self View
                  </div>
                </div>
              </motion.div>

              {/* Remote Participants */}
              {Array.from({ length: participants - 1 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="group relative col-span-1 row-span-1 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black p-4 shadow-2xl ring-1 ring-white/20 transition-all hover:scale-105 hover:shadow-3xl"
                >
                  <div className="relative h-64 w-full overflow-hidden rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-2 border-dashed border-white/30 rounded-xl w-full h-full flex flex-col items-center justify-center text-white/80 backdrop-blur-sm animate-pulse" />
                  <div className="text-center z-10 drop-shadow-lg">
                    <span className="text-5xl mb-2 block animate-bounce">👥</span>
                    <p className="text-lg font-semibold">Participant {i + 1}</p>
                    <p className="text-sm opacity-75">Connected • HD Video</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center space-y-6 rounded-2xl bg-white/80 p-6 backdrop-blur-sm shadow-2xl ring-1 ring-white/20">
              <div className="flex items-center space-x-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleMute}
                  className={`h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    muted
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {muted ? '🔇' : '🎤'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleVideo}
                  className={`h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    !videoEnabled
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {videoEnabled ? '📹' : '📴'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="h-16 w-16 rounded-full bg-gradient-to-r from-yellow-600 to-amber-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg transition-all hover:from-yellow-700 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                >
                  🖥️
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={endCall}
                  className="h-16 w-16 rounded-full bg-gradient-to-r from-red-600 to-rose-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg transition-all hover:from-red-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  📞
                </motion.button>
              </div>

              <div className="text-center text-sm text-gray-600 space-y-2">
                <p>Participants: {participants}</p>
                <p>Room: <span className="font-mono font-semibold text-blue-700">{room}</span></p>
                <p className="text-xs">High-quality video • Low latency • Secure P2P</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans antialiased">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />

        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-white p-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, x: currentView === 'login' ? 0 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="h-full"
            >
              {currentView === 'home' && <HomeView />}
              {currentView === 'documents' && <DocumentsView />}
              {currentView === 'whiteboard' && <WhiteboardView />}
              {currentView === 'tasks' && <TasksView />}
              {currentView === 'chat' && <ChatView />}
              {currentView === 'video' && <VideoView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default App;