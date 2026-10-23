import React, { useState } from 'react';
import { 
    BarChart3, Download, Calendar, Activity, 
    Zap, Droplets, ArrowUpRight, ArrowDownRight, 
    Info, FileText, CheckCircle2
} from 'lucide-react';
import { 
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
    CartesianGrid, Tooltip, ReferenceLine, AreaChart, Area,
    BarChart, Bar, Legend
} from 'recharts';
import { DATA_PROVENANCE } from '../services/agriPulseData';

// Hydraulic QH Curve (Head vs Flow) compared to OEM Factory Benchmark
const HYDRAULIC_QH_DATA = [
    { flow: 100, headActual: 78, headOem: 80, efficiency: 72 },
    { flow: 200, headActual: 75, headOem: 77, efficiency: 82 },
    { flow: 300, headActual: 71, headOem: 73, efficiency: 88 },
    { flow: 400, headActual: 64, headOem: 68, efficiency: 89 }, // Optimal operating point (BEP)
    { flow: 450, headActual: 58, headOem: 64, efficiency: 85 }, // P-04 operates here (head degradation)
    { flow: 500, headActual: 51, headOem: 59, efficiency: 78 },
    { flow: 600, headActual: 38, headOem: 48, efficiency: 62 },
];

// Energy Intensity per 1,000 m³ Water Delivered (kWh/1000m³) over past 6 months
const ENERGY_EFFICIENCY_DATA = [
    { month: 'May 2026', kwhPer1000m3: 312, target: 320 },
    { month: 'Jun 2026', kwhPer1000m3: 318, target: 320 },
    { month: 'Jul 2026', kwhPer1000m3: 325, target: 320 },
    { month: 'Aug 2026', kwhPer1000m3: 334, target: 320 },
    { month: 'Sep 2026', kwhPer1000m3: 348, target: 320 }, // Spurred by cavitation losses on P-04
    { month: 'Oct 2026', kwhPer1000m3: 356, target: 320 },
];

