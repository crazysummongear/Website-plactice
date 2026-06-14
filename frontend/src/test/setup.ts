import '@testing-library/jest-dom';
import { loadEnv } from 'vite';

// Load test environment variables
const env = loadEnv('test', process.cwd(), '');
Object.assign(import.meta.env, env);
