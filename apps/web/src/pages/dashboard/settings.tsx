import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Palette, Shield, Moon, Sun, Monitor } from 'lucide-react';
import { Card, Button, Avatar, AvatarFallback, AvatarImage } from '@lumora/ui';
import { useAuthStore } from '@/store/auth-store';
import { useTheme } from '@/providers/theme-provider';
import { useUpdateProfile, useChangePassword } from '@/hooks';
import { toast } from '@lumora/ui';

type SettingsTab = 'profile' | 'appearance' | 'security';

const tabs: { key: SettingsTab; label: string; icon: typeof User }[] = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'appearance', label: 'Appearance', icon: Palette },
  { key: 'security', label: 'Security', icon: Shield },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const themeOptions = [
  { value: 'light' as const, label: 'Light', icon: Sun },
  { value: 'dark' as const, label: 'Dark', icon: Moon },
  { value: 'system' as const, label: 'System', icon: Monitor },
];

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [name, setName] = useState(user?.name || '');
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const userInitials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U';

  const handleSaveProfile = async () => {
    try {
      const updated = await updateProfile.mutateAsync({ name });
      if (updated) setUser(updated);
      toast({ title: 'Profile updated', variant: 'success' });
    } catch {
      toast({ title: 'Failed to update profile', variant: 'destructive' });
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    try {
      await changePassword.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast({ title: 'Password updated', variant: 'success' });
    } catch {
      toast({ title: 'Failed to update password', variant: 'destructive' });
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-text-primary text-2xl font-semibold">Settings</h1>
        <p className="text-text-secondary mt-1 text-sm">Manage your account settings and preferences.</p>
      </div>

      <div className="bg-surface-secondary flex w-fit gap-1 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-surface-primary text-text-primary shadow-sm'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-2xl space-y-6">
          <Card className="glass-card p-6">
            <h2 className="text-text-primary mb-4 text-base font-medium">Profile Information</h2>
            <div className="border-border-secondary mb-6 flex items-center gap-5 border-b pb-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.avatar || undefined} />
                <AvatarFallback className="bg-primary-500/20 text-primary-400 text-lg">{userInitials}</AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm" className="rounded-lg text-sm">
                  Change avatar
                </Button>
                <p className="text-text-tertiary mt-1 text-xs">JPG, PNG or WEBP. Max 2MB.</p>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-text-secondary mb-1.5 block text-sm font-medium">Full Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-border-secondary bg-surface-secondary text-text-primary placeholder-text-tertiary focus:border-primary-500/30 focus:ring-primary-500/10 w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-1"
                />
              </div>
              <div>
                <label className="text-text-secondary mb-1.5 block text-sm font-medium">Email</label>
                <input
                  defaultValue={user?.email || ''}
                  disabled
                  className="border-border-secondary bg-surface-secondary text-text-primary placeholder-text-tertiary w-full rounded-xl border px-4 py-2.5 text-sm opacity-60 outline-none"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                className="rounded-xl bg-white px-6 text-neutral-900 hover:bg-white/90"
                onClick={handleSaveProfile}
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {activeTab === 'appearance' && (
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-2xl space-y-6">
          <Card className="glass-card p-6">
            <h2 className="text-text-primary mb-4 text-base font-medium">Theme</h2>
            <p className="text-text-tertiary mb-5 text-sm">Choose how Lumora looks for you.</p>
            <div className="grid grid-cols-3 gap-4">
              {themeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all ${
                    theme === opt.value
                      ? 'border-primary-500/40 bg-primary-500/5'
                      : 'border-border-secondary hover:border-border-secondary/80 bg-surface-secondary/50'
                  }`}
                >
                  <opt.icon className={`h-6 w-6 ${theme === opt.value ? 'text-primary-400' : 'text-text-tertiary'}`} />
                  <span
                    className={`text-sm font-medium ${theme === opt.value ? 'text-text-primary' : 'text-text-secondary'}`}
                  >
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {activeTab === 'security' && (
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-2xl space-y-6">
          <Card className="glass-card p-6">
            <h2 className="text-text-primary mb-4 text-base font-medium">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="text-text-secondary mb-1.5 block text-sm font-medium">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  className="border-border-secondary bg-surface-secondary text-text-primary placeholder-text-tertiary focus:border-primary-500/30 focus:ring-primary-500/10 w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-1"
                  placeholder="Enter current password"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-text-secondary mb-1.5 block text-sm font-medium">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                    className="border-border-secondary bg-surface-secondary text-text-primary placeholder-text-tertiary focus:border-primary-500/30 focus:ring-primary-500/10 w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-1"
                    placeholder="New password"
                  />
                </div>
                <div>
                  <label className="text-text-secondary mb-1.5 block text-sm font-medium">Confirm Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    className="border-border-secondary bg-surface-secondary text-text-primary placeholder-text-tertiary focus:border-primary-500/30 focus:ring-primary-500/10 w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-1"
                    placeholder="Confirm password"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  className="rounded-xl bg-white px-6 text-neutral-900 hover:bg-white/90"
                  onClick={handleChangePassword}
                  disabled={changePassword.isPending}
                >
                  {changePassword.isPending ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