const AnalyticsPage = () => {
    const [timeRange, setTimeRange] = useState('30D');

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E6E5DC] pb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[0.68rem] font-mono tracking-widest uppercase font-extrabold px-2 py-0.5 rounded bg-[#173F35] text-[#C7F36B]">
                            ENGINEERING ANALYTICS
                        </span>
                        <span className="text-[0.68rem] font-mono px-2 py-0.5 rounded bg-[#ECEBE4] text-[#555A52] border border-[#D5D4CA]">
                            {DATA_PROVENANCE.dataSource}
                        </span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-[#173F35] tracking-tight">
                        Hydraulic & Fleet Energy Analytics
                    </h1>
                    <p className="text-sm text-[#858A80] mt-0.5">
                        Pump affinity curves, specific power consumption, and mean reliability metrics.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex bg-[#EFEFE7] p-1 rounded-md text-xs font-semibold">
                        {['7D', '30D', '90D', '1Y'].map(t => (
                            <button
                                key={t}
                                onClick={() => setTimeRange(t)}
                                className={`px-2.5 py-1 rounded transition-colors ${
                                    timeRange === t ? 'bg-[#173F35] text-white' : 'text-[#555] hover:text-black'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => window.print()}
                        className="agri-btn agri-btn-outline text-xs"
                    >
                        <Download size={14} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Top KPI Cards (4 cols) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white border border-[#E6E5DC] rounded-lg shadow-sm">
                    <div className="text-[0.7rem] uppercase tracking-wider font-semibold text-[#858A80]">
                        Mean Time Between Failures
                    </div>
                    <div className="text-2xl font-extrabold text-[#173F35] font-mono mt-1">
                        4,820 <span className="text-xs font-normal text-[#858A80]">Hours</span>
                    </div>
                    <div className="text-[0.7rem] text-[#2E7D32] flex items-center gap-1 mt-1 font-semibold">
                        <ArrowUpRight size={12} />
                        <span>+14% vs OEM expectation</span>
                    </div>
                </div>

                <div className="p-4 bg-white border border-[#E6E5DC] rounded-lg shadow-sm">
                    <div className="text-[0.7rem] uppercase tracking-wider font-semibold text-[#858A80]">
                        Mean Time To Repair
                    </div>
                    <div className="text-2xl font-extrabold text-[#173F35] font-mono mt-1">
                        3.4 <span className="text-xs font-normal text-[#858A80]">Hours</span>
                    </div>
                    <div className="text-[0.7rem] text-[#2E7D32] flex items-center gap-1 mt-1 font-semibold">
                        <ArrowDownRight size={12} />
                        <span>-40 min turnaround</span>
                    </div>
                </div>

                <div className="p-4 bg-white border border-[#E6E5DC] rounded-lg shadow-sm">
                    <div className="text-[0.7rem] uppercase tracking-wider font-semibold text-[#858A80]">
                        Average Fleet Efficiency
                    </div>
                    <div className="text-2xl font-extrabold text-[#173F35] font-mono mt-1">
                        84.6%
                    </div>
                    <div className="text-[0.7rem] text-[#858A80] mt-1">
                        Best Efficiency Point (BEP): 89%
                    </div>
                </div>

                <div className="p-4 bg-white border border-[#E6E5DC] rounded-lg shadow-sm">
                    <div className="text-[0.7rem] uppercase tracking-wider font-semibold text-[#D94C45]">
                        Hydraulic Throttling Loss
                    </div>
                    <div className="text-2xl font-extrabold text-[#D94C45] font-mono mt-1">
                        11.2%
                    </div>
                    <div className="text-[0.7rem] text-[#D94C45] font-semibold mt-1">
                        Sector Delta-7 over-throttled
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 1. Hydraulic QH Curve vs OEM Factory Benchmark (6 cols) */}
                <div className="lg:col-span-6 bg-white border border-[#E6E5DC] rounded-lg p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-[#F0EFEA]">
                        <div>
                            <h3 className="text-xs font-extrabold tracking-wider text-[#173F35] uppercase">
                                Hydraulic Performance (Head vs Flow QH Curve)
                            </h3>
                            <p className="text-[0.7rem] text-[#858A80] mt-0.5">
                                Grundfos CR 95 Measured Curve vs Factory Baseline
                            </p>
                        </div>
                        <span className="text-[0.65rem] font-mono px-2 py-0.5 rounded bg-[#DCE7D8] text-[#173F35] font-bold">
                            CALIBRATED
                        </span>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={HYDRAULIC_QH_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E6E5DC" vertical={false} />
                                <XAxis dataKey="flow" stroke="#858A80" fontSize={11} tickLine={false} unit=" L/m" />
                                <YAxis stroke="#858A80" fontSize={11} tickLine={false} unit="m" />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#102D27', 
                                        border: '1px solid #1C4B40',
                                        borderRadius: '6px',
                                        color: '#FFFFFF',
                                        fontSize: '12px',
                                        fontFamily: 'monospace'
                                    }} 
                                />
                                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                                <Line 
                                    name="OEM Factory Head (m)" 
                                    type="monotone" 
                                    dataKey="headOem" 
                                    stroke="#858A80" 
                                    strokeDasharray="4 4" 
                                    strokeWidth={2}
                                    dot={false}
                                />
                                <Line 
                                    name="Actual Measured Head (m)" 
                                    type="monotone" 
                                    dataKey="headActual" 
                                    stroke="#173F35" 
                                    strokeWidth={2.5}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="text-[0.72rem] text-[#555A52] bg-[#F6F5EF] p-2.5 rounded border border-[#E6E5DC]">
                        <strong>Engineering Finding:</strong> Pump P-04 exhibits a 6-meter head deficit at 450 L/min compared to factory OEM curves, corroborating internal recirculation and impeller vane erosion.
                    </div>
                </div>

                {/* 2. Specific Energy Intensity (6 cols) */}
                <div className="lg:col-span-6 bg-white border border-[#E6E5DC] rounded-lg p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-[#F0EFEA]">
                        <div>
                            <h3 className="text-xs font-extrabold tracking-wider text-[#173F35] uppercase">
                                Energy Intensity per 1,000 m³ Delivered
                            </h3>
                            <p className="text-[0.7rem] text-[#858A80] mt-0.5">
                                Specific Energy Consumption (kWh per 1,000 m³)
                            </p>
                        </div>
                        <span className="text-[0.65rem] font-mono px-2 py-0.5 rounded bg-[#FDF4E6] text-[#925805] font-bold">
                            +11.2% RISE
                        </span>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ENERGY_EFFICIENCY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E6E5DC" vertical={false} />
                                <XAxis dataKey="month" stroke="#858A80" fontSize={11} tickLine={false} />
                                <YAxis stroke="#858A80" fontSize={11} tickLine={false} domain={[250, 400]} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#102D27', 
                                        border: '1px solid #1C4B40',
                                        borderRadius: '6px',
                                        color: '#FFFFFF',
                                        fontSize: '12px',
                                        fontFamily: 'monospace'
                                    }} 
                                />
                                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                                <Bar name="Measured kWh / 1000m³" dataKey="kwhPer1000m3" fill="#173F35" radius={[4, 4, 0, 0]} />
                                <Line 
                                    name="Target Baseline (320)" 
                                    type="monotone" 
                                    dataKey="target" 
                                    stroke="#C7F36B" 
                                    strokeWidth={2}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="text-[0.72rem] text-[#555A52] bg-[#F6F5EF] p-2.5 rounded border border-[#E6E5DC]">
                        <strong>Efficiency Alert:</strong> Energy consumption climbed from 312 to 356 kWh/1000m³ over recent months as mechanical seal drag and cavitation worsened on booster lines.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
