import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { User } from '../types';

import apiService from '../services/api';

const loginSchema = z.object({
  username: z.string().min(1, 'Foydalanuvchi nomi talab qilinadi'),
  password: z.string().min(1, 'Parol talab qilinadi')
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { dispatch } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: ''
    }
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

      const profile = (await apiService.getProfile()) as {
        id?: number;
        username?: string;
        first_name?: string;
        last_name?: string;
        role?: string;
        floor?: number;
        floor_id?: number;
        user?: { id?: number; username?: string; last_name?: string; role?: string };
      };

      const role = profile.role || profile.user?.role || tokens.role || '';
      // Rol aniq bo'lsa va qavat sardori bo'lmasa — darhol to'xtat
      if (role && !isFloorLeaderRole(role)) {
        clearSession();
        throw new Error(
          "Bu hisob qavat sardori emas. Faqat qavat sardori login/paroli bilan kiring."
        );
      }

      // Haqiqiy ruxsat: /floor-leader/dashboard/ (admin/token bo'lsa 403)
      // getFloorLeaders() admin endpoint — sardor uchun 403 beradi, chaqirilmaydi
      let floorId: number | undefined =
        typeof profile.floor === 'number'
          ? profile.floor
          : typeof profile.floor_id === 'number'
            ? profile.floor_id
            : undefined;

      try {
        const dash = (await apiService.getDashboardData()) as {
          floor?: { id?: number; name?: string };
        };
        if (dash?.floor?.id != null) floorId = dash.floor.id;
      } catch (dashErr) {
        clearSession();
        const msg =
          dashErr instanceof Error ? dashErr.message : 'Dashboardga ruxsat yo‘q';
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-surface-50 flex items-center justify-center p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="w-full max-w-md"
        variants={cardVariants}
      >
        <Card className="p-8 shadow-sm border border-surface-200 bg-white">
          <motion.div
            className="text-center mb-10"
            variants={itemVariants}
          >
            <motion.div
              className="bg-surface-900 w-16 h-16 rounded-[5px] flex items-center justify-center mx-auto mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring" as const, stiffness: 400 }}
            >
              <LogIn className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-surface-900 mb-2 uppercase tracking-tight">Qavat sardori</h1>
            <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">Tizimga kirish</p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            variants={itemVariants}
          >
            <div>
              <label className="block text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-2">
                Foydalanuvchi nomi
              </label>
              <input
                {...register('username')}
                type="text"
                className="w-full px-4 py-3 border border-surface-300 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-surface-900 focus:border-surface-900 transition-all duration-200 text-sm"
                placeholder="Foydalanuvchi nomi"
              />
              {errors.username && (
                <motion.p
                  className="text-danger-600 text-[10px] font-bold uppercase mt-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.username.message}
                </motion.p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-2">
                Parol
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 border border-surface-300 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-surface-900 focus:border-surface-900 transition-all duration-200 text-sm"
                  placeholder="Parol"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  className="text-danger-600 text-[10px] font-bold uppercase mt-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            {error && (
              <motion.div
                className="p-3 bg-danger-50 border border-danger-100 rounded-[5px]"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="text-[10px] font-bold text-danger-600 uppercase text-center">{error}</p>
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full py-3 bg-surface-900 hover:bg-black text-white font-bold uppercase tracking-widest text-xs rounded-[5px] transition-all"
              isLoading={isLoading}
            >
              Kirish
            </Button>
          </motion.form>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Login;
