'use client';

import { useEffect, useState } from 'react';
import type { ModPropConfig } from '@/types/cms-types';
import TestimonialsEditor from './TestimonialsEditor';
import EvangelizationActionsEditor from './EvangelizationActionsEditor';
import ProjectsEditor from './ProjectsEditor';
import { ParagraphsEditor } from './ParagraphsEditor';
import { AnimationPicker } from './AnimationPicker';
import { PillarsEditor } from './PillarsEditor';
import { ButtonsEditor } from './ButtonsEditor';

interface DynamicModFormProps {
  modId: string;
  propConfigs: ModPropConfig[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
}

export default function DynamicModForm({
  modId,
  propConfigs,
  values,
  onChange
}: DynamicModFormProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>(values);

  useEffect(() => {
    setFormValues(values);
  }, [values]);

  const handleChange = (propName: string, value: any) => {
    const newValues = { ...formValues, [propName]: value };
    setFormValues(newValues);
    onChange(newValues);
  };

  const renderInput = (config: ModPropConfig) => {
    // Suporta tanto 'name' quanto 'key' (legacy) para compatibilidade
    const propName = config.name || (config as any).key || '';
    const value = formValues[propName] ?? config.default ?? (config as any).defaultValue ?? '';

    switch (config.type) {
      case 'select':
        // Select dropdown com suporte para string[] ou {value, label}[]
        return (
          <select
            className="select select-bordered w-full"
            value={value}
            onChange={(e) => handleChange(propName, e.target.value)}
          >
            {config.options?.map((option) => {
              // Suporta tanto strings quanto objetos {value, label}
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              return (
                <option key={optionValue} value={optionValue}>
                  {optionLabel}
                </option>
              );
            })}
          </select>
        );

      case 'string':
        if (config.options && config.options.length > 0) {
          // Select dropdown for predefined options (legacy support)
          return (
            <select
              className="select select-bordered w-full"
              value={value}
              onChange={(e) => handleChange(propName, e.target.value)}
            >
              {config.options.map((option) => {
                const optionValue = typeof option === 'string' ? option : option.value;
                const optionLabel = typeof option === 'string' ? option : option.label;
                return (
                  <option key={optionValue} value={optionValue}>
                    {optionLabel}
                  </option>
                );
              })}
            </select>
          );
        } else if (config.multiline) {
          // Textarea for multiline strings
          return (
            <textarea
              className="textarea textarea-bordered w-full h-24"
              placeholder={config.placeholder || ''}
              value={value}
              onChange={(e) => handleChange(propName, e.target.value)}
            />
          );
        } else {
          // Regular text input
          return (
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder={config.placeholder || ''}
              value={value}
              onChange={(e) => handleChange(propName, e.target.value)}
            />
          );
        }

      case 'number':
        return (
          <input
            type="number"
            className="input input-bordered w-full"
            placeholder={config.placeholder || ''}
            value={value}
            onChange={(e) => handleChange(propName, parseFloat(e.target.value) || 0)}
          />
        );

      case 'boolean':
        return (
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            checked={value}
            onChange={(e) => handleChange(propName, e.target.checked)}
          />
        );

      case 'url':
        return (
          <input
            type="url"
            className="input input-bordered w-full"
            placeholder={config.placeholder || 'https://...'}
            value={value}
            onChange={(e) => handleChange(propName, e.target.value)}
          />
        );

      case 'testimonials-editor':
        return (
          <TestimonialsEditor
            value={value}
            onChange={(newValue) => handleChange(propName, newValue)}
          />
        );

      case 'evangelization-actions-editor':
        return (
          <EvangelizationActionsEditor
            value={value}
            onChange={(newValue) => handleChange(propName, newValue)}
          />
        );

      case 'projects-editor':
        return (
          <ProjectsEditor
            value={value}
            onChange={(newValue) => handleChange(propName, newValue)}
          />
        );

      case 'paragraphs-editor':
        return (
          <ParagraphsEditor
            value={value}
            onChange={(newValue) => handleChange(propName, newValue)}
          />
        );

      case 'animation-picker':
        return (
          <AnimationPicker
            value={value}
            onChange={(newValue) => handleChange(propName, newValue)}
          />
        );

      case 'pillars-editor':
        return (
          <PillarsEditor
            value={value}
            onChange={(newValue) => handleChange(propName, newValue)}
          />
        );

      case 'buttons-editor':
        return (
          <ButtonsEditor
            value={value}
            onChange={(newValue) => handleChange(propName, newValue)}
          />
        );

      default:
        return (
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder={config.placeholder || ''}
            value={value}
            onChange={(e) => handleChange(propName, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {propConfigs.map((config) => {
        const propName = config.name || (config as any).key || '';
        const helpText = config.description || (config as any).helpText || '';

        return (
          <div key={propName} className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                {config.label}
                {config.required && <span className="text-error ml-1">*</span>}
              </span>
            </label>
            {renderInput(config)}
            {helpText && (
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  {helpText}
                </span>
              </label>
            )}
          </div>
        );
      })}
    </div>
  );
}
