import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

/**
 * Signup form validation schema
 */
const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, 'メールアドレスを入力してください')
      .email('有効なメールアドレスを入力してください'),
    password: z
      .string()
      .min(1, 'パスワードを入力してください')
      .min(12, 'パスワードは12文字以上である必要があります')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'パスワードは大文字、小文字、数字、特殊文字を含む必要があります'
      ),
    confirmPassword: z.string().min(1, 'パスワード（確認）を入力してください'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

/**
 * Email verification form validation schema
 */
const verificationSchema = z.object({
  code: z
    .string()
    .min(1, '検証コードを入力してください')
    .length(6, '検証コードは6桁です'),
});

type VerificationFormData = z.infer<typeof verificationSchema>;

/**
 * Signup page component
 * Provides email/password signup with form validation using React Hook Form + Zod
 * Includes email verification code input flow
 */
export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, confirmEmail, loading, error: authError } = useAuthContext();
  const [showVerification, setShowVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register: registerSignup,
    handleSubmit: handleSubmitSignup,
    formState: { errors: signupErrors, isSubmitting: isSignupSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const {
    register: registerVerification,
    handleSubmit: handleSubmitVerification,
    formState: { errors: verificationErrors, isSubmitting: isVerificationSubmitting },
  } = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
  });

  /**
   * Handle signup form submission
   */
  const onSignupSubmit = async (data: SignupFormData) => {
    try {
      await signup(data.email, data.password);
      setUserEmail(data.email);
      setShowVerification(true);
      setSuccessMessage('確認コードをメールで送信しました。メールをご確認ください。');
    } catch (err) {
      // Error is handled by useAuth hook and displayed via authError
      console.error('Signup failed:', err);
    }
  };

  /**
   * Handle verification form submission
   */
  const onVerificationSubmit = async (data: VerificationFormData) => {
    try {
      await confirmEmail(userEmail, data.code);
      setSuccessMessage('メールアドレスが確認されました。ログインしてください。');
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      // Error is handled by useAuth hook and displayed via authError
      console.error('Email confirmation failed:', err);
    }
  };

  const isLoading = loading || isSignupSubmitting || isVerificationSubmitting;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">kakei</h1>
          <p className="text-gray-600 mt-2">
            {showVerification ? 'メール確認' : 'アカウント作成'}
          </p>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="mb-6 rounded-md bg-green-50 p-4 border border-green-200">
            <p className="text-sm font-medium text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Error message */}
        {authError && (
          <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
            <p className="text-sm font-medium text-red-800">{authError}</p>
          </div>
        )}

        {!showVerification ? (
          /* Signup form */
          <form onSubmit={handleSubmitSignup(onSignupSubmit)} className="space-y-5">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                placeholder="example@example.com"
                {...registerSignup('email')}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  signupErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {signupErrors.email && (
                <p className="mt-1 text-sm text-red-600">{signupErrors.email.message}</p>
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
                placeholder="••••••••"
                {...registerSignup('password')}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  signupErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {signupErrors.password && (
                <p className="mt-1 text-sm text-red-600">{signupErrors.password.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                12文字以上、大文字・小文字・数字・特殊文字を含む
              </p>
            </div>

            {/* Confirm password field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                パスワード（確認）
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...registerSignup('confirmPassword')}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  signupErrors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {signupErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {signupErrors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
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
                  登録中...
                </>
              ) : (
                'アカウント作成'
              )}
            </button>
          </form>
        ) : (
          /* Email verification form */
          <form
            onSubmit={handleSubmitVerification(onVerificationSubmit)}
            className="space-y-5"
          >
            <div className="mb-4 text-sm text-gray-600">
              <p>
                <strong>{userEmail}</strong> に確認コードを送信しました。
              </p>
              <p className="mt-2">メールに記載された6桁のコードを入力してください。</p>
            </div>

            {/* Verification code field */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                確認コード
              </label>
              <input
                id="code"
                type="text"
                placeholder="123456"
                maxLength={6}
                {...registerVerification('code')}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-center text-2xl tracking-widest ${
                  verificationErrors.code ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {verificationErrors.code && (
                <p className="mt-1 text-sm text-red-600">{verificationErrors.code.message}</p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
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
                  確認中...
                </>
              ) : (
                'メールアドレスを確認'
              )}
            </button>

            {/* Back to signup button */}
            <button
              type="button"
              onClick={() => setShowVerification(false)}
              disabled={isLoading}
              className="w-full text-gray-600 py-2 rounded-md font-medium hover:text-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              戻る
            </button>
          </form>
        )}

        {/* Login link */}
        {!showVerification && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              すでにアカウントをお持ちですか？{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                ログイン
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
