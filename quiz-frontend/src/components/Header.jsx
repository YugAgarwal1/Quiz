import { useState } from 'react';
import logo from "../images/logo.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faBook,
  faCog,
  faShieldHalved,
  faSignOutAlt,
  faSignInAlt,
  faUserPlus,
  faBars,
  faKey,
  faGraduationCap,
  faUser,
  faSlidersH
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Header({ activePage }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSemDropdownOpen, setIsSemDropdownOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

    const {
        user,
        isAuthenticated,
        isAdmin,
        semesters,
        currentSemester,
        selectSemester,
        logout,
        openAuthModal
    } = useAuth();
    
    const navigate = useNavigate();
    const location = useLocation();

    // The 4 Core Navigation Items
    const navItems = [
        { id: 'home', label: 'Home', loc: '', icon: faHome },
        { id: 'practise', label: 'Practise', loc: 'practise', icon: faBook },
        { id: 'customized', label: 'Customized', loc: 'customized', icon: faSlidersH },
        { id: 'apply-code', label: 'Apply Code', loc: 'apply-code', icon: faKey }
    ];

    // Determine currently active navigation id based on path
    const getActiveId = () => {
        const path = (location.pathname || '').toLowerCase();
        if (path.startsWith('/practise')) return 'practise';
        if (path.startsWith('/customized')) return 'customized';
        if (path.startsWith('/apply-code')) return 'apply-code';
        if (path === '/' || path === '') return 'home';
        return activePage || 'home';
    };

    const currentActiveId = getActiveId();

    const handleNavClick = (item) => {
        navigate(`/${item.loc}`);
    };

    return (
        <>
            <header>
                <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 lg:px-8 py-3 fixed top-0 w-full z-40 shadow-xs">
                    {/* TOP BAR */}
                    <div className="flex justify-between items-center mx-auto max-w-7xl">
                        {/* LEFT: Logo */}
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); navigate('/'); }}
                            className="flex items-center gap-2"
                        >
                            <img src={logo} className="h-7 sm:h-9" alt="Quiz Bird Logo" />
                            <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                                Quiz Bird
                            </span>
                        </a>

                        {/* CENTER: Nav Items (Desktop Only - Authenticated Users) */}
                        {isAuthenticated && (
                            <ul className="hidden lg:flex space-x-6">
                                {navItems.map((item) => (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => handleNavClick(item)}
                                            className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                                                currentActiveId === item.id
                                                    ? "bg-red-500 text-white shadow-xs"
                                                    : "text-gray-600 hover:text-red-500 hover:bg-red-50/50"
                                            }`}
                                        >
                                            {item.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* RIGHT: Semester Selector + User / Auth + Mobile Hamburger */}
                        <div className="flex items-center space-x-3">
                            {/* SEM DROPDOWN: Admins can switch; Students have their assigned semester displayed */}
                            {isAuthenticated && (
                                <div className="relative hidden sm:block">
                                    {isAdmin ? (
                                        <>
                                            <button
                                                onClick={() => setIsSemDropdownOpen(!isSemDropdownOpen)}
                                                className="text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                                                title="Admin: Switch active viewing semester"
                                            >
                                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                {currentSemester?.name || 'Select Sem'}
                                                <span className="text-[10px] text-gray-400">▼</span>
                                            </button>

                                            {isSemDropdownOpen && (
                                                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50 animate-fade-in">
                                                    <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                                                        Admin: Switch Sem
                                                    </div>
                                                    {semesters.map((sem) => (
                                                        <div
                                                            key={sem.id}
                                                            onClick={() => {
                                                                selectSemester(sem);
                                                                setIsSemDropdownOpen(false);
                                                            }}
                                                            className={`px-3 py-2 text-xs font-semibold hover:bg-red-50 hover:text-red-600 cursor-pointer flex justify-between items-center ${
                                                                currentSemester?.id === sem.id ? 'text-red-600 font-bold bg-red-50/50' : 'text-gray-700'
                                                            }`}
                                                        >
                                                            <span>{sem.name}</span>
                                                            <span className="text-[10px] text-gray-400 font-normal">{sem.subjects_count || 0} subs</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div
                                            className="text-gray-700 bg-red-50/70 border border-red-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                                            title={`Enrolled Semester: ${currentSemester?.name || 'Sem VI'}`}
                                        >
                                            <FontAwesomeIcon icon={faGraduationCap} className="text-red-500 text-sm" />
                                            <span>{currentSemester?.name || 'Sem VI'}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* AUTH SECTION */}
                            {isAuthenticated ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                        className="flex items-center gap-2 p-1 pl-2.5 pr-3 rounded-full bg-gray-100 hover:bg-gray-200 transition cursor-pointer border border-gray-200"
                                    >
                                        {user?.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt="Avatar"
                                                className="w-6 h-6 rounded-full object-cover border border-red-400"
                                            />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-xs">
                                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                        )}
                                        <span className="text-xs font-bold text-gray-800 max-w-[100px] truncate hidden md:inline">
                                            {user?.name || 'Account'}
                                        </span>
                                    </button>

                                    {isUserDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-fade-in">
                                            <div className="px-4 py-2 border-b border-gray-100">
                                                <p className="text-xs font-bold text-gray-900 truncate">{user?.name}</p>
                                                <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                                                <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                                    isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                    {user?.role?.toUpperCase()}
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setIsUserDropdownOpen(false);
                                                    navigate('/profile');
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-800 hover:bg-red-50 hover:text-red-600 flex items-center gap-2 transition cursor-pointer"
                                            >
                                                <FontAwesomeIcon icon={faUser} /> My Profile & Sem
                                            </button>

                                            {isAdmin && (
                                                <button
                                                    onClick={() => {
                                                        setIsUserDropdownOpen(false);
                                                        navigate('/admin');
                                                    }}
                                                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition cursor-pointer"
                                                >
                                                    <FontAwesomeIcon icon={faShieldHalved} /> Admin Portal
                                                </button>
                                            )}

                                            <button
                                                onClick={() => {
                                                    setIsUserDropdownOpen(false);
                                                    navigate('/');
                                                }}
                                                className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition cursor-pointer"
                                            >
                                                <FontAwesomeIcon icon={faHome} /> Student Dashboard
                                            </button>

                                            <div className="border-t border-gray-100 my-1"></div>

                                            <button
                                                onClick={() => {
                                                    setIsUserDropdownOpen(false);
                                                    logout();
                                                    navigate('/');
                                                }}
                                                className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 transition cursor-pointer"
                                            >
                                                <FontAwesomeIcon icon={faSignOutAlt} /> Log Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openAuthModal('login')}
                                        className="px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:text-red-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                                    >
                                        <FontAwesomeIcon icon={faSignInAlt} /> Sign In
                                    </button>
                                    <button
                                        onClick={() => openAuthModal('register')}
                                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                                    >
                                        <FontAwesomeIcon icon={faUserPlus} /> Get Started
                                    </button>
                                </div>
                            )}

                            {/* HAMBURGER (Mobile only - Logged in only) */}
                            {isAuthenticated && (
                                <button
                                    className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                >
                                    <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </nav>
            </header>

            {/* MOBILE SIDEBAR (Logged in only) */}
            {isAuthenticated && (
                <aside
                    className={`fixed top-0 left-0 z-50 w-64 h-full bg-white shadow-2xl transform ${
                        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                    } transition-transform duration-300 lg:hidden`}
                >
                    <div className="flex flex-col h-full p-5">
                        {/* LOGO */}
                        <div className="flex items-center justify-between mb-6 pb-4 border-b">
                            <div className="flex items-center gap-2">
                                <img src={logo} className="h-7" alt="Logo" />
                                <span className="text-lg font-bold text-red-600">Quiz Bird</span>
                            </div>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-gray-400 hover:text-gray-600 font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {/* MOBILE SEMESTER SELECTOR */}
                        <div className="mb-4">
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                Enrolled Semester
                            </label>
                            {isAdmin ? (
                                <select
                                    value={currentSemester?.id || ''}
                                    onChange={(e) => {
                                        selectSemester(e.target.value);
                                    }}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 outline-none"
                                >
                                    {semesters.map((sem) => (
                                        <option key={sem.id} value={sem.id}>
                                            {sem.name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="px-3 py-2 bg-red-50 text-red-700 font-bold rounded-xl text-xs border border-red-200 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faGraduationCap} />
                                    <span>{currentSemester?.name || 'Sem VI'}</span>
                                </div>
                            )}
                        </div>

                        {/* QUICK ACCESS LINKS (Account, Profile, Admin) */}
                        <div className="space-y-2 flex-1">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Account & Settings
                            </div>
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    navigate('/profile');
                                }}
                                className="w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-800 hover:bg-slate-200 transition flex items-center gap-2"
                            >
                                <FontAwesomeIcon icon={faUser} className="text-slate-500" />
                                <span>My Profile & Sem</span>
                            </button>

                            {isAdmin && (
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        navigate('/admin');
                                    }}
                                    className="w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 transition flex items-center gap-2"
                                >
                                    <FontAwesomeIcon icon={faShieldHalved} />
                                    <span>Admin Portal</span>
                                </button>
                            )}
                        </div>

                        {/* AUTH FOOTER BUTTON */}
                        <button
                            className="w-full bg-gray-900 hover:bg-black text-white py-2.5 rounded-xl font-semibold text-xs transition"
                            onClick={() => {
                                logout();
                                setIsMobileMenuOpen(false);
                                navigate('/');
                            }}
                        >
                            Logout ({user?.name})
                        </button>
                    </div>
                </aside>
            )}

            {/* BACKDROP FOR MOBILE SIDEBAR */}
            {isAuthenticated && isMobileMenuOpen && (
                <div
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
                />
            )}

            {/* MOBILE BOTTOM NAVIGATION BAR: Home, Practise, Customized, Apply Code (Logged in only) */}
            {isAuthenticated && (
                <nav
                    aria-label="Mobile Navigation"
                    className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] lg:hidden z-50"
                >
                    <div className="grid grid-cols-4 h-full max-w-lg mx-auto">
                        {navItems.map((item) => {
                            const isActive = currentActiveId === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item)}
                                    className={`flex flex-col items-center justify-center h-full transition cursor-pointer relative ${
                                        isActive
                                            ? "text-red-600 font-bold"
                                            : "text-slate-500 hover:text-slate-800 font-medium"
                                    }`}
                                >
                                    {isActive && (
                                        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-red-600 rounded-b-full"></span>
                                    )}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition mb-0.5 ${
                                        isActive ? "bg-red-50 text-red-600" : "text-slate-500"
                                    }`}>
                                        <FontAwesomeIcon icon={item.icon} className="text-base" />
                                    </div>
                                    <span className="text-[10px] leading-tight">
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </nav>
            )}
        </>
    );
}