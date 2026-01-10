import React from 'react';
import PropTypes from 'prop-types';

const CutIn = ({ character, skillName }) => {
    if (!character) return null;

    return (
        <div className="cut-in-overlay">
            {/* Картинка персонажа слева */}
            {character.img && (
                <img 
                    src={character.img} 
                    alt={`${character.name || 'Персонаж'} использует ${skillName}`}
                    className="cut-in-char" 
                />
            )}
            
            {/* Текст справа */}
            <div className="cut-in-text">
                <span className="cut-in-name">{character.name || 'Неизвестный'}</span>
                <span className="cut-in-skill">{skillName || 'Навык'}</span>
            </div>
        </div>
    );
};

CutIn.propTypes = {
    character: PropTypes.shape({
        img: PropTypes.string,
        name: PropTypes.string
    }),
    skillName: PropTypes.string
};

CutIn.defaultProps = {
    character: null,
    skillName: ''
};

export default CutIn;