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

const loginSchema = z.object({
  username: z.string().min(1, 'Foydalanuvchi nomi talab qilinadi'),
  password: z.string().min(1, 'Parol talab qilinadi')
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginResponse {
  refresh: string;
  access: string;
  role: string;
}

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
      const response = await fetch('https://joyboryangi.pythonanywhere.com/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Kirishda xatolik yuz berdi');
      }

      const tokens: LoginResponse = await response.json();

      // Store tokens in session storage
      sessionStorage.setItem('access_token', tokens.access);
      sessionStorage.setItem('refresh_token', tokens.refresh);
      sessionStorage.setItem('user_role', tokens.role);

      // Create user object
      const user = {
        id: '1',
        name: data.username,
        lastName: '',
        role: tokens.role
      };

      dispatch({ type: 'LOGIN_SUCCESS', payload: { tokens, user } });
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
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="w-full max-w-md"
        variants={cardVariants}
      >
        <Card className="p-8 shadow-2xl">
          <motion.div
            className="text-center mb-8"
            variants={itemVariants}
          >
            <motion.div
              className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring" as const, stiffness: 400 }}
            >
              <LogIn className="w-8 h-8 text-blue-600" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Qavat sardori</h1>
            <p className="text-gray-600">Tizimga kirish</p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            variants={itemVariants}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foydalanuvchi nomi
              </label>
              <input
                {...register('username')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Foydalanuvchi nomingizni kiriting"
              />
              {errors.username && (
                <motion.p
                  className="text-red-500 text-sm mt-1"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.username.message}
                </motion.p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parol
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Parolingizni kiriting"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  className="text-red-500 text-sm mt-1"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            {error && (
              <motion.div
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="text-red-600 text-sm">{error}</p>
              </motion.div>
            )}

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Kirilmoqda...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="w-4 h-4 mr-2" />
                    Kirish
                  </div>
                )}
              </Button>
            </motion.div>
          </motion.form>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Login;
