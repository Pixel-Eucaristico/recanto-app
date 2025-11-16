'use client';

import { useEffect, useState } from 'react';
import type { ModPropConfig } from '@/types/cms-types';
import TestimonialsEditor from './TestimonialsEditor';
import EvangelizationActionsEditor from './EvangelizationActionsEditor';
import ProjectsEditor from './ProjectsEditor';

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
    const value = formValues[config.name] ?? config.default ?? '';

    switch (config.type) {
      case 'string':
        if (config.options && config.options.length > 0) {
          // Select dropdown for predefined options
          return (
            <select
              className="select select-bordered w-full"
              value={value}
              onChange={(e) => handleChange(config.name, e.target.value)}
            >
              {config.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        } else if (config.multiline) {
          // Textarea for multiline strings
          return (
            <textarea
              className="textarea textarea-bordered w-full h-24"
              placeholder={config.placeholder || ''}
              value={value}
              onChange={(e) => handleChange(config.name, e.target.value)}
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
              onChange={(e) => handleChange(config.name, e.target.value)}
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
            onChange={(e) => handleChange(config.name, parseFloat(e.target.value) || 0)}
          />
        );

      case 'boolean':
        return (
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            checked={value}
            onChange={(e) => handleChange(config.name, e.target.checked)}
          />
        );

      case 'url':
        return (
          <input
            type="url"
            className="input input-bordered w-full"
            placeholder={config.placeholder || 'https://...'}
            value={value}
            onChange={(e) => handleChange(config.name, e.target.value)}
          />
        );

      case 'testimonials-editor':
        return (
          <TestimonialsEditor
            value={value}
            onChange={(newValue) => handleChange(config.name, newValue)}
          />
        );

      case 'evangelization-actions-editor':
        return (
          <EvangelizationActionsEditor
            value={value}
            onChange={(newValue) => handleChange(config.name, newValue)}
          />
        );

      case 'projects-editor':
        return (
          <ProjectsEditor
            value={value}
            onChange={(newValue) => handleChange(config.name, newValue)}
          />
        );

      default:
        return (
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder={config.placeholder || ''}
            value={value}
            onChange={(e) => handleChange(config.name, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {propConfigs.map((config) => (
        <div key={config.name} className="form-control">
          <label className="label">
            <span className="label-text font-semibold">
              {config.label}
              {config.required && <span className="text-error ml-1">*</span>}
            </span>
          </label>
          {renderInput(config)}
          {config.description && (
            <label className="label">
              <span className="label-text-alt text-base-content/60">
                {config.description}
              </span>
            </label>
          )}
        </div>
      ))}
    </div>
  );
}
