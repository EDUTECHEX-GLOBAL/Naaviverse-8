import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DatePicker, Button, Pagination, Input, Select } from 'antd';
import 'antd/dist/reset.css';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { 
  FiDownload, 
  FiFilter, 
  FiCalendar, 
  FiGlobe, 
  FiMapPin, 
  FiMap, 
  FiUser,
  FiSearch,
  FiEye
} from 'react-icons/fi';
import { MdLocationCity, MdOutlineLocationOn } from 'react-icons/md';
import './VisitorsList.scss';

// Extend dayjs with plugins
dayjs.extend(relativeTime);

const { Option } = Select;
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const VisitorsList = () => {
  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    countries: 0,
    today: 0
  });

  const visitorsPerPage = 10;

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${BASE_URL}/api/admin-visitors`);
        const data = res.data || [];
        setVisitors(data);
        setFilteredVisitors(data);
        
        // Calculate stats
        const today = dayjs().startOf('day');
        const todayCount = data.filter(visitor => 
          dayjs(visitor.createdAt).isSame(today, 'day')
        ).length;
        
        const countries = new Set(data.map(v => v.country).filter(Boolean));
        
        setStats({
          total: data.length,
          countries: countries.size,
          today: todayCount
        });
      } catch (err) {
        console.error("Error fetching visitors", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVisitors();
  }, []);

  useEffect(() => {
    let filtered = [...visitors];

    // Date filter
    if (startDate && endDate) {
      filtered = filtered.filter(visitor => {
        const created = dayjs(visitor.createdAt);
        return created.isAfter(dayjs(startDate).subtract(1, 'day')) &&
               created.isBefore(dayjs(endDate).add(1, 'day'));
      });
    }

    // Country filter
    if (countryFilter) {
      filtered = filtered.filter(visitor => 
        visitor.country?.toLowerCase() === countryFilter.toLowerCase()
      );
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(visitor => 
        visitor.ip?.toLowerCase().includes(term) ||
        visitor.city?.toLowerCase().includes(term) ||
        visitor.region?.toLowerCase().includes(term) ||
        visitor.country?.toLowerCase().includes(term)
      );
    }

    setFilteredVisitors(filtered);
    setCurrentPage(1);
  }, [startDate, endDate, countryFilter, searchTerm, visitors]);

  const indexOfLast = currentPage * visitorsPerPage;
  const indexOfFirst = indexOfLast - visitorsPerPage;
  const currentVisitors = filteredVisitors.slice(indexOfFirst, indexOfLast);

  const exportData = () => {
    const exportData = filteredVisitors.map((visitor, i) => ({
      SNo: i + 1,
      IP: visitor.ip,
      City: visitor.city,
      Region: visitor.region,
      PostalCode: visitor.postalCode,
      Country: visitor.country,
      CreatedOn: new Date(visitor.createdAt).toLocaleString(),
      Date: dayjs(visitor.createdAt).format('YYYY-MM-DD'),
      Time: dayjs(visitor.createdAt).format('HH:mm:ss')
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Visitors");

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(fileData, `Visitors_${dayjs().format('YYYY-MM-DD')}.xlsx`);
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setCountryFilter('');
    setSearchTerm('');
  };

  const getCountryFlag = (countryCode) => {
    if (!countryCode) return '🏳️';
    
    // Simple country to flag emoji mapping
    const countryFlags = {
      'US': '🇺🇸', 'IN': '🇮🇳', 'UK': '🇬🇧', 'GB': '🇬🇧', 'CA': '🇨🇦',
      'AU': '🇦🇺', 'DE': '🇩🇪', 'FR': '🇫🇷', 'IT': '🇮🇹', 'ES': '🇪🇸',
      'BR': '🇧🇷', 'JP': '🇯🇵', 'CN': '🇨🇳', 'RU': '🇷🇺', 'KR': '🇰🇷'
    };
    
    return countryFlags[countryCode.toUpperCase()] || '🌐';
  };

  const getTimeAgo = (dateString) => {
    try {
      return dayjs(dateString).fromNow();
    } catch (error) {
      return 'recently';
    }
  };

  const getUniqueCountries = () => {
    const countries = visitors
      .map(v => v.country)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);
    
    return countries.sort();
  };

  return (
    <div className="visitors-container">
      {/* Header */}
      <div className="visitors-header">
        <div className="header-left">
          <h1 className="page-title">
            <span className="title-gradient">Website</span> Visitors
          </h1>
          <p className="page-subtitle">Track and analyze visitor traffic and locations</p>
        </div>
        <div className="header-right">
          <Button 
            type="default" 
            onClick={clearFilters}
            className="clear-btn"
            icon={<FiFilter />}
          >
            Clear Filters
          </Button>
          <Button 
            type="primary" 
            onClick={exportData}
            className="export-btn"
            icon={<FiDownload />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card total-card">
          <div className="stat-icon">
            <FiEye />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Visitors</div>
          </div>
        </div>
        <div className="stat-card country-card">
          <div className="stat-icon">
            <FiGlobe />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.countries}</div>
            <div className="stat-label">Countries</div>
          </div>
        </div>
        <div className="stat-card today-card">
          <div className="stat-icon">
            <FiCalendar />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.today}</div>
            <div className="stat-label">Today</div>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="filters-card">
        <div className="filters-header">
          <FiFilter className="filter-icon" />
          <h3>Filter Visitors</h3>
        </div>
        <div className="filters-grid">
          <div className="filter-item">
            <label className="filter-label">
              <FiCalendar /> Start Date
            </label>
            <DatePicker 
              value={startDate} 
              onChange={setStartDate} 
              format="MMM DD, YYYY"
              placeholder="Select start date"
              className="date-picker"
              allowClear
            />
          </div>
          
          <div className="filter-item">
            <label className="filter-label">
              <FiCalendar /> End Date
            </label>
            <DatePicker 
              value={endDate} 
              onChange={setEndDate} 
              format="MMM DD, YYYY"
              placeholder="Select end date"
              className="date-picker"
              allowClear
            />
          </div>
          
          <div className="filter-item">
            <label className="filter-label">
              <FiGlobe /> Country
            </label>
            <Select
              value={countryFilter}
              onChange={setCountryFilter}
              placeholder="All countries"
              className="country-select"
              allowClear
            >
              {getUniqueCountries().map((country, index) => (
                <Option key={index} value={country}>
                  {getCountryFlag(country)} {country}
                </Option>
              ))}
            </Select>
          </div>
          
          <div className="filter-item">
            <label className="filter-label">
              <FiSearch /> Search
            </label>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search IP, city, region..."
              prefix={<FiSearch style={{ color: '#9ca3af' }} />}
              className="search-input"
              allowClear
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <span className="results-count">
          Showing {currentVisitors.length} of {filteredVisitors.length} visitors
        </span>
        {(startDate || endDate || countryFilter || searchTerm) && (
          <span className="active-filters">
            Filters applied: 
            {startDate && <span className="filter-tag">From {dayjs(startDate).format('MMM DD')}</span>}
            {endDate && <span className="filter-tag">To {dayjs(endDate).format('MMM DD')}</span>}
            {countryFilter && <span className="filter-tag">{getCountryFlag(countryFilter)} {countryFilter}</span>}
            {searchTerm && <span className="filter-tag">Search: "{searchTerm}"</span>}
          </span>
        )}
      </div>

      {/* Table Container */}
      <div className="table-container">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading visitors...</p>
          </div>
        ) : currentVisitors.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No visitors found</h3>
            <p>
              {visitors.length === 0 
                ? "No visitors have been tracked yet." 
                : "No visitors match your filters."}
            </p>
            {visitors.length > 0 && (
              <Button type="primary" onClick={clearFilters} ghost>
                Clear filters to see all visitors
              </Button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="visitors-table">
              <thead>
                <tr>
                  <th>S.NO</th>
                  <th>LOCATION</th>
                  <th>IP ADDRESS</th>
                  <th>REGION</th>
                  <th>POSTAL CODE</th>
                  <th>VISITED</th>
                </tr>
              </thead>
              <tbody>
                {currentVisitors.map((visitor, index) => {
                  const visitDate = visitor.createdAt ? dayjs(visitor.createdAt) : dayjs();
                  return (
                    <tr key={visitor._id || index} className="table-row">
                      <td className="serial-no">
                        <span className="serial-badge">{indexOfFirst + index + 1}</span>
                      </td>
                      <td className="location-cell">
                        <div className="location-content">
                          <div className="location-icon">
                            <MdOutlineLocationOn />
                          </div>
                          <div className="location-details">
                            <div className="city-country">
                              <span className="city">{visitor.city || 'Unknown'}</span>
                              <span className="country-flag">
                                {getCountryFlag(visitor.country)} {visitor.country || 'Unknown'}
                              </span>
                            </div>
                            <span className="visit-time">
                              Visited {getTimeAgo(visitor.createdAt)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="ip-cell">
                        <div className="ip-content">
                          <div className="ip-icon">
                            <FiUser />
                          </div>
                          <div className="ip-details">
                            <span className="ip-address">{visitor.ip || 'N/A'}</span>
                            <span className="ip-label">IP Address</span>
                          </div>
                        </div>
                      </td>
                      <td className="region-cell">
                        <div className="region-content">
                          <div className="region-icon">
                            <FiMap />
                          </div>
                          <div className="region-details">
                            <span className="region-name">{visitor.region || 'N/A'}</span>
                            <span className="region-label">Region/State</span>
                          </div>
                        </div>
                      </td>
                      <td className="postal-cell">
                        <span className="postal-code">
                          {visitor.postalCode || 'N/A'}
                        </span>
                      </td>
                      <td className="date-cell">
                        <div className="date-content">
                          <div className="date-display">{visitDate.format('MMM DD, YYYY')}</div>
                          <div className="time-display">{visitDate.format('hh:mm A')}</div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && filteredVisitors.length > visitorsPerPage && (
        <div className="pagination-wrapper">
          <Pagination
            current={currentPage}
            total={filteredVisitors.length}
            pageSize={visitorsPerPage}
            onChange={page => setCurrentPage(page)}
            showSizeChanger={false}
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} visitors`}
            className="custom-pagination"
          />
        </div>
      )}
    </div>
  );
};

export default VisitorsList;