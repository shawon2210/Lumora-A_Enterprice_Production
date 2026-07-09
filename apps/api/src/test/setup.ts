// Test environment setup
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key-for-jest-tests-min-32-chars';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-jest-tests-min-32-chars';
process.env.DATABASE_URL = 'postgresql://localhost:5432/lumora_test';
process.env.NODE_ENV = 'test';
process.env.RESEND_API_KEY = 'test-key';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
process.env.GOOGLE_CALLBACK_URL = 'http://localhost:3000/api/v1/auth/google/callback';
process.env.GITHUB_CLIENT_ID = 'test-github-client-id';
process.env.GITHUB_CLIENT_SECRET = 'test-github-client-secret';
process.env.GITHUB_CALLBACK_URL = 'http://localhost:3000/api/v1/auth/github/callback';
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = 'test-key';
process.env.CLOUDINARY_API_SECRET = 'test-secret';
