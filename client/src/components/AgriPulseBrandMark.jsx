import React from 'react';

/**
 * AgriPulse Brand Mark
 * Visual concept: Nature (leaf curvature) + Engineering (centrifugal impeller) + Intelligence (pulse node)
 */
const AgriPulseBrandMark = ({ size = 36, showText = true, textVariant = 'dark', subtitle = 'Living Intelligence' }) => {
    const isDark = textVariant === 'dark';
    const textColor = isDark ? '#173F35' : '#F6F5EF';
    const subtextColor = isDark ? '#858A80' : '#A0ABA4';

    return (
        <div className="flex items-center gap-2.5 select-none">
            {/* SVG Brand Icon */}
            <svg
                width={size}
                height={size}
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
            >
                {/* Outer Rounded Container / Fluid boundary */}
                <rect width="48" height="48" rx="10" fill="#173F35" />

                {/* Botanical Venation & Hydraulic Flow Curve */}
                <path
                    d="M12 36C12 24.9543 20.9543 16 32 16"
                    stroke="#DCE7D8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeOpacity="0.5"
                />

                {/* Concentric Irrigation Wave */}
                <path
                    d="M16 36C16 28 22 22 30 22"
                    stroke="#C7F36B"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                />

                {/* Secondary Hydraulic Pulse */}
                <path
                    d="M20 36C20 30 24 26 30 26"
                    stroke="#F6F5EF"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeOpacity="0.8"
                />

                {/* Engineering Impeller / Sensor Core Node */}
                <circle cx="33" cy="15" r="4.5" fill="#C7F36B" />
                <circle cx="33" cy="15" r="2" fill="#102D27" />

                {/* Subtle Sensor Wave Echo */}
                <circle cx="33" cy="15" r="8" stroke="#C7F36B" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.6" />
            </svg>

            {/* Typography */}
            {showText && (
                <div className="flex flex-col leading-none">
                    <div className="flex items-center gap-1">
                        <span
                            className="font-extrabold tracking-tight"
                            style={{
                                color: textColor,
                                fontSize: size >= 32 ? '1.125rem' : '0.95rem',
                                letterSpacing: '-0.025em'
                            }}
                        >
                            Agri<span style={{ color: '#173F35', WebkitTextFillColor: isDark ? '#173F35' : '#C7F36B' }}>Pulse</span>
                        </span>
                        <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: '#C7F36B' }}
                            title="System Live"
                        />
                    </div>
                    {subtitle && (
                        <span
                            className="text-[0.68rem] tracking-wider uppercase font-semibold mt-0.5"
                            style={{ color: subtextColor, letterSpacing: '0.08em' }}
                        >
                            {subtitle}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default AgriPulseBrandMark;
