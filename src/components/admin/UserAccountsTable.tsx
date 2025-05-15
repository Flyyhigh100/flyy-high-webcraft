
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserProfile } from "@/types/admin";
import { useAdminRoleManagement } from "@/hooks/useAdminRoleManagement";

interface UserAccountsTableProps {
  users: UserProfile[];
  setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
}

export function UserAccountsTable({ users, setUsers }: UserAccountsTableProps) {
  const { makeUserAdmin } = useAdminRoleManagement();

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No users found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Last Sign In</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.email}</TableCell>
            <TableCell>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {user.role}
              </span>
            </TableCell>
            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
            <TableCell>{user.last_sign_in ? new Date(user.last_sign_in).toLocaleDateString() : 'Never'}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">View</Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={user.role === 'admin' ? 'bg-gray-100 text-gray-500' : ''}
                  disabled={user.role === 'admin'}
                  onClick={() => makeUserAdmin(user.id, users, setUsers)}
                >
                  Make Admin
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
