import { defineStepper } from "@stepperize/react";
import { FormProvider, useForm } from "react-hook-form";
import React, { useState } from "react";
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
import { useSealosStore } from "@/store/sealos-store";
import { createDevboxMutation } from "@/lib/sealos/devbox/devbox-mutation";
import { toast } from "sonner";
import { usePanel } from "@/context/panel-provider";

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

    // Trigger validation for specific fields
    const isValid = await trigger(fieldsToValidate);
    console.log(`✅ Validation result for step ${current.id}:`, isValid);

    if (isValid) {
      // Mark step as completed
      setCompletedSteps((prev) => [...prev, current.id]);
      next();
    } else {
      console.log("❌ Validation failed, staying on current step");
    }
  };

  const handlePrev = () => {
    // Remove current step from completed steps when going back
    setCompletedSteps((prev) => prev.filter((id) => id !== current.id));
    prev();
  };

  const isStepCompleted = (stepId: string) => completedSteps.includes(stepId);

  return (
    <div className="flex flex-col h-full">
      {/* Header with step indicator */}
      <div className="flex-shrink-0 p-6 border-b">
        <div className="max-w-4xl mx-auto">
                     <StepIndicator
             steps={steps.map((step) => ({
               id: step.id,
               title: step.title,
               description: step.description,
             }))}
             currentStepId={current.id}
             completedStepIds={completedSteps}
           />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <Scoped>
                {current.id === "step-1" && <StepATemplate />}
                {current.id === "step-2" && <StepBResource />}
                {current.id === "step-3" && <StepCNetwork />}
                {current.id === "step-4" && <StepDSummary />}
              </Scoped>
            </form>
          </FormProvider>
        </div>
      </div>

      {/* Footer with navigation buttons */}
      <div className="flex-shrink-0 p-6 border-t bg-background">
        <div className="max-w-4xl mx-auto flex justify-between">
          <div className="flex gap-2">
            {!isFirst && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrev}
                disabled={isPending}
              >
                Previous
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </Button>

            {!isLast ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isPending}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isPending || !formState.isValid}
                className="min-w-[100px]"
              >
                {isPending ? "Creating..." : "Create Devbox"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
