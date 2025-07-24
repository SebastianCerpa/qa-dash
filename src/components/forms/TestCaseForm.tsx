import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TestCase } from '@/store/enhancedStore';
import {
  Card,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-radix";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Trash2,
  GripVertical,
  Tag as TagIcon
} from 'lucide-react';

interface TestStep {
  id: string;
  stepNumber: number;
  description?: string; // For form compatibility
  action: string; // Main property in enhancedStore.ts
  expectedResult?: string;
  actualResult?: string;
  status?: "Passed" | "Failed" | "Skipped";
  screenshot?: string;
}

interface TestCaseFormData {
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  type: "Manual" | "Automated" | "Exploratory" | "Regression";
  steps: TestStep[];
  expectedResult: string;
  preconditions: string;
  tags: string[];
  status?: "Not Executed" | "Passed" | "Failed" | "Blocked" | "Skipped";
  environment?: string;
  linkedTicketIds?: string[];
  estimatedTime?: number;
  automationScript?: string;
}

interface TestCaseFormProps {
  initialData?: TestCase;
  onSubmit: (data: TestCaseFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const TestCaseForm: React.FC<TestCaseFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<TestCaseFormData>({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: initialData?.priority || 'Medium',
      type: initialData?.type || 'Manual',
      steps: (initialData?.steps && Array.isArray(initialData.steps)) ? initialData.steps.map((step, index) => ({
        id: `step-${index}`,
        stepNumber: index + 1,
        action: typeof step === 'string' ? step : step.action,
        description: typeof step === 'string' ? step : step.action // Keep description for form compatibility
      })) : [{ id: 'step-1', stepNumber: 1, action: '', description: '' }],
      expectedResult: initialData?.expectedResult || '',
      preconditions: initialData?.preconditions || '',
      tags: initialData?.tags || [],
      status: initialData?.status || 'Not Executed',
      environment: initialData?.environment || '',
      linkedTicketIds: initialData?.linkedTicketIds || [],
      estimatedTime: initialData?.estimatedTime || 0,
      automationScript: initialData?.automationScript || ''
    }
  });

  const [newTag, setNewTag] = useState('');
  const [deleteStepDialogOpen, setDeleteStepDialogOpen] = useState(false);
  const [stepToDelete, setStepToDelete] = useState<string | null>(null);

  const steps = watch('steps');
  const tags = watch('tags');

  const addStep = () => {
    const newStep = {
      id: `step-${Date.now()}`,
      stepNumber: steps.length + 1,
      action: '',
      description: '' // Keep description for form compatibility
    };
    setValue('steps', [...steps, newStep]);
  };

  const removeStep = (stepId: string) => {
    const updatedSteps = steps.filter(step => step.id !== stepId)
      .map((step, index) => ({
        ...step,
        stepNumber: index + 1
      }));
    setValue('steps', updatedSteps);
    setDeleteStepDialogOpen(false);
    setStepToDelete(null);
  };

  const handleRemoveStepClick = (stepId: string) => {
    setStepToDelete(stepId);
    setDeleteStepDialogOpen(true);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setValue('tags', [...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setValue('tags', tags.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const onFormSubmit = (data: TestCaseFormData) => {
    // Transform steps to the correct format for API
    const formattedData = {
      ...data,
      steps: Array.isArray(data.steps) ? data.steps.map(step => ({
        id: step.id,
        stepNumber: step.stepNumber,
        action: step.action || step.description || "", // Use action if exists, or description as fallback
        expectedResult: step.expectedResult || "",
        actualResult: step.actualResult || "",
        status: step.status,
        screenshot: step.screenshot
      })) : [],
      linkedTickets: [] // Ensure required property for TestCase
    };
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <Card className="w-full max-w-4xl mx-auto shadow-lg border-0 bg-white">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
            {initialData ? 'Edit Test Case' : 'Create New Test Case'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {initialData ? 'Update the test case details below' : 'Fill in the details to create a comprehensive test case'}
          </p>
        </div>
        <CardContent className="p-8">
          <div className="space-y-8">
            {/* Basic Information Section */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-medium text-gray-900">Information</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: 'Title is required' }}
                  render={({ field }) => (
                    <Input
                      id="title"
                      placeholder="Enter a clear and descriptive test case title"
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                      {...field}
                    />
                  )}
                />
                {errors.title && (
                  <p className="text-sm text-red-600 flex items-center mt-1">
                    <span className="mr-1">!</span>{errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      id="description"
                      placeholder="Provide a detailed description of what this test case validates"
                      className="min-h-[120px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors resize-none"
                      {...field}
                    />
                  )}
                />
              </div>
            </div>

            {/* Test Configuration Section */}
            <div className="bg-ray-50 rounded-xl p-6 space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <h3 className="text-lg font-medium text-gray-900">Test Configuration</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm font-medium text-gray-700">
                    Priority <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="priority"
                    control={control}
                    rules={{ required: 'Priority is required' }}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors">
                          <SelectValue placeholder="Select priority level" />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg">
                          <SelectItem value="Critical" className="text-red-600 font-medium">Critical</SelectItem>
                          <SelectItem value="High" className="text-orange-600 font-medium">High</SelectItem>
                          <SelectItem value="Medium" className="text-yellow-600 font-medium">Medium</SelectItem>
                          <SelectItem value="Low" className="text-green-600 font-medium">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                    Type <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="type"
                    control={control}
                    rules={{ required: 'Type is required' }}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors">
                          <SelectValue placeholder="Select test type" />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg">
                          <SelectItem value="Manual">Manual</SelectItem>
                          <SelectItem value="Automated">Automated</SelectItem>
                          <SelectItem value="Exploratory">Exploratory</SelectItem>
                          <SelectItem value="Regression">Regression</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Preconditions Section */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <h3 className="text-lg font-medium text-gray-900">Preconditions</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preconditions" className="text-sm font-medium text-gray-700">
                  Setup Requirements
                </Label>
                <Controller
                  name="preconditions"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      id="preconditions"
                      placeholder="List any setup requirements, data conditions, or system states needed before executing this test"
                      className="min-h-[100px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors resize-none"
                      {...field}
                    />
                  )}
                />
              </div>
            </div>

            {/* Test Steps Section */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <h3 className="text-lg font-medium text-gray-900">Test Steps</h3>
                  <span className="text-red-500 text-sm">*</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addStep}
                  className="bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>

              {steps.length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-white">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Plus className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No test steps defined yet</p>
                  <p className="text-gray-400 text-sm mt-1">Click "Add Step" to start building your test case</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(steps) ? steps.map((step, index) => (
                    <div key={step.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-4">
                        <div className="flex-none pt-1">
                          <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-move" />
                        </div>
                        <div className="flex-none">
                          <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-grow">
                          <Controller
                            name={`steps.${index}.action`}
                            control={control}
                            rules={{ required: 'Step action is required' }}
                            render={({ field }) => (
                              <Textarea
                                placeholder={`Describe what should be done in step ${index + 1}...`}
                                className="resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors min-h-[80px]"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  // Synchronize value with description to maintain compatibility
                                  setValue(`steps.${index}.description`, e.target.value);
                                }}
                              />
                            )}
                          />
                          {errors.steps?.[index]?.action && (
                            <p className="text-sm text-red-600 flex items-center mt-2">
                              <span className="mr-1">!</span>{errors.steps[index]?.action?.message}
                            </p>
                          )}
                        </div>
                        <div className="flex-none">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveStepClick(step.id)}
                            disabled={steps.length <= 1}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )) : null}
                </div>
              )}
            </div>

            {/* Expected Result Section */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <h3 className="text-lg font-medium text-gray-900">Expected Result</h3>
                <span className="text-red-500 text-sm">*</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedResult" className="text-sm font-medium text-gray-700">
                  What should happen when the test is executed successfully?
                </Label>
                <Controller
                  name="expectedResult"
                  control={control}
                  rules={{ required: 'Expected result is required' }}
                  render={({ field }) => (
                    <Textarea
                      id="expectedResult"
                      placeholder="Describe the expected behavior, output, or state after executing all test steps"
                      className="min-h-[120px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors resize-none"
                      {...field}
                    />
                  )}
                />
                {errors.expectedResult && (
                  <p className="text-sm text-red-600 flex items-center mt-1">
                    <span className="mr-1">!</span>{errors.expectedResult.message}
                  </p>
                )}
              </div>
            </div>

            {/* Tags Section */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <h3 className="text-lg font-medium text-gray-900">Tags</h3>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">
                  Add labels to categorize and organize this test case
                </Label>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 transition-colors flex items-center gap-2 px-3 py-1">
                        <TagIcon className="h-3 w-3" />
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full"
                          onClick={() => removeTag(tag)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex space-x-3">
                  <div className="flex-grow">
                    <Input
                      placeholder="Type a tag and press Enter or click Add"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTag}
                    disabled={!newTag.trim()}
                    className="bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors px-4"
                  >
                    <TagIcon className="h-4 w-4 mr-2" />
                    Add Tag
                  </Button>
                </div>
              </div>
            </div>

            {/* Additional Configuration Section */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                <h3 className="text-lg font-medium text-gray-900">Additional Configuration</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="environment" className="text-sm font-medium text-gray-700">
                    Environment
                  </Label>
                  <Controller
                    name="environment"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="environment"
                        placeholder="e.g., Production, Staging, QA, Development"
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                        {...field}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedTime" className="text-sm font-medium text-gray-700">
                    Estimated Time (minutes)
                  </Label>
                  <Controller
                    name="estimatedTime"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="estimatedTime"
                        type="number"
                        min="0"
                        placeholder="How long should this test take?"
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {watch('type') === 'Automated' && (
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  <h3 className="text-lg font-medium text-gray-900">Automation Script</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="automationScript" className="text-sm font-medium text-gray-700">
                    Script or Reference
                  </Label>
                  <Controller
                    name="automationScript"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        id="automationScript"
                        placeholder="Enter automation script code, file path, or reference to the automated test"
                        className="min-h-[120px] font-mono text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors resize-none bg-gray-900 text-green-400"
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 border-t border-gray-100 px-8 py-6 rounded-b-xl">
          <div className="flex justify-end space-x-4 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                initialData ? 'Update Test Case' : 'Create Test Case'
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={deleteStepDialogOpen} onOpenChange={setDeleteStepDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the selected test step. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => stepToDelete && removeStep(stepToDelete)}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
};

export default TestCaseForm;
