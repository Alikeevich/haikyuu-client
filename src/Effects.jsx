import React from 'react';

const Debris = () => {
    // Генерируем 10 случайных осколков
    const particles = Array.from({ length: 10 });

    return (
        <div className="debris-container">
            {particles.map((_, i) => (
                <div 
                    key={i} 
                    className="debris" 
                    style={{
                        top: `${30 + Math.random() * 40}%`, // Разброс по высоте
                        left: `${40 + Math.random() * 20}%`, // Разброс по ширине
                        animationName: `debris-fall-${(i % 4) + 1}`, // Выбираем одну из 4 анимаций
                        animationDuration: `${0.5 + Math.random() * 0.5}s`
                    }} 
                />
            ))}
        </div>
    );
};

export default Debris;