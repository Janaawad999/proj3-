import { MMCard } from '@sdk';
import { useTranslation } from 'react-i18next';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen, Rocket, Palette, Server, Building2,
    Globe, Package, Code2, FileText, Search, ArrowRight,
    GraduationCap, Puzzle, ChevronRight, Megaphone
} from 'lucide-react';
import './DocsPage.css';

/* ─────────────────────── Doc Registry ─────────────────────── */
const DOC_REGISTRY = [
    {
        slug: 'quick-start',
        file: 'QUICK_START.md',
        categoryId: 'getting-started',
        titleKey: 'docs.items.quickStart',
        descKey: 'docs.items.quickStartDesc',
    },
    {
        slug: 'setup',
        file: 'SETUP.md',
        categoryId: 'getting-started',
        titleKey: 'docs.items.setup',
        descKey: 'docs.items.setupDesc',
    },
    {
        slug: 'deployment-instructions',
        file: 'DEPLOYMENT_INSTRUCTIONS.md',
        categoryId: 'getting-started',
        titleKey: 'docs.items.deployInstructions',
        descKey: 'docs.items.deployInstructionsDesc',
    },
    {
        slug: 'readme',
        file: 'README.md',
        categoryId: 'getting-started',
        titleKey: 'docs.items.readme',
        descKey: 'docs.items.readmeDesc',
    },
    {
        slug: 'extending-your-app',
        file: 'EXTENDING_YOUR_APP.md',
        categoryId: 'getting-started',
        titleKey: 'docs.items.extendingApp',
        descKey: 'docs.items.extendingAppDesc',
    },
    {
        slug: 'v4-sdk-reference',
        file: 'V4_SDK_REFERENCE.md',
        categoryId: 'frontend-sdk',
        titleKey: 'docs.items.v4Sdk',
        descKey: 'docs.items.v4SdkDesc',
    },
    {
        slug: 'branding',
        file: 'BRANDING.md',
        categoryId: 'frontend-sdk',
        titleKey: 'docs.items.branding',
        descKey: 'docs.items.brandingDesc',
    },
    {
        slug: 'backend-sdk',
        file: 'BACKEND_SDK_AGENTS_GUIDE.md',
        categoryId: 'backend-sdk',
        titleKey: 'docs.items.backendSdk',
        descKey: 'docs.items.backendSdkDesc',
    },
    {
        slug: 'ai-agents',
        file: 'AI_AGENTS_GUIDE.md',
        categoryId: 'ai-integration',
        titleKey: 'docs.items.aiAgents',
        descKey: 'docs.items.aiAgentsDesc',
    },
    {
        slug: 'saas',
        file: 'SAAS.md',
        categoryId: 'saas-features',
        titleKey: 'docs.items.saas',
        descKey: 'docs.items.saasDesc',
    },
    {
        slug: 'deployment',
        file: 'DEPLOYMENT.md',
        categoryId: 'deployment',
        titleKey: 'docs.items.deployment',
        descKey: 'docs.items.deploymentDesc',
    },
    {
        slug: 'example-credit-control',
        file: 'EXAMPLE_APP_CREDIT_CONTROL.md',
        categoryId: 'example-apps',
        titleKey: 'docs.items.exCreditControl',
        descKey: 'docs.items.exCreditControlDesc',
    },
    {
        slug: 'example-order-cycle',
        file: 'EXAMPLE_APP_ORDER_CYCLE.md',
        categoryId: 'example-apps',
        titleKey: 'docs.items.exOrderCycle',
        descKey: 'docs.items.exOrderCycleDesc',
    },
    {
        slug: 'example-otax',
        file: 'EXAMPLE_APP_OTAX.md',
        categoryId: 'example-apps',
        titleKey: 'docs.items.exOtax',
        descKey: 'docs.items.exOtaxDesc',
    },
    {
        slug: 'example-teamsync',
        file: 'EXAMPLE_APP_TEAMSYNC.md',
        categoryId: 'example-apps',
        titleKey: 'docs.items.exTeamSync',
        descKey: 'docs.items.exTeamSyncDesc',
    },
    {
        slug: 'example-oracle-ebs',
        file: 'EXAMPLE_INTEGRATION_ORACLE_EBS.md',
        categoryId: 'example-apps',
        titleKey: 'docs.items.exOracleEbs',
        descKey: 'docs.items.exOracleEbsDesc',
    },
    {
        slug: 'website-and-marketing',
        file: 'WEBSITE_AND_MARKETING.md',
        categoryId: 'go-to-market',
        titleKey: 'docs.items.websiteMarketing',
        descKey: 'docs.items.websiteMarketingDesc',
    },
    {
        slug: 'sales-flyers',
        file: 'SALES_FLYERS.md',
        categoryId: 'go-to-market',
        titleKey: 'docs.items.salesFlyers',
        descKey: 'docs.items.salesFlyersDesc',
    },
];

/* ─────────────────────── Categories ─────────────────────── */
/* MicroMind logo as a sized icon component */
const MicroMindIcon = ({ size = 22 }) => (
    <img
        src="/assets/logo.png"
        alt="MicroMind"
        style={{ width: size, height: size, objectFit: 'contain' }}
    />
);

const getCategories = (t) => [
    {
        id: 'getting-started',
        icon: Rocket,
        titleKey: 'docs.categories.gettingStarted',
        descKey: 'docs.categories.gettingStartedDesc',
        accentColor: '#2AAB91',
    },
    {
        id: 'deployment',
        icon: Globe,
        titleKey: 'docs.categories.deployment',
        descKey: 'docs.categories.deploymentDesc',
        accentColor: '#1F8180',
    },
    {
        id: 'go-to-market',
        icon: Megaphone,
        titleKey: 'docs.categories.goToMarket',
        descKey: 'docs.categories.goToMarketDesc',
        accentColor: '#0D5254',
    },
    {
        id: 'saas-features',
        icon: Building2,
        titleKey: 'docs.categories.saasFeatures',
        descKey: 'docs.categories.saasFeaturesDesc',
        accentColor: '#2AAB91',
    },
    {
        id: 'ai-integration',
        icon: MicroMindIcon,
        titleKey: 'docs.categories.aiIntegration',
        descKey: 'docs.categories.aiIntegrationDesc',
        accentColor: '#1F8180',
    },
    {
        id: 'example-apps',
        icon: Package,
        titleKey: 'docs.categories.exampleApps',
        descKey: 'docs.categories.exampleAppsDesc',
        accentColor: '#0D5254',
    },
    {
        id: 'frontend-sdk',
        icon: Palette,
        titleKey: 'docs.categories.frontendSdk',
        descKey: 'docs.categories.frontendSdkDesc',
        accentColor: '#2AAB91',
    },
    {
        id: 'backend-sdk',
        icon: Server,
        titleKey: 'docs.categories.backendSdk',
        descKey: 'docs.categories.backendSdkDesc',
        accentColor: '#1F8180',
    },
    {
        id: 'i18n',
        icon: Globe,
        titleKey: 'docs.categories.i18n',
        descKey: 'docs.categories.i18nDesc',
        accentColor: '#688A8C',
        comingSoon: true,
    },
    {
        id: 'sdk-gallery',
        icon: Puzzle,
        titleKey: 'docs.categories.sdkGallery',
        descKey: 'docs.categories.sdkGalleryDesc',
        accentColor: '#688A8C',
        comingSoon: true,
    },
];

