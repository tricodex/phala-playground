'use client';

import { useState } from 'react';

export default function SchemaPage() {
  const [schemaId, setSchemaId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSchema = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/schema', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setSchemaId(data.schemaId);
      } else {
        setError(data.error || 'Failed to create schema');
      }
    } catch (err) {
      setError(`An error occurred while creating the schema ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Schema Creation</h1>
      <button
        onClick={createSchema}
        disabled={isLoading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {isLoading ? 'Creating...' : 'Create Schema'}
      </button>
      {schemaId && (
        <p className="mt-4">
          Schema created successfully! ID: <strong>{schemaId}</strong>
        </p>
      )}
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
}