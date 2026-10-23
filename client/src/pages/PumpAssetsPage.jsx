import React, { useState, useEffect } from 'react';
import { 
    Layers, Search, ShieldCheck, Wrench, Calendar, 
    Zap, Droplets, Info, ChevronRight, FileText,
    RefreshCw
} from 'lucide-react';
import { SMART_PUMPS, DATA_PROVENANCE } from '../services/agriPulseData';
import { pumpService } from '../services/api';

const PumpAssetsPage = () => {
    const [pumps, setPumps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [selectedPump, setSelectedPump] = useState(null);

    const loadPumps = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await pumpService.getPumps();
            const list = res.data || res.pumps || res;
            const validList = Array.isArray(list) ? list : SMART_PUMPS;
            setPumps(validList);
            if (!selectedPump && validList.length > 0) {
                setSelectedPump(validList[0]);
            }
        } catch (err) {
            console.warn('Failed to load pumps:', err);
            setError(err.userMessage || 'Could not load pump assets');
            setPumps(SMART_PUMPS);
            setSelectedPump(SMART_PUMPS[0]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPumps();
    }, []);

    const activeList = pumps.length > 0 ? pumps : SMART_PUMPS;
    const currentSelected = selectedPump || activeList[0];

    const filtered = activeList.filter(p => 
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.model.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E6E5DC] pb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[0.68rem] font-mono tracking-widest uppercase font-extrabold px-2 py-0.5 rounded bg-[#173F35] text-[#C7F36B]">
                            INDUSTRIAL EQUIPMENT REGISTRY
                        </span>
                        <span className="text-[0.68rem] font-mono px-2 py-0.5 rounded bg-[#ECEBE4] text-[#555A52] border border-[#D5D4CA]">
                            18 REGISTERED ASSETS
                        </span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-[#173F35] tracking-tight">
                        Pump Assets & Technical Specifications
                    </h1>
                    <p className="text-sm text-[#858A80] mt-0.5">
                        Lifecycle registry, hydraulic operating points, and service histories.
                    </p>
                </div>

                <div className="relative w-64">
                    <Search size={14} className="absolute left-3 top-2.5 text-[#858A80]" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search assets..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-md border border-[#D8D7CD] bg-white text-xs focus:outline-none focus:border-[#173F35]"
                    />
                </div>
            </div>

            {error && (
                <div className="p-3 bg-[#FDECEC] border border-[#F8B4B1] rounded-lg text-xs text-[#9E1F1A] flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={loadPumps} className="underline font-bold text-xs flex items-center gap-1">
                        <RefreshCw size={12} />
                        Retry
                    </button>
                </div>
            )}

            {/* Asset Detail & Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Assets List (5 cols) */}
                <div className="lg:col-span-5 bg-white border border-[#E6E5DC] rounded-lg p-4 shadow-sm divide-y divide-[#F6F5EF] max-h-[700px] overflow-y-auto">
                    {loading ? (
                        <div className="space-y-3 p-2">
                            {[1, 2, 3, 4].map(n => (
                                <div key={n} className="p-3 rounded-md bg-[#F6F5EF] animate-pulse space-y-2">
                                    <div className="h-4 w-3/4 bg-[#E8E7DF] rounded" />
                                    <div className="h-3 w-1/2 bg-[#E8E7DF] rounded" />
                                </div>
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="p-6 text-center text-xs text-[#858A80] space-y-2">
                            <Layers size={24} className="mx-auto text-[#858A80]" />
                            <div>No pumps found matching "{search}"</div>
                            <button 
                                onClick={() => setSearch('')}
                                className="px-2.5 py-1 rounded bg-[#EFEFE7] text-[#173F35] font-semibold text-[0.7rem]"
                            >
                                Clear search
                            </button>
                        </div>
                    ) : (
                        filtered.map(p => {
                            const isSelected = currentSelected?.id === p.id;
                            return (
                                <div
                                    key={p.id}
                                    onClick={() => setSelectedPump(p)}
                                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                                        isSelected ? 'bg-[#173F35] text-white' : 'hover:bg-[#F6F5EF] text-[#252B28]'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="font-extrabold text-xs">{p.id} — {p.name}</div>
                                        <span className={`text-[0.65rem] font-mono font-bold px-1.5 py-0.2 rounded ${
                                            isSelected 
                                                ? 'bg-[#C7F36B] text-[#173F35]' 
                                                : p.status === 'CRITICAL' ? 'bg-[#FDECEC] text-[#D94C45]' : 'bg-[#EFEFE7] text-[#555]'
                                        }`}>
                                            {p.status}
                                        </span>
                                    </div>
                                    <div className={`text-[0.7rem] mt-1 ${isSelected ? 'text-[#DCE7D8]' : 'text-[#858A80]'}`}>
                                        Model: {p.model} • SN: {p.serial}
                                    </div>
                                    <div className="mt-1 flex items-center justify-between text-[0.68rem] font-mono">
                                        <span className={isSelected ? 'text-[#A0ABA4]' : 'text-[#858A80]'}>
                                            Runtime: {p.cumulativeRuntimeHours}h
                                        </span>
                                        <span className={isSelected ? 'text-[#C7F36B]' : 'text-[#173F35]'}>
                                            Health Score: {p.healthScore}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Selected Asset Engineering Datasheet (7 cols) */}
                {currentSelected ? (
                    <div className="lg:col-span-7 bg-white border border-[#E6E5DC] rounded-lg p-6 shadow-sm space-y-6">
                        <div className="flex items-start justify-between pb-4 border-b border-[#F0EFEA]">
                            <div>
                                <span className="text-[0.68rem] font-mono text-[#858A80] uppercase tracking-wider font-extrabold">
                                    ASSET SPECIFICATION SHEET
                                </span>
                                <h2 className="text-2xl font-extrabold text-[#173F35]">
                                    {currentSelected.name}
                                </h2>
                                <div className="text-xs text-[#858A80] mt-0.5">
                                    Serial Number: <strong className="font-mono text-[#252B28]">{currentSelected.serial}</strong>
                                </div>
                            </div>

                            <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded ${
                                currentSelected.status === 'CRITICAL' ? 'bg-[#FDECEC] text-[#D94C45]' : 'bg-[#DCE7D8] text-[#173F35]'
                            }`}>
                                {currentSelected.status}
                            </span>
                        </div>

                        {/* Technical Specifications Grid */}
                        <div>
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#173F35] mb-3">
                                Design Operating Parameters
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                                <div className="p-3 rounded bg-[#F6F5EF] border border-[#E6E5DC]">
                                    <div className="text-[0.68rem] text-[#858A80] font-sans">Pump Architecture</div>
                                    <div className="font-bold text-[#173F35] mt-1">{currentSelected.model}</div>
                                </div>
                                <div className="p-3 rounded bg-[#F6F5EF] border border-[#E6E5DC]">
                                    <div className="text-[0.68rem] text-[#858A80] font-sans">Rated Power</div>
                                    <div className="font-bold text-[#173F35] mt-1">{currentSelected.metrics?.powerKw ?? 18.5} kW (25 HP)</div>
                                </div>
                                <div className="p-3 rounded bg-[#F6F5EF] border border-[#E6E5DC]">
                                    <div className="text-[0.68rem] text-[#858A80] font-sans">Rated Head</div>
                                    <div className="font-bold text-[#173F35] mt-1">68.5 Meters</div>
                                </div>
                                <div className="p-3 rounded bg-[#F6F5EF] border border-[#E6E5DC]">
                                    <div className="text-[0.68rem] text-[#858A80] font-sans">Impeller Diameter</div>
                                    <div className="font-bold text-[#173F35] mt-1">185 mm (316 SS)</div>
                                </div>
                                <div className="p-3 rounded bg-[#F6F5EF] border border-[#E6E5DC]">
                                    <div className="text-[0.68rem] text-[#858A80] font-sans">Commissioning Date</div>
                                    <div className="font-bold text-[#173F35] mt-1">{currentSelected.installationDate}</div>
                                </div>
                                <div className="p-3 rounded bg-[#F6F5EF] border border-[#E6E5DC]">
                                    <div className="text-[0.68rem] text-[#858A80] font-sans">Cumulative Runtime</div>
                                    <div className="font-bold text-[#173F35] mt-1">{currentSelected.cumulativeRuntimeHours} Hours</div>
                                </div>
                            </div>
                        </div>

                        {/* Sensor Threshold Tolerances */}
                        <div>
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#173F35] mb-3">
                                Calibrated Alarm Thresholds
                            </h4>
                            <div className="p-3.5 bg-[#F6F5EF] rounded border border-[#E6E5DC] text-xs font-mono space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-[#858A80]">ISO 10816 Vibration Alert:</span>
                                    <strong>4.5 mm/s RMS (Trigger for Work Order)</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#858A80]">ISO 10816 Vibration Danger:</span>
                                    <strong className="text-[#D94C45]">7.1 mm/s RMS (Automated Motor Trip)</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#858A80]">Max Casing Temperature:</span>
                                    <strong>88.0°C</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#858A80]">Motor FLA Overcurrent Limit:</span>
                                    <strong>30.0 A</strong>
                                </div>
                            </div>
                        </div>

                        {/* Action Footer */}
                        <div className="pt-3 border-t border-[#F0EFEA] flex justify-end">
                            <button
                                onClick={() => window.print()}
                                className="agri-btn agri-btn-outline text-xs"
                            >
                                <FileText size={14} />
                                <span>Export Engineering Datasheet</span>
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default PumpAssetsPage;
