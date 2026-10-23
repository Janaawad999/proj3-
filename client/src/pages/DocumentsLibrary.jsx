import React, { useEffect, useState, useCallback } from 'react';
import managerService from '../services/managerService';
import CustomSelect from '../components/CustomSelect';
import { useTranslation } from 'react-i18next';

const DocumentsLibrary = () => {
    const { t } = useTranslation();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        collectorId: 'all',
        startDate: (() => {
            const date = new Date();
            date.setDate(date.getDate() - 30); // Last 30 days
            return date.toISOString().split('T')[0];
        })(),
        endDate: new Date().toISOString().split('T')[0],
        mediaType: 'all',
        searchQuery: ''
    });
    const [collectors, setCollectors] = useState([]);

    // Load collectors
    const loadCollectors = useCallback(async () => {
        try {
            const data = await managerService.getTeamStatus();
            setCollectors(data);
        } catch (error) {
            console.error('Failed to load collectors', error);
        }
    }, []);

    // Load documents
    const loadDocuments = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch audit visits with media using date range
            const response = await managerService.getAuditVisits({
                collectorId: filters.collectorId,
                startDate: filters.startDate,
                endDate: filters.endDate,
                outcomeFilter: 'all'
            });

            // Flatten visits to individual documents
            const allDocuments = [];
            if (response.visits) {
                response.visits.forEach(visit => {
                    if (visit.media && visit.media.length > 0) {
                        visit.media.forEach(media => {
                            allDocuments.push({
                                ...media,
                                visit: {
                                    id: visit.id,
                                    customerName: visit.customer.name,
                                    customerRegion: visit.customer.region,
                                    collectorName: visit.collector?.displayName || visit.assignedTo?.displayName || 'Unknown',
                                    outcomeStatus: visit.outcomeStatus,
                                    logTimestamp: visit.logTimestamp,
                                    collectedAmount: visit.collectedAmount,
                                    gpsStatus: visit.gpsStatus
                                }
                            });
                        });
                    }
                });
            }

            // Apply filters (date range is now handled by backend)
            let filtered = allDocuments;

            // Filter by media type
            if (filters.mediaType !== 'all') {
                filtered = filtered.filter(doc => doc.mediaType === filters.mediaType);
            }

            // Filter by search query
            if (filters.searchQuery) {
                const query = filters.searchQuery.toLowerCase();
                filtered = filtered.filter(doc =>
                    doc.visit.customerName.toLowerCase().includes(query) ||
                    doc.visit.collectorName.toLowerCase().includes(query) ||
                    doc.visit.customerRegion.toLowerCase().includes(query)
                );
            }

            // Sort by date (newest first)
            filtered.sort((a, b) => new Date(b.visit.logTimestamp) - new Date(a.visit.logTimestamp));

            setDocuments(filtered);
        } catch (error) {
            console.error('Failed to load documents', error);
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadCollectors();
    }, [loadCollectors]);

    useEffect(() => {
        loadDocuments();
    }, [loadDocuments]);

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const handleDownload = (document) => {
        window.open(document.s3Path, '_blank');
    };



    // Improved mapping to use just the text part from translations if needed,
    // or keep icons. Let's strictly follow the translation file which includes icons.
    const getMediaTypeLabel = (mediaType) => {
        switch (mediaType) {
            case 'PHOTO': return t('documents.mediaTypes.photo');
            case 'SITE_PHOTO': return t('documents.mediaTypes.sitePhoto');
            case 'VOICE_NOTE': return t('documents.mediaTypes.voiceNote');
            case 'SITE_EVALUATION_PHOTO': return t('documents.mediaTypes.siteEvaluation');
            default: return mediaType;
        }
    };

    // Extract icon from label if needed, or just display the whole label.
    // The previous implementation had icons hardcoded in switch. 
    // The translation keys I added include the icons "📷 Photos".
    // So I can just return the translated string.

    const getOutcomeBadge = (outcomeStatus) => {
        const badges = {
            'SUCCESS_PAYMENT': { label: t('documents.outcomes.SUCCESS_PAYMENT'), color: '#16a34a' },
            'PTP': { label: t('documents.outcomes.PTP'), color: '#f59e0b' },
            'CLIENT_UNAVAILABLE': { label: t('documents.outcomes.CLIENT_UNAVAILABLE'), color: '#dc2626' },
            'FAILURE_NO_CONTACT': { label: t('documents.outcomes.FAILURE_NO_CONTACT'), color: '#dc2626' },
            'REJECTED': { label: t('documents.outcomes.REJECTED'), color: '#dc2626' }
        };
        return badges[outcomeStatus] || { label: outcomeStatus, color: '#64748b' };
    };

    return (
        <div className="dashboard-container" style={{ paddingBottom: '2rem' }}>
            <div style={{ padding: '0 2rem 2rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: '0 0 0.5rem 0', fontWeight: '600' }}>
                            {t('documents.title')}
                        </h2>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            {t('documents.subtitle')}
                        </p>
                    </div>

                    {/* Filters */}
                    <div style={{
                        marginBottom: '0',
                        padding: '1.5rem',
                        display: 'flex',
                        gap: '1.5rem',
                        alignItems: 'flex-end',
                        flexWrap: 'wrap',
                        backgroundColor: 'var(--bg-surface)',
                        borderRadius: '12px',
                        border: '1px solid var(--border)'
                    }}>
                        {/* Collector Filter */}
                        <div style={{ flex: '1 1 220px', minWidth: '200px' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                {t('documents.filters.collector')}
                            </label>
                            <CustomSelect
                                value={filters.collectorId}
                                onChange={(value) => handleFilterChange('collectorId', value)}
                                options={[
                                    { value: 'all', label: t('documents.filters.allCollectors') },
                                    ...collectors.map(c => ({ value: c.id, label: c.name }))
                                ]}
                            />
                        </div>

                        {/* Start Date */}
                        <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                {t('documents.filters.startDate')}
                            </label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                style={{
                                    width: '100%',
                                    height: '42px',
                                    padding: '0 0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--bg-surface)',
                                    fontSize: '0.95rem',
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    colorScheme: document.documentElement.getAttribute('data-theme') || 'dark'
                                }}
                            />
                        </div>

                        {/* End Date */}
                        <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                {t('documents.filters.endDate')}
                            </label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                style={{
                                    width: '100%',
                                    height: '42px',
                                    padding: '0 0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--bg-surface)',
                                    fontSize: '0.95rem',
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    colorScheme: document.documentElement.getAttribute('data-theme') || 'dark'
                                }}
                            />
                        </div>

                        {/* Media Type Filter */}
                        <div style={{ flex: '1 1 220px', minWidth: '200px' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                {t('documents.filters.mediaType')}
                            </label>
                            <CustomSelect
                                value={filters.mediaType}
                                onChange={(value) => handleFilterChange('mediaType', value)}
                                options={[
                                    { value: 'all', label: t('documents.filters.allTypes') },
                                    { value: 'PHOTO', label: t('documents.mediaTypes.photo') },
                                    { value: 'SITE_PHOTO', label: t('documents.mediaTypes.sitePhoto') },
                                    { value: 'VOICE_NOTE', label: t('documents.mediaTypes.voiceNote') },
                                    { value: 'SITE_EVALUATION_PHOTO', label: t('documents.mediaTypes.siteEvaluation') }
                                ]}
                            />
                        </div>

                        {/* Search */}
                        <div style={{ flex: '1 1 280px', minWidth: '250px' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                {t('documents.filters.search')}
                            </label>
                            <input
                                type="text"
                                value={filters.searchQuery}
                                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                                placeholder={t('documents.filters.searchPlaceholder')}
                                style={{
                                    width: '100%',
                                    height: '42px',
                                    padding: '0 0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--bg-surface)',
                                    fontSize: '0.95rem',
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    </div>

                    {/* Results Count */}
                    <div>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>
                            <strong style={{ color: '#0D5254', fontSize: '1.1rem' }}>{documents.length}</strong> {t('documents.stats.found')}
                        </p>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                        <div className="spinner" style={{ marginBottom: '1rem' }}></div>
                        {t('common.loading')}
                    </div>
                ) : documents.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem',
                        backgroundColor: 'var(--bg-surface)',
                        borderRadius: '12px',
                        border: '1px dashed var(--border)',
                        color: 'var(--text-secondary)'
                    }}>
                        <span style={{ fontSize: '3rem' }}>📁</span>
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.5rem' }}>
                            {t('documents.empty.title')}
                        </h3>
                        <p style={{ fontSize: '0.9rem' }}>
                            {t('documents.empty.subtitle')}
                        </p>
                    </div>
                ) : (
                    <div style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        overflow: 'hidden'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--bg-hover)', borderBottom: '2px solid var(--border)' }}>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {t('documents.table.dateTime')}
                                    </th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {t('documents.table.customer')}
                                    </th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {t('documents.table.collector')}
                                    </th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {t('documents.table.mediaType')}
                                    </th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {t('documents.table.outcome')}
                                    </th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {t('documents.table.gpsStatus')}
                                    </th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {t('documents.table.actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map((doc, index) => {
                                    const outcomeBadge = getOutcomeBadge(doc.visit.outcomeStatus);
                                    return (
                                        <tr
                                            key={`${doc.visit.id}-${doc.id || index}`}
                                            style={{
                                                borderBottom: index < documents.length - 1 ? '1px solid var(--border)' : 'none',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-hover')}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            {/* Date/Time */}
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                                        {new Date(doc.visit.logTimestamp).toLocaleDateString()}
                                                    </span>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                                        {new Date(doc.visit.logTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Customer */}
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                    <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                                        {doc.visit.customerName}
                                                    </span>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                        📍 {doc.visit.customerRegion}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Collector */}
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
                                                    👤 {doc.visit.collectorName}
                                                </span>
                                            </td>

                                            {/* Media Type */}
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <div style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    padding: '0.375rem 0.875rem',
                                                    borderRadius: '6px',
                                                    backgroundColor: 'var(--bg-hover)',
                                                    border: '1px solid var(--border)'
                                                }}>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                                        {getMediaTypeLabel(doc.mediaType)}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Outcome */}
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '0.375rem 0.75rem',
                                                    borderRadius: '6px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '700',
                                                    color: outcomeBadge.color,
                                                    border: `1px solid ${outcomeBadge.color}`,
                                                    backgroundColor: 'transparent'
                                                }}>
                                                    {outcomeBadge.label}
                                                </span>
                                            </td>

                                            {/* GPS Status */}
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <span style={{
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    color: doc.visit.gpsStatus === 'VERIFIED' ? '#16a34a' :
                                                        doc.visit.gpsStatus === 'SUSPICIOUS' ? '#f59e0b' : '#dc2626'
                                                }}>
                                                    {doc.visit.gpsStatus === 'VERIFIED' ? '✓' :
                                                        doc.visit.gpsStatus === 'SUSPICIOUS' ? '⚠' : '✗'} {doc.visit.gpsStatus || 'N/A'}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => handleDownload(doc)}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '6px',
                                                        border: '1px solid #2AAB91',
                                                        backgroundColor: 'transparent',
                                                        color: '#2AAB91',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.backgroundColor = '#2AAB91';
                                                        e.target.style.color = '#FFFFFF';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.backgroundColor = 'transparent';
                                                        e.target.style.color = '#2AAB91';
                                                    }}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                                                    </svg>
                                                    {t('documents.table.download')}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentsLibrary;

