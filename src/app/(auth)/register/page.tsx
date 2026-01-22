'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await signUp(data.email, data.password, {
        first_name: data.firstName,
        last_name: data.lastName,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Check your email</h1>
        </div>

        <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-xl">
          <CardContent className="pt-6 text-center">
            <p className="text-slate-300 mb-4">
              We&apos;ve sent a confirmation link to your email address. Please click the link to verify your account.
            </p>
            <Link href="/login">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                Back to sign in
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <CardTitle className="text-xl text-white">Create an account</CardTitle>
          <CardDescription className="text-slate-400">
            Get started with your free account today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">First name</label>
                <Input
                  {...register('firstName')}
                  placeholder="John"
                  className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                  leftIcon={<User className="w-4 h-4" />}
                  error={errors.firstName?.message}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Last name</label>
                <Input
                  {...register('lastName')}
                  placeholder="Doe"
                  className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                  error={errors.lastName?.message}
                />
              </div>
            </div>

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
              <label className="text-sm font-medium text-slate-300">Password</label>
              <Input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Confirm password</label>
              <Input
                {...register('confirmPassword')}
                type="password"
                placeholder="••••••••"
                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.confirmPassword?.message}
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
              Create account
            </Button>

            <p className="text-xs text-center text-slate-400">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
