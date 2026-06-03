/** Shared route paths and UI copy used across tests. */

export const ROUTES = {
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  todos: '/todos',
  notes: '/notes',
  contact: '/contact',
  products: '/products',
};

export const PASSWORD_MIN_LENGTH = 6;

export const MESSAGES = {
  login: {
    invalidEmail: 'Invalid email',
    passwordRequired: 'Password is required',
    invalidCredentials: 'Invalid email or password',
    welcomeHeading: 'Welcome back',
    subtitle: 'Enter your credentials to access your command center',
  },
  register: {
    nameRequired: 'Name is required',
    invalidEmail: 'Invalid email',
    passwordMin: 'Password must be at least 6 characters',
    emailInUse: 'Email already in use',
  },
  api: {
    loginSuccess: 'Logged in successfully',
    registerSuccess: 'Registered successfully',
  },
  products: {
    emptySearch: 'No products found',
  },
  todos: {
    emptyState: "No tasks yet. You're all caught up!",
  },
};
