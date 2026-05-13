import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, NavLink, Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import CodeEditor from "./Pages/CodeEditor";
import CreatePostPage from "./Pages/CreatePostPage";
import DashboardPage from "./Pages/DashboardPage";
import HomePage from "./Pages/HomePage";
import LoginPage from "./Pages/LoginPage";
import OtherUserProfilePage from "./Pages/OtherUserProfilePage";
import PremiumPage from "./Pages/PremiumPage";
import ProfilePage from "./Pages/ProfilePage";
import RegisterPage from "./Pages/RegisterPage";
import SinglePostPage from "./Pages/SinglePostPage";
import axios from "./services/api";
import { buyrazorpay } from "./services/paymentService";

const TAGS = ["Web", "Devtools", "Product", "Design", "API", "UX", "AI", "Frontend", "Backend"];
function AppIcon({ type, className = "h-4 w-4" }) {
  if (type === "home") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 10.5L12 3l9 7.5" />
        <path d="M6 10v10h12V10" />
      </svg>
    );
  }

  if (type === "spark") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3l2.4 5.6L20 11l-5.6 2.4L12 19l-2.4-5.6L4 11l5.6-2.4L12 3z" />
      </svg>
    );
  }

  if (type === "grid") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    );
  }

  if (type === "search") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-4-4" />
      </svg>
    );
  }

  if (type === "plus") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 4v16" />
      <path d="M4 12h16" />
    </svg>
  );
}

function Brand() {
  return (
    <Link to="/" className="inline-flex items-center gap-2 ">
      <span className="signal-dot" />
      <span className="font-display text-2xl font-bold text-zinc-100">{"</StackLoop>"}</span>
    </Link >
  );
}




