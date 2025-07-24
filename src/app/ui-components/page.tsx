'use client';

import React from 'react';
import CardDemo from '@/components/ui/CardDemo';
import BadgeDemo from '@/components/ui/BadgeDemo';

export default function UIComponentsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">UI Components</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Card Components</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <CardDemo />
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Badge Components</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <BadgeDemo />
        </div>
      </section>
    </div>
  );
}
