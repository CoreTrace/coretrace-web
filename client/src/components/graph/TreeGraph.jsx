import React from "react";

// Example tree node: { id: 1, label: 'main', children: [ ... ] }

const NODE_WIDTH = 100;
const NODE_HEIGHT = 40;
const VERTICAL_SPACING = 60;
const HORIZONTAL_SPACING = 30;

// Helper to calculate positions for each node
function layoutTree(node, depth = 0, x = 0, positions = [], parent = null) {
  const y = depth * (NODE_HEIGHT + VERTICAL_SPACING);
  let width = 0;
  let childX = x;
  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      const childWidth = layoutTree(child, depth + 1, childX, positions, node);
      childX += childWidth + HORIZONTAL_SPACING;
      width += childWidth + HORIZONTAL_SPACING;
    });
    width -= HORIZONTAL_SPACING; // Remove last extra spacing
    // Center parent above children
    const firstChild = positions.find((p) => p.node === node.children[0]);
    const lastChild = positions.find((p) => p.node === node.children[node.children.length - 1]);
    const centerX = (firstChild.x + lastChild.x) / 2;
    positions.push({ node, x: centerX, y, parent });
  } else {
    positions.push({ node, x, y, parent });
    width = NODE_WIDTH;
  }
  return width;
}

function TreeGraph({ data }) {
  if (!data) return <div>No data</div>;
  // Layout
  const positions = [];
  layoutTree(data, 0, 0, positions);
  // Normalize X to start at 0
  const minX = Math.min(...positions.map((p) => p.x));
  positions.forEach((p) => (p.x -= minX - 20));
  const maxY = Math.max(...positions.map((p) => p.y)) + NODE_HEIGHT + 20;
  const maxX = Math.max(...positions.map((p) => p.x)) + NODE_WIDTH + 20;

  return (
    <svg width={maxX} height={maxY}>
      {/* Edges */}
      {positions.map((p, i) =>
        p.parent ? (
          <line
            key={"edge-" + i}
            x1={positions.find((q) => q.node === p.parent).x + NODE_WIDTH / 2}
            y1={positions.find((q) => q.node === p.parent).y + NODE_HEIGHT}
            x2={p.x + NODE_WIDTH / 2}
            y2={p.y}
            stroke="#888"
          />
        ) : null
      )}
      {/* Nodes */}
      {positions.map((p, i) => (
        <g key={p.node.id}>
          <rect
            x={p.x}
            y={p.y}
            width={NODE_WIDTH}
            height={NODE_HEIGHT}
            rx={8}
            fill="#fff"
            stroke="#333"
            strokeWidth={1.5}
            shadow="2"
          />
          <text
            x={p.x + NODE_WIDTH / 2}
            y={p.y + NODE_HEIGHT / 2}
            textAnchor="middle"
            alignmentBaseline="central"
            fontSize={14}
            fill="#222"
          >
            {p.node.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default TreeGraph;
