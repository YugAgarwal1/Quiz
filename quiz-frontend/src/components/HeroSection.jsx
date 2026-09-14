import React from 'react';
import Logo from '../images/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faBook, faCalendar, faPause, faChartArea } from '@fortawesome/free-solid-svg-icons';
import { DemoChart } from '../components/DemoChart.jsx';
import PausedTests from './PausedTests.jsx';
import UpcomingTest from './UpcomingTest.jsx';
export default function HeroSection() {
    return (
        <div className="flex flex-col min-h-screen px-4 sm:px-8 lg:px-20">

            {/* Welcome Section */}
            <div className="mt-10 lg:mt-16">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-heading">
                    Welcome Back 👋
                </h1>
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-6 mt-8 w-full">
                {/* Profile Card */}
                <div className="bg-neutral-primary-soft lg:w-[60%]  p-6 rounded-base shadow-xs border border-default">

                    <div className="flex items-center gap-4">
                        {/* Image */}
                        <img
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full"
                            src={Logo}
                            alt="User"
                        />

                        {/* Name */}
                        <div>
                            <h5 className="text-xl sm:text-2xl font-semibold text-heading">
                                Yug Agarwal
                            </h5>
                            <p className="text-body">Studylink</p>
                        </div>
                    </div>

                    {/* Semester */}
                    <div className="mt-4">
                        <span className="bg-[var(--primary-red-light)] text-[var(--primary-red)] text-xs px-4 py-1 rounded">
                            Sem VI
                        </span>
                    </div>
                </div>
                {/* Time Spent and Progress crads together*/}
                <div className='flex justify-start gap-4 lg:w-[40%]'>
                    {/* Time Spent Card */}
                    <div className="bg-neutral-primary-soft lg:w-[50%] p-6 rounded-base shadow-xs border border-default">
                        <div className="flex flex-col gap-4">
                            {/* Icon */}
                            <div className="rounded-full bg-[var(--primary-red-light)] w-12 h-12 flex items-center justify-center">
                                <FontAwesomeIcon
                                    icon={faClock}
                                    className="text-[var(--primary-red)] text-2xl"
                                />
                            </div>
                            {/* Title */}
                            <p className="text-body">Total Time Spent</p>
                            {/* Time */}
                            <p className="text-black text-2xl font-medium">
                                18 : 06 : 03
                            </p>
                        </div>
                    </div>
                    {/* Progress Card */}
                    <div className="bg-neutral-primary-soft lg:w-[50%] p-6 rounded-base shadow-xs border border-default">
                        <div className="flex flex-col gap-4">
                            {/* Icon */}
                            <div className="rounded-full bg-[var(--primary-red-light)] w-12 h-12 flex items-center justify-center">
                                <FontAwesomeIcon icon={faBook}
                                    className="text-[var(--primary-red)] text-2xl"
                                />
                            </div>
                            {/* Title */}
                            <p className="text-body">Practise Test Given</p>
                            {/* Time */}
                            <p className="text-black text-2xl font-medium">
                                5
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upcoming Tests */}
            <UpcomingTest />


           {/* Paused Tests */}
           <PausedTests />

            {/* Weekly Performance Section */}
            <div className='mt-8 mb-8'>
                {/* Title */}
                <div className='mb-8'>
                    <h5 className="text-xl sm:text-2xl font-semibold text-heading">
                        Weekly Performance
                    </h5>
                </div>
                {/* Charts */}
                <div className='flex justify-start gap-6 flex-wrap'>
                    {/* Progress Chart */}
                    <div className="rounded-md border bg-white transition-all duration-200 border-gray-200 shadow-sm lg:w-[100%] h-96 md:w-[100%] sm:w-[100%] px-10 py-10 max-h-[max-content]">
                        {/* Title of chart */}
                        <div className="flex items-center gap-2 mb-4 sm:mb-5">
                            <FontAwesomeIcon icon={faChartArea} className='text-xl sm:text-2xl text-[var(--primary-red)]' />
                            <h3 className="text-base sm:text-lg md:text-xl text-gray-900">Practice Progress</h3>
                        </div>
                        {/* Simple Chart */}
                        <DemoChart />
                    </div>

                    {/* Accuracy by Subject chart */}
                    <div className="rounded-md border bg-white transition-all duration-200 border-gray-200 shadow-sm lg:w-[100%] h-[max-content] md:w-[100%] sm:w-[100%] px-10 py-10">
                        {/* Title of chart */}
                        <div className="flex items-center gap-2 mb-4 sm:mb-5">
                            <FontAwesomeIcon icon={faChartArea} className='text-xl sm:text-2xl text-[var(--primary-red)]' />
                            <h3 className="text-base sm:text-lg md:text-xl text-gray-900">Accuracy by Subject</h3>
                        </div>
                        {/* Chart - > No Data Available */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                            <div className="w-full flex flex-col items-center justify-center py-12 text-center md:col-span-2 lg:col-span-3 h-[max-content]">
                                <div className="w-16 h-[max-content] rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                    <FontAwesomeIcon icon={faChartArea} className='text-3xl text-gray-400' />
                                </div>
                                <p className="text-gray-600 font-medium">No Data Available</p>
                                <p className="text-sm text-gray-400 mt-1">Start a test to see it here</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};