import React from 'react';

const GameOver = ({ data, onRestart }) => {
    if (!data) return null;

    const { winner, score, mvp } = data;

    // Картинка MVP
    const renderMvpImg = () => {
        if (mvp.img && mvp.img.length > 5) {
            return <img src={mvp.img} alt={mvp.name} className="mvp-photo" />;
        }
        return <div style={{fontSize: '80px', display:'flex', justifyContent:'center', alignItems:'center', height:'100%'}}>{mvp.img}</div>;
    };

    return (
        <div className="game-over-overlay">
            <div className="winner-title">{winner} ПОБЕДИЛА!</div>
            
            <div className="final-score">
                {score.team1} : {score.team2}
            </div>

            <div className="mvp-section">
                <div className="mvp-label">MAN OF THE MATCH</div>
                
                <div className="mvp-card">
                    {renderMvpImg()}
                    <div className="mvp-info">
                        <div className="mvp-name">{mvp.name}</div>
                        <div className="mvp-stats">
                            PTS: {mvp.matchStats.points} | BLK: {mvp.matchStats.blocks}
                        </div>
                    </div>
                </div>
            </div>

            <button className="restart-btn" onClick={onRestart}>
                ВЕРНУТЬСЯ В ЛОББИ
            </button>
        </div>
    );
};

export default GameOver;