import React from 'react';

// ТЕ ЖЕ САМЫЕ КООРДИНАТЫ, ЧТО В BOARDUTILS
// Если меняешь тут, меняй и в BoardUtils!
const ZONES = {
    MY: {
        1: { x: 80, y: 85 },
        6: { x: 50, y: 85 },
        5: { x: 20, y: 85 },
        4: { x: 20, y: 65 },
        3: { x: 50, y: 65 },
        2: { x: 80, y: 65 },
    },
    ENEMY: {
        1: { x: 20, y: 15 },
        6: { x: 50, y: 15 },
        5: { x: 80, y: 15 },
        4: { x: 80, y: 35 },
        3: { x: 50, y: 35 },
        2: { x: 20, y: 35 },
    }
};

const DebugOverlay = () => {
    return (
        <div style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}>
            {/* Отрисовка МОИХ зон */}
            {Object.entries(ZONES.MY).map(([pos, coords]) => (
                <div key={`my-${pos}`} style={{
                    position: 'absolute',
                    left: `${coords.x}%`,
                    top: `${coords.y}%`,
                    width: '10px', height: '10px',
                    background: 'red',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    border: '1px solid white'
                }}>
                    <span style={{position:'absolute', top:'-15px', left:'0', color:'red', fontWeight:'bold', fontSize:'10px'}}>
                        MY {pos}
                    </span>
                </div>
            ))}

            {/* Отрисовка ВРАЖЕСКИХ зон */}
            {Object.entries(ZONES.ENEMY).map(([pos, coords]) => (
                <div key={`enemy-${pos}`} style={{
                    position: 'absolute',
                    left: `${coords.x}%`,
                    top: `${coords.y}%`,
                    width: '10px', height: '10px',
                    background: 'blue',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    border: '1px solid white'
                }}>
                     <span style={{position:'absolute', top:'12px', left:'0', color:'blue', fontWeight:'bold', fontSize:'10px'}}>
                        EN {pos}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default DebugOverlay;