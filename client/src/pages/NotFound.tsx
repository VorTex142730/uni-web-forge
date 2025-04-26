
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-9xl font-bold text-gray-200">404</h1>
      <h2 className="text-2xl font-semibold mt-4 mb-2">Oops! Page not found</h2>
      <p className="text-gray-600 max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Button asChild>
        <Link to="/">Return to Homepage</Link>
      </Button>
    </div>
  );
};

export default NotFound;
