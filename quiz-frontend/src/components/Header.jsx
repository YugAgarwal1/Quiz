import { useState } from 'react';
import logo from "../images/logo.png";
import Notification from "../images/notification.avif";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faBook, faCog, faUser, faBars } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router';
export default function Header({activePage}) {
    const [activeItem, setActiveItem] = useState(activePage || 'home');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSemDropdownOpen, setIsSemDropdownOpen] = useState(false);

    const semOptions = ['Sem VII', 'Sem VIII', 'Sem IX'];

    const navItems = [
        { id: 'home', label: 'Home', loc: '' },
        { id: 'practise', label: 'Practise', loc: 'practise' },
        { id: 'customized', label: 'Customized', loc: 'customized' },
        { id: 'apply-code', label: 'Apply Code', loc: 'apply-code' }
    ];
    const bottomNavItems = [
        { id: 'home', label: 'Home', loc: '' },
        { id: 'practise', label: 'Practise', loc: 'practise' },
        { id: 'customized', label: 'Customized', loc: 'customized' },
        { id: 'apply-code', label: 'ApplyCode', loc: 'apply-code' }
    ];
    const bottomNavSvg = [
        { id: 'home', svg: '<i class="fa-light fa-house"></i>' },
        { id: 'practise', svg: '<i class="fa-light fa-book"></i>' },
        { id: 'customized', svg: '<i class="fa-light fa-gear"></i>' },
        { id: 'apply-code', svg: '<i class="fa-light fa-key"></i>' }
    ]
    const navigate = useNavigate();
    return (
        <header>
            <nav className="bg-white border-gray-200 px-4 lg:px-6 py-2.5 fixed top-0 w-full z-10">

                {/* TOP BAR */}
                <div className="flex justify-between items-center mx-auto max-w-screen-xl">

                    {/* LEFT: Logo */}
                    <a href="#" className="flex items-center">
                        <img src={logo} className="h-6 sm:h-9 mr-2" alt="Logo" />
                        <span className="text-xl font-semibold">Quiz Bird</span>
                    </a>

                    {/* CENTER: Nav Items (Desktop Only) */}
                    <ul className="hidden lg:flex space-x-8">
                        {navItems.map((item) => (
                            <li key={item.id}>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActiveItem(item.id);
                                        navigate(`/${item.loc}`)
                                    }}
                                    className={`px-3 py-2 rounded transition ${activeItem === item.id
                                            ? "bg-red-500 text-white"
                                            : "text-gray-600 hover:text-black"
                                        }`}
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>

                    {/* RIGHT: Notification + Sem + Hamburger */}
                    <div className="flex items-center space-x-3">

                        {/* Notification (Always visible) */}
                        <img src={Notification} className="h-5 sm:h-7" alt="Notification" />

                        {/* SEM DROPDOWN (Desktop only) */}
                        <div className="relative hidden lg:block">
                            <button
                                onClick={() => setIsSemDropdownOpen(!isSemDropdownOpen)}
                                className="text-white bg-red-500 px-4 py-2 rounded flex items-center"
                            >
                                {semOptions[0]}
                            </button>

                            {isSemDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow">
                                    {semOptions.map((sem) => (
                                        <div
                                            key={sem}
                                            className="p-2 hover:bg-gray-100 cursor-pointer"
                                        >
                                            {sem}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* HAMBURGER (Mobile only) */}
                        <button
                            className="lg:hidden p-2"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <FontAwesomeIcon icon={faBars} className="w-6 h-6" />
                        </button>

                    </div>
                </div>

                {/* MOBILE SIDEBAR */}
                <aside
                    className={`fixed top-0 left-0 z-40 w-64 h-full bg-white shadow transform ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                        } transition-transform duration-300`}
                >
                    <div className="flex flex-col h-full p-4">

                        {/*LOGO */}
                        <div className="flex items-center mb-6">
                            <img src={logo} className="h-8 mr-2" alt="Logo" />
                            <span className="text-lg font-semibold">Quiz Bird</span>
                        </div>

                        {/* SEM DROPDOWN */}
                        <button
                            onClick={() => setIsSemDropdownOpen(!isSemDropdownOpen)}
                            className="w-full text-white bg-red-500 px-4 py-2 rounded"
                        >
                            {semOptions[0]}
                        </button>

                        {isSemDropdownOpen && (
                            <ul className="mt-2">
                                {semOptions.map((sem) => (
                                    <li key={sem} className="p-2 hover:bg-gray-100 cursor-pointer">
                                        {sem}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* NAV ITEMS */}
                        <ul className="mt-4 flex-1">
                            {navItems.map((item) => (
                                <li key={item.id}>
                                    <a
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActiveItem(item.id);
                                            setIsMobileMenuOpen(false);
                                            navigate(`/${item.loc}`)
                                        }}
                                        className={`block p-2 rounded ${activeItem === item.id
                                                ? "bg-red-500 text-white"
                                                : "text-red-500 hover:bg-gray-100"
                                            }`}
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>

                        {/*LOGOUT BUTTON (BOTTOM FIXED) */}
                        <button
                            className="mt-auto w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900"
                            onClick={() => {
                                console.log("Logout clicked");
                            }}
                        >
                            Logout
                        </button>

                    </div>
                </aside>

                {/* MOBILE BOTTOM NAV */}
                <div className="fixed bottom-0 left-0 w-full h-16 bg-white border-t lg:hidden">
                    <div className="grid grid-cols-4 h-full">

                        {bottomNavItems.map((item) => {
                            const getIcon = (id) => {
                                switch(id) {
                                    case 'home': return faHome;
                                    case 'practise': return faBook;
                                    case 'customized': return faCog;
                                    case 'profile': return faUser;
                                    default: return faHome;
                                }
                            };
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {setActiveItem(item.id); navigate("/" + item.loc)}}
                                    className={`flex flex-col items-center justify-center ${activeItem === item.id
                                            ? "bg-red-500 text-white"
                                            : "text-gray-500"
                                        }`}
                                >
                                    <FontAwesomeIcon icon={getIcon(item.id)} className="w-5 h-5 mb-1" />
                                    <span className="text-sm">{item.label}</span>
                                </button>
                            );
                        })}

                    </div>
                </div>

            </nav>
        </header>
    );
};