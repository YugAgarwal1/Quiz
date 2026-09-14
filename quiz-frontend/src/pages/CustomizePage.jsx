import React from 'react'
import Header from '../components/Header.jsx'
export default function CustomizePage() {
    return (
        <>
            <Header activePage="customized"/>
            <div className="container mx-auto px-4 py-8">
                <h1>Customize Page</h1>
            </div>
        </>
    );
};