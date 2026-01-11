// src/utils/BoardUtils.js

export const TEAMS = {
    MY: 'MY_TEAM',
    ENEMY: 'ENEMY_TEAM'
};

const ZONES = {
    [TEAMS.MY]: {
        1: { x: 75, y: 85 }, 
        6: { x: 50, y: 85 }, 
        5: { x: 25, y: 85 }, 
        4: { x: 25, y: 65 }, 
        3: { x: 50, y: 65 }, 
        2: { x: 75, y: 65 }, 
    },
    [TEAMS.ENEMY]: {
        1: { x: 25, y: 15 }, 
        6: { x: 50, y: 15 }, 
        5: { x: 75, y: 15 }, 
        4: { x: 75, y: 35 }, 
        3: { x: 50, y: 35 }, 
        2: { x: 25, y: 35 }, 
    }
};

export const getPlayerCoordinates = (playerId, myTeam, enemyTeam) => {
    const myPlayer = myTeam.find(p => p.id === playerId);
    if (myPlayer) return { ...ZONES[TEAMS.MY][myPlayer.position], isMySide: true };

    const enemyPlayer = enemyTeam.find(p => p.id === playerId);
    if (enemyPlayer) return { ...ZONES[TEAMS.ENEMY][enemyPlayer.position], isMySide: false };

    return null; 
};

export const getBallTargetCoordinates = (targetType, data, context) => {
    const { myTeam, enemyTeam } = context;

    if (targetType === 'HOLD_IN_HANDS') {
        const pos = getPlayerCoordinates(data.playerId, myTeam, enemyTeam);
        if (!pos) return { x: 50, y: 50 };
        const offsetX = pos.isMySide ? 5 : -5;
        const offsetY = pos.isMySide ? 2 : -2;
        return { x: pos.x + offsetX, y: pos.y + offsetY };
    }

    // === ФИКС КООРДИНАТ СВЯЗУЮЩЕГО ===
    if (targetType === 'SETTER_ZONE') {
        const isMySide = data.isMySide;
        // Было x: 65 (слишком вправо). Стало x: 55 (почти центр).
        // Y: 60 (ближе к сетке).
        if (isMySide) return { x: 50, y: 60 }; 
        else return { x: 50, y: 40 };          
    }

    if (targetType === 'PLAYER') {
        const pos = getPlayerCoordinates(data.id, myTeam, enemyTeam);
        return pos || { x: 50, y: 50 };
    }

    if (targetType === 'ZONE') {
        const isMySide = data.isMySide;
        const teamKey = isMySide ? TEAMS.MY : TEAMS.ENEMY;
        const base = ZONES[teamKey][data.zoneId];
        return { 
            x: base.x + (Math.random() * 2 - 1), 
            y: base.y + (Math.random() * 2 - 1)
        };
    }

    return { x: 50, y: 50 };
};