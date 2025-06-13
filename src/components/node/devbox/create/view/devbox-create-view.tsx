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

// Create a custom nanoid with lowercase alphabet and size 12
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 12);

const stepDefinitions = [
  { id: "step-1", title: "Template", description: "Choose a template repository and template" },
  { id: "step-2", title: "Resource", description: "Configure CPU, memory, and storage" },
  { id: "step-3", title: "Network", description: "Set up networking and ports" },
  { id: "step-4", title: "Summary", description: "Review and create your devbox" }
];

const { Scoped, useStepper, steps, utils } = defineStepper(...stepDefinitions);

export default function DevboxCreateView() {
  const { switch: switchStep, next, prev, current, isFirst, isLast } = useStepper();
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

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

  const onSubmit = (data: DevboxFormValues) => {
    console.log("Form data:", data);
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
    console.log(`🔍 Validating step ${current.id} with fields:`, fieldsToValidate);
    
    // Log current form values for the fields we're validating
    const currentValues = watch();
    console.log("📋 Current form values:", currentValues);
    console.log("📋 Values for validation:", fieldsToValidate.map(field => ({ [field]: currentValues[field] })));
    
    const isValid = await trigger(fieldsToValidate);
    console.log(`✅ Validation result for step ${current.id}:`, isValid);
    
    if (!isValid) {
      console.log("❌ Form errors:", formState.errors);
    }
    
    if (isValid) {
      // Mark current step as completed
      if (!completedSteps.includes(current.id)) {
        setCompletedSteps(prev => [...prev, current.id]);
      }
      console.log(`🚀 Moving to next step from ${current.id}`);
      next();
    } else {
      console.log(`🛑 Cannot proceed from step ${current.id} due to validation errors`);
    }
  };

  const handlePrev = () => {
    // Remove current step from completed steps when going back
    setCompletedSteps(prev => prev.filter(stepId => stepId !== current.id));
    prev();
  };

  return (
    <Scoped>
      <FormProvider {...methods}>
        <div className="max-w-4xl mx-auto">
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
              <div>
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
                  <Button type="submit">Create Devbox</Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </FormProvider>
    </Scoped>
  );
}
