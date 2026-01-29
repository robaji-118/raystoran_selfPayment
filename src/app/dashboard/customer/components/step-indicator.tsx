// app/dashboard/customer/components/step-indicator.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface Step {
  number: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  slug?: string;
}

export interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export default function StepIndicator({
  steps,
  currentStep,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className="bg-white px-8 py-4 rounded-xl mb-12">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;
          const isClickable = step.number <= currentStep;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.number}>
              {/* Step Circle */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => isClickable && onStepClick?.(step.number)}
                  disabled={!isClickable}
                  className={cn(
                    "flex items-center justify-center transition-all duration-300 w-10 h-10 rounded-full relative",
                    !isClickable && "cursor-not-allowed opacity-50",
                    isClickable && !isActive && "hover:scale-105",
                    isActive && "scale-110"
                  )}
                  type="button"
                  aria-current={isActive ? "step" : undefined}
                >
                  {/* Background Circle */}
                  <div className={cn(
                    "absolute inset-0 rounded-full transition-all duration-300",
                    isActive 
                      ? "bg-black shadow-lg" 
                      : isCompleted 
                        ? "bg-gray-900" 
                        : "bg-white border-2 border-gray-300"
                  )} />
                  
                  {/* Icon */}
                  <StepIcon 
                    className={cn(
                      "w-5 h-5 relative z-10 transition-colors duration-300",
                      isActive || isCompleted
                        ? "text-white" 
                        : "text-gray-400"
                    )}
                  />
                  
                  {/* Active Ring */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full border-2 border-black animate-pulse" 
                         style={{ transform: 'scale(1.3)', opacity: 0.3 }} />
                  )}
                </button>
                
                {/* Step Title */}
                <div className="text-center">
                  <div 
                    className={cn(
                      "text-xs font-medium transition-colors duration-300 whitespace-nowrap",
                      isActive 
                        ? "text-black font-semibold" 
                        : isCompleted 
                          ? "text-gray-700" 
                          : "text-gray-400"
                    )}
                  >
                    {step.title}
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 relative h-0.5 -mt-6 mx-2">
                  <div className="absolute top-0 left-0 right-0 bg-gray-200 h-0.5 rounded-full" />
                  <div 
                    className="absolute top-0 left-0 bg-black h-0.5 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: isCompleted ? '100%' : '0%',
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}