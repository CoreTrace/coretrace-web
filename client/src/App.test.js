import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the api service
jest.mock('./services/api/api', () => ({
  analyzeCode: jest.fn(),
  getAvailableTools: jest.fn()
}));

test('renders app without crashing', () => {
  render(<App />);
  // Just test if the component renders without error
  expect(document.body).toBeDefined();
});
