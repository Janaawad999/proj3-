import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import managerService from '../services/managerService';
import CustomSelect from './CustomSelect';

const ReportsExplorer = () => {
    const { t } = useTranslation();

    const [selectedReport, setSelectedReport] = useState(() => {
        return localStorage.getItem('reportsLibrary_selectedReport') || '';
    });
    const [parameters, setParameters] = useState(() => {
        const saved = localStorage.getItem('reportsLibrary_parameters');
        return saved ? JSON.parse(saved) : {};
    });
    const [reportData, setReportData] = useState(() => {
        const saved = localStorage.getItem('reportsLibrary_reportData');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'details'

    // Save to localStorage whenever values change
    useEffect(() => {
        localStorage.setItem('reportsLibrary_selectedReport', selectedReport);
    }, [selectedReport]);

    useEffect(() => {
        localStorage.setItem('reportsLibrary_parameters', JSON.stringify(parameters));
    }, [parameters]);

    useEffect(() => {
        if (reportData) {
            localStorage.setItem('reportsLibrary_reportData', JSON.stringify(reportData));
        } else {
            localStorage.removeItem('reportsLibrary_reportData');
        }
    }, [reportData]);

    // Define available reports
    const availableReports = [
        {
            id: 'visits_summary',
            name: 'Number of Visits per Day/Week/Month',
            description: 'View visit statistics per person or for the division as a whole',
            parameters: [
                { name: 'period', label: 'Period', type: 'select', options: ['day', 'week', 'month'], required: true },
                { name: 'startDate', label: 'Start Date', type: 'date', required: true },
                { name: 'endDate', label: 'End Date', type: 'date', required: true },
                { name: 'collectorId', label: 'Collector (Optional)', type: 'text', required: false, placeholder: 'Leave blank for division-wide' }
            ]
        },
        {
            id: 'successful_collections',
            name: 'Number of Successful Collections',
            description: 'Count of successful collection activities',
            parameters: [
                { name: 'startDate', label: 'Start Date', type: 'date', required: true },
                { name: 'endDate', label: 'End Date', type: 'date', required: true },
                { name: 'collectorId', label: 'Collector (Optional)', type: 'text', required: false, placeholder: 'Leave blank for all collectors' }
            ]
        },
        {
            id: 'collection_values',
            name: 'Value of Successful Collections vs Non-Due vs Overdue',
            description: 'Financial breakdown per day, month, or period YTD',
            parameters: [
                { name: 'period', label: 'Period', type: 'select', options: ['day', 'month', 'ytd'], required: true },
                { name: 'startDate', label: 'Start Date', type: 'date', required: true },
                { name: 'endDate', label: 'End Date', type: 'date', required: true }
            ]
        },
        {
            id: 'customer_onboarding',
            name: 'Number of Customers Onboarded / Validated',
            description: 'Track customer onboarding and validation activities',
            parameters: [
                { name: 'startDate', label: 'Start Date', type: 'date', required: true },
                { name: 'endDate', label: 'End Date', type: 'date', required: true },
                { name: 'status', label: 'Status', type: 'select', options: ['onboarded', 'validated', 'all'], required: true }
            ]
        },
        {
            id: 'reconciliations',
            name: 'Number of Successful Reconciliations Done',
            description: 'View reconciliation completion statistics',
            parameters: [
                { name: 'startDate', label: 'Start Date', type: 'date', required: true },
                { name: 'endDate', label: 'End Date', type: 'date', required: true },
                { name: 'collectorId', label: 'Collector (Optional)', type: 'text', required: false, placeholder: 'Leave blank for all collectors' }
            ]
        },
        {
            id: 'non_reconciling_balances',
            name: 'Number of Non-Reconciling Balances',
            description: 'Identify accounts with reconciliation issues',
            parameters: [
                { name: 'startDate', label: 'Start Date', type: 'date', required: true },
                { name: 'endDate', label: 'End Date', type: 'date', required: true },
                { name: 'minAmount', label: 'Minimum Amount (Optional)', type: 'number', required: false, placeholder: 'e.g., 1000' }
            ]
        },
        {
            id: 'visits_with_subtasks',
            name: 'Visit Details with Subtasks',
            description: 'Comprehensive view of visits with all associated subtasks, outcomes, and notes',
            parameters: [
                { name: 'startDate', label: 'Start Date', type: 'date', required: true },
                { name: 'endDate', label: 'End Date', type: 'date', required: true },
                { name: 'collectorId', label: 'Collector (Optional)', type: 'text', required: false, placeholder: 'Leave blank for all collectors' },
                { name: 'subtaskStatus', label: 'Subtask Status', type: 'select', options: ['all', 'completed', 'pending', 'blocked'], required: false },
                { name: 'includeNoSubtasks', label: 'Include Visits Without Subtasks', type: 'checkbox', required: false }
            ]
        }
    ];

    const handleReportChange = (reportId) => {
        setSelectedReport(reportId);
        setParameters({});
        setReportData(null);
        setError(null);
    };

    const handleParameterChange = (paramName, value) => {
        setParameters(prev => ({
            ...prev,
            [paramName]: value
        }));
    };

    const executeReport = async () => {
        const report = availableReports.find(r => r.id === selectedReport);
        if (!report) return;

        // Create a copy of parameters to modify for validation and execution
        let requestParams = { ...parameters };

        // Auto-fill endDate if period is 'day'
        if (requestParams.period === 'day' && requestParams.startDate) {
            requestParams.endDate = requestParams.startDate;
        }

        // Validate required parameters
        const missingParams = report.parameters
            .filter(p => p.required && !requestParams[p.name])
            .map(p => p.label);

        if (missingParams.length > 0) {
            setError(`Please fill in required fields: ${missingParams.join(', ')}`);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Call the appropriate service method based on report type
            let data;
            switch (selectedReport) {
                case 'visits_summary':
                    data = await managerService.getVisitsSummaryReport(requestParams);
                    break;
                case 'successful_collections':
                    data = await managerService.getSuccessfulCollectionsReport(requestParams);
                    break;
                case 'collection_values':
                    data = await managerService.getCollectionValuesReport(requestParams);
                    break;
                case 'customer_onboarding':
                    data = await managerService.getCustomerOnboardingReport(requestParams);
                    break;
                case 'reconciliations':
                    data = await managerService.getReconciliationsReport(requestParams);
                    break;
                case 'non_reconciling_balances':
                    data = await managerService.getNonReconcilingBalancesReport(requestParams);
                    break;
                case 'visits_with_subtasks':
                    data = await managerService.getVisitsWithSubtasksReport(requestParams);
                    break;
                default:
                    throw new Error('Unknown report type');
            }
            setReportData(data);
        } catch (err) {
            console.error('Error executing report:', err);
            setError(err.message || 'Failed to execute report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Get appropriate columns for details view based on report type
    const getDetailsColumns = () => {
        if (!reportData.details || reportData.details.length === 0) return [];

        switch (selectedReport) {
            case 'visits_summary':
                return ['visitDate', 'customerName', 'collectorName', 'city', 'outcomeStatus', 'collectedAmount', 'visitNotes'];
            case 'successful_collections':
                return ['date', 'customerName', 'collectorName', 'collectedAmount', 'paymentMethod', 'visitNotes'];
            default:
                // If no specific columns defined, show all except IDs
                return Object.keys(reportData.details[0])
                    .filter(key => !key.toLowerCase().includes('id'));
        }
    };

    // Format column headers to be readable
    const formatColumnHeader = (column) => {
        return column
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const renderTable = () => {
        if (!reportData || !reportData.data || reportData.data.length === 0) {
            return (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No data available for the selected parameters.
                </div>
            );
        }

        // Check if details are available
        const hasDetails = reportData.details && reportData.details.length > 0;

        // Determine which data to show
        const dataToDisplay = viewMode === 'details' && hasDetails
            ? reportData.details
            : reportData.data;

        // Determine columns based on view mode
        const columns = viewMode === 'details' && hasDetails
            ? getDetailsColumns()
            : (reportData.columns || Object.keys(reportData.data[0]));

        return (
            <div>
                {/* View Toggle Buttons */}
                {hasDetails && (
                    <div style={{
                        marginBottom: '1rem',
                        display: 'flex',
                        gap: '0.5rem',
                        borderBottom: '1px solid var(--border)',
                        paddingBottom: '0.5rem'
                    }}>
                        <button
                            onClick={() => setViewMode('summary')}
                            style={{
                                padding: '0.5rem 1rem',
                                background: viewMode === 'summary' ? 'linear-gradient(135deg, #0D5254 0%, #1F8180 100%)' : 'transparent',
                                color: viewMode === 'summary' ? '#FFFFFF' : 'var(--text-primary)',
                                border: '1px solid',
                                borderColor: viewMode === 'summary' ? '#0D5254' : 'var(--border)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.9rem'
                            }}
                        >
                            Summary View ({reportData.data.length} rows)
                        </button>
                        <button
                            onClick={() => setViewMode('details')}
                            style={{
                                padding: '0.5rem 1rem',
                                background: viewMode === 'details' ? 'linear-gradient(135deg, #0D5254 0%, #1F8180 100%)' : 'transparent',
                                color: viewMode === 'details' ? '#FFFFFF' : 'var(--text-primary)',
                                border: '1px solid',
                                borderColor: viewMode === 'details' ? '#0D5254' : 'var(--border)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.9rem'
                            }}
                        >
                            Detailed View ({reportData.details.length} records)
                        </button>
                    </div>
                )}

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: 'var(--bg-hover)', borderBottom: '2px solid var(--border)' }}>
                            <tr>
                                {columns.map((col, idx) => (
                                    <th
                                        key={idx}
                                        style={{
                                            padding: '1rem 1.5rem',
                                            textAlign: 'left',
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            color: 'var(--text-primary)',
                                            textTransform: 'capitalize'
                                        }}
                                    >
                                        {formatColumnHeader(col)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {dataToDisplay.map((row, rowIdx) => (
                                <tr
                                    key={rowIdx}
                                    style={{
                                        borderBottom: '1px solid var(--border)',
                                        transition: 'background-color 0.2s',
                                        backgroundColor: 'transparent'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-hover')}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    {columns.map((col, colIdx) => (
                                        <td
                                            key={colIdx}
                                            style={{
                                                padding: '1rem 1.5rem',
                                                color: 'var(--text-primary)',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            {formatCellValue(row[col], col)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const formatCellValue = (value, columnName) => {
        if (value === null || value === undefined) return 'N/A';

        const colLower = columnName.toLowerCase();

        // Format dates with time for details view
        if (colLower.includes('date') || colLower.includes('timestamp')) {
            const date = new Date(value);
            // If it's in details view and includes time component, show time
            if (viewMode === 'details' && (colLower.includes('visit') || colLower.includes('timestamp'))) {
                return date.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }

        // Format currency values
        if (colLower.includes('amount') || colLower.includes('value') || colLower.includes('revenue')) {
            return value ? `$${Number(value).toLocaleString()}` : 'N/A';
        }

        // Format percentages
        if (colLower.includes('rate') || colLower.includes('percent')) {
            return `${Number(value).toFixed(1)}%`;
        }

        // Status formatting with badges
        if (colLower.includes('status') || colLower === 'outcomestatus') {
            const statusColors = {
                'SUCCESS_PAYMENT': '#10b981',
                'PTP': '#3b82f6',
                'NO_CONTACT': '#6b7280',
                'REFUSED_TO_PAY': '#ef4444',
                'COMPLETED': '#10b981',
                'PENDING': '#f59e0b',
                'APPROVED': '#10b981',
                'REJECTED': '#ef4444'
            };
            const color = statusColors[value] || '#6b7280';
            return (
                <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: `${color}20`,
                    color: color,
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                }}>
                    {String(value).replace(/_/g, ' ')}
                </span>
            );
        }

        return String(value);
    };

    const currentReport = availableReports.find(r => r.id === selectedReport);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: '0 0 0.5rem 0', fontWeight: '600' }}>
                        {t('reportsExplorer.title')}
                    </h2>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        {t('reportsExplorer.subtitle')}
                    </p>
                </div>

            </div>

            {/* Report Selection */}
            <div className="card" style={{
                padding: '1.5rem',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                boxShadow: 'none'
            }}>
                <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600' }}>
                    {t('reportsExplorer.selectReport')}
                </h3>
                <CustomSelect
                    value={selectedReport}
                    onChange={handleReportChange}
                    options={[
                        { value: '', label: t('reportsExplorer.chooseReport') },
                        ...availableReports.map(report => ({
                            value: report.id,
                            label: report.name
                        }))
                    ]}
                    placeholder={t('reportsExplorer.chooseReport')}
                />

                {currentReport && (
                    <p style={{
                        margin: '1rem 0 0 0',
                        padding: '1rem',
                        backgroundColor: 'var(--bg-hover)',
                        borderLeft: '3px solid #2AAB91',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem'
                    }}>
                        {currentReport.description}
                    </p>
                )}
            </div>

            {/* Parameters Form */}
            {currentReport && (
                <div className="card" style={{
                    padding: '1.5rem',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    boxShadow: 'none'
                }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600' }}>
                        Report Parameters
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        {currentReport.parameters.map(param => {
                            // Dynamic logic for 'day' period
                            let displayParam = param;
                            if (parameters.period === 'day') {
                                if (param.name === 'endDate') return null; // Hide End Date
                                if (param.name === 'startDate') displayParam = { ...param, label: 'Date' }; // Rename Start Date
                            }

                            return (
                                <div key={displayParam.name}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.9rem',
                                        fontWeight: '500'
                                    }}>
                                        {displayParam.label} {displayParam.required && <span style={{ color: '#D9534F' }}>*</span>}
                                    </label>
                                    {displayParam.type === 'select' ? (
                                        <CustomSelect
                                            value={parameters[displayParam.name] || ''}
                                            onChange={(value) => handleParameterChange(displayParam.name, value)}
                                            options={[
                                                { value: '', label: `-- Select ${displayParam.label} --` },
                                                ...displayParam.options.map(opt => ({
                                                    value: opt,
                                                    label: opt.charAt(0).toUpperCase() + opt.slice(1)
                                                }))
                                            ]}
                                        />
                                    ) : (
                                        <input
                                            type={displayParam.type}
                                            value={parameters[displayParam.name] || ''}
                                            onChange={(e) => handleParameterChange(displayParam.name, e.target.value)}
                                            placeholder={displayParam.placeholder}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                borderRadius: '4px',
                                                border: '1px solid var(--border)',
                                                backgroundColor: 'var(--bg-surface)',
                                                color: 'var(--text-primary)',
                                                outline: 'none',
                                                fontSize: '0.9rem',
                                                boxSizing: 'border-box',
                                                colorScheme: document.documentElement.getAttribute('data-theme') || 'dark'
                                            }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {error && (
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            color: '#991b1b',
                            fontSize: '0.9rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        onClick={executeReport}
                        disabled={loading}
                        className="btn btn-primary"
                        style={{
                            marginTop: '1.5rem',
                            padding: '0.875rem 2rem',
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            opacity: loading ? 0.7 : 1,
                            background: 'linear-gradient(135deg, #0D5254 0%, #2AAB91 100%)',
                            color: '#FFFFFF',
                            border: 'none',
                            fontWeight: '600',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(42, 171, 145, 0.25)'
                        }}
                    >
                        {loading ? (
                            <>
                                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                                Executing...
                            </>
                        ) : (
                            <>
                                Execute Report
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Results Table */}
            {reportData && (
                <div className="card" style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '1.5rem',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h3 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600' }}>
                                Report Results
                            </h3>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                {reportData.data?.length || 0} record(s) found
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                // Export to CSV functionality - use active view data
                                const hasDetails = reportData.details && reportData.details.length > 0;
                                const dataToExport = viewMode === 'details' && hasDetails
                                    ? reportData.details
                                    : reportData.data;
                                const csvContent = convertToCSV(dataToExport);
                                downloadCSV(csvContent, `${selectedReport}_${viewMode}_${new Date().toISOString().split('T')[0]}.csv`);
                            }}
                            className="btn btn-secondary"
                            style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {t('reportsExplorer.exportCsv')}
                        </button>
                    </div>
                    {renderTable()}
                </div>
            )}

            {/* Recently Generated Reports (Placeholder) */}
            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600' }}>
                    {t('reportsExplorer.recentlyGenerated')}
                </h3>
                <div className="card" style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    overflow: 'hidden'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-hover)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1rem', textAlign: 'start', color: '#0D5254', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>{t('reportsExplorer.columns.reportName')}</th>
                                <th style={{ padding: '1rem', textAlign: 'start', color: '#0D5254', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>{t('reportsExplorer.columns.date')}</th>
                                <th style={{ padding: '1rem', textAlign: 'start', color: '#0D5254', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>{t('reportsExplorer.columns.generatedBy')}</th>
                                <th style={{ padding: '1rem', textAlign: 'end', color: '#0D5254', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>{t('reportsExplorer.columns.action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>Visits Summary (Weekly)</td>
                                <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Dec 05, 2025</td>
                                <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>You</td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2AAB91' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                    </button>
                                </td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>Successful Collections</td>
                                <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Dec 04, 2025</td>
                                <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>You</td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2AAB91' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ padding: '1rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>High Risk Account Audit</td>
                                <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Dec 01, 2025</td>
                                <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>You</td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2AAB91' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Helper function to convert data to CSV
const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Escape quotes and wrap in quotes if contains comma
                const escaped = String(value).replace(/"/g, '""');
                return escaped.includes(',') ? `"${escaped}"` : escaped;
            }).join(',')
        )
    ];

    return csvRows.join('\n');
};

// Helper function to download CSV
const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export default ReportsExplorer;