function MainRoutes({ search, setSearch, searchpost, setSearchpost }) {
  
  return (
    <Routes>
      <Route path="/" element={<HomePage search={search} setSearch={setSearch} searchpost={searchpost} setSearchpost={setSearchpost} />} />
      <Route path="/post/:id" element={<SinglePostPage />} />
      <Route path="/user/:id" element={<OtherUserProfilePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/premium" element={<PremiumPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/create-post" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/codeeditor" element={<CodeEditor/>} />
    </Routes>
  );
}

function TopHeader({ search, setSearch, searchpost, setSearchpost }) {
  const { token, user } = useSelector((state) => state.auth);

const handlechange=async (e)=>{
  setSearch(e.target.value);
  if(e.target.value.trim()===""){
    setSearchpost([]);
    return;
  }
const response=await axios.get(`/auth/v1/v2/search?query=${e.target.value}`);  
setSearchpost(response.data);

console.log(response.data); 
} 

  const navItems = [
    { to: "/", label: "Feed", icon: "home", end: true },
    { to: "/dashboard", label: "Studio", icon: "grid" },
    { to: "/premium", label: "Pro", icon: "spark" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="layout-container">
        <div className="flex h-16 items-center justify-between gap-4">
          <Brand />

          <nav className="hidden items-center gap-1 rounded-2xl border border-white/10 bg-zinc-950/80 p-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${isActive ? "bg-brand-500 text-white shadow-[0_0_0_1px_rgba(239,68,68,0.25)]" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                  }`
                }
              >
                <AppIcon type={item.icon} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden min-w-[280px] flex-1 lg:flex lg:justify-center">
            <div className="relative w-full max-w-md">
              <AppIcon type="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input name="search" className="command-input pl-10" placeholder="Search people, posts, snippets" onChange={handlechange} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {token ? (
              <>
                <Link to="/create-post" className="hidden rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm font-semibold text-zinc-200 transition-all duration-200 hover:-translate-y-px hover:border-white/20 sm:inline-flex">
                  <AppIcon type="plus" className="mr-1 h-4 w-4" />
                  New
                </Link>
                <button
                  onClick={buyrazorpay}
                  className="hidden rounded-xl border border-brand-300/25 bg-brand-300/10 px-3 py-2 text-sm font-semibold text-brand-200 transition-all duration-200 hover:-translate-y-px hover:bg-brand-300/20 lg:inline-flex"
                >
                  Upgrade
                </button>
                <NavLink
                  to="/profile"
                  className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm font-bold uppercase tracking-wide text-zinc-100 transition-all duration-200 hover:-translate-y-px hover:border-white/20"
                >
                  {(user?.username || user?.name || "U").slice(0, 2)}
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/login" className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-300 transition-all duration-200 hover:border-white/20 hover:text-zinc-100">
                  Sign in
                </NavLink>
                <NavLink to="/register" className="rounded-xl bg-brand-500 px-3 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-brand-400 active:scale-[0.98]">
                  Join
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function LeftRail() {
  const links = [
    { to: "/", label: "Home", note: "Latest activity" },
    { to: "/dashboard", label: "Studio", note: "Your creator panel" },
    { to: "/premium", label: "Premium", note: "Members content" },
  ];

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-24 space-y-4">
        <div className="surface-card p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-zinc-500">Navigation</p>
          <div className="space-y-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `block rounded-2xl border px-3 py-3 transition-colors ${isActive
                    ? "border-brand-300/40 bg-brand-300/10"
                    : "border-white/10 bg-black hover:border-white/20"
                  }`
                }
              >
                <p className="text-sm font-semibold text-zinc-100">{link.label}</p>
                <p className="text-xs text-zinc-500">{link.note}</p>
              </NavLink>
            ))}
          </div>
        </div>

        <div className="surface-card p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-zinc-500">Command Hints</p>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>Press `/` to focus search</li>
            <li>Use filters in feed</li>
            <li>Draft first, publish later</li>
          </ul>
        </div>
      </div>
    </aside>
  );
}

function RightRail() {
const [user,setuser]=useState([]);
useEffect(()=>{
  
  const fetchRecentUsers=async()=>{
    try{
      const response=await axios.get("/auth/recentuser");
      setuser(response.data.user);
    }
    catch(err){
      console.log("Error fetching recent users:", err);
    }
  }
  fetchRecentUsers();
},[])    



  return (
    <aside className="hidden 2xl:block">
      <div className="sticky top-24 space-y-4">
        <div className="surface-card p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-zinc-500">Trending Tags</p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <button key={tag} className="rounded-full border border-white/10 bg-black px-3 py-1 text-xs text-zinc-400 transition-all duration-200 hover:-translate-y-px hover:border-brand-300/35 hover:text-brand-200">
                #{tag}
              </button>
            ))}
          </div>
        </div>

        <div className="surface-card p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-zinc-500">New Creators</p>
          {user.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/10 bg-black/70 px-3 py-2 text-sm text-zinc-500">
              No new creators yet.
            </p>
          ) : (
            <div className="space-y-2">
              {user.map((creator) => {
                const displayName =
                  (creator.username || creator.name || "").trim() ||
                  "Unknown User";
                const initials = displayName.slice(0, 1).toUpperCase();

                return (
                  <div key={creator._id} className="flex items-start gap-2 rounded-xl border border-white/10 bg-black/90 px-3 py-2.5 transition-colors duration-200 hover:border-white/20">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-zinc-900 text-xs font-semibold text-zinc-200">
                      {initials}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="break-all text-sm font-medium leading-snug text-zinc-200">
                        {displayName}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/10 bg-zinc-900 text-xs text-zinc-500 transition-all duration-200 hover:border-brand-300/35 hover:text-brand-200 active:scale-[0.96]"
                      aria-label={`Follow ${displayName}`}
                    >
                      +
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function AppLayout() {

  const location = useLocation();
  const isAuthPage = ["/login", "/register"].includes(location.pathname);
  const [search, setsearch] = useState("");
  const [searchpost, setSearchpost] = useState([]);
  console.log(searchpost);

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-black text-zinc-100">
        <main className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-12">
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-40 [background:radial-gradient(circle_at_15%_20%,rgba(239,68,68,0.22),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(127,29,29,0.24),transparent_30%)]" />
          <MainRoutes search={search} setSearch={setsearch}  searchpost={searchpost} setSearchpost={setSearchpost} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <TopHeader search={search} setSearch={setsearch} searchpost={searchpost} setSearchpost={setSearchpost} />
      <div className="layout-container py-6">
        <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)] 2xl:grid-cols-[240px_minmax(0,1fr)_300px]">
          <LeftRail />
          <main className="min-w-0">
            <MainRoutes search={search} setSearch={setsearch}  searchpost={searchpost} setSearchpost={setSearchpost} />
          </main>
          <RightRail />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
