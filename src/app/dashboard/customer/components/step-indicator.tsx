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
  
  // Cari data step yang sedang aktif untuk tampilan mobile
  const activeStepData = steps.find((s) => s.number === currentStep) || steps[0];
  const ActiveIcon = activeStepData.icon;

  return (
    <div
      className={cn(
        "bg-white overflow-hidden",
        "mb-6 px-4 py-6 rounded-xl",
        "md:mx-6 lg:mx-8 xl:mx-auto xl:max-w-5xl",
        "md:mb-8 md:px-6 md:py-6 lg:rounded-2xl"
      )}
    >
      {/* --- DESKTOP VIEW (Tablet ke atas) --- */}
      {/* Hidden di mobile, Flex di md ke atas */}
      <div className="hidden md:flex items-start justify-between w-full relative">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;
          const isClickable = step.number <= currentStep;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.number}>
              {/* Step Item Container */}
              <div className="flex flex-col items-center relative z-10 gap-2">
                <button
                  onClick={() => isClickable && onStepClick?.(step.number)}
                  disabled={!isClickable}
                  className={cn(
                    "flex items-center justify-center transition-all duration-300 rounded-full relative group",
                    "w-10 h-10", // Ukuran desktop tetap
                    !isClickable && "cursor-not-allowed opacity-50",
                    isClickable && !isActive && "hover:scale-105",
                    isActive && "scale-110"
                  )}
                  type="button"
                  aria-current={isActive ? "step" : undefined}
                >
                  {/* Background Circle */}
                  <div
                    className={cn(
                      "absolute inset-0 rounded-full transition-all duration-300",
                      isActive
                        ? "bg-black shadow-lg"
                        : isCompleted
                        ? "bg-gray-900"
                        : "bg-white border border-gray-200 group-hover:border-gray-300"
                    )}
                  />

                  {/* Icon */}
                  <StepIcon
                    className={cn(
                      "relative z-10 transition-colors duration-300 w-4 h-4",
                      (isActive || isCompleted) ? "text-white" : "text-gray-400"
                    )}
                  />

                  {/* Active Ring Animation */}
                  {isActive && (
                    <div
                      className="absolute inset-0 rounded-full border border-black animate-pulse"
                      style={{ transform: "scale(1.3)", opacity: 0.2 }}
                    />
                  )}
                </button>

                {/* Step Title */}
                <div className="text-center absolute top-full left-1/2 -translate-x-1/2 mt-2 w-24">
                  <span
                    className={cn(
                      "block font-medium transition-colors duration-300 leading-tight text-xs",
                      isActive
                        ? "text-black font-bold"
                        : isCompleted
                        ? "text-gray-900"
                        : "text-gray-400"
                    )}
                  >
                    {step.title}
                  </span>
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={cn(
                    "flex-1 relative mx-3 h-[2px] mt-5" // Alignment desktop
                  )}
                >
                  <div className="absolute top-0 left-0 right-0 bg-gray-100 rounded-full h-full" />
                  <div
                    className="absolute top-0 left-0 bg-black rounded-full h-full transition-all duration-700 ease-in-out"
                    style={{
                      width: isCompleted ? "100%" : isActive ? "50%" : "0%",
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* --- MOBILE VIEW (HP) --- */}
      {/* Flex di mobile, Hidden di md ke atas */}
      <div className="flex md:hidden flex-col items-center justify-center w-full animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center gap-3">
          
          {/* Active Circle (Single) */}
          <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-black shadow-lg">
             <ActiveIcon className="w-5 h-5 text-white relative z-10" />
             {/* Ring Animation */}
             <div
                className="absolute inset-0 rounded-full border-2 border-black animate-pulse"
                style={{ transform: "scale(1.25)", opacity: 0.15 }}
              />
          </div>

          {/* Title & Counter */}
          <div className="text-center space-y-1">
            <h3 className="font-bold text-gray-900 text-sm">
              {activeStepData.title}
            </h3>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
              Step {currentStep} of {steps.length}
            </p>
          </div>

          {/* Dots Indicator (Untuk konteks progress) */}
          <div className="flex items-center gap-1.5 mt-2">
            {steps.map((s) => (
              <div 
                key={s.number}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  s.number === currentStep 
                    ? "w-6 bg-black" 
                    : s.number < currentStep 
                    ? "w-1.5 bg-gray-400" 
                    : "w-1.5 bg-gray-200"
                )}
              />
            ))}
          </div>

        </div>
      </div>

      {/* Spacer bawah untuk desktop agar title tidak terpotong */}
      <div className="hidden md:block h-8" />
    </div>
  );
}