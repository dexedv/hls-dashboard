export default function FormField({
    label,
    type = 'text',
    value,
    onChange,
    error,
    required = false,
    placeholder,
    options = [],
    rows = 3,
    min,
    max,
    step,
    disabled = false,
    className = '',
}) {
    const inputClasses = `w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
        error ? 'border-red-300 bg-red-50' : 'border-gray-200'
    } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`;

    const renderInput = () => {
        if (type === 'textarea') {
            return (
                <textarea
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={rows}
                    required={required}
                    disabled={disabled}
                    className={inputClasses}
                />
            );
        }

        if (type === 'select') {
            return (
                <select
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                    disabled={disabled}
                    className={inputClasses}
                >
                    {placeholder && <option value="">{placeholder}</option>}
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            );
        }

        return (
            <input
                type={type}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                min={min}
                max={max}
                step={step}
                className={inputClasses}
            />
        );
    };

    return (
        <div>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            {renderInput()}
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}
