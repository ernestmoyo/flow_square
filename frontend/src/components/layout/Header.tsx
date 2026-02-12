import { Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotificationStore } from '../../stores/notificationStore';

export default function Header() {
  const { user, logout } = useAuth();
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <div>
        <h2 className="text-sm font-medium text-muted-foreground">Port-to-Pump Digital Platform</h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative rounded-md p-2 hover:bg-accent">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4" />
          <span>{user?.full_name || 'User'}</span>
          <span className="rounded bg-secondary px-1.5 py-0.5 text-xs">{user?.role}</span>
        </div>
        <button onClick={logout} className="rounded-md p-2 hover:bg-accent" title="Logout">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
