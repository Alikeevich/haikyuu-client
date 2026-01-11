// src/utils/BoardUtils.js

export const TEAMS = {
    MY: 'MY_TEAM',
    ENEMY: 'ENEMY_TEAM'
};

// Координаты зон
const ZONES = {
    [TEAMS.MY]: {
        1: { x: 85, y: 85 }, 2: { x: 85, y: 60 }, 3: { x: 50, y: 60 },
        4: { x: 15, y: 60 }, 5: { x: 15, y: 85 }, 6: { x: 50, y: 75 },
    },
    [TEAMS.ENEMY]: {
        1: { x: 15, y: 15 }, 2: { x: 15, y: 40 }, 3: { x: 50, y: 40 },
        4: { x: 85, y: 40 }, 5: { x: 85, y: 15 }, 6: { x: 50, y: 25 },
    }
};

export const getDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

/**
 * Находит координаты игрока
 */
const getPlayerPos = (playerId, myTeam, enemyTeam) => {
    const myPlayer = myTeam.find(p => p.id === playerId);
    if (myPlayer) return { ...ZONES[TEAMS.MY][myPlayer.position], isMySide: true };

    const enemyPlayer = enemyTeam.find(p => p.id === playerId);
    if (enemyPlayer) return { ...ZONES[TEAMS.ENEMY][enemyPlayer.position], isMySide: false };

    return null;
};

export const getCoordinates = (targetType, data, context) => {
    const { myTeam, enemyTeam } = context;
    const center = { x: 50, y: 50 };

    // 1. ПОЗИЦИЯ ДЛЯ ПОДАЧИ (У ИГРОКА ЗА СПИНОЙ)
    if (targetType === 'SERVE_START_AT_PLAYER') {
        const playerPos = getPlayerPos(data.playerId, myTeam, enemyTeam);
        if (!playerPos) return center;

        // Смещаем мяч за лицевую линию (в зависимости от стороны)
        // Если это я (снизу), смещаем вниз (Y увеличиваем). Если враг (сверху), уменьшаем.
        const offsetY = playerPos.isMySide ? 15 : -15; 
        
        return { 
            x: playerPos.x, 
            y: playerPos.y + offsetY 
        };
    }

    // 2. ПОЗИЦИЯ ПАСУЮЩЕГО (Сеттера)
    if (targetType === 'SETTER_POS') {
        const team = data.isMySide ? myTeam : enemyTeam;
        const teamKey = data.isMySide ? TEAMS.MY : TEAMS.ENEMY;
        
        // Пытаемся найти игрока в зоне 3 (классический выход пасующего)
        // Или в зоне 2, если разыгрывают оттуда. По дефолту зона 3.
        const setter = team.find(p => p.position === 3) || team.find(p => p.position === 2);
        
        if (setter) {
            return ZONES[teamKey][setter.position];
        }
        // Если игрока нет, возвращаем координаты зоны 3
        return ZONES[teamKey][3];
    }

    if (targetType === 'PLAYER') {
        const pos = getPlayerPos(data.id, myTeam, enemyTeam);
        return pos || center;
    }

    if (targetType === 'ZONE') {
        const isMySide = data.isMySide;
        const teamKey = isMySide ? TEAMS.MY : TEAMS.ENEMY;
        return ZONES[teamKey][data.zoneId] || center;
    }

    return center;
};