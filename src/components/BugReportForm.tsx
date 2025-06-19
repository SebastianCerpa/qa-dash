'use client';

import React, { useState, useRef } from 'react';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Label } from '@/components/ui/Label';
import { Checkbox } from '@/components/ui/Checkbox';
import { AlertTriangle, Upload, X, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface BugReportFormProps {
  onSubmit: (bugData: any) => void;
  onCancel: () => void;
  projects: Array<{ id: string; name: string }>;
  users: Array<{ id: string; name: string; email: string }>;
  testCases?: Array<{ id: string; name: string }>;
}

interface CustomField {
  id: string;
  name: string;
  value: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: string[];
}

export default function BugReportForm({ 
  onSubmit, 
  onCancel, 
  projects, 
  users, 
  testCases = [] 
}: BugReportFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'MEDIUM',
    priority: 'MEDIUM',
    project_id: '',
    assignee_id: '',
    environment: '',
    browser: '',
    os: '',
    version: '',
    steps_to_reproduce: '',
    expected_behavior: '',
    actual_behavior: '',
    labels: [] as string[],
    is_regression: false,
    related_test_case_id: '',
    regression_version: ''
  });
  
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [currentLabel, setCurrentLabel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);
  
  const severityOptions = [
    { value: 'LOW', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-800' },
    { value: 'BLOCKER', label: 'Blocker', color: 'bg-purple-100 text-purple-800' }
  ];
  
  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' }
  ];
  
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAddLabel = () => {
    if (currentLabel.trim() && !formData.labels.includes(currentLabel.trim())) {
      setFormData(prev => ({
        ...prev,
        labels: [...prev.labels, currentLabel.trim()]
      }));
      setCurrentLabel('');
    }
  };
  
  const handleRemoveLabel = (label: string) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter(l => l !== label)
    }));
  };
  
  const handleFileUpload = (files: FileList | null, type: 'attachments' | 'screenshots') => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    const validFiles = fileArray.filter(file => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });
    
    if (type === 'attachments') {
      setAttachments(prev => [...prev, ...validFiles]);
    } else {
      setScreenshots(prev => [...prev, ...validFiles]);
    }
  };
  
  const handleRemoveFile = (index: number, type: 'attachments' | 'screenshots') => {
    if (type === 'attachments') {
      setAttachments(prev => prev.filter((_, i) => i !== index));
    } else {
      setScreenshots(prev => prev.filter((_, i) => i !== index));
    }
  };
  
  const addCustomField = () => {
    const newField: CustomField = {
      id: Date.now().toString(),
      name: '',
      value: '',
      type: 'text'
    };
    setCustomFields(prev => [...prev, newField]);
  };
  
  const updateCustomField = (id: string, updates: Partial<CustomField>) => {
    setCustomFields(prev => prev.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };
  
  const removeCustomField = (id: string) => {
    setCustomFields(prev => prev.filter(field => field.id !== id));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.project_id) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const submitData = {
        ...formData,
        custom_fields: customFields.filter(field => field.name.trim()),
        attachments,
        screenshots
      };
      
      await onSubmit(submitData);
      toast.success('Bug report created successfully!');
    } catch (error) {
      toast.error('Failed to create bug report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Report New Bug
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Brief description of the bug"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="project">Project *</Label>
              <Select value={formData.project_id} onValueChange={(value) => handleInputChange('project_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="assignee">Assignee</Label>
              <Select value={formData.assignee_id} onValueChange={(value) => handleInputChange('assignee_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign to..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="severity">Severity *</Label>
              <Select value={formData.severity} onValueChange={(value) => handleInputChange('severity', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {severityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <Badge className={option.color}>{option.label}</Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="priority">Priority *</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Description */}
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Detailed description of the bug"
              rows={4}
              required
            />
          </div>
          
          {/* Environment Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="environment">Environment</Label>
              <Input
                id="environment"
                value={formData.environment}
                onChange={(e) => handleInputChange('environment', e.target.value)}
                placeholder="e.g., Production, Staging"
              />
            </div>
            <div>
              <Label htmlFor="browser">Browser</Label>
              <Input
                id="browser"
                value={formData.browser}
                onChange={(e) => handleInputChange('browser', e.target.value)}
                placeholder="e.g., Chrome 120.0"
              />
            </div>
            <div>
              <Label htmlFor="os">Operating System</Label>
              <Input
                id="os"
                value={formData.os}
                onChange={(e) => handleInputChange('os', e.target.value)}
                placeholder="e.g., Windows 11"
              />
            </div>
          </div>
          
          {/* Bug Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="steps">Steps to Reproduce</Label>
              <Textarea
                id="steps"
                value={formData.steps_to_reproduce}
                onChange={(e) => handleInputChange('steps_to_reproduce', e.target.value)}
                placeholder="1. Go to...\n2. Click on...\n3. Observe..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expected">Expected Behavior</Label>
                <Textarea
                  id="expected"
                  value={formData.expected_behavior}
                  onChange={(e) => handleInputChange('expected_behavior', e.target.value)}
                  placeholder="What should happen?"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="actual">Actual Behavior</Label>
                <Textarea
                  id="actual"
                  value={formData.actual_behavior}
                  onChange={(e) => handleInputChange('actual_behavior', e.target.value)}
                  placeholder="What actually happens?"
                  rows={3}
                />
              </div>
            </div>
          </div>
          
          {/* Regression Tracking */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="regression"
                checked={formData.is_regression}
                onCheckedChange={(checked) => handleInputChange('is_regression', checked)}
              />
              <Label htmlFor="regression">This is a regression bug</Label>
            </div>
            
            {formData.is_regression && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="regression-version">Regression Version</Label>
                  <Input
                    id="regression-version"
                    value={formData.regression_version}
                    onChange={(e) => handleInputChange('regression_version', e.target.value)}
                    placeholder="Version where bug was introduced"
                  />
                </div>
                <div>
                  <Label htmlFor="test-case">Related Test Case</Label>
                  <Select value={formData.related_test_case_id} onValueChange={(value) => handleInputChange('related_test_case_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select test case" />
                    </SelectTrigger>
                    <SelectContent>
                      {testCases.map(testCase => (
                        <SelectItem key={testCase.id} value={testCase.id}>
                          {testCase.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          
          {/* Labels */}
          <div>
            <Label>Labels</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={currentLabel}
                onChange={(e) => setCurrentLabel(e.target.value)}
                placeholder="Add label"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLabel())}
              />
              <Button type="button" onClick={handleAddLabel} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.labels.map(label => (
                <Badge key={label} variant="secondary" className="flex items-center gap-1">
                  {label}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleRemoveLabel(label)}
                  />
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Custom Fields */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>Custom Fields</Label>
              <Button type="button" onClick={addCustomField} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Field
              </Button>
            </div>
            
            {customFields.map(field => (
              <div key={field.id} className="grid grid-cols-12 gap-2 mb-2">
                <div className="col-span-3">
                  <Input
                    value={field.name}
                    onChange={(e) => updateCustomField(field.id, { name: e.target.value })}
                    placeholder="Field name"
                  />
                </div>
                <div className="col-span-2">
                  <Select value={field.type} onValueChange={(value: any) => updateCustomField(field.id, { type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-6">
                  {field.type === 'boolean' ? (
                    <Checkbox
                      checked={field.value === 'true'}
                      onCheckedChange={(checked) => updateCustomField(field.id, { value: checked ? 'true' : 'false' })}
                    />
                  ) : (
                    <Input
                      value={field.value}
                      onChange={(e) => updateCustomField(field.id, { value: e.target.value })}
                      placeholder="Field value"
                      type={field.type === 'number' ? 'number' : 'text'}
                    />
                  )}
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    onClick={() => removeCustomField(field.id)}
                    size="sm"
                    variant="ghost"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {/* File Attachments */}
          <div className="space-y-4">
            <div>
              <Label>Attachments</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files, 'attachments')}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
                {attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{file.name}</span>
                        <Button
                          type="button"
                          onClick={() => handleRemoveFile(index, 'attachments')}
                          size="sm"
                          variant="ghost"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <Label>Screenshots</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  ref={screenshotInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files, 'screenshots')}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => screenshotInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Screenshots
                </Button>
                {screenshots.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {screenshots.map((file, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{file.name}</span>
                        <Button
                          type="button"
                          onClick={() => handleRemoveFile(index, 'screenshots')}
                          size="sm"
                          variant="ghost"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" onClick={onCancel} variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Bug Report'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}