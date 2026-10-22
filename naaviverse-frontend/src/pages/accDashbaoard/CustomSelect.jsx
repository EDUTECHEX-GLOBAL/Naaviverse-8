import React, { useState, useEffect, useRef, useMemo } from 'react';

const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder = "Select",
  disabled = false,
  className = "",
  style = {},
  ariaLabel = "",
  searchable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);
  const itemRefs = useRef([]);

  // Auto-enable search if there are 8 or more options
  const showSearch = searchable && options.length >= 8;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (showSearch) {
        setTimeout(() => searchInputRef.current?.focus(), 30);
      }
    } else {
      setSearchQuery("");
      setHighlightIndex(-1);
    }
  }, [isOpen, showSearch]);

  const selectedOption = useMemo(() => {
    return options.find((opt) => {
      const optVal = typeof opt === "object" ? opt.value : opt;
      return String(optVal) === String(value);
    });
  }, [options, value]);

  const displayLabel = selectedOption
    ? (typeof selectedOption === "object" ? selectedOption.label : selectedOption)
    : (value !== "" && value !== undefined && value !== null ? value : placeholder);

  const isPlaceholder = !value && value !== 0 && value !== "0";

  // Filter and sort options based on search query
  // Items starting with query are placed first, then items containing query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.trim().toLowerCase();
    const startsWith = [];
    const contains = [];

    for (const opt of options) {
      const label = String(typeof opt === "object" ? opt.label : opt).toLowerCase();
      if (label.startsWith(q)) {
        startsWith.push(opt);
      } else if (label.includes(q)) {
        contains.push(opt);
      }
    }
    return [...startsWith, ...contains];
  }, [options, searchQuery]);

  // Handle keyboard events on the trigger / container
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
        return;
      }
      // If user types a letter key directly on closed dropdown (e.g. 'i')
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsOpen(true);
        setSearchQuery(e.key);
        return;
      }
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => {
        const next = prev < filteredOptions.length - 1 ? prev + 1 : 0;
        itemRefs.current[next]?.scrollIntoView({ block: "nearest" });
        return next;
      });
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => {
        const next = prev > 0 ? prev - 1 : filteredOptions.length - 1;
        itemRefs.current[next]?.scrollIntoView({ block: "nearest" });
        return next;
      });
      return;
    }

    if (e.key === "Enter" && highlightIndex >= 0 && highlightIndex < filteredOptions.length) {
      e.preventDefault();
      const chosen = filteredOptions[highlightIndex];
      const optVal = typeof chosen === "object" ? chosen.value : chosen;
      onChange({ target: { value: optVal } });
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`custom-select-wrapper ${disabled ? "disabled" : ""} ${className}`}
      style={{ position: "relative", width: "100%", ...style }}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`custom-select-trigger ${isOpen ? "open" : ""}`}
        aria-label={ariaLabel || placeholder}
      >
        <span className={`custom-select-label ${isPlaceholder ? "placeholder" : ""}`}>
          {displayLabel}
        </span>
        <svg
          className={`custom-select-arrow ${isOpen ? "open" : ""}`}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="custom-select-dropdown">
          {showSearch && (
            <div className="custom-select-search-wrap" onClick={(e) => e.stopPropagation()}>
              <svg className="custom-select-search-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                className="custom-select-search-input"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightIndex(0);
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="custom-select-search-clear"
                  onClick={() => {
                    setSearchQuery("");
                    searchInputRef.current?.focus();
                  }}
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          )}

          <div className="custom-select-options-list" ref={listRef}>
            {placeholder && !searchQuery && (
              <div
                className={`custom-select-option ${isPlaceholder ? "selected" : ""}`}
                onClick={() => {
                  onChange({ target: { value: "" } });
                  setIsOpen(false);
                }}
              >
                <span>{placeholder}</span>
              </div>
            )}

            {filteredOptions.length === 0 ? (
              <div className="custom-select-empty">No matches found</div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const optVal = typeof opt === "object" ? opt.value : opt;
                const optLabel = typeof opt === "object" ? opt.label : opt;
                const isSelected = String(optVal) === String(value);
                const isHighlighted = highlightIndex === idx;

                return (
                  <div
                    key={typeof opt === "object" ? opt.key || optVal || idx : opt}
                    ref={(el) => (itemRefs.current[idx] = el)}
                    className={`custom-select-option ${isSelected ? "selected" : ""} ${isHighlighted ? "highlighted" : ""}`}
                    onClick={() => {
                      onChange({ target: { value: optVal } });
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setHighlightIndex(idx)}
                  >
                    <span>{optLabel}</span>
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
