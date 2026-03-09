import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  it('renders the login shell by default', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /Fast paperwork/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in to assigned loads/i })).toBeInTheDocument();
  });

  it('enters the load list after sign-in', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(screen.getByRole('button', { name: /Sign in to assigned loads/i }));

    expect(screen.getByRole('heading', { name: /2 active loads/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Settings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Happy path/i })).toBeInTheDocument();
  });
});
