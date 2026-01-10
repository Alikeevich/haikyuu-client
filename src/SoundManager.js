// client/src/SoundManager.js

// 🎵 КАРТА ЗВУКОВ С ОПИСАНИЕМ
const soundFiles = {
    whistle: '/sounds/whistle.mp3',        // Свисток судьи (очко, начало/конец)
    serve: '/sounds/serve.mp3',            // Мощная подача / удар
    spike: '/sounds/spike.mp3',            // Атака (удар об пол)
    bump: '/sounds/bump.mp3',              // Прием / защита
    set: '/sounds/set.mp3',                // Пас сеттера
    monster_block: '/sounds/monster_block.mp3', // Жесткий блок
    soft_block: '/sounds/block.mp3',       // Мягкий блок / смягчение
};

// 🎯 НАСТРОЙКИ ГРОМКОСТИ ДЛЯ КАЖДОГО ЗВУКА
const volumeSettings = {
    whistle: 0.6,        // Свисток средней громкости
    serve: 0.7,          // Мощная подача громко
    spike: 0.75,         // Атака очень громко
    bump: 0.5,           // Прием умеренно
    set: 0.35,           // Пас тихо (не должен перекрывать другие звуки)
    monster_block: 0.85, // Блок максимально громко
    soft_block: 0.5,     // Мягкий блок умеренно
};

// 📦 ПУЛ АУДИО-ОБЪЕКТОВ (для одновременного воспроизведения)
const POOL_SIZE = 6; // Увеличен пул для быстрых комбо
const soundPools = {};

// 🔧 ИНИЦИАЛИЗАЦИЯ ПУЛОВ
Object.keys(soundFiles).forEach(key => {
    soundPools[key] = [];
    
    for (let i = 0; i < POOL_SIZE; i++) {
        const audio = new Audio(soundFiles[key]);
        audio.preload = 'auto';
        audio.volume = volumeSettings[key] || 0.5;
        
        // Добавляем обработчик ошибок загрузки
        audio.addEventListener('error', (e) => {
            console.warn(`⚠️ Ошибка загрузки звука "${key}":`, e);
        });
        
        soundPools[key].push(audio);
    }
});

// 🔊 ОСНОВНАЯ ФУНКЦИЯ ВОСПРОИЗВЕДЕНИЯ
export const playSound = (name, volumeMultiplier = 1.0) => {
    const pool = soundPools[name];
    
    if (!pool) {
        console.warn(`❌ Звук "${name}" не найден в библиотеке!`);
        return;
    }

    // Ищем свободный аудио-объект
    let availableSound = pool.find(audio => audio.paused || audio.ended || audio.currentTime === 0);
    
    // Если все заняты, берем тот, который играет дольше всего
    if (!availableSound) {
        availableSound = pool.reduce((prev, current) => 
            current.currentTime > prev.currentTime ? current : prev
        );
    }
    
    // Применяем множитель громкости (для динамических эффектов)
    const baseVolume = volumeSettings[name] || 0.5;
    availableSound.volume = Math.min(1.0, baseVolume * volumeMultiplier);
    
    // Перематываем и играем
    availableSound.currentTime = 0;
    
    availableSound.play().catch(e => {
        // Игнорируем прерывание воспроизведения (нормальное поведение при быстрой игре)
        if (!e.message.includes('interrupted') && !e.message.includes('interact')) {
            console.warn(`⚠️ Не удалось воспроизвести "${name}":`, e.message);
        }
    });
};

// 🔓 РАЗБЛОКИРОВКА ЗВУКОВ (для обхода ограничений браузера)
export const unlockAudio = () => {
    Object.values(soundPools).forEach(pool => {
        pool.forEach(audio => {
            // Играем и сразу останавливаем (трюк для разблокировки)
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    audio.pause();
                    audio.currentTime = 0;
                }).catch(() => {
                    // Игнорируем ошибки разблокировки
                });
            }
        });
    });
};

// 🎮 АВТОМАТИЧЕСКАЯ РАЗБЛОКИРОВКА ПРИ ПЕРВОМ ВЗАИМОДЕЙСТВИИ
if (typeof document !== 'undefined') {
    let isUnlocked = false;
    
    const unlock = () => {
        if (!isUnlocked) {
            unlockAudio();
            isUnlocked = true;
            
            // Удаляем слушатели после первого взаимодействия
            document.removeEventListener('click', unlock);
            document.removeEventListener('touchstart', unlock);
            document.removeEventListener('keydown', unlock);
            
            console.log('🔊 Звуковая система разблокирована!');
        }
    };
    
    // Слушаем любое взаимодействие пользователя
    document.addEventListener('click', unlock);
    document.addEventListener('touchstart', unlock);
    document.addEventListener('keydown', unlock);
}

// 🎛️ ДОПОЛНИТЕЛЬНЫЕ УТИЛИТЫ

// Функция для проигрывания звука с задержкой
export const playSoundDelayed = (name, delayMs, volumeMultiplier = 1.0) => {
    setTimeout(() => playSound(name, volumeMultiplier), delayMs);
};

// Функция для последовательного воспроизведения звуков
export const playSoundSequence = (sequence) => {
    let totalDelay = 0;
    
    sequence.forEach(({ name, delay = 0, volume = 1.0 }) => {
        totalDelay += delay;
        playSoundDelayed(name, totalDelay, volume);
    });
};

// Пример использования последовательности:
// playSoundSequence([
//     { name: 'spike', delay: 0 },
//     { name: 'whistle', delay: 700 }
// ]);