import { MMCard } from '@sdk';
import { useTranslation } from 'react-i18next';
import {
    GraduationCap, Code2, Rocket, Mail, Globe,
    ExternalLink, MessageCircle, ArrowRight
} from 'lucide-react';

// Brand-aligned SVG icons for social platforms
const LinkedInIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

const FacebookIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

const YouTubeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
);

const XIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const DiscordIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
    </svg>
);

/* ────────────────────────────── Styles ────────────────────────────── */
const styles = {
    page: {
        padding: '2rem',
        maxWidth: '1100px',
        margin: '0 auto',
    },
    heroSection: {
        textAlign: 'center',
        marginBottom: '3rem',
        padding: '2.5rem 2rem',
        background: 'linear-gradient(135deg, rgba(13,82,84,0.08) 0%, rgba(42,171,145,0.04) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(42,171,145,0.2)',
    },
    heroIcon: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #0D5254 0%, #2AAB91 100%)',
        marginBottom: '1.25rem',
        color: '#FFFFFF',
        boxShadow: '0 4px 12px rgba(42,171,145,0.3)',
    },
    heroTitle: {
        fontSize: '2.25rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: '0.75rem',
        letterSpacing: '-0.02em',
    },
    heroSubtitle: {
        fontSize: '1.1rem',
        color: 'var(--text-secondary)',
        maxWidth: '600px',
        margin: '0 auto',
        lineHeight: 1.6,
    },
    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    sectionSubtitle: {
        fontSize: '0.95rem',
        color: 'var(--text-secondary)',
        marginBottom: '1.75rem',
        lineHeight: 1.5,
    },
    trackGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.25rem',
        marginBottom: '3rem',
        alignItems: 'stretch',
    },
    trackCard: {
        padding: '1.75rem',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--bg-surface)',
        transition: 'all 0.3s ease',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    trackIconWrapper: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        marginBottom: '1rem',
    },
    trackTitle: {
        fontSize: '1.15rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: '0.5rem',
    },
    trackAudience: {
        display: 'inline-block',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        padding: '4px 10px',
        borderRadius: '6px',
        marginBottom: '0.75rem',
    },
    trackDescription: {
        fontSize: '0.9rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
    },
    bulletList: {
        listStyle: 'none',
        padding: 0,
        margin: '0.75rem 0 0 0',
        flex: 1,
    },
    bulletItem: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.5rem',
        marginBottom: '0.5rem',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.5,
    },
    bulletArrow: {
        color: '#2AAB91',
        marginTop: '3px',
        flexShrink: 0,
    },
    contactSection: {
        marginTop: '1rem',
    },
    contactGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem',
        alignItems: 'stretch',
    },
    contactCard: {
        padding: '1.5rem',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    contactItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 0',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
    },
    contactItemLast: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 0',
        borderBottom: 'none',
    },
    contactIconWrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        backgroundColor: 'rgba(42,171,145,0.12)',
        color: '#2AAB91',
        flexShrink: 0,
    },
    contactLabel: {
        fontSize: '0.75rem',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        marginBottom: '2px',
    },
    contactValue: {
        fontSize: '0.9rem',
        color: 'var(--text-primary)',
    },
    contactLink: {
        fontSize: '0.9rem',
        color: '#2AAB91',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        transition: 'opacity 0.2s',
    },
    socialGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.75rem',
        marginTop: '0.5rem',
        flex: 1,
        alignContent: 'start',
    },
    socialLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.875rem 1rem',
        borderRadius: '10px',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--bg-surface)',
        color: 'var(--text-primary)',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        fontSize: '0.9rem',
        fontWeight: 500,
    },
    socialDisabled: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.875rem 1rem',
        borderRadius: '10px',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--bg-surface)',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        fontWeight: 500,
        opacity: 0.6,
    },
    comingSoonBadge: {
        fontSize: '0.65rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        padding: '2px 6px',
        borderRadius: '4px',
        backgroundColor: 'rgba(42,171,145,0.15)',
        color: '#2AAB91',
        marginLeft: 'auto',
    },
    cardTitle: {
        fontSize: '1.1rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
};

/* ─────────────────────── Track Data ─────────────────────── */
const getTracks = (t) => [
    {
        useLogo: true,
        icon: null,
        title: t('campus.tracks.aiAgent.title'),
        subtitle: t('campus.tracks.aiAgent.subtitle'),
        audience: t('campus.tracks.aiAgent.audience'),
        audienceColor: { background: 'rgba(42,171,145,0.12)', color: '#2AAB91' },
        iconBg: 'linear-gradient(135deg, rgba(13,82,84,0.2) 0%, rgba(42,171,145,0.1) 100%)',
        iconColor: '#2AAB91',
        accentColor: '#2AAB91',
        bullets: [
            t('campus.tracks.aiAgent.bullet1'),
            t('campus.tracks.aiAgent.bullet2'),
            t('campus.tracks.aiAgent.bullet3'),
            t('campus.tracks.aiAgent.bullet4'),
        ],
    },
    {
        icon: Code2,
        title: t('campus.tracks.fullStack.title'),
        subtitle: t('campus.tracks.fullStack.subtitle'),
        audience: t('campus.tracks.fullStack.audience'),
        audienceColor: { background: 'rgba(52,211,153,0.12)', color: '#34D399' },
        iconBg: 'linear-gradient(135deg, rgba(52,211,153,0.2) 0%, rgba(52,211,153,0.05) 100%)',
        iconColor: '#34D399',
        accentColor: '#34D399',
        bullets: [
            t('campus.tracks.fullStack.bullet1'),
            t('campus.tracks.fullStack.bullet2'),
            t('campus.tracks.fullStack.bullet3'),
            t('campus.tracks.fullStack.bullet4'),
        ],
    },
    {
        icon: Rocket,
        title: t('campus.tracks.founder.title'),
        subtitle: t('campus.tracks.founder.subtitle'),
        audience: t('campus.tracks.founder.audience'),
        audienceColor: { background: 'rgba(251,113,133,0.12)', color: '#FB7185' },
        iconBg: 'linear-gradient(135deg, rgba(251,113,133,0.2) 0%, rgba(251,113,133,0.05) 100%)',
        iconColor: '#FB7185',
        accentColor: '#FB7185',
        bullets: [
            t('campus.tracks.founder.bullet1'),
            t('campus.tracks.founder.bullet2'),
            t('campus.tracks.founder.bullet3'),
            t('campus.tracks.founder.bullet4'),
        ],
    },
];

/* ─────────────────────── Component ─────────────────────── */
function CampusPage() {
    const { t } = useTranslation();
    const TRACKS = getTracks(t);

    return (
        <div style={styles.page}>
            {/* ── Hero Section ── */}
            <div style={styles.heroSection}>
                <div style={styles.heroIcon}>
                    <GraduationCap size={32} />
                </div>
                <h1 style={styles.heroTitle}>{t('campus.heroTitle')}</h1>
                <p style={styles.heroSubtitle}>
                    {t('campus.heroSubtitle')}
                </p>
            </div>

            {/* ── Section: What You'll Get ── */}
            <div style={{ marginBottom: '3rem' }}>
                <h2 style={styles.sectionTitle}>
                    <span style={{ color: '#2AAB91' }}>
                        <GraduationCap size={24} />
                    </span>
                    {t('campus.sectionTitle')}
                </h2>
                <p style={styles.sectionSubtitle}>
                    {t('campus.sectionSubtitle')}
                </p>

                <div style={styles.trackGrid}>
                    {TRACKS.map((track, idx) => {
                        const IconComponent = track.icon;
                        return (
                            <MMCard key={idx} style={styles.trackCard}>
                                {/* Accent Top Bar */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '3px',
                                    background: `linear-gradient(90deg, ${track.accentColor} 0%, transparent 100%)`,
                                }} />
                                {/* Track Icon */}
                                <div style={{
                                    ...styles.trackIconWrapper,
                                    background: track.iconBg,
                                    color: track.iconColor,
                                }}>
                                    {track.useLogo ? (
                                        <img
                                            src="/assets/logo.png"
                                            alt="AI MicroMind"
                                            style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <IconComponent size={24} />
                                    )}
                                </div>

                                {/* Title + Subtitle */}
                                <div style={styles.trackTitle}>{track.title}</div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    color: 'var(--text-secondary)',
                                    marginBottom: '0.5rem',
                                    fontWeight: 500,
                                    lineHeight: 1.4,
                                }}>
                                    {track.subtitle}
                                </div>

                                {/* Audience Badge */}
                                <div style={{ ...styles.trackAudience, ...track.audienceColor }}>
                                    {track.audience}
                                </div>

                                {/* Bullet Points */}
                                <ul style={styles.bulletList}>
                                    {track.bullets.map((bullet, i) => (
                                        <li key={i} style={styles.bulletItem}>
                                            <ArrowRight size={14} style={styles.bulletArrow} />
                                            <span>{bullet}</span>
                                        </li>
                                    ))}
                                </ul>
                            </MMCard>
                        );
                    })}
                </div>
            </div>

            {/* ── Section: How to Communicate ── */}
            <div style={styles.contactSection}>
                <h2 style={styles.sectionTitle}>
                    <span style={{ color: '#2AAB91' }}>
                        <MessageCircle size={24} />
                    </span>
                    {t('campus.contactTitle')}
                </h2>
                <p style={styles.sectionSubtitle}>
                    {t('campus.contactSubtitle')}
                </p>

                <div style={styles.contactGrid}>
                    {/* Direct Contact Card */}
                    <MMCard style={styles.contactCard}>
                        <div style={styles.cardTitle}>
                            <Mail size={18} style={{ color: '#2AAB91' }} />
                            {t('campus.directContact')}
                        </div>

                        <div style={styles.contactItem}>
                            <div style={styles.contactIconWrapper}>
                                <Mail size={16} />
                            </div>
                            <div>
                                <div style={styles.contactLabel}>{t('campus.email')}</div>
                                <a href="mailto:Campus@aimicromind.com" style={styles.contactLink}>
                                    Campus@aimicromind.com
                                    <ExternalLink size={12} />
                                </a>
                            </div>
                        </div>

                        <div style={styles.contactItem}>
                            <div style={styles.contactIconWrapper}>
                                <Globe size={16} />
                            </div>
                            <div>
                                <div style={styles.contactLabel}>{t('campus.website')}</div>
                                <a href="https://aimicromind.com" target="_blank" rel="noopener noreferrer" style={styles.contactLink}>
                                    aimicromind.com
                                    <ExternalLink size={12} />
                                </a>
                            </div>
                        </div>

                        <div style={styles.contactItemLast}>
                            <div style={styles.contactIconWrapper}>
                                <DiscordIcon />
                            </div>
                            <div>
                                <div style={styles.contactLabel}>{t('campus.discordCommunity')}</div>
                                <a href="https://discord.gg/D68xJE3s" target="_blank" rel="noopener noreferrer" style={styles.contactLink}>
                                    {t('campus.joinDiscord')}
                                    <ExternalLink size={12} />
                                </a>
                            </div>
                        </div>
                    </MMCard>

                    {/* Social Media Card */}
                    <MMCard style={styles.contactCard}>
                        <div style={styles.cardTitle}>
                            <Globe size={18} style={{ color: '#2AAB91' }} />
                            {t('campus.followUs')}
                        </div>

                        <div style={styles.socialGrid}>
                            <a
                                href="https://www.linkedin.com/company/ai-micromind/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={styles.socialLink}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
                            >
                                <LinkedInIcon /> LinkedIn
                            </a>
                            <a
                                href="https://www.facebook.com/profile.php?id=61559573424749"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={styles.socialLink}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
                            >
                                <FacebookIcon /> Facebook
                            </a>
                            <a
                                href="https://youtube.com/@aimicromind?si=FJfzwJSF9k2ns-1e"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={styles.socialLink}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
                            >
                                <YouTubeIcon /> YouTube
                            </a>
                            <div style={styles.socialDisabled}>
                                <XIcon /> X (Twitter)
                                <span style={styles.comingSoonBadge}>{t('campus.comingSoon')}</span>
                            </div>
                        </div>
                    </MMCard>
                </div>
            </div>
        </div>
    );
}

export default CampusPage;
