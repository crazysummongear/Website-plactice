import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

/**
 * Login form validation schema
 */
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(1, 'パスワードを入力してください')
    .min(12, 'パスワードは12文字以上である必要があります'),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Login page component
 * Provides email/password login with form validation using React Hook Form + Zod
 * Redirects to the original page (if saved in location state) or dashboard on successful login
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading, error: authError } = useAuthContext();

  // Get the page user was trying to access before being redirected to login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit', // 送信時にバリデーションを実行
    reValidateMode: 'onChange', // 再バリデーションは入力変更時
  });

  /**
   * Redirect to original page or dashboard if already authenticated
   */
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  /**
   * Handle form submission
   */
  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      // Navigation will be handled by useEffect after isAuthenticated becomes true
    } catch (err) {
      // Error is handled by useAuth hook and displayed via authError
      console.error('Login failed:', err);
    }
  };

  const isLoading = loading || isSubmitting;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">kakei</h1>
          <p className="text-gray-600 mt-2">スマートな家計管理</p>
        </div>

        {/* Error message */}
        {authError && (
          <div data-testid="login-error-message" className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
            <p className="text-sm font-medium text-red-800">{authError}</p>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              data-testid="login-email-input"
              placeholder="example@example.com"
              {...register('email')}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.email && (
              <p data-testid="email-error" className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              data-testid="login-password-input"
              placeholder="••••••••"
              {...register('password')}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.password && (
              <p data-testid="password-error" className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            data-testid="login-submit-button"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                ログイン中...
              </>
            ) : (
              'ログイン'
            )}
          </button>
        </form>

        {/* Signup link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            アカウントをお持ちでないですか？{' '}
            <Link
              to="/signup"
              data-testid="login-signup-link"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              サインアップ
            </Link>
          </p>
        </div>

        {/* Password reset link */}
        <div className="mt-4 text-center">
          <Link
            to="/forgot-password"
            className="text-sm text-gray-600 hover:text-gray-700 transition-colors"
          >
            パスワードをお忘れですか？
          </Link>
        </div>
      </div>
    </div>
  );
}