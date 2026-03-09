import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  it('renders the login shell by default', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /Sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
  });

  it('enters the load list after sign-in', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(screen.getByRole('button', { name: /Continue/i }));
    await user.click(screen.getByRole('button', { name: /Sign in/i }));

    expect(screen.getByRole('heading', { name: /2 active loads/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Settings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Happy path/i })).toBeInTheDocument();
  });

  it('opens forgot password screen from password step', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(screen.getByRole('button', { name: /Continue/i }));
    await user.click(screen.getByRole('button', { name: /Forgot password/i }));

    expect(screen.getByRole('heading', { name: /Reset password/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send reset link/i })).toBeInTheDocument();
  });

  it('shows update password as the only settings action', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(screen.getByRole('button', { name: /Continue/i }));
    await user.click(screen.getByRole('button', { name: /Sign in/i }));
    await user.click(screen.getByRole('button', { name: /Settings/i }));

    expect(screen.getByRole('button', { name: /Update password/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Log out/i })).not.toBeInTheDocument();
  });

  it('opens update password screen from settings', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(screen.getByRole('button', { name: /Continue/i }));
    await user.click(screen.getByRole('button', { name: /Sign in/i }));
    await user.click(screen.getByRole('button', { name: /Settings/i }));
    await user.click(screen.getByRole('button', { name: /Update password/i }));

    expect(screen.getByRole('heading', { name: /Update password/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save new password/i })).toBeInTheDocument();
  });
});
