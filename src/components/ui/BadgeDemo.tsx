'use client';

import React from 'react';
import { Badge } from './badge';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function BadgeDemo() {
  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Basic Badges</h3>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Status Badges</h3>
        <div className="flex flex-wrap gap-2">
          <Badge className="flex items-center gap-1 bg-green-500 hover:bg-green-600">
            <CheckCircleIcon className="h-3.5 w-3.5" />
            Success
          </Badge>
          <Badge className="flex items-center gap-1 bg-red-500 hover:bg-red-600">
            <XCircleIcon className="h-3.5 w-3.5" />
            Error
          </Badge>
          <Badge className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600">
            <InformationCircleIcon className="h-3.5 w-3.5" />
            Info
          </Badge>
          <Badge className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600">
            <ExclamationTriangleIcon className="h-3.5 w-3.5" />
            Warning
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Numeric Badges</h3>
        <div className="flex flex-wrap gap-2">
          <Badge className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums">
            1
          </Badge>
          <Badge
            variant="secondary"
            className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums"
          >
            25
          </Badge>
          <Badge
            variant="destructive"
            className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums"
          >
            99+
          </Badge>
          <Badge
            variant="outline"
            className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums"
          >
            500
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Custom Badges</h3>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-purple-500 hover:bg-purple-600">
            Premium
          </Badge>
          <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
            Featured
          </Badge>
          <Badge className="border-2 border-dashed border-blue-500 bg-transparent text-blue-500 hover:bg-blue-50">
            Draft
          </Badge>
          <Badge className="bg-gray-800 text-white hover:bg-gray-900">
            Pro
          </Badge>
        </div>
      </div>
    </div>
  );
}