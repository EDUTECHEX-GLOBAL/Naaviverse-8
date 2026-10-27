import React, { useState, useEffect, useRef } from "react";
import "./ResponsiveDatePicker.scss";

const DAYS_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Supported year range: 1950 - 2050 (100+ years)
const START_YEAR = 1950;
const END_YEAR = 2050;
const ALL_YEARS = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i);

export default function ResponsiveDatePicker({
  id,
  name,
  value,
  onChange,
  className = "",
  placeholder = "Select date",
  disabled = false,
  format = "MMM DD, YYYY",
  allowClear = true,
  showToday = true,
  min,
  max,
  ...rest
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [monthMenuOpen, setMonthMenuOpen] = useState(false);
  const [yearMenuOpen, setYearMenuOpen] = useState(false);

  const containerRef = useRef(null);
  const popupRef = useRef(null);
  const monthMenuRef = useRef(null);
  const yearMenuRef = useRef(null);
  const activeYearRef = useRef(null);

  // Parse any value (Date, Dayjs, string YYYY-MM-DD or DD-MM-YYYY) into a valid Date
  const parseDate = (val) => {
    if (!val) return null;
    if (typeof val === "object" && typeof val.toDate === "function") {
      return val.toDate();
    }
    if (val instanceof Date) {
      return isNaN(val.getTime()) ? null : val;
    }
    if (typeof val === "string") {
      const trimmed = val.trim();
      const ymd = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (ymd) {
        return new Date(parseInt(ymd[1], 10), parseInt(ymd[2], 10) - 1, parseInt(ymd[3], 10));
      }
      const dmy = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);
      if (dmy) {
        return new Date(parseInt(dmy[3], 10), parseInt(dmy[2], 10) - 1, parseInt(dmy[1], 10));
      }
      const parsed = new Date(trimmed);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  };

  const selectedDate = parseDate(value);
  const today = new Date();

  const [viewYear, setViewYear] = useState(() =>
    selectedDate ? selectedDate.getFullYear() : today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(() =>
    selectedDate ? selectedDate.getMonth() : today.getMonth()
  );

  // Sync internal view when external value changes
  useEffect(() => {
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [value]);

  const handleOpen = () => {
    if (disabled) return;
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    } else {
      setViewYear(today.getFullYear());
      setViewMonth(today.getMonth());
    }
    setMonthMenuOpen(false);
    setYearMenuOpen(false);
    setIsOpen((prev) => !prev);
  };

  // Scroll active year into view when year menu opens
  useEffect(() => {
    if (yearMenuOpen && activeYearRef.current) {
      activeYearRef.current.scrollIntoView({ block: "center", inline: "nearest" });
    }
  }, [yearMenuOpen]);

  // Viewport and container boundary positioning
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const popupWidth = 275;
      const popupHeight = 310;

      // Check right overflow
      if (rect.left + popupWidth > window.innerWidth - 12) {
        setAlignRight(true);
      } else {
        setAlignRight(false);
      }

      // Check bottom overflow
      if (rect.bottom + popupHeight > window.innerHeight && rect.top > popupHeight) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setMonthMenuOpen(false);
        setYearMenuOpen(false);
      } else {
        if (monthMenuRef.current && !monthMenuRef.current.contains(e.target)) {
          setMonthMenuOpen(false);
        }
        if (yearMenuRef.current && !yearMenuRef.current.contains(e.target)) {
          setYearMenuOpen(false);
        }
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (monthMenuOpen) {
          setMonthMenuOpen(false);
        } else if (yearMenuOpen) {
          setYearMenuOpen(false);
        } else {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, monthMenuOpen, yearMenuOpen]);

  const formatDateStr = (d) => {
    if (!d) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const formatDisplay = (d) => {
    if (!d) return "";
    if (format === "MMM DD, YYYY") {
      const m = MONTH_SHORT[d.getMonth()];
      const day = String(d.getDate()).padStart(2, "0");
      const y = d.getFullYear();
      return `${m} ${day}, ${y}`;
    }
    if (format === "DD-MM-YYYY") {
      const day = String(d.getDate()).padStart(2, "0");
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const y = d.getFullYear();
      return `${day}-${m}-${y}`;
    }
    return formatDateStr(d);
  };

  const triggerChange = (d) => {
    const dateStr = d ? formatDateStr(d) : "";
    if (onChange) {
      const syntheticEvent = {
        target: { name: name || id || "date", value: dateStr, id },
        currentTarget: { name: name || id || "date", value: dateStr, id },
        dateString: dateStr,
        date: d,
      };
      onChange(syntheticEvent, dateStr, d);
    }
  };

  const handleSelectDay = (dayDate) => {
    triggerChange(dayDate);
    setMonthMenuOpen(false);
    setYearMenuOpen(false);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    triggerChange(null);
    setMonthMenuOpen(false);
    setYearMenuOpen(false);
    setIsOpen(false);
  };

  const handleToday = (e) => {
    e.stopPropagation();
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    triggerChange(now);
    setMonthMenuOpen(false);
    setYearMenuOpen(false);
    setIsOpen(false);
  };

  // Month navigation arrows
  const prevMonth = (e) => {
    e.stopPropagation();
    setMonthMenuOpen(false);
    setYearMenuOpen(false);
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => Math.max(START_YEAR, y - 1));
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = (e) => {
    e.stopPropagation();
    setMonthMenuOpen(false);
    setYearMenuOpen(false);
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => Math.min(END_YEAR, y + 1));
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Accurate calendar calculations with leap year & variable month lengths
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

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({
      date: new Date(viewYear, viewMonth, d),
      dayNum: d,
      isCurrentMonth: true,
    });
  }

  // Leading days from next month to complete the 7-column grid
  const remaining = (7 - (calendarDays.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    calendarDays.push({
      date: new Date(viewYear, viewMonth + 1, d),
      dayNum: d,
      isCurrentMonth: false,
    });
  }

  const displayVal = formatDisplay(selectedDate);

  return (
    <div className={`rdp-container ${className}`} ref={containerRef}>
      <input type="hidden" id={id} name={name} value={formatDateStr(selectedDate)} />

      {/* Input Box matching the modern UI */}
      <div
        className={`rdp-input-box ${isOpen ? "open" : ""} ${displayVal ? "filled" : ""} ${disabled ? "disabled" : ""}`}
        onClick={handleOpen}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpen();
          }
        }}
      >
        <span className={`rdp-display-text ${!displayVal ? "is-placeholder" : ""}`}>
          {displayVal || placeholder}
        </span>

        <div className="rdp-actions-right">
          {allowClear && displayVal && !disabled && (
            <button
              type="button"
              className="rdp-clear-icon-btn"
              onClick={handleClear}
              title="Clear date"
              aria-label="Clear date"
            >
              ×
            </button>
          )}
          <span className="rdp-cal-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </span>
        </div>
      </div>

      {/* Clean Calendar Popup (Direct Month/Year dropdowns + Date grid) */}
      {isOpen && (
        <div
          ref={popupRef}
          className={`rdp-popup-card ${alignRight ? "align-right" : ""} ${openUpward ? "open-upward" : ""}`}
        >
          {/* Header with Navigation Arrows & Month / Year Dropdowns */}
          <div className="rdp-nav-header">
            <button
              type="button"
              className="rdp-arrow-btn"
              onClick={prevMonth}
              aria-label="Previous month"
              title="Previous month"
            >
              ‹
            </button>

            <div className="rdp-selectors-group">
              {/* Month Dropdown */}
              <div className="rdp-dropdown-wrapper" ref={monthMenuRef}>
                <button
                  type="button"
                  className={`rdp-header-btn rdp-month-btn ${monthMenuOpen ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setYearMenuOpen(false);
                    setMonthMenuOpen((prev) => !prev);
                  }}
                  aria-label="Select month"
                  aria-expanded={monthMenuOpen}
                >
                  <span>{MONTH_NAMES[viewMonth]}</span>
                  <span className={`rdp-select-chevron ${monthMenuOpen ? "rotate" : ""}`}>▾</span>
                </button>

                {monthMenuOpen && (
                  <div className="rdp-custom-menu rdp-month-menu">
                    {MONTH_NAMES.map((name, idx) => (
                      <button
                        key={name}
                        type="button"
                        className={`rdp-menu-item ${idx === viewMonth ? "selected" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewMonth(idx);
                          setMonthMenuOpen(false);
                        }}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Year Dropdown */}
              <div className="rdp-dropdown-wrapper" ref={yearMenuRef}>
                <button
                  type="button"
                  className={`rdp-header-btn rdp-year-btn ${yearMenuOpen ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMonthMenuOpen(false);
                    setYearMenuOpen((prev) => !prev);
                  }}
                  aria-label="Select year"
                  aria-expanded={yearMenuOpen}
                >
                  <span>{viewYear}</span>
                  <span className={`rdp-select-chevron ${yearMenuOpen ? "rotate" : ""}`}>▾</span>
                </button>

                {yearMenuOpen && (
                  <div className="rdp-custom-menu rdp-year-menu">
                    {ALL_YEARS.map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        ref={yr === viewYear ? activeYearRef : null}
                        className={`rdp-menu-item ${yr === viewYear ? "selected" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewYear(yr);
                          setYearMenuOpen(false);
                        }}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              className="rdp-arrow-btn"
              onClick={nextMonth}
              aria-label="Next month"
              title="Next month"
            >
              ›
            </button>
          </div>

          {/* Weekday Row */}
          <div className="rdp-weekdays-row">
            {DAYS_SHORT.map((day) => (
              <span key={day} className="rdp-weekday-cell">
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Dates Grid */}
          <div className="rdp-days-grid">
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
                  className={`rdp-day-btn ${!item.isCurrentMonth ? "muted" : ""} ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
                  onClick={() => handleSelectDay(item.date)}
                >
                  {item.dayNum}
                </button>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="rdp-popup-footer">
            <button
              type="button"
              className="rdp-footer-btn clear-btn"
              onClick={handleClear}
            >
              Clear
            </button>
            {showToday && (
              <button
                type="button"
                className="rdp-footer-btn today-btn"
                onClick={handleToday}
              >
                Today
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
