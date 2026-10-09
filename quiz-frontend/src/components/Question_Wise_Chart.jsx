import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

export default function QuestionWiseChart({ title = "Question Answers Breakdown", labels = ['Correct', 'Incorrect', 'Skipped'], data = [0, 0, 0] }) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const total = data.reduce((a, b) => a + (Number(b) || 0), 0);

    useEffect(() => {
        if (!chartRef.current) return;
        const ctx = chartRef.current.getContext('2d');
        
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const chartData = total > 0 ? data : [1];
        const bgColors = total > 0 
            ? ['#10b981', '#ef4444', '#f59e0b']
            : ['#e2e8f0'];

        chartInstance.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: total > 0 ? labels : ['No Data'],
                datasets: [{
                    data: chartData,
                    backgroundColor: bgColors,
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    cutout: '68%',
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { 
                        enabled: total > 0,
                        backgroundColor: '#0f172a',
                        titleFont: { size: 11, weight: 'bold' },
                        bodyFont: { size: 11 },
                        padding: 8,
                        cornerRadius: 8
                    }
                }
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [JSON.stringify(data), total]);

    return (
        <div className="w-full flex flex-col h-full">
            {/* Header with pill */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <h5 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{title}</span>
                </h5>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {total} {total === 1 ? 'Total' : 'Total'}
                </span>
            </div>

            {/* Chart + Legend Container */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-auto py-1">
                {/* Donut Chart */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
                    <canvas ref={chartRef}></canvas>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                        <span className="text-base sm:text-lg font-black text-slate-900 leading-none">{total}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Total</span>
                    </div>
                </div>

                {/* Legend Items */}
                <div className="w-full sm:flex-1 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-emerald-50/70 border border-emerald-100/60">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
                            <span className="font-semibold text-slate-700">Correct</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="font-bold text-emerald-700">{data[0] || 0}</span>
                            <span className="text-[10px] text-emerald-600/70 font-medium">
                                ({total > 0 ? Math.round(((data[0] || 0) / total) * 100) : 0}%)
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-rose-50/70 border border-rose-100/60">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-200"></span>
                            <span className="font-semibold text-slate-700">Incorrect</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="font-bold text-rose-700">{data[1] || 0}</span>
                            <span className="text-[10px] text-rose-600/70 font-medium">
                                ({total > 0 ? Math.round(((data[1] || 0) / total) * 100) : 0}%)
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-amber-50/70 border border-amber-100/60">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-amber-200"></span>
                            <span className="font-semibold text-slate-700">Skipped</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="font-bold text-amber-700">{data[2] || 0}</span>
                            <span className="text-[10px] text-amber-600/70 font-medium">
                                ({total > 0 ? Math.round(((data[2] || 0) / total) * 100) : 0}%)
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}