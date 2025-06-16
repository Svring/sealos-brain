import { defineStepper } from "@stepperize/react";
import { FormProvider, useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  devboxCreateSchema,
  DevboxFormValues,
} from "../schema/devbox-create-schema";
import StepATemplate from "./steps/step-a-template";
import StepBResource from "./steps/step-b-resource";
import StepCNetwork from "./steps/step-c-network";
import StepDSummary from "./steps/step-d-summary";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/ui/step-indicator";
import { customAlphabet } from "nanoid";
import { useControlStore } from "@/store/control-store";
import { useSealosStore } from "@/store/sealos-store";
import { createDevboxMutation } from "@/lib/devbox/devbox-mutation";
import { toast } from "sonner";
import { usePanel } from "@/components/node/panel-provider";

// Create a custom nanoid with lowercase alphabet and size 12
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz", 12);

const stepDefinitions = [
  {
    id: "step-1",
    title: "Template",
    description: "Choose a template repository and template",
  },
  {
    id: "step-2",
    title: "Resource",
    description: "Configure CPU, memory, and storage",
  },
  {
    id: "step-3",
    title: "Network",
    description: "Set up networking and ports",
  },
  {
    id: "step-4",
    title: "Summary",
    description: "Review and create your devbox",
  },
];

const { Scoped, useStepper, steps, utils } = defineStepper(...stepDefinitions);

interface DevboxCreateViewProps {
  onComplete?: (success: boolean) => void;
}

export default function DevboxCreateView({
  onComplete,
}: DevboxCreateViewProps) {
  const {
    switch: switchStep,
    next,
    prev,
    current,
    isFirst,
    isLast,
  } = useStepper();
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const { setDevboxCreateStep, updateDevboxCreateForm, devboxCreateForm } =
    useControlStore();
  const { currentUser, regionUrl } = useSealosStore();
  const { closePanel } = usePanel();

  // Create devbox mutation
  const { mutateAsync: createDevbox, isPending } = createDevboxMutation(
    currentUser,
    regionUrl
  );

  const methods = useForm<DevboxFormValues>({
    resolver: zodResolver(devboxCreateSchema),
    mode: "onBlur",
    defaultValues: {
      name: `devbox-${nanoid()}`, // Generate a default name
      cpu: 1000,
      memory: 2048,
      networks: [],
    },
  });

  const { handleSubmit, trigger, formState, watch } = methods;

  // Sync current step with control store
  useEffect(() => {
    const stepMapping = {
      "step-1": "template" as const,
      "step-2": "resource" as const,
      "step-3": "network" as const,
      "step-4": "summary" as const,
    };

    const controlStoreStep =
      stepMapping[current.id as keyof typeof stepMapping];
    if (controlStoreStep) {
      setDevboxCreateStep(controlStoreStep);
    }
  }, [current.id, setDevboxCreateStep]);

  // Sync form values with control store for AI access
  useEffect(() => {
    const subscription = watch((formData) => {
      // Convert form data to control store format
      const controlStoreFormData = {
        name: formData.name,
        templateId: formData.templateUid,
        cpu: formData.cpu ? Math.round(formData.cpu / 1000) : undefined, // Convert from millicores to cores
        memory: formData.memory
          ? Math.round(formData.memory / 1024)
          : undefined, // Convert from MB to GB
        gpu: formData.gpu
          ? {
              type: formData.gpu.type || "",
              count: formData.gpu.amount || 0,
            }
          : undefined,
      };

      // Only update if there are actual changes to avoid infinite loops
      const hasChanges = Object.entries(controlStoreFormData).some(
        ([key, value]) => {
          const currentValue =
            devboxCreateForm[key as keyof typeof devboxCreateForm];
          return value !== currentValue;
        }
      );

      if (hasChanges) {
        console.log(
          "🔄 Syncing form data to control store:",
          controlStoreFormData
        );
        updateDevboxCreateForm(controlStoreFormData);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, updateDevboxCreateForm, devboxCreateForm]);

  const onSubmit = async (data: DevboxFormValues) => {
    try {
      toast.loading("Creating devbox...", { id: "create-devbox" });

      const result = await createDevbox({
        devboxForm: {
          ...data,
          cpu: data.cpu, // Keep in millicores
          memory: data.memory, // Keep in MB
        },
      });

      toast.success("Devbox created successfully!", { id: "create-devbox" });
      closePanel();
      onComplete?.(true);
    } catch (error: any) {
      toast.error(error?.message || "Failed to create devbox", {
        id: "create-devbox",
      });
      onComplete?.(false);
    }
  };

  const handleCancel = () => {
    onComplete?.(false);
  };

  const getFieldsToValidate = (stepId: string): (keyof DevboxFormValues)[] => {
    switch (stepId) {
      case "step-1":
        return ["templateRepositoryUid", "templateUid"];
      case "step-2":
        return ["cpu", "memory"];
      case "step-3":
        return ["networks"];
      case "step-4":
        return ["name"]; // Validate name in the final step
      default:
        return [];
    }
  };

  const handleNext = async () => {
    const fieldsToValidate = getFieldsToValidate(current.id);
    console.log(
      `🔍 Validating step ${current.id} with fields:`,
      fieldsToValidate
    );

    // Log current form values for the fields we're validating
    const currentValues = watch();
    console.log("📋 Current form values:", currentValues);
    console.log(
      "📋 Values for validation:",
      fieldsToValidate.map((field) => ({ [field]: currentValues[field] }))
    );

    const isValid = await trigger(fieldsToValidate);
    console.log(`✅ Validation result for step ${current.id}:`, isValid);

    if (!isValid) {
      console.log("❌ Form errors:", formState.errors);
    }

    if (isValid) {
      // Mark current step as completed
      if (!completedSteps.includes(current.id)) {
        setCompletedSteps((prev) => [...prev, current.id]);
      }
      console.log(`🚀 Moving to next step from ${current.id}`);
      next();
    } else {
      console.log(
        `🛑 Cannot proceed from step ${current.id} due to validation errors`
      );
    }
  };

  const handlePrev = () => {
    // Remove current step from completed steps when going back
    setCompletedSteps((prev) => prev.filter((stepId) => stepId !== current.id));
    prev();
  };

  return (
    <Scoped>
      <FormProvider {...methods}>
        <div className="w-full">
          {/* Step Indicator */}
          <div className="mb-8 px-6 pt-6">
            <StepIndicator
              steps={stepDefinitions}
              currentStepId={current.id}
              completedStepIds={completedSteps}
            />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Step Content */}
            <div className="px-6">
              {switchStep({
                "step-1": () => <StepATemplate />,
                "step-2": () => <StepBResource />,
                "step-3": () => <StepCNetwork />,
                "step-4": () => <StepDSummary />,
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center px-6 pb-6">
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={handleCancel}>
                  Cancel
                </Button>
                {!isFirst && (
                  <Button type="button" variant="outline" onClick={handlePrev}>
                    Previous
                  </Button>
                )}
              </div>

              <div className="flex gap-4">
                {!isLast ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Creating..." : "Create Devbox"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </FormProvider>
    </Scoped>
  );
}
