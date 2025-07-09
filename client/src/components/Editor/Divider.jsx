import React from 'react';
import PropTypes from 'prop-types';

function Divider({ handleMouseDown }) {
  return (
    <div
      className="w-1 bg-gray-700 cursor-col-resize"
      onMouseDown={handleMouseDown}
    ></div>
  );
}

Divider.propTypes = {
  handleMouseDown: PropTypes.func.isRequired
};

export default Divider;