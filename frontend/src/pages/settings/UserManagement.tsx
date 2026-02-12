import { Plus } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

const DEMO_USERS = [
  { id: '1', name: 'Admin User', email: 'admin@flowsquare.io', role: 'ADMIN', department: 'IT', active: true },
  { id: '2', name: 'John Mwangi', email: 'j.mwangi@tiper.co.tz', role: 'CONTROL_ROOM', department: 'Operations', active: true },
  { id: '3', name: 'Sarah Kimaro', email: 's.kimaro@tiper.co.tz', role: 'INTEGRITY_HSE', department: 'HSE', active: true },
  { id: '4', name: 'Peter Massawe', email: 'p.massawe@tiper.co.tz', role: 'FINANCE_REGULATORY', department: 'Finance', active: true },
  { id: '5', name: 'Grace Mushi', email: 'g.mushi@puma.com', role: 'EXECUTIVE', department: 'Management', active: true },
  { id: '6', name: 'James Ndaro', email: 'j.ndaro@lakeoil.co.tz', role: 'OPERATOR', department: 'Fleet', active: true },
  { id: '7', name: 'Mary Lyimo', email: 'm.lyimo@tiper.co.tz', role: 'VIEWER', department: 'Quality', active: false },
];

export default function UserManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage users and role-based access</p>
        </div>
        <button className="flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">Department</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_USERS.map((user) => (
                <tr key={user.id} className="border-b hover:bg-muted/25 cursor-pointer">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-secondary px-2 py-0.5 text-xs">{user.role.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.department}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={user.active ? 'ACTIVE' : 'INACTIVE'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
