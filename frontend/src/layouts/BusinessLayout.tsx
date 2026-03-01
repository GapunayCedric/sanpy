import { Outlet } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/guest-records', label: 'Guest Records', icon: '📋' },
  { to: '/submissions', label: 'Submissions', icon: '📤' },
  { to: '/inbox', label: 'Inbox', icon: '✉️' },
];

export default function BusinessLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-56 flex-col border-r border-gray-200 bg-white lg:flex">
        <div className="border-b border-gray-200 p-4">
          <h1 className="text-lg font-semibold text-gov-blue">SA Tourism</h1>
          <p className="text-xs text-gray-500">San Pablo City, Laguna</p>
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {nav.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-gov-pale text-gov-blue font-medium' : 'text-gray-600 hover:bg-gray-100'}`
              }
            >
              <span>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-gray-200 p-2">
          <p className="truncate px-3 py-1 text-xs text-gray-500">{user?.email}</p>
          <button
            onClick={logout}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="pb-20 lg:pl-56 lg:pb-6">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-gray-200 bg-white lg:hidden">
        {nav.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2 text-xs ${isActive ? 'text-gov-blue font-medium' : 'text-gray-500'}`
            }
          >
            <span className="text-lg">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
