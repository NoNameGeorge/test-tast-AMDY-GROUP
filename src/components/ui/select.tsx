import * as React from 'react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options: SelectOption[];
}

export function Select({ options, className = '', ...props }: SelectProps) {
    const baseClasses = 'border border-gray-300 px-2 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';

    return (
        <div className="flex flex-col">
            <select
                className={`${baseClasses} ${className}`}
                {...props}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
