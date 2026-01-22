'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        setError(error.message);
      } else {
        router.push(redirect);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div className="flex flex-col items-center space-y-2">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
          <Camera className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">ECP Media Platform</h1>
      </div>

      <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-white">Welcome back</CardTitle>
          <CardDescription className="text-slate-400">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email</label>
              <Input
                {...register('email')}
                type="email"
                placeholder="you@company.com"
                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              Sign in
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Create account
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
