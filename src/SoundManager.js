// client/src/SoundManager.js

// Объект с путями к файлам
const soundFiles = {
    whistle: '/sounds/whistle.mp3',
    serve: '/sounds/serve.mp3',
    spike: '/sounds/spike.mp3',
    bump: '/sounds/bump.mp3',
    set: '/sounds/set.mp3',
    monster_block: '/sounds/monster_block.mp3',
    soft_block: '/sounds/block.mp3', // Твой новый файл для смягчения
};

// Хранилище загруженных объектов Audio
const sounds = {};

// Предзагрузка звуков
Object.keys(soundFiles).forEach(key => {
    const audio = new Audio(soundFiles[key]);
    audio.volume = 0.5; // Громкость по умолчанию (50%)
    
    // Индивидуальная настройка громкости
    if (key === 'monster_block') audio.volume = 0.8;
    if (key === 'spike') audio.volume = 0.7;
    if (key === 'set') audio.volume = 0.3;
    
    sounds[key] = audio;
});

export const playSound = (name) => {
    const originalAudio = sounds[name];
    
    if (originalAudio) {
        // МАГИЯ: Клонируем узел аудио. 
        // Это позволяет играть один и тот же звук "поверх" себя, 
        // если он вызывается часто (например, быстрый розыгрыш), 
        // и решает проблему "проглатывания" звуков.
        const clone = originalAudio.cloneNode();
        clone.volume = originalAudio.volume;
        
        clone.play().catch(e => {
            // Игнорируем ошибку "The user didn't interact first"
            // (Пока пользователь не кликнет по сайту первый раз, звуки могут не играть - это защита браузера)
            console.warn("Звук не сыграл (нужен клик):", e);
        });
    } else {
        console.warn(`Звук "${name}" не найден! Проверь название файла.`);
    }
};