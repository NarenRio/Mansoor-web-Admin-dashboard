import { useState, useRef, useEffect } from 'react';

const AutocompleteInput = ({
  value,
  onChange,
  options = [],
  placeholder = 'Type to search...',
  onSelect,
  label,
  icon,
  showClearButton = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Filter options based on input value
    if (value && value.trim()) {
      const searchTerm = value.toLowerCase();
      const filtered = options.filter(option =>
        option && option.toLowerCase().includes(searchTerm)
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [value, options]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    onChange(e.target.value);
    setIsOpen(true);
  };

  const handleSelect = (option) => {
    onChange(option);
    if (onSelect) {
      onSelect(option);
    }
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
        />
        {icon && (
          <div className="absolute left-3 top-2.5 text-gray-400">
            {icon}
          </div>
        )}
        {showClearButton && value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && filteredOptions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {filteredOptions.slice(0, 50).map((option, index) => (
            <button
              key={`${option}-${index}`}
              type="button"
              onClick={() => handleSelect(option)}
              className="w-full text-left px-4 py-2 hover:bg-primary-purple hover:text-white transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              {option}
            </button>
          ))}
          {filteredOptions.length > 50 && (
            <div className="px-4 py-2 text-xs text-gray-500 text-center border-t">
              Showing first 50 of {filteredOptions.length} results
            </div>
          )}
        </div>
      )}

      {/* Show message if no results */}
      {isOpen && value && value.trim() && filteredOptions.length === 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg"
        >
          <div className="px-4 py-2 text-sm text-gray-500">
            No results found
          </div>
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;

