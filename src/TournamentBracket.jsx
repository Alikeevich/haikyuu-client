import { useState } from 'react';

const AI_INFO = {
    PHANTOM: { name: 'Kitsune Academy', emoji: '🦊', color: '#9b59b6', subtitle: 'Обманщики' },
    TACTICAL: { name: 'Shogi Masters', emoji: '♟️', color: '#3498db', subtitle: 'Тактики' },
    DATA: { name: 'Neural Storm', emoji: '🧠', color: '#e74c3c', subtitle: 'Адаптивные' },
    APEX: { name: 'Ryujin Killers', emoji: '🦅', color: '#f39c12', subtitle: 'Хищники' }
};

function TournamentBracket({ tournament, onPlayMatch, isPlaying }) {
    const [hoveredMatch, setHoveredMatch] = useState(null);

    if (!tournament) return null;

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h1 style={styles.title}>ТУРНИРНЫЙ ПУТЬ</h1>
                <div style={styles.subtitle}>Пройди все испытания</div>
                <div style={styles.scoreBar}>
                    <div style={styles.scoreItem}>
                        <span style={styles.scoreLabel}>ПОБЕД</span>
                        <span style={{...styles.scoreValue, color: '#2ecc71'}}>{tournament.wins}</span>
                    </div>
                    <div style={styles.progressBarContainer}>
                        <div style={{
                            ...styles.progressBarFill,
                            width: `${(tournament.wins / 4) * 100}%`
                        }} />
                    </div>
                    <div style={styles.scoreItem}>
                        <span style={styles.scoreLabel}>ПОРАЖЕНИЙ</span>
                        <span style={{...styles.scoreValue, color: '#e74c3c'}}>{tournament.losses}</span>
                    </div>
                </div>
            </div>

            {/* Tournament Path */}
            <div style={styles.bracketPath}>
                {tournament.matches.map((match, idx) => {
                    const aiInfo = AI_INFO[match.aiType];
                    const isActive = match.id === tournament.currentMatchId;
                    const isCompleted = match.status === 'COMPLETED';
                    const isUpcoming = match.status === 'UPCOMING' && !isActive;
                    
                    return (
                        <div key={match.id} style={styles.matchNode}>
                            {/* Connection Line */}
                            {idx < tournament.matches.length - 1 && (
                                <div style={{
                                    ...styles.connectionLine,
                                    background: isCompleted 
                                        ? `linear-gradient(to bottom, ${match.result === 'WIN' ? '#2ecc71' : '#e74c3c'}, rgba(255,255,255,0.1))`
                                        : 'rgba(255,255,255,0.1)'
                                }} />
                            )}

                            {/* Match Card */}
                            <div 
                                style={{
                                    ...styles.matchCard,
                                    borderColor: isActive ? aiInfo.color : isCompleted ? (match.result === 'WIN' ? '#2ecc71' : '#e74c3c') : 'rgba(255,255,255,0.1)',
                                    background: isActive 
                                        ? `linear-gradient(135deg, ${aiInfo.color}15, rgba(0,0,0,0.3))`
                                        : isCompleted 
                                            ? `linear-gradient(135deg, ${match.result === 'WIN' ? '#2ecc7115' : '#e74c3c15'}, rgba(0,0,0,0.3))`
                                            : 'rgba(0,0,0,0.3)',
                                    transform: hoveredMatch === match.id ? 'scale(1.05)' : 'scale(1)',
                                    boxShadow: isActive 
                                        ? `0 0 30px ${aiInfo.color}50`
                                        : hoveredMatch === match.id 
                                            ? '0 10px 30px rgba(0,0,0,0.5)'
                                            : '0 5px 15px rgba(0,0,0,0.3)'
                                }}
                                onMouseEnter={() => setHoveredMatch(match.id)}
                                onMouseLeave={() => setHoveredMatch(null)}
                            >
                                {/* Match Number Badge */}
                                <div style={{
                                    ...styles.matchBadge,
                                    background: isCompleted 
                                        ? (match.result === 'WIN' ? '#2ecc71' : '#e74c3c')
                                        : isActive ? aiInfo.color : 'rgba(255,255,255,0.2)'
                                }}>
                                    {isCompleted ? (match.result === 'WIN' ? '✓' : '✗') : match.id}
                                </div>

                                {/* AI Info */}
                                <div style={styles.aiSection}>
                                    <div style={{
                                        ...styles.aiEmoji,
                                        filter: isUpcoming ? 'grayscale(100%)' : 'grayscale(0%)'
                                    }}>
                                        {aiInfo.emoji}
                                    </div>
                                    <div style={styles.aiInfo}>
                                        <div style={styles.aiName}>{aiInfo.name}</div>
                                        <div style={styles.aiSubtitle}>{aiInfo.subtitle}</div>
                                    </div>
                                </div>

                                {/* Match Status */}
                                <div style={styles.statusSection}>
                                    {isCompleted && (
                                        <div style={styles.scoreDisplay}>
                                            <span style={styles.scoreText}>{match.playerScore}</span>
                                            <span style={styles.scoreSeparator}>:</span>
                                            <span style={styles.scoreText}>{match.aiScore}</span>
                                        </div>
                                    )}

                                    {isActive && !isPlaying && (
                                        <button 
                                            style={{
                                                ...styles.playButton,
                                                background: `linear-gradient(135deg, ${aiInfo.color}, ${aiInfo.color}cc)`
                                            }}
                                            onClick={() => onPlayMatch(match.id, match.aiType)}
                                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                        >
                                            ⚔️ СРАЗИТЬСЯ
                                        </button>
                                    )}

                                    {isActive && isPlaying && (
                                        <div style={styles.playingBadge}>
                                            <div style={styles.pulseCircle} />
                                            БОЙ ИДЁТ
                                        </div>
                                    )}

                                    {isUpcoming && (
                                        <div style={styles.lockedBadge}>
                                            🔒 ЗАБЛОКИРОВАНО
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Trophy */}
            {tournament.matches.every(m => m.status === 'COMPLETED') && (
                <div style={styles.trophy}>
                    <div style={styles.trophyIcon}>🏆</div>
                    <div style={styles.trophyText}>ТУРНИР ЗАВЕРШЁН!</div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        padding: '20px',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'auto'
    },
    header: {
        textAlign: 'center',
        marginBottom: '40px',
        padding: '20px'
    },
    title: {
        fontSize: 'clamp(1.8rem, 5vw, 3rem)',
        fontWeight: 'bold',
        background: 'linear-gradient(135deg, #f39c12, #e74c3c, #9b59b6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '10px',
        letterSpacing: '2px'
    },
    subtitle: {
        fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
        color: 'rgba(255,255,255,0.7)',
        marginBottom: '30px'
    },
    scoreBar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        flexWrap: 'wrap',
        maxWidth: '600px',
        margin: '0 auto'
    },
    scoreItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '5px'
    },
    scoreLabel: {
        fontSize: '0.8rem',
        color: 'rgba(255,255,255,0.6)',
        fontWeight: 'bold',
        letterSpacing: '1px'
    },
    scoreValue: {
        fontSize: '2rem',
        fontWeight: 'bold'
    },
    progressBarContainer: {
        flex: '1',
        minWidth: '150px',
        height: '8px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '10px',
        overflow: 'hidden',
        position: 'relative'
    },
    progressBarFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #2ecc71, #27ae60)',
        borderRadius: '10px',
        transition: 'width 0.5s ease'
    },
    bracketPath: {
        maxWidth: '500px',
        margin: '0 auto',
        position: 'relative',
        padding: '20px 0'
    },
    matchNode: {
        position: 'relative',
        marginBottom: '20px'
    },
    connectionLine: {
        position: 'absolute',
        left: '50%',
        top: '100%',
        width: '4px',
        height: '20px',
        transform: 'translateX(-50%)',
        transition: 'all 0.3s ease',
        zIndex: 0
    },
    matchCard: {
        position: 'relative',
        background: 'rgba(0,0,0,0.3)',
        border: '3px solid',
        borderRadius: '16px',
        padding: '20px',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)',
        cursor: 'pointer',
        zIndex: 1
    },
    matchBadge: {
        position: 'absolute',
        top: '-15px',
        left: '20px',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        border: '3px solid rgba(255,255,255,0.1)',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
    },
    aiSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '15px'
    },
    aiEmoji: {
        fontSize: '3rem',
        transition: 'filter 0.3s ease'
    },
    aiInfo: {
        flex: 1
    },
    aiName: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        marginBottom: '3px'
    },
    aiSubtitle: {
        fontSize: '0.9rem',
        color: 'rgba(255,255,255,0.6)'
    },
    statusSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        alignItems: 'center'
    },
    scoreDisplay: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        fontSize: '2rem',
        fontWeight: 'bold'
    },
    scoreText: {
        minWidth: '40px',
        textAlign: 'center'
    },
    scoreSeparator: {
        color: 'rgba(255,255,255,0.5)'
    },
    playButton: {
        width: '100%',
        padding: '12px 24px',
        border: 'none',
        borderRadius: '10px',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        letterSpacing: '1px'
    },
    playingBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 20px',
        background: 'rgba(241, 196, 15, 0.2)',
        border: '2px solid #f1c40f',
        borderRadius: '10px',
        fontWeight: 'bold',
        fontSize: '0.9rem',
        color: '#f1c40f',
        position: 'relative'
    },
    pulseCircle: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        background: '#f1c40f',
        animation: 'pulse 1.5s ease-in-out infinite',
        boxShadow: '0 0 10px #f1c40f'
    },
    lockedBadge: {
        padding: '10px 20px',
        background: 'rgba(255,255,255,0.05)',
        border: '2px solid rgba(255,255,255,0.2)',
        borderRadius: '10px',
        fontWeight: 'bold',
        fontSize: '0.9rem',
        color: 'rgba(255,255,255,0.5)'
    },
    trophy: {
        textAlign: 'center',
        marginTop: '40px',
        padding: '30px',
        background: 'linear-gradient(135deg, rgba(243, 156, 18, 0.2), rgba(231, 76, 60, 0.2))',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)',
        maxWidth: '400px',
        margin: '40px auto 0'
    },
    trophyIcon: {
        fontSize: '5rem',
        marginBottom: '10px',
        animation: 'bounce 2s ease-in-out infinite'
    },
    trophyText: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        background: 'linear-gradient(135deg, #f39c12, #e74c3c)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    }
};

// Add keyframes for animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.5); opacity: 0.5; }
    }
    
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
    }
    
    @media (max-width: 600px) {
        .match-card {
            padding: 15px !important;
        }
    }
`;
document.head.appendChild(styleSheet);

export default TournamentBracket;