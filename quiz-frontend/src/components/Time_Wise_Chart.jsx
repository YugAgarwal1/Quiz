import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { SecondsToString } from '../utils/SeondsToMinute.js';
export default function TimeWiseChart({title, labels, data}) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    // Data points matching your image
    const chartData = {
        correct: 3,
        wrong: 7,
        skipped: 0
    };

    useEffect(() => {
        const ctx = chartRef.current.getContext('2d');
        
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        chartInstance.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#10b981', // green (Correct)
                        '#ef4444', // red (Wrong)
                        '#f59e0b'  // amber (Skipped) - matching your image color
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    cutout: '75%' // Makes the ring thinner like the image
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false // Removes the default labels
                    },
                    tooltip: {
                        enabled: true
                    }
                }
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, []);

    return (
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-4">
            <h5 className="text-lg font-bold text-gray-800 mb-6">🕐 {title}</h5>

            <div className="flex items-center justify-between gap-8">
                {/* Donut Chart Container */}
                <div className="w-32 h-32">
                    <canvas ref={chartRef}></canvas>
                </div>
                {/* Custom Legend Div on the Right */}
                <div className="flex-1 space-y-4">
                    {/* Correct Row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full bg-[#10b981]"></span>
                            <span className="text-sm font-medium text-gray-600">Correct</span>
                        </div>
                        <span className="text-sm font-bold text-gray-800">{data[0]}s</span>
                    </div>

                    {/* Wrong Row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full bg-[#ef4444]"></span>
                            <span className="text-sm font-medium text-gray-600">Incorrect</span>
                        </div>
                        <span className="text-sm font-bold text-gray-800">{data[1]}s</span>
                    </div>

                    {/* Skipped Row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full bg-[#f59e0b]"></span>
                            <span className="text-sm font-medium text-gray-600">Skipped</span>
                        </div>
                        <span className="text-sm font-bold text-gray-800">{data[2]}s</span>
                    </div>

                    {/* Total Time Row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-md font-bold text-gray-600">Total Time</span>
                        </div>
                        <span className="text-sm font-bold text-gray-800">{SecondsToString(data.reduce((a, b) => a + b, 0))}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}