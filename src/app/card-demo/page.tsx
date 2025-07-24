'use client';

import React from 'react';
import CardDemo from '@/components/ui/CardDemo';
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from '@/components/ui/card';

export default function CardDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-medium text-gray-900 mb-8">Card Design Demo</h1>

        <div className="mb-12">
          <h2 className="text-xl font-medium text-gray-800 mb-4">Metric Cards</h2>
          <CardDemo />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Card with Title</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">This is a card with a title and subtitle. The card has padding and a border.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Card Header</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">This card uses the CardHeader and CardContent components.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Card with Footer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">This card has a footer with an action button.</p>
            </CardContent>
            <CardFooter>
              <div className="flex justify-end w-full">
                <button className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium">Action</button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">This card uses the elevated variant with a stronger shadow effect.</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Bordered Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">This card uses the bordered variant with a more prominent border.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
