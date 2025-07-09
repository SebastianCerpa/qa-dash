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
  description?: string; // Para compatibilidad con el formulario
  action: string; // Propiedad principal en enhancedStore.ts
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
      steps: initialData?.steps?.map((step, index) => ({
        id: `step-${index}`,
        stepNumber: index + 1,
        action: typeof step === 'string' ? step : step.action,
        description: typeof step === 'string' ? step : step.action // Mantenemos description para compatibilidad con el formulario
      })) || [{ id: 'step-1', stepNumber: 1, action: '', description: '' }],
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
      description: '' // Mantenemos description para compatibilidad con el formulario
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
      steps: data.steps.map(step => ({
        id: step.id,
        stepNumber: step.stepNumber,
        action: step.action || step.description || "", // Usamos action si existe, o description como fallback
        expectedResult: step.expectedResult || "",
        actualResult: step.actualResult || "",
        status: step.status,
        screenshot: step.screenshot
      })),
      linkedTickets: [] // Ensure required property for TestCase
    };
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Title is required' }}
                render={({ field }) => (
                  <Input
                    id="title"
                    placeholder="Enter test case title"
                    {...field}
                    error={errors.title?.message}
                  />
                )}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="description"
                    placeholder="Describe the purpose of this test case"
                    className="min-h-[100px]"
                    {...field}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority <span className="text-destructive">*</span></Label>
                <Controller
                  name="priority"
                  control={control}
                  rules={{ required: 'Priority is required' }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Critical">Critical</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type <span className="text-destructive">*</span></Label>
                <Controller
                  name="type"
                  control={control}
                  rules={{ required: 'Type is required' }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
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

            <div className="space-y-2">
              <Label htmlFor="preconditions">Preconditions</Label>
              <Controller
                name="preconditions"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="preconditions"
                    placeholder="List any preconditions required for this test case"
                    {...field}
                  />
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Test Steps <span className="text-destructive">*</span></Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addStep}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>

              {steps.length === 0 ? (
                <div className="text-center p-4 border border-dashed rounded-md">
                  <p className="text-muted-foreground">No steps added yet. Click "Add Step" to begin.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-start space-x-3 p-3 border rounded-md">
                      <div className="flex-none pt-2">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-none pt-2 w-8 text-center font-medium">
                        {index + 1}.
                      </div>
                      <div className="flex-grow">
                        <Controller
                          name={`steps.${index}.action`}
                          control={control}
                          rules={{ required: 'Step action is required' }}
                          render={({ field }) => (
                            <Textarea
                              placeholder={`Describe step ${index + 1}`}
                              className="resize-none"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                // Sincronizamos el valor con description para mantener compatibilidad
                                setValue(`steps.${index}.description`, e.target.value);
                              }}
                            />
                          )}
                        />
                        {errors.steps?.[index]?.action && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.steps[index]?.action?.message}
                          </p>
                        )}
                      </div>
                      <div className="flex-none pt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveStepClick(step.id)}
                          disabled={steps.length <= 1}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedResult">Expected Result <span className="text-destructive">*</span></Label>
              <Controller
                name="expectedResult"
                control={control}
                rules={{ required: 'Expected result is required' }}
                render={({ field }) => (
                  <Textarea
                    id="expectedResult"
                    placeholder="Describe the expected outcome of the test"
                    {...field}
                  />
                )}
              />
              {errors.expectedResult && (
                <p className="text-sm text-destructive">{errors.expectedResult.message}</p>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => removeTag(tag)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex space-x-2">
                <div className="flex-grow">
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTag}
                  disabled={!newTag.trim()}
                >
                  <TagIcon className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="environment">Environment</Label>
                <Controller
                  name="environment"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="environment"
                      placeholder="e.g., Production, Staging, QA"
                      {...field}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
                <Controller
                  name="estimatedTime"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="estimatedTime"
                      type="number"
                      min="0"
                      placeholder="Estimated execution time"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  )}
                />
              </div>
            </div>

            {watch('type') === 'Automated' && (
              <div className="space-y-2">
                <Label htmlFor="automationScript">Automation Script</Label>
                <Controller
                  name="automationScript"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      id="automationScript"
                      placeholder="Enter automation script or reference"
                      className="min-h-[100px] font-mono text-sm"
                      {...field}
                    />
                  )}
                />
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialData ? 'Update Test Case' : 'Create Test Case'}
          </Button>
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