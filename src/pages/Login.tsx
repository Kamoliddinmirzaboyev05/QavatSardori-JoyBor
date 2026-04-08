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

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const tokens = await apiService.login(data.username, data.password);

      // Store tokens in session storage
      sessionStorage.setItem('access_token', tokens.access);
      sessionStorage.setItem('refresh_token', tokens.refresh);
      sessionStorage.setItem('user_role', tokens.role);

      // Fetch user profile to get more details (like floor ID)
      let userDetails: User = {
        id: '1', // fallback
        name: data.username,
        lastName: '',
        role: tokens.role
      };

      try {
        const profile = await apiService.getProfile();
        
        // Find if this user is a floor leader
        const leaders = await apiService.getFloorLeaders();
        const floorLeader = Array.isArray(leaders) 
          ? leaders.find((l: any) => l.user_info.username === data.username || l.user === profile.user?.id)
          : null;

        userDetails = {
          id: profile.user?.id?.toString() || profile.id?.toString() || '1',
          name: profile.user?.username || data.username,
          lastName: profile.user?.last_name || '',
          role: tokens.role || profile.user?.role,
          floor: floorLeader ? floorLeader.floor : profile.floor,
          floorLeaderId: floorLeader ? floorLeader.id : undefined
        };
      } catch (profileErr) {
        console.warn('Could not fetch user profile details, attempting floor leaders fallback:', profileErr);
        try {
          const leaders = await apiService.getFloorLeaders();
          const floorLeader = Array.isArray(leaders) 
            ? leaders.find((l: any) => l.user_info.username === data.username)
            : null;
          
          if (floorLeader) {
            userDetails = {
              ...userDetails,
              id: floorLeader.user?.toString() || '1',
              name: floorLeader.user_info?.username || data.username,
              floor: floorLeader.floor,
              floorLeaderId: floorLeader.id
            };
          }
        } catch (leaderErr) {
          console.warn('Could not fetch floor leaders either:', leaderErr);
        }
      }

      dispatch({ type: 'LOGIN_SUCCESS', payload: { tokens, user: userDetails } });
      toast.success('Muvaffaqiyatli kirdingiz!');
    } catch (err) {
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
      className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="w-full max-w-md"
        variants={cardVariants}
      >
        <Card className="p-8 shadow-sm border border-gray-200 bg-white">
          <motion.div
            className="text-center mb-10"
            variants={itemVariants}
          >
            <motion.div
              className="bg-gray-900 w-16 h-16 rounded-[5px] flex items-center justify-center mx-auto mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring" as const, stiffness: 400 }}
            >
              <LogIn className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-tight">Qavat sardori</h1>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tizimga kirish</p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            variants={itemVariants}
          >
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                Foydalanuvchi nomi
              </label>
              <input
                {...register('username')}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 text-sm"
                placeholder="Foydalanuvchi nomi"
              />
              {errors.username && (
                <motion.p
                  className="text-red-600 text-[10px] font-bold uppercase mt-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.username.message}
                </motion.p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                Parol
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 text-sm"
                  placeholder="Parol"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  className="text-red-600 text-[10px] font-bold uppercase mt-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            {error && (
              <motion.div
                className="p-3 bg-red-50 border border-red-100 rounded-[5px]"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="text-[10px] font-bold text-red-600 uppercase text-center">{error}</p>
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold uppercase tracking-widest text-xs rounded-[5px] transition-all"
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
