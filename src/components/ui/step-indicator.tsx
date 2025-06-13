import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStepId: string;
  completedStepIds?: string[];
  className?: string;
}

export function StepIndicator({
  steps,
  currentStepId,
  completedStepIds = [],
  className,
}: StepIndicatorProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStepId);
  const currentStep = steps.find((step) => step.id === currentStepId);

  return (
    <div className={cn("w-full", className)}>
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = completedStepIds.includes(step.id);
            const isCurrent = step.id === currentStepId;
            const isPast = index < currentIndex;
            const isClickable = isPast || isCompleted;

            return (
              <li key={step.id} className="flex-1">
                <div className="flex items-center">
                  {/* Step Circle */}
                  <div className="flex items-center justify-center">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium",
                        {
                          "border-blue-600 bg-blue-600 text-white": isCurrent,
                          "border-green-600 bg-green-600 text-white": isCompleted,
                          "border-gray-300 bg-white text-gray-500": !isCurrent && !isCompleted && !isPast,
                          "border-gray-300 bg-gray-100 text-gray-500": isPast && !isCompleted,
                        }
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                  </div>

                  {/* Step Title */}
                  <div className="ml-4 min-w-0 flex-1">
                    <div
                      className={cn("text-sm font-medium", {
                        "text-blue-600": isCurrent,
                        "text-green-600": isCompleted,
                        "text-gray-900": isPast && !isCompleted,
                        "text-gray-500": !isCurrent && !isCompleted && !isPast,
                      })}
                    >
                      {step.title}
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="flex-1 ml-4">
                      <div
                        className={cn("h-0.5 w-full", {
                          "bg-green-600": index < currentIndex || isCompleted,
                          "bg-gray-300": index >= currentIndex && !isCompleted,
                        })}
                      />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
      
      {/* Current Step Description */}
      {currentStep?.description && (
        <div className="mt-4 text-center">
          <p className="text-sm text-blue-600 font-medium">
            {currentStep.description}
          </p>
        </div>
      )}
    </div>
  );
} 