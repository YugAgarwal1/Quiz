import React, { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';
import 'primereact/resources/themes/lara-light-indigo/theme.css';

export const DemoChart=()=>{
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        const data = {
            labels: ['Progress'],
            datasets: [
                {
                    label: 'Adv',
                    data: [0.81], // your percentage value
                    backgroundColor: '#ef4444', // red
                    borderColor: '#ef4444',
                    borderWidth: 2,
                    barThickness: 6
                }
            ]
        };

        const options = {
            indexAxis: 'y', // makes it horizontal
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true
                }
            },
            scales: {
                x: {
                    min: 0,
                    max: 100,
                    ticks: {
                        stepSize: 25,
                        color: '#6b7280'
                    },
                    grid: {
                        color: '#e5e7eb'
                    },
                    title: {
                        display: true,
                        text: 'Progress'
                    }
                },
                y: {
                    ticks: {
                        color: '#6b7280',
                        callback: function () {
                            return 'Adv 0.81%';
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        };

        setChartData(data);
        setChartOptions(options);
    }, []);

    return (
        <div className="w-full h-[max-content]">
            <Chart type="bar" data={chartData} options={chartOptions} />
        </div>
    );
}