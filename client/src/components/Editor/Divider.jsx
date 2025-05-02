import React from 'react';

function Divider({ handleMouseDown }) {
  return (
    <div
      className="w-1 bg-gray-700 cursor-col-resize"
      onMouseDown={handleMouseDown}
    ></div>
  );
}

export default Divider;