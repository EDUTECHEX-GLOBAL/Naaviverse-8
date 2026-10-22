import React, { useState, useEffect, useRef } from "react";
import "./ResponsiveDatePicker.scss";

const DAYS_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function ResponsiveDatePicker({
  id,
  name,
  value,
  onChange,
  className = "",
  placeholder = "dd-mm-yyyy",
  disabled = false,
  min,
  max,
  ...rest
}) {
  // Breakpoint covers mobile, tablet, and iPads (including iPad Pro 13 at 1032px)
  const TABLET_BREAKPOINT = 1080;

  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= TABLET_BREAKPOINT
  );
  const [isOpen, setIsOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= TABLET_BREAKPOINT);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const parentPanel = containerRef.current.closest(".ne-step-panel, .chk-modal, .card, form, .modal");
      const parentRight = parentPanel
        ? parentPanel.getBoundingClientRect().right
        : window.innerWidth;

      if (rect.left + 285 > parentRight || window.innerWidth - rect.left < 290) {
        setAlignRight(true);
      } else {
        setAlignRight(false);
      }
    }
  }, [isOpen]);

  // Parse YYYY-MM-DD string into Date
  const parseDate = (val) => {
    if (!val) return null;
    const parts = String(val).split("-");
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m, d);
      }
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const selectedDate = parseDate(value);
  const today = new Date();

  const [viewYear, setViewYear] = useState(() =>
    selectedDate ? selectedDate.getFullYear() : today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(() =>
    selectedDate ? selectedDate.getMonth() : today.getMonth()
  );

  // Sync view state when value changes
  useEffect(() => {
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [value]);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Month navigation
  const prevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const formatDateStr = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const triggerChange = (dateStr) => {
    if (onChange) {
      onChange({
        target: { name, value: dateStr, id },
        currentTarget: { name, value: dateStr, id },
      });
    }
  };

  const handleSelectDay = (dayDate) => {
    triggerChange(formatDateStr(dayDate));
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    triggerChange("");
    setIsOpen(false);
  };

  const handleToday = (e) => {
    e.stopPropagation();
    const now = new Date();
    triggerChange(formatDateStr(now));
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setIsOpen(false);
  };

  // On desktop (> 1024px), return native input so desktop is completely untouched
  if (!isMobile) {
    return (
      <input
        id={id}
        name={name}
        type="date"
        value={value || ""}
        onChange={onChange}
        className={className}
        disabled={disabled}
        min={min}
        max={max}
        {...rest}
      />
    );
  }

  // Generate calendar grid for viewYear, viewMonth
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const calendarDays = [];

  // Trailing days from previous month
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    calendarDays.push({
      date: new Date(viewYear, viewMonth - 1, d),
      dayNum: d,
      isCurrentMonth: false,
    });
  }

  // Days in current month
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({
      date: new Date(viewYear, viewMonth, d),
      dayNum: d,
      isCurrentMonth: true,
    });
  }

  // Leading days from next month
  const remaining = (7 - (calendarDays.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    calendarDays.push({
      date: new Date(viewYear, viewMonth + 1, d),
      dayNum: d,
      isCurrentMonth: false,
    });
  }

  // Display text formatted as DD-MM-YYYY
  const displayVal = selectedDate
    ? `${String(selectedDate.getDate()).padStart(2, "0")}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${selectedDate.getFullYear()}`
    : "";

  return (
    <div className={`rdp-container ${className}`} ref={containerRef}>
      <input type="hidden" id={id} name={name} value={value || ""} />

      <div
        className={`rdp-input-box ${isOpen ? "open" : ""} ${displayVal ? "filled" : ""}`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        role="button"
        tabIndex={0}
      >
        <span className="rdp-cal-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </span>
        <span className={`rdp-display-text ${!displayVal ? "is-placeholder" : ""}`}>
          {displayVal || placeholder}
        </span>
      </div>

      {isOpen && (
        <div className={`rdp-popup-card ${alignRight ? "align-right" : ""}`}>
          <div className="rdp-popup-header">
            <div className="rdp-popup-title">
              <span>{MONTH_NAMES[viewMonth]}, {viewYear}</span>
              <span className="rdp-title-chevron">▾</span>
            </div>
            <div className="rdp-arrows">
              <button
                type="button"
                className="rdp-arrow-btn"
                onClick={prevMonth}
                aria-label="Previous Month"
              >
                ↑
              </button>
              <button
                type="button"
                className="rdp-arrow-btn"
                onClick={nextMonth}
                aria-label="Next Month"
              >
                ↓
              </button>
            </div>
          </div>

          <div className="rdp-popup-weekdays">
            {DAYS_SHORT.map((day) => (
              <span key={day} className="rdp-weekday-cell">{day}</span>
            ))}
          </div>

          <div className="rdp-popup-days">
            {calendarDays.map((item, idx) => {
              const isSelected =
                selectedDate &&
                item.date.getFullYear() === selectedDate.getFullYear() &&
                item.date.getMonth() === selectedDate.getMonth() &&
                item.date.getDate() === selectedDate.getDate();

              const isToday =
                item.date.getFullYear() === today.getFullYear() &&
                item.date.getMonth() === today.getMonth() &&
                item.date.getDate() === today.getDate();

              return (
                <button
                  key={idx}
                  type="button"
                  className={`rdp-day-cell ${!item.isCurrentMonth ? "muted" : ""} ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectDay(item.date);
                  }}
                >
                  {item.dayNum}
                </button>
              );
            })}
          </div>

          <div className="rdp-popup-footer">
            <button
              type="button"
              className="rdp-footer-btn clear-btn"
              onClick={handleClear}
            >
              Clear
            </button>
            <button
              type="button"
              className="rdp-footer-btn today-btn"
              onClick={handleToday}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
