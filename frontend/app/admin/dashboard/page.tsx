'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/admin');
      return;
    }
    setOk(true);
  }, [router]);

  if (!ok) return <div className="p-8">Checking authentication...</div>;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="mb-4">Use the admin UI to create/edit/delete projects and skills.</p>

      <div className="text-sm text-gray-600">
        Example: send Authorization header for write requests:
        <pre className="mt-2 bg-gray-100 p-2 rounded text-xs">
          Authorization: Bearer &lt;admin_token from localStorage&gt;
        </pre>
      </div>
    </main>
  );
}