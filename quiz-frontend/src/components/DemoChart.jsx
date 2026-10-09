import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

export const DemoChart = ({ weeklyData = [] }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!chartRef.current) return;
        const ctx = chartRef.current.getContext('2d');

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const defaultDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const labels = weeklyData.length > 0 ? weeklyData.map(d => d.day || d.date) : defaultDays;
        const testCounts = weeklyData.length > 0 ? weeklyData.map(d => d.count || 0) : [0, 0, 0, 0, 0, 0, 0];
        const accuracies = weeklyData.length > 0 ? weeklyData.map(d => d.accuracy || 0) : [0, 0, 0, 0, 0, 0, 0];

        chartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Tests Completed',
                        data: testCounts,
                        backgroundColor: '#ef4444',
                        borderRadius: 8,
                        barThickness: 24,
                        maxBarThickness: 32,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Avg Accuracy (%)',
                        data: accuracies,
                        type: 'line',
                        borderColor: '#10b981',
                        backgroundColor: '#10b981',
                        pointBackgroundColor: '#10b981',
                        pointRadius: 4,
                        borderWidth: 2,
                        tension: 0.3,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            font: {
                                size: 12,
                                weight: '600'
                            },
                            color: '#374151'
                        }
                    },
                    tooltip: {
                        backgroundColor: '#111827',
                        titleFont: { size: 12, weight: 'bold' },
                        bodyFont: { size: 11 },
                        padding: 10,
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#6b7280', font: { weight: '600', size: 11 } }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        suggestedMax: 5,
                        ticks: {
                            stepSize: 1,
                            color: '#6b7280',
                            font: { size: 11 }
                        },
                        grid: { color: '#f3f4f6' },
                        title: {
                            display: true,
                            text: 'Tests Taken',
                            color: '#6b7280',
                            font: { size: 11, weight: 'bold' }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 25,
                            callback: (v) => `${v}%`,
                            color: '#10b981',
                            font: { size: 11 }
                        },
                        grid: { drawOnChartArea: false },
                        title: {
                            display: true,
                            text: 'Accuracy %',
                            color: '#10b981',
                            font: { size: 11, weight: 'bold' }
                        }
                    }
                }
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [JSON.stringify(weeklyData)]);

    return (
        <div className="w-full h-44 sm:h-48 my-auto">
            <canvas ref={chartRef}></canvas>
        </div>
    );
};