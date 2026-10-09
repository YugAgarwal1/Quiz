import React from 'react';
import Navbar from '../components/Header.jsx';
import HeroSection from '../components/HeroSection.jsx';
import PublicLanding from '../components/PublicLanding.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const MainPage = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <>
            <Navbar activePage="home" />
            {isAuthenticated ? <HeroSection /> : <PublicLanding />}
        </>
    );
};

export default MainPage;