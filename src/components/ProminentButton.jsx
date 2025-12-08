// src/components/ProminentButton.jsx
import PropTypes from 'prop-types';
import { THEME } from '../lib/theme';

/**
 * Large, eye-catching button with gradient background
 * Used for important actions like week comparison and gameweek selection
 */
function ProminentButton({
  onClick,
  icon,
  mainText,
  subtitleText,
  endIcon,
  className = ''
}) {
  return (
    <div className="flex justify-center mb-6">
      <button
        onClick={onClick}
        className={`${THEME.prominentButton.base} ${THEME.prominentButton.hover} ${className}`}
      >
        {icon && <span className="text-3xl">{icon}</span>}
        <div className="flex flex-col items-start">
          <span className={THEME.prominentButton.text.main}>{mainText}</span>
          {subtitleText && (
            <span className={THEME.prominentButton.text.subtitle}>
              {subtitleText}
            </span>
          )}
        </div>
        {endIcon && <span className="text-2xl">{endIcon}</span>}
      </button>
    </div>
  );
}

ProminentButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.string,
  mainText: PropTypes.string.isRequired,
  subtitleText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  endIcon: PropTypes.string,
  className: PropTypes.string
};

export default ProminentButton;
