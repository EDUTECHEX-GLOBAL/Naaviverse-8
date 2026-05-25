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
  FiUser,
  FiSearch,
  FiEye
} from 'react-icons/fi';
import './VisitorsList.scss';

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

    if (startDate && endDate) {
      filtered = filtered.filter(visitor => {
        const created = dayjs(visitor.createdAt);
        return created.isAfter(dayjs(startDate).subtract(1, 'day')) &&
               created.isBefore(dayjs(endDate).add(1, 'day'));
      });
    }

    if (countryFilter) {
      filtered = filtered.filter(visitor => 
        visitor.country?.toLowerCase() === countryFilter.toLowerCase()
      );
    }

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
      VisitedOn: dayjs(visitor.createdAt).format('MMM DD, YYYY hh:mm A'),
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
    if (!countryCode) return '🌐';
    const flags = {
      'US': '🇺🇸', 'IN': '🇮🇳', 'GB': '🇬🇧', 'CA': '🇨🇦', 'AU': '🇦🇺',
      'DE': '🇩🇪', 'FR': '🇫🇷', 'IT': '🇮🇹', 'ES': '🇪🇸', 'BR': '🇧🇷',
      'JP': '🇯🇵', 'CN': '🇨🇳', 'RU': '🇷🇺', 'KR': '🇰🇷', 'MX': '🇲🇽'
    };
    return flags[countryCode.toUpperCase()] || '🌐';
  };

  const getUniqueCountries = () => {
    const countries = [...new Set(visitors.map(v => v.country).filter(Boolean))];
    return countries.sort();
  };

  return (
    <div className="visitors-list">
      {/* Header - Compact */}
      <div className="visitors-list__header">
        <div>
          <h1 className="visitors-list__title">Visitor Analytics</h1>
          <p className="visitors-list__subtitle">Track and analyze website traffic</p>
        </div>
        <div className="visitors-list__actions">
          <Button onClick={clearFilters} icon={<FiFilter />} className="btn-outline">
            Clear
          </Button>
          <Button onClick={exportData} icon={<FiDownload />} type="primary" className="btn-primary">
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards - Compact */}
      <div className="visitors-list__stats">
        <div className="stat-card">
          <FiEye className="stat-icon total" />
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>
        <div className="stat-card">
          <FiGlobe className="stat-icon countries" />
          <div>
            <div className="stat-value">{stats.countries}</div>
            <div className="stat-label">Countries</div>
          </div>
        </div>
        <div className="stat-card">
          <FiCalendar className="stat-icon today" />
          <div>
            <div className="stat-value">{stats.today}</div>
            <div className="stat-label">Today</div>
          </div>
        </div>
      </div>

      {/* Filters - Minimal */}
      <div className="visitors-list__filters">
        <div className="filter-item">
          <div className="filter-label"><FiCalendar /> Start</div>
          <DatePicker 
            value={startDate} 
            onChange={setStartDate} 
            format="MMM DD, YYYY"
            placeholder="Start date"
            className="filter-date"
            allowClear
          />
        </div>
        <div className="filter-item">
          <div className="filter-label"><FiCalendar /> End</div>
          <DatePicker 
            value={endDate} 
            onChange={setEndDate} 
            format="MMM DD, YYYY"
            placeholder="End date"
            className="filter-date"
            allowClear
          />
        </div>
        <div className="filter-item">
          <div className="filter-label"><FiGlobe /> Country</div>
          <Select
            value={countryFilter}
            onChange={setCountryFilter}
            placeholder="All"
            className="filter-select"
            allowClear
          >
            {getUniqueCountries().map((country, idx) => (
              <Option key={idx} value={country}>
                {getCountryFlag(country)} {country}
              </Option>
            ))}
          </Select>
        </div>
        <div className="filter-item">
          <div className="filter-label"><FiSearch /> Search</div>
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="IP, city, region..."
            className="filter-search"
            allowClear
          />
        </div>
        {(startDate || endDate || countryFilter || searchTerm) && (
          <div className="filter-item filter-clear">
            <Button onClick={clearFilters} size="small" type="text">
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="visitors-list__summary">
        <span>{filteredVisitors.length} visitor{filteredVisitors.length !== 1 ? 's' : ''}</span>
        {countryFilter && <span className="summary-badge">{getCountryFlag(countryFilter)} {countryFilter}</span>}
        {(startDate || endDate) && <span className="summary-badge">Date range</span>}
      </div>

      {/* Table */}
      <div className="visitors-list__table-wrapper">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
          </div>
        ) : currentVisitors.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <p>No visitors found</p>
            {visitors.length > 0 && (
              <Button onClick={clearFilters} type="link">Clear filters</Button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="compact-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Location</th>
                  <th>IP Address</th>
                  <th>Region</th>
                  <th>Visited</th>
                </tr>
              </thead>
              <tbody>
                {currentVisitors.map((visitor, idx) => (
                  <tr key={visitor._id || idx}>
                    <td className="col-sn">{indexOfFirst + idx + 1}</td>
                    <td className="col-location">
                      <div className="location-cell">
                        <FiMapPin className="location-icon" />
                        <div>
                          <div className="location-city">{visitor.city || 'Unknown'}</div>
                          <div className="location-country">
                            {getCountryFlag(visitor.country)} {visitor.country || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="col-ip">
                      <div className="ip-cell">
                        <FiUser className="ip-icon" />
                        <span className="ip-address">{visitor.ip || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="col-region">
                      <span className="region-badge">{visitor.region || 'N/A'}</span>
                    </td>
                    <td className="col-date">
                      <div className="date-cell">
                        <span>{dayjs(visitor.createdAt).format('MMM DD, YYYY')}</span>
                        <span className="time">{dayjs(visitor.createdAt).format('hh:mm A')}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && filteredVisitors.length > visitorsPerPage && (
        <div className="visitors-list__pagination">
          <Pagination
            current={currentPage}
            total={filteredVisitors.length}
            pageSize={visitorsPerPage}
            onChange={setCurrentPage}
            showSizeChanger={false}
            size="small"
          />
        </div>
      )}
    </div>
  );
};

export default VisitorsList;