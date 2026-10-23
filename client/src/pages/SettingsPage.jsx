import React, { useState, useEffect } from 'react';
import { 
    Settings, Sliders, Bell, ShieldCheck, 
    Save, Check, RefreshCw, Info, Database
} from 'lucide-react';
import { settingsService } from '../services/api';

const SettingsPage = () => {
    const [vibrationWarning, setVibrationWarning] = useState('4.5');
    const [vibrationCritical, setVibrationCritical] = useState('7.1');
    const [tempWarning, setTempWarning] = useState('75.0');
    const [samplingRate, setSamplingRate] = useState('2500');
    const [alertEmail, setAlertEmail] = useState('t.mansour@agripulse.ai');
    const [webhookUrl, setWebhookUrl] = useState('https://scada.agripulse.internal/hooks/anomaly');
    const [saved, setSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const res = await settingsService.getSettings();
                const data = res.data || res;
                if (data) {
                    if (data.vibrationWarning) setVibrationWarning(String(data.vibrationWarning));
                    if (data.vibrationCritical) setVibrationCritical(String(data.vibrationCritical));
                    if (data.tempWarning) setTempWarning(String(data.tempWarning));
                    if (data.samplingRateMs) setSamplingRate(String(data.samplingRateMs));
                    if (data.alertEmail) setAlertEmail(data.alertEmail);
                    if (data.webhookUrl) setWebhookUrl(data.webhookUrl);
                }
            } catch (err) {
                console.warn('Could not load server settings, using defaults');
            }
        };
        loadSettings();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        const vibWarn = parseFloat(vibrationWarning);
        const vibCrit = parseFloat(vibrationCritical);
        if (isNaN(vibWarn) || isNaN(vibCrit) || vibWarn <= 0 || vibCrit <= 0) {
            setErrorMessage('Please enter valid positive vibration thresholds.');
            return;
        }
        if (vibWarn >= vibCrit) {
            setErrorMessage('Zone C warning threshold must be strictly less than Zone D danger threshold.');
            return;
        }

        setIsSaving(true);
        try {
            await settingsService.updateSettings({
                vibrationWarning: vibWarn,
                vibrationCritical: vibCrit,
                tempWarning: parseFloat(tempWarning) || 75.0,
                samplingRateMs: parseInt(samplingRate, 10) || 2500,
                alertEmail,
                webhookUrl
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setErrorMessage(err.userMessage || 'Failed to save settings.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="border-b border-[#E6E5DC] pb-4">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[0.68rem] font-mono tracking-widest uppercase font-extrabold px-2 py-0.5 rounded bg-[#173F35] text-[#C7F36B]">
                        SYSTEM CALIBRATION
                    </span>
                </div>
                <h1 className="text-3xl font-extrabold text-[#173F35] tracking-tight">
                    AgriPulse Platform Settings
                </h1>
                <p className="text-sm text-[#858A80] mt-0.5">
                    Sensor telemetry alarm tolerances, ISO threshold limits, and notification destinations.
                </p>
            </div>

            {saved && (
                <div className="p-3 bg-[#DCE7D8] text-[#173F35] font-bold text-xs rounded-md flex items-center gap-2">
                    <Check size={16} />
                    <span>Configuration successfully updated and synchronized with local cache.</span>
                </div>
            )}

            {errorMessage && (
                <div className="p-3 bg-[#FDECEC] border border-[#F8B4B1] rounded-md text-[#9E1F1A] font-medium text-xs flex items-center justify-between">
                    <span>{errorMessage}</span>
                    <button onClick={() => setErrorMessage('')} className="underline text-[0.68rem] font-bold">
                        Dismiss
                    </button>
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
                {/* 1. ISO 10816 Vibration Alert Thresholds */}
                <div className="bg-white border border-[#E6E5DC] rounded-lg p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#F0EFEA]">
                        <Sliders size={16} className="text-[#173F35]" />
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#173F35]">
                            ISO 10816-3 Vibration Severity Limits (Class II Pumps)
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                            <label className="block font-bold text-[#252B28] mb-1">
                                Zone C Alert Threshold (mm/s RMS):
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={vibrationWarning}
                                onChange={(e) => setVibrationWarning(e.target.value)}
                                className="w-full p-2 rounded border border-[#D8D7CD] font-mono"
                            />
                            <p className="text-[0.68rem] text-[#858A80] mt-1">
                                Triggers advisory notice and dispatches lubrication inspection.
                            </p>
                        </div>

                        <div>
                            <label className="block font-bold text-[#252B28] mb-1">
                                Zone D Critical Danger Threshold (mm/s RMS):
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={vibrationCritical}
                                onChange={(e) => setVibrationCritical(e.target.value)}
                                className="w-full p-2 rounded border border-[#D8D7CD] font-mono text-[#D94C45] font-bold"
                            />
                            <p className="text-[0.68rem] text-[#858A80] mt-1">
                                Mandatory automated motor trip & breaker lockout.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Telemetry Polling Rate */}
                <div className="bg-white border border-[#E6E5DC] rounded-lg p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#F0EFEA]">
                        <Database size={16} className="text-[#173F35]" />
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#173F35]">
                            IoT Telemetry Polling Frequency
                        </h3>
                    </div>

                    <div className="text-xs">
                        <label className="block font-bold text-[#252B28] mb-1">
                            Hardware Transducer Sampling Rate:
                        </label>
                        <select
                            value={samplingRate}
                            onChange={(e) => setSamplingRate(e.target.value)}
                            className="w-full md:w-64 p-2 rounded border border-[#D8D7CD] bg-white font-mono"
                        >
                            <option value="1000">1,000 ms (High-Frequency Acoustic)</option>
                            <option value="2500">2,500 ms (Standard Balanced Telemetry)</option>
                            <option value="10000">10,000 ms (Low-Bandwidth Satellite Link)</option>
                        </select>
                    </div>
                </div>

                {/* 3. Notification Relays */}
                <div className="bg-white border border-[#E6E5DC] rounded-lg p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#F0EFEA]">
                        <Bell size={16} className="text-[#173F35]" />
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#173F35]">
                            Anomaly Dispatch Channels
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                            <label className="block font-bold text-[#252B28] mb-1">
                                On-Duty Engineer Email:
                            </label>
                            <input
                                type="email"
                                value={alertEmail}
                                onChange={(e) => setAlertEmail(e.target.value)}
                                className="w-full p-2 rounded border border-[#D8D7CD] font-mono"
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-[#252B28] mb-1">
                                SCADA Webhook Relay URL:
                            </label>
                            <input
                                type="url"
                                value={webhookUrl}
                                onChange={(e) => setWebhookUrl(e.target.value)}
                                className="w-full p-2 rounded border border-[#D8D7CD] font-mono"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="agri-btn agri-btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 disabled:opacity-60"
                    >
                        {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={15} />}
                        <span>{isSaving ? 'Calibrating System...' : 'Save Calibration Parameters'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SettingsPage;