/* ─────────────────────── Component ─────────────────────── */
function DocsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const categories = useMemo(() => getCategories(t), [t]);

    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return categories;
        const q = searchQuery.toLowerCase();
        return categories.filter(cat => {
            const catTitle = t(cat.titleKey).toLowerCase();
            const catDesc = t(cat.descKey).toLowerCase();
            if (catTitle.includes(q) || catDesc.includes(q)) return true;
            // Also check doc titles in this category
            const catDocs = DOC_REGISTRY.filter(d => d.categoryId === cat.id);
            return catDocs.some(d => t(d.titleKey).toLowerCase().includes(q));
        });
    }, [searchQuery, categories, t]);

    const getDocCount = (categoryId) =>
        DOC_REGISTRY.filter(d => d.categoryId === categoryId).length;

    const getFirstDoc = (categoryId) => {
        const doc = DOC_REGISTRY.find(d => d.categoryId === categoryId);
        return doc ? doc.slug : null;
    };

    const handleCategoryClick = (cat) => {
        if (cat.comingSoon) return;
        const slug = getFirstDoc(cat.id);
        if (slug) navigate(`/docs/${slug}`);
    };

    return (
        <div className="docs-page">
            {/* ── Hero Section ── */}
            <div className="docs-hero">
                <div className="docs-hero-icon">
                    <BookOpen size={32} />
                </div>
                <h1 className="docs-hero-title">{t('docs.heroTitle')}</h1>
                <p className="docs-hero-subtitle">{t('docs.heroSubtitle')}</p>

                {/* Search Bar */}
                <div className="docs-search-wrapper">
                    <Search size={18} className="docs-search-icon" />
                    <input
                        type="text"
                        className="docs-search-input"
                        placeholder={t('docs.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* ── Quick Links ── */}
            <div className="docs-quick-links">
                <button
                    className="docs-quick-link"
                    onClick={() => navigate('/docs/quick-start')}
                >
                    <Rocket size={14} />
                    {t('docs.items.quickStart')}
                </button>
                <button
                    className="docs-quick-link"
                    onClick={() => navigate('/docs/v4-sdk-reference')}
                >
                    <Code2 size={14} />
                    {t('docs.items.v4Sdk')}
                </button>
                <button
                    className="docs-quick-link"
                    onClick={() => navigate('/docs/ai-agents')}
                >
                    <MicroMindIcon size={14} />
                    {t('docs.items.aiAgents')}
                </button>
                <button
                    className="docs-quick-link"
                    onClick={() => navigate('/docs/saas')}
                >
                    <Building2 size={14} />
                    {t('docs.items.saas')}
                </button>
            </div>

            {/* ── Category Cards Grid ── */}
            <div className="docs-grid">
                {filteredCategories.map((cat) => {
                    const Icon = cat.icon;
                    const docCount = getDocCount(cat.id);
                    const isComingSoon = cat.comingSoon;

                    return (
                        <div
                            key={cat.id}
                            className={`docs-card-wrapper ${isComingSoon ? 'docs-coming-soon' : ''}`}
                            style={{ cursor: isComingSoon ? 'default' : 'pointer' }}
                            onClick={() => handleCategoryClick(cat)}
                        >
                            <MMCard
                                className="docs-category-card"
                            >
                                {/* Accent bar */}
                                <div
                                    className="docs-card-accent"
                                    style={{ background: cat.accentColor }}
                                />

                                <div className="docs-card-content">
                                    <div className="docs-card-header">
                                        <div
                                            className="docs-card-icon-wrapper"
                                            style={{
                                                background: `linear-gradient(135deg, ${cat.accentColor}22 0%, ${cat.accentColor}08 100%)`,
                                                color: cat.accentColor,
                                            }}
                                        >
                                            <Icon size={22} />
                                        </div>
                                        {isComingSoon && (
                                            <span className="docs-coming-soon-badge">
                                                {t('docs.comingSoon')}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="docs-card-title">{t(cat.titleKey)}</h3>
                                    <p className="docs-card-desc">{t(cat.descKey)}</p>

                                    {!isComingSoon && (
                                        <div className="docs-card-footer">
                                            <span className="docs-doc-count">
                                                <FileText size={13} />
                                                {docCount} {docCount === 1 ? t('docs.document') : t('docs.documents')}
                                            </span>
                                            <span className="docs-card-arrow">
                                                <ArrowRight size={16} />
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </MMCard>
                        </div>
                    );
                })}
            </div>

            {/* ── AI Agents Tip ── */}
            <div className="docs-ai-tip">
                <div className="docs-ai-tip-icon">
                    <GraduationCap size={20} />
                </div>
                <div className="docs-ai-tip-content">
                    <strong>{t('docs.aiTipTitle')}</strong>
                    <p>{t('docs.aiTipDesc')}</p>
                </div>
            </div>
        </div>
    );
}

export default DocsPage;
