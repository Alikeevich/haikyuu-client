import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { getPlayerCoordinates, getBallTargetCoordinates } from '../utils/BoardUtils';

const BallManager = ({ lastAction, myTeam, enemyTeam, phase, turn, myId }) => {
    // === КОНТРОЛЛЕРЫ АНИМАЦИИ (Все названия стандартизированы) ===
    const controlsX = useAnimation();      // Движение A -> B
    const controlsOffset = useAnimation(); // Искривление (Curve)
    const controlsScale = useAnimation();  // Высота (Z-axis)
    const controlsRotate = useAnimation(); // Вращение
    const controlsSquash = useAnimation(); // Сплющивание
    const controlsShadow = useAnimation(); // Тень
    
    const posRef = useRef({ x: 50, y: 50 });
    const rotationRef = useRef(0); 

    // === 1. ТЕЛЕПОРТ (СБРОС) ===
    const teleportTo = (target) => {
        if (!target) return;
        posRef.current = target;
        
        // Сбрасываем физику
        controlsX.set({ left: `${target.x}%`, top: `${target.y}%` });
        controlsOffset.set({ x: 0, y: 0 }); 
        controlsScale.set({ scale: 1 });
        controlsSquash.set({ scaleX: 1, scaleY: 1 });
        
        // Тень
        controlsShadow.set({ 
            left: `${target.x}%`, top: `${target.y}%`, 
            scale: 1, opacity: 0.6, filter: "blur(2px)" 
        });
    };

    // === 2. ЭФФЕКТ "SQUASH" (УДАР) ===
    const playSquash = async (strength = 1) => {
        await controlsSquash.start({
            scaleX: [1, 1 + (0.3 * strength), 0.9, 1],
            scaleY: [1, 1 - (0.3 * strength), 1.1, 1],
            transition: { duration: 0.15 }
        });
    };

    // === 3. ФИЗИКА ПОЛЕТА ===
    const moveBall = async (target, type = 'NORMAL') => {
        if (!target) return;
        
        const start = posRef.current;
        
        // -- НАСТРОЙКИ --
        let duration = 0.5;
        let apex = 0.5; 
        let height = 1.3; 
        let spin = 360; 
        let curveAmount = 0; 
        
        // -- ТЮНИНГ --
        switch (type) {
            case 'SERVE':
                duration = 0.5; height = 1.9; spin = 1080; apex = 0.5;
                curveAmount = (Math.random() - 0.5) * 40; 
                break;
            case 'SPIKE':
                duration = 0.3; height = 1.15; spin = 720; apex = 0.2; curveAmount = 0;     
                break;
            case 'SET':
                duration = 0.7; height = 1.5; spin = -180; apex = 0.5;
                curveAmount = (Math.random() - 0.5) * 20; 
                break;
            case 'SET_HIDDEN': 
                duration = 0.8; height = 1.2; spin = -90; apex = 0.5;
                break;
            case 'RECEIVE':
                duration = 0.6; height = 1.6; spin = 180; apex = 0.6;          
                curveAmount = (Math.random() - 0.5) * 60; 
                break;
            default: break;
        }

        // -- ЗАПУСК АНИМАЦИЙ --

        // 1. Вращение
        rotationRef.current += spin;
        controlsRotate.start({
            rotate: rotationRef.current,
            transition: { duration: duration, ease: "linear" }
        });

        // 2. Высота (Z-axis)
        controlsScale.start({
            scale: [1, height, 1],
            transition: { duration: duration, times: [0, apex, 1], ease: "easeInOut" }
        });

        // 3. Тень (ИСПРАВЛЕНО: controlsShadow вместо shadowControls)
        controlsShadow.start({
            left: `${target.x}%`, 
            top: `${target.y}%`,
            scale: [1, 0.4, 1], 
            opacity: [0.6, 0.1, 0.6], 
            filter: ["blur(2px)", "blur(8px)", "blur(2px)"],
            transition: { duration: duration, times: [0, apex, 1], ease: "easeInOut" }
        });

        // 4. Искривление (Offset)
        if (curveAmount !== 0) {
            controlsOffset.start({
                x: [0, curveAmount, 0], 
                y: [0, -Math.abs(curveAmount/2), 0], 
                transition: { duration: duration, ease: "easeInOut" }
            });
        }

        // 5. Основное движение (ИСПРАВЛЕНО: controlsX вместо ballX)
        await controlsX.start({
            left: `${target.x}%`,
            top: `${target.y}%`,
            transition: { duration: duration, ease: "easeInOut" }
        });

        // 6. Удар
        if (type !== 'SET' && type !== 'SET_HIDDEN') {
            playSquash(type === 'SPIKE' ? 1.5 : 0.8);
        }

        posRef.current = target;
    };

    // === ВОЗВРАТ МЯЧА ===
    const resetBallToHand = () => {
        const isMyTurn = turn === myId;
        const servingTeam = isMyTurn ? myTeam : enemyTeam;
        const serverPlayer = servingTeam.find(p => p.position === 1);
        
        if (serverPlayer) {
            const handPos = getBallTargetCoordinates('HOLD_IN_HANDS', { playerId: serverPlayer.id }, { myTeam, enemyTeam });
            teleportTo(handPos);
        } else {
            const defaultPos = isMyTurn ? {x: 75, y: 85} : {x: 25, y: 15};
            teleportTo(defaultPos);
        }
    };

    // ФАЗА ПОДАЧИ
    useEffect(() => {
        if (phase === 'SERVE') {
            const isJustActed = lastAction && (Date.now() - lastAction.ts < 1500);
            if (!isJustActed) resetBallToHand();
        }
    }, [phase, turn, myTeam, enemyTeam]);

    // ЛОГИКА ДЕЙСТВИЙ
    useEffect(() => {
        if (!lastAction) return;
        const { type, actorId, data = {} } = lastAction;

        const processAction = async () => {
            if (type === 'SERVE') {
                const startPos = getBallTargetCoordinates('HOLD_IN_HANDS', { playerId: actorId }, { myTeam, enemyTeam });
                teleportTo(startPos);
                const receiverPos = getPlayerCoordinates(data.receiverId, myTeam, enemyTeam);
                
                if (data.winSide === 'ATTACK') {
                    await moveBall({ x: receiverPos.x + 5, y: receiverPos.y + 5 }, 'SERVE');
                    setTimeout(resetBallToHand, 1200);
                } else {
                    await moveBall(receiverPos, 'SERVE');
                    const isMyReception = myTeam.some(p => p.id === data.receiverId);
                    if (data.isBadReception) {
                        const overpassPos = getBallTargetCoordinates('ZONE', { zoneId: 6, isMySide: !isMyReception }, { myTeam, enemyTeam });
                        await moveBall(overpassPos, 'RECEIVE');
                        const enemySetterPos = getBallTargetCoordinates('SETTER_ZONE', { isMySide: !isMyReception }, { myTeam, enemyTeam });
                        await moveBall(enemySetterPos, 'RECEIVE');
                    } else {
                        const setterPos = getBallTargetCoordinates('SETTER_ZONE', { isMySide: isMyReception }, { myTeam, enemyTeam });
                        await moveBall(setterPos, 'RECEIVE');
                    }
                }
            } else if (type === 'SET') {
                const isMySet = myTeam.some(p => p.id === actorId);
                if (!isMySet) { await moveBall({ x: 50, y: 40 }, 'SET_HIDDEN'); return; }
                const targetZone = lastAction.targetPos || 4;
                let spikePos = getBallTargetCoordinates('ZONE', { zoneId: targetZone, isMySide: isMySet }, { myTeam, enemyTeam });
                if (targetZone === 3) spikePos.y += 10; 
                await moveBall(spikePos, 'SET');
            } else if (type === 'SPIKE') {
                const isMyAttack = myTeam.some(p => p.id === actorId);
                if (!isMyAttack) {
                    const attackerPos = getPlayerCoordinates(actorId, myTeam, enemyTeam);
                    if (attackerPos) teleportTo(attackerPos);
                }
                if (data.winSide === 'DEFENSE') {
                    const contactId = data.trajectory?.startId || actorId;
                    let blockPos = getPlayerCoordinates(contactId, myTeam, enemyTeam);
                    if (!blockPos) blockPos = getBallTargetCoordinates('ZONE', { zoneId: 3, isMySide: !isMyAttack }, { myTeam, enemyTeam });
                    
                    if(!isMyAttack) teleportTo(blockPos);

                    const reboundY = isMyAttack ? blockPos.y + 20 : blockPos.y - 20;
                    const reboundPos = { x: blockPos.x + (Math.random() * 10 - 5), y: reboundY };
                    await moveBall(reboundPos, 'SPIKE');
                    setTimeout(resetBallToHand, 1200);

                } else if (data.winSide === 'ATTACK') {
                    let landPos;
                    if (data.trajectory?.endId) landPos = getPlayerCoordinates(data.trajectory.endId, myTeam, enemyTeam);
                    else landPos = getBallTargetCoordinates('ZONE', { zoneId: 6, isMySide: !isMyAttack }, { myTeam, enemyTeam });
                    await moveBall(landPos, 'SPIKE');
                    setTimeout(resetBallToHand, 1200);

                } else {
                    let digPos;
                    if (data.trajectory?.endId) digPos = getPlayerCoordinates(data.trajectory.endId, myTeam, enemyTeam);
                    else digPos = getBallTargetCoordinates('ZONE', { zoneId: 6, isMySide: !isMyAttack }, { myTeam, enemyTeam });
                    await moveBall(digPos, 'SPIKE'); 
                    
                    const isOverpass = data.message && data.message.includes("перелетел сетку");
                    if (isOverpass) {
                        const overpassPos = getBallTargetCoordinates('ZONE', { zoneId: 6, isMySide: isMyAttack }, { myTeam, enemyTeam });
                        await moveBall(overpassPos, 'RECEIVE');
                        const counterSetterPos = getBallTargetCoordinates('SETTER_ZONE', { isMySide: isMyAttack }, { myTeam, enemyTeam });
                        await moveBall(counterSetterPos, 'RECEIVE');
                    } else {
                        const isMyDefense = !isMyAttack;
                        const setterPos = getBallTargetCoordinates('SETTER_ZONE', { isMySide: isMyDefense }, { myTeam, enemyTeam });
                        await moveBall(setterPos, 'RECEIVE');
                    }
                }
            }
        };
        processAction();
    }, [lastAction]);

    return (
        <>
            {/* ТЕНЬ */}
            <motion.div
                animate={controlsShadow}
                initial={{ opacity: 0, scale: 0 }}
                style={{
                    position: 'absolute', width: '24px', height: '6px',
                    marginLeft: '-12px', marginTop: '16px',
                    borderRadius: '50%', background: 'rgba(0,0,0,0.6)',
                    filter: 'blur(3px)', zIndex: 9, pointerEvents: 'none'
                }}
            />
            
            {/* ОСНОВНОЙ КОНТЕЙНЕР (X/Y) */}
            <motion.div
                animate={controlsX}
                initial={{ left: '50%', top: '50%' }}
                style={{
                    position: 'absolute', width: '0px', height: '0px',
                    zIndex: 100, pointerEvents: 'none',
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}
            >
                {/* КОНТЕЙНЕР ИСКРИВЛЕНИЯ */}
                <motion.div animate={controlsOffset} style={{ display:'flex', justifyContent: 'center', alignItems: 'center' }}>
                    
                    {/* КОНТЕЙНЕР ВЫСОТЫ */}
                    <motion.div animate={controlsScale} style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
                        
                        {/* КОНТЕЙНЕР СПЛЮЩИВАНИЯ */}
                        <motion.div animate={controlsSquash} style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
                            
                            {/* ВРАЩЕНИЕ */}
                            <motion.div 
                                animate={controlsRotate} 
                                style={{ 
                                    width: '24px', height: '24px', 
                                    transformOrigin: 'center center'
                                }}
                            >
                                {/* SVG МЯЧ */}
                                <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ overflow: 'visible' }}>
                                    <defs>
                                        <radialGradient id="ballGrad" cx="30%" cy="30%" r="80%">
                                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4"/>
                                            <stop offset="100%" stopColor="#000000" stopOpacity="0.1"/>
                                        </radialGradient>
                                    </defs>
                                    <circle cx="50" cy="50" r="48" fill="#003c8f" stroke="#222" strokeWidth="2"/>
                                    <path d="M 2 50 Q 50 10, 98 50 Q 50 90, 2 50" fill="#fca311" stroke="#222" strokeWidth="2" />
                                    <path d="M 50 2 Q 90 50, 50 98 Q 10 50, 50 2" fill="none" stroke="#222" strokeWidth="2" />
                                    <circle cx="50" cy="50" r="48" fill="url(#ballGrad)" style={{ mixBlendMode: 'overlay' }}/>
                                </svg>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </>
    );
};

export default BallManager;