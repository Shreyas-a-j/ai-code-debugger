const env = {
  HUGGING_FACE_API_KEY: process.env.REACT_APP_HUGGING_FACE_API_KEY || '',
  API_URL: process.env.REACT_APP_API_URL || 'https://api-inference.huggingface.co',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
};

// More detailed logging
console.log('Environment Check:', {
  hasApiKey: !!env.HUGGING_FACE_API_KEY,
  keyLength: env.HUGGING_FACE_API_KEY?.length,
  startsWithHf: env.HUGGING_FACE_API_KEY?.startsWith('hf_'),
  environment: process.env.NODE_ENV,
});

if (!env.HUGGING_FACE_API_KEY) {
  console.warn('Warning: HUGGING_FACE_API_KEY is not set in environment variables');
} else if (!env.HUGGING_FACE_API_KEY.startsWith('hf_')) {
  console.warn('Warning: API key does not start with "hf_". This may cause issues.');
}

console.log('Environment:', process.env.NODE_ENV);
console.log('API URL:', env.API_URL);

export default env; 