import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export interface StepItem {
  id: number;
  label: string;
  icon?: React.ElementType;
}

export interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between relative">
        {/* Continuous connector line behind circles */}
        <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />

        {steps.map((step, idx) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const StepIcon = step.icon;

          return (
            <div
              key={step.id}
              onClick={() => isCompleted && onStepClick && onStepClick(step.id)}
              className={`relative z-10 flex flex-col items-center group ${
                isCompleted && onStepClick ? 'cursor-pointer' : ''
              }`}
            >
              {/* Step Circle Badge */}
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.08 : 1,
                  backgroundColor: isCompleted
                    ? '#16A34A'
                    : isCurrent
                    ? '#4F46E5'
                    : '#FFFFFF',
                }}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-shadow ${
                  isCompleted
                    ? 'text-white shadow-md shadow-emerald-500/20'
                    : isCurrent
                    ? 'text-white shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-500/20'
                    : 'border-2 border-slate-200 dark:border-slate-700 text-slate-400 bg-white dark:bg-slate-900'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[2.5]" />
                ) : StepIcon ? (
                  <StepIcon className="w-4 h-4" />
                ) : (
                  <span>{step.id}</span>
                )}
              </motion.div>

              {/* Step Label */}
              <span
                className={`mt-2 text-xs font-semibold tracking-tight transition-colors ${
                  isCurrent
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : isCompleted
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
