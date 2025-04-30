import { setupCors } from '../config/setupCors';

// Run the CORS setup
setupCors().then(() => {
  console.log('CORS setup completed');
  process.exit(0);
}).catch((error) => {
  console.error('Error during CORS setup:', error);
  process.exit(1);
}); 