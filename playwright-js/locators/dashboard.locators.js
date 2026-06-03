export const dashboardLocators = {
  roles: {
    heading: /welcome back/i,
    logout: { role: 'button', name: 'Logout' },
    quickAdd: { role: 'button', name: 'Add' },
  },
  testIds: {
    welcome: 'text-welcome',
    statTotal: 'stat-total',
    statCompleted: 'stat-completed',
    statPending: 'stat-pending',
    quickTodoInput: 'input-quick-todo',
    quickAddButton: 'button-quick-add-todo',
  },
};
