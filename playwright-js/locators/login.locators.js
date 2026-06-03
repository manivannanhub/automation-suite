/** Login page selectors — prefer getByRole in page objects; testids as fallback. */

export const loginLocators = {
  roles: {
    email: { role: 'textbox', name: 'Email' },
    password: { role: 'textbox', name: 'Password' },
    signIn: { role: 'button', name: 'Sign In' },
    signUp: { role: 'link', name: 'Sign up' },
  },
  testIds: {
    email: 'input-email',
    password: 'input-password',
    submit: 'button-login',
    error: 'login-error',
    registerLink: 'link-register',
  },
  text: {
    welcome: 'Welcome back',
    invalidEmail: 'Invalid email',
    passwordRequired: 'Password is required',
    invalidCredentials: 'Invalid email or password',
  },
};
