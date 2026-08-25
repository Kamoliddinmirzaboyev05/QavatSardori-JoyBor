import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { User, DashboardData } from '../types';
import apiService from '../services/api';

const loginSchema = z.object({
  username: z.string().min(1, 'Foydalanuvchi nomi talab qilinadi'),
  password: z.string().min(1, 'Parol talab qilinadi'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { dispatch } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const clearSession = () => {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user_role');
  };

  const isFloorLeaderRole = (role?: string | null): boolean => {
    if (!role) return false;
    const r = role.toLowerCase().replace(/[_\s-]/g, '');
    return (
      r === 'floorleader' ||
      r === 'sardor' ||
      r === 'qavatsardori' ||
      r === 'qavatsardor' ||
      r === 'leader' ||
      r.includes('sardor') ||
      r.includes('floorleader')
    );
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const tokens = await apiService.login(data.username, data.password);

      sessionStorage.setItem('access_token', tokens.access);
      sessionStorage.setItem('refresh_token', tokens.refresh);

      type ProfileResponse = {
        id?: number;
        username?: string;
        first_name?: string;
        last_name?: string;
        role?: string;
        floor?: number;
        floor_id?: number;
        user?: { id?: number; username?: string; last_name?: string; role?: string };
      };
      // Profil va dashboard bir-biriga bog'liq emas — parallel yuklanadi (1 ta round-trip o'rniga)
      const [profile, dashSettled] = await Promise.all([
        apiService.getProfile() as Promise<ProfileResponse>,
        apiService
          .getDashboardData()
          .then((d) => ({ ok: true as const, data: d as DashboardData }))
          .catch((e) => ({ ok: false as const, error: e as Error })),
      ]);

      const role = profile.role || profile.user?.role || tokens.role || '';
      // Rol aniq bo'lsa va qavat sardori bo'lmasa — darhol to'xtat
      if (role && !isFloorLeaderRole(role)) {
        clearSession();
        throw new Error(
          "Bu hisob qavat sardori emas. Faqat qavat sardori login/paroli bilan kiring."
        );
      }

      let floorId: number | undefined =
        typeof profile.floor === 'number'
          ? profile.floor
          : typeof profile.floor_id === 'number'
            ? profile.floor_id
            : undefined;

      if (!dashSettled.ok) {
        clearSession();
        const msg = dashSettled.error?.message || 'Dashboardga ruxsat yo‘q';
        if (
          msg.toLowerCase().includes('sardori') ||
          msg.toLowerCase().includes('403') ||
          msg.toLowerCase().includes('permission') ||
          msg.toLowerCase().includes('ruxsat')
        ) {
          throw new Error(
            "Siz qavat sardori emassiz. Admin yoki boshqa rol bilan bu ilovaga kirmang."
          );
        }
        throw new Error(msg);
      }
      if (dashSettled.data?.floor?.id != null) floorId = dashSettled.data.floor.id;

      const profileId = profile.id ?? profile.user?.id;
      const normalizedRole = isFloorLeaderRole(role) ? role : 'qavat_sardori';
      sessionStorage.setItem('user_role', normalizedRole);

      const userDetails: User = {
        id: String(profileId || '1'),
        name: profile.first_name || profile.username || data.username,
        lastName: profile.last_name || profile.user?.last_name || '',
        role: normalizedRole === 'sardor' ? 'qavat_sardori' : normalizedRole,
        floor: floorId,
      };

      dispatch({ type: 'LOGIN_SUCCESS', payload: { tokens, user: userDetails } });
      dispatch({ type: 'LOAD_DATA', payload: { dashboardData: dashSettled.data } });
      toast.success('Muvaffaqiyatli kirdingiz!');
    } catch (err) {
      clearSession();
      const message = err instanceof Error ? err.message : 'Kirishda xatolik yuz berdi';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-surface-900 rounded-2xl shadow-sm p-6 sm:p-8 w-full max-w-md border border-surface-200 dark:border-surface-800"
      >
        <div className="mb-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-white dark:bg-surface-800 rounded-2xl flex items-center justify-center shadow-sm border border-surface-100 dark:border-surface-700 p-3">
            <img src="/logoicon.svg" alt="JoyBor Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white font-sans tracking-tight">
            Xush kelibsiz!
          </h2>
          <p className="text-surface-500 dark:text-surface-400 text-sm sm:text-base mt-2 font-sans">
            JoyBor Qavat sardori paneliga kirish
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-danger-700 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800/50 rounded-xl px-3.5 py-2.5 text-center font-medium"
            >
              {error}
            </motion.div>
          )}

          <div>
            <label className="block text-xs sm:text-sm font-medium text-surface-900 dark:text-surface-200 mb-1 font-sans">
              Login (Foydalanuvchi nomi)
            </label>
            <input
              {...register('username')}
              type="text"
              className={`w-full px-3.5 sm:px-4 py-2.5 rounded-xl border ${
                errors.username ? 'border-danger-500' : 'border-surface-300 dark:border-surface-700'
              } bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500/40 focus:border-brand-600 outline-none font-sans text-sm sm:text-base transition-colors duration-150`}
              placeholder="Foydalanuvchi nomi"
              autoFocus
            />
            {errors.username && (
              <p className="text-danger-600 text-xs mt-1 font-medium">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-surface-900 dark:text-surface-200 mb-1 font-sans">
              Parol
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className={`w-full px-3.5 sm:px-4 py-2.5 pr-10 rounded-xl border ${
                  errors.password ? 'border-danger-500' : 'border-surface-300 dark:border-surface-700'
                } bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500/40 focus:border-brand-600 outline-none font-sans text-sm sm:text-base transition-colors duration-150`}
                placeholder="Parol"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 focus:outline-none transition-colors duration-150"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Parolni yashirish' : "Parolni ko'rsatish"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-danger-600 text-xs mt-1 font-medium">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors duration-150 disabled:opacity-60 font-sans text-sm sm:text-base shadow-sm mt-2 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Tekshirilmoqda...
              </>
            ) : (
              'Kirish'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
