import * as React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export function Input({ className = '', ...props }: InputProps) {
    const baseClasses = 'border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';

    return (
        <div className="flex flex-col">
            <input
                className={`${baseClasses} ${className}`}
                {...props}
            />
        </div>
    );
}
