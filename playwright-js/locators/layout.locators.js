/** App shell / sidebar shared across authenticated pages. */

export const layoutLocators = {
  roles: {
    dashboard: { role: 'link', name: 'Dashboard' },
    todos: { role: 'link', name: 'Todos' },
    notes: { role: 'link', name: 'Notes' },
    contact: { role: 'link', name: 'Contact' },
    products: { role: 'link', name: 'Products' },
    logout: { role: 'button', name: 'Logout' },
  },
  testIds: {
    logout: 'button-logout',
  },
};
