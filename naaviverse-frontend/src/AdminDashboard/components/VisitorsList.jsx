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
  const [stats, setStats] = useState({ total: 0, countries: 0, today: 0 });

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
        const todayCount = data.filter(v => dayjs(v.createdAt).isSame(today, 'day')).length;
        const countries = new Set(data.map(v => v.country).filter(Boolean));

        setStats({ total: data.length, countries: countries.size, today: todayCount });
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
      filtered = filtered.filter(v => {
        const created = dayjs(v.createdAt);
        return created.isAfter(dayjs(startDate).subtract(1, 'day')) &&
               created.isBefore(dayjs(endDate).add(1, 'day'));
      });
    }

    if (countryFilter) {
      filtered = filtered.filter(v =>
        v.country?.toLowerCase() === countryFilter.toLowerCase()
      );
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(v =>
        v.ip?.toLowerCase().includes(term) ||
        v.city?.toLowerCase().includes(term) ||
        v.region?.toLowerCase().includes(term) ||
        v.country?.toLowerCase().includes(term)
      );
    }

    setFilteredVisitors(filtered);
    setCurrentPage(1);
  }, [startDate, endDate, countryFilter, searchTerm, visitors]);

  const indexOfLast = currentPage * visitorsPerPage;
  const indexOfFirst = indexOfLast - visitorsPerPage;
  const currentVisitors = filteredVisitors.slice(indexOfFirst, indexOfLast);

  const exportData = () => {
    const data = filteredVisitors.map((v, i) => ({
      SNo: i + 1,
      IP: v.ip,
      City: v.city,
      Region: v.region,
      PostalCode: v.postalCode,
      Country: v.country,
      VisitedOn: dayjs(v.createdAt).format('MMM DD, YYYY hh:mm A'),
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
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
    return [...new Set(visitors.map(v => v.country).filter(Boolean))].sort();
  };

  const hasFilters = startDate || endDate || countryFilter || searchTerm;

  return (
    <div className="visitors-list">
      {/* Header */}
      <div className="visitors-list__header">
        <div>
          <p className="visitors-list__subtitle">Track and analyze website traffic</p>
        </div>
        <div className="visitors-list__actions">
          {hasFilters && (
            <Button size="small" onClick={clearFilters} icon={<FiFilter size={12} />} className="btn-outline">
              Clear
            </Button>
          )}
          <Button size="small" onClick={exportData} icon={<FiDownload size={12} />} type="primary" className="btn-primary">
            Export
          </Button>
        </div>
      </div>

      {/* Stat Pills */}
      <div className="visitors-list__stats">
        <div className="stat-pill stat-pill--green">
          <FiEye className="stat-pill__icon" />
          <span className="stat-pill__value">{stats.total}</span>
          <span className="stat-pill__label">Total</span>
        </div>
        <div className="stat-pill stat-pill--blue">
          <FiGlobe className="stat-pill__icon" />
          <span className="stat-pill__value">{stats.countries}</span>
          <span className="stat-pill__label">Countries</span>
        </div>
        <div className="stat-pill stat-pill--yellow">
          <FiCalendar className="stat-pill__icon" />
          <span className="stat-pill__value">{stats.today}</span>
          <span className="stat-pill__label">Today</span>
        </div>
      </div>

      {/* Filters */}
      <div className="visitors-list__filters">
        <div className="filter-item">
          <div className="filter-label"><FiCalendar /> Start</div>
          <DatePicker
            size="small"
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
            size="small"
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
            size="small"
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
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="IP, city, region..."
            className="filter-search"
            allowClear
          />
        </div>
      </div>

      {/* Summary */}
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
              <Button size="small" onClick={clearFilters} type="link">Clear filters</Button>
            )}
          </div>
        ) : (
          <table className="visitors-table">
            <thead>
              <tr>
                <th className="col-sn">#</th>
                <th className="col-location">Location</th>
                <th className="col-ip">IP Address</th>
                <th className="col-region">Region</th>
                <th className="col-date">Visited</th>
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
                    <div className="date-wrap">
                      <span className="date">{dayjs(visitor.createdAt).format('MMM DD, YYYY')}</span>
                      <span className="time">{dayjs(visitor.createdAt).format('hh:mm A')}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
