"use client";

import React, { useState } from 'react';
import { Button } from '@payloadcms/ui';

const MigrationButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleMigration = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setProgress(0);

    try {
      const response = await fetch('/api/wordpress-migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Migration failed');
      }

      setSuccess(true);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="migration-button-container p-4">
      <Button 
        onClick={handleMigration}
        disabled={isLoading}
        type={success ? 'success' : 'primary'}
      >
        {isLoading ? 'Migrating...' : success ? 'Migration Completed!' : 'Migrate from WordPress'}
      </Button>
      
      {isLoading && (
        <div className="mt-4 w-full h-2 bg-gray-200 rounded overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-4 rounded border border-red-200 bg-red-50 text-red-700">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mt-4 p-4 rounded border border-green-200 bg-green-50 text-green-700">
          WordPress content has been successfully migrated to Payload CMS!
        </div>
      )}
    </div>
  );
};

export default MigrationButton;