import Layout from '../../components/common/Layout';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import { roleColors } from '../../utils/permissions';

const Profile = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl font-semibold text-ink-800 dark:text-ink-100 mb-6">My profile</h1>
        <div className="bg-white dark:bg-ink-800 rounded-lg shadow-card border border-ink-100 dark:border-ink-700 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl font-semibold">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold text-ink-800 dark:text-ink-100">{user.fullName}</p>
              <Badge label={user.role} className={roleColors[user.role]} />
            </div>
          </div>
          <div className="space-y-3 text-sm border-t border-ink-100 dark:border-ink-700 pt-4">
            <div className="flex justify-between">
              <span className="text-ink-400 dark:text-ink-500">Email</span>
              <span className="text-ink-700 dark:text-ink-200 font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-400 dark:text-ink-500">Department</span>
              <span className="text-ink-700 dark:text-ink-200 font-medium">{user.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-400 dark:text-ink-500">Role</span>
              <span className="text-ink-700 dark:text-ink-200 font-medium">{user.role}</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
