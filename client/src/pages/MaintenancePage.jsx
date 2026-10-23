import React, { useState, useEffect } from 'react';
import { 
    Wrench, Plus, CheckCircle2, AlertTriangle, 
    Clock, User, ShieldAlert, Check, X, Filter,
    RefreshCw
} from 'lucide-react';
import { WORK_ORDERS, SMART_PUMPS, DATA_PROVENANCE } from '../services/agriPulseData';
import { workOrderService, pumpService } from '../services/api';

const MaintenancePage = () => {
    const [workOrders, setWorkOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [targetPumpId, setTargetPumpId] = useState('P-04');
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState('P1_CRITICAL');
    const [technician, setTechnician] = useState('Tariq Mansour');
    const [downtime, setDowntime] = useState('3.5');
    const [safetyNotes, setSafetyNotes] = useState('LOTO Procedure on 380V Main Breaker required.');
    const [formError, setFormError] = useState('');

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await workOrderService.getWorkOrders();
            const list = res.data || res.workOrders || res;
            setWorkOrders(Array.isArray(list) ? list : WORK_ORDERS);
        } catch (err) {
            console.warn('Failed to load work orders:', err);
            setError(err.userMessage || 'Could not load work orders');
            setWorkOrders(WORK_ORDERS);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = workOrders.filter(wo => {
        if (filterStatus === 'ALL') return true;
        return wo.status === filterStatus;
    });

    const handleCreateWorkOrder = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!title.trim()) {
            setFormError('Please enter a work order title.');
            return;
        }

        const downtimeNum = parseFloat(downtime);
        if (isNaN(downtimeNum) || downtimeNum <= 0) {
            setFormError('Please enter a valid estimated downtime in hours.');
            return;
        }

        setIsSubmitting(true);

        const newOrder = {
            pumpId: targetPumpId,
            title: title.trim(),
            priority,
            status: 'SCHEDULED',
            assignedTechnician: technician.trim() || 'Tariq Mansour',
            estimatedDowntimeHours: downtimeNum,
            targetCompletion: 'Within 48h',
            spareParts: ['Viton O-Ring', 'Replacement Bearing Kit'],
            safetyRequirements: safetyNotes.trim()
        };

        try {
            const res = await workOrderService.createWorkOrder(newOrder);
            const created = res.data || res;
            setWorkOrders(prev => [created, ...prev]);
            setShowCreateModal(false);
            setTitle('');
            setFormError('');
        } catch (err) {
            console.warn('Failed to dispatch work order:', err);
            setFormError(err.userMessage || 'Failed to dispatch work order to server.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E6E5DC] pb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[0.68rem] font-mono tracking-widest uppercase font-extrabold px-2 py-0.5 rounded bg-[#173F35] text-[#C7F36B]">
                            FIELD MAINTENANCE WORKSPACE
                        </span>
                        <span className="text-[0.68rem] font-mono px-2 py-0.5 rounded bg-[#ECEBE4] text-[#555A52] border border-[#D5D4CA]">
                            INTEGRATED DISPATCH
                        </span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-[#173F35] tracking-tight">
                        Maintenance & Work Orders
                    </h1>
                    <p className="text-sm text-[#858A80] mt-0.5">
                        Schedule preventive interventions, assign technicians, and track LOTO safety checklists.
                    </p>
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="agri-btn agri-btn-lime text-xs"
                >
                    <Plus size={15} />
                    <span>Create Work Order</span>
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="text-[#858A80]">Filter Status:</span>
                {['ALL', 'SCHEDULED', 'IN_PROGRESS', 'BACKLOG', 'VERIFIED'].map((st) => (
                    <button
                        key={st}
                        onClick={() => setFilterStatus(st)}
                        className={`px-3 py-1 rounded transition-colors ${
                            filterStatus === st 
                                ? 'bg-[#173F35] text-white' 
                                : 'bg-white border border-[#D8D7CD] text-[#555] hover:text-black'
                        }`}
                    >
                        {st.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Work Orders Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3].map(n => (
                        <div key={n} className="p-5 rounded-lg border border-[#E6E5DC] bg-white shadow-sm space-y-4 animate-pulse">
                            <div className="flex justify-between items-center">
                                <div className="h-5 w-24 bg-[#EFEFE7] rounded" />
                                <div className="h-5 w-16 bg-[#EFEFE7] rounded" />
                            </div>
                            <div className="h-4 w-3/4 bg-[#EFEFE7] rounded mt-2" />
                            <div className="space-y-2 pt-2">
                                <div className="h-3 w-1/2 bg-[#EFEFE7] rounded" />
                                <div className="h-3 w-2/3 bg-[#EFEFE7] rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="bg-white border border-[#E6E5DC] rounded-xl p-8 text-center space-y-3">
                    <Wrench size={32} className="mx-auto text-[#858A80]" />
                    <h3 className="font-bold text-sm text-[#252B28]">No Work Orders Found</h3>
                    <p className="text-xs text-[#858A80] max-w-sm mx-auto">
                        No maintenance work orders match the current filter "{filterStatus.replace('_', ' ')}".
                    </p>
                    <button
                        onClick={() => setFilterStatus('ALL')}
                        className="px-3 py-1.5 rounded-lg bg-[#EFEFE7] hover:bg-[#E2E1D9] text-[#173F35] text-xs font-semibold"
                    >
                        Show All Orders
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredOrders.map(wo => {
                        const isCritical = wo.priority === 'P1_CRITICAL';
                        return (
                            <div 
                                key={wo.id}
                                className={`p-5 rounded-lg border bg-white shadow-sm flex flex-col justify-between space-y-4 ${
                                    isCritical ? 'border-[#F8B4B1]' : 'border-[#E6E5DC]'
                                }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs font-extrabold text-[#173F35] bg-[#DCE7D8] px-2 py-0.5 rounded">
                                            {wo.id} • {wo.pumpId}
                                        </span>
                                    <span className={`text-[0.65rem] font-bold font-mono px-2 py-0.5 rounded ${
                                        isCritical 
                                            ? 'bg-[#FDECEC] text-[#D94C45]' 
                                            : wo.priority === 'P2_HIGH' ? 'bg-[#FDF4E6] text-[#925805]' : 'bg-[#EFEFE7] text-[#555]'
                                    }`}>
                                        {wo.priority.replace('_', ' ')}
                                    </span>
                                </div>

                                <h3 className="font-bold text-sm text-[#252B28] mt-3 leading-snug">
                                    {wo.title}
                                </h3>

                                <div className="mt-3 space-y-1.5 text-xs text-[#555A52]">
                                    <div className="flex items-center gap-1.5">
                                        <User size={13} className="text-[#858A80]" />
                                        <span><strong>Tech:</strong> {wo.assignedTechnician}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={13} className="text-[#858A80]" />
                                        <span><strong>Est. Downtime:</strong> {wo.estimatedDowntimeHours} Hours</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <ShieldAlert size={13} className="text-[#D94C45]" />
                                        <span className="text-[0.7rem] font-mono text-[#7A1C18]">
                                            {wo.safetyRequirements}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-[#F0EFEA] flex items-center justify-between text-xs">
                                <span className={`font-mono text-[0.68rem] font-bold ${
                                    wo.status === 'IN_PROGRESS' ? 'text-[#E7A944]' :
                                    wo.status === 'VERIFIED' ? 'text-[#2E7D32]' : 'text-[#858A80]'
                                }`}>
                                    Status: {wo.status}
                                </span>
                                <button
                                    onClick={() => {
                                        setWorkOrders(workOrders.map(item => 
                                            item.id === wo.id ? { ...item, status: 'VERIFIED' } : item
                                        ));
                                    }}
                                    className="text-[0.7rem] font-bold text-[#173F35] hover:underline"
                                >
                                    Mark Verified
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            )}

            {/* Modal: Create Work Order */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-lg w-full p-6 border border-[#D8D7CD] shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-[#F0EFEA]">
                            <h3 className="font-extrabold text-base text-[#173F35]">
                                Create Field Work Order
                            </h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-[#858A80] hover:text-black"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {formError && (
                            <div className="p-2.5 bg-[#FDECEC] border border-[#F8B4B1] rounded-lg text-xs text-[#9E1F1A]">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleCreateWorkOrder} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-bold text-[#252B28] mb-1">Target Pump Asset:</label>
                                <select
                                    value={targetPumpId}
                                    onChange={(e) => setTargetPumpId(e.target.value)}
                                    className="w-full p-2 rounded border border-[#D8D7CD] bg-white font-mono"
                                >
                                    {SMART_PUMPS.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.id} — {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-[#252B28] mb-1">Work Order Title:</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Replace drive end ball bearing"
                                    required
                                    className="w-full p-2 rounded border border-[#D8D7CD]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-[#252B28] mb-1">Priority:</label>
                                    <select
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                        className="w-full p-2 rounded border border-[#D8D7CD] bg-white"
                                    >
                                        <option value="P1_CRITICAL">P1 Critical</option>
                                        <option value="P2_HIGH">P2 High</option>
                                        <option value="P3_ROUTINE">P3 Routine</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold text-[#252B28] mb-1">Assigned Technician:</label>
                                    <input
                                        type="text"
                                        value={technician}
                                        onChange={(e) => setTechnician(e.target.value)}
                                        className="w-full p-2 rounded border border-[#D8D7CD]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-[#252B28] mb-1">Estimated Downtime (Hours):</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0.5"
                                        value={downtime}
                                        onChange={(e) => setDowntime(e.target.value)}
                                        required
                                        className="w-full p-2 rounded border border-[#D8D7CD] font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-[#252B28] mb-1">Target Window:</label>
                                    <input
                                        type="text"
                                        value="Within 48h"
                                        disabled
                                        className="w-full p-2 rounded border border-[#E6E5DC] bg-[#FAF9F5] text-[#858A80]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-[#252B28] mb-1">LOTO & Safety Requirements:</label>
                                <textarea
                                    value={safetyNotes}
                                    onChange={(e) => setSafetyNotes(e.target.value)}
                                    rows={2}
                                    className="w-full p-2 rounded border border-[#D8D7CD] font-mono text-[0.72rem]"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-[#F0EFEA]">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-3 py-1.5 rounded border border-[#D8D7CD]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-1.5 rounded bg-[#173F35] text-white font-bold flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {isSubmitting && <RefreshCw size={13} className="animate-spin" />}
                                    <span>{isSubmitting ? 'Dispatching...' : 'Dispatch Work Order'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaintenancePage;
