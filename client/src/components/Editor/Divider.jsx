/**
 * @module Divider
 * @description Divider component for resizing panes in the editor layout.
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * @component Divider
 * @description Vertical divider for resizing panes. Triggers a callback on mouse down.
 * @param {Object} props - Component props
 * @param {function} props.handleMouseDown - Callback for mouse down event
 * @returns {JSX.Element} Divider element
 */
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