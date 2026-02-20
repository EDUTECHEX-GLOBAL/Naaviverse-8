import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DatePicker, Button, Pagination, Input } from 'antd';
import 'antd/dist/reset.css';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { FiDownload, FiFilter, FiCalendar, FiMail, FiSearch, FiUsers } from 'react-icons/fi';
import './SubscriptionList.scss';

// Extend dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const SubscriptionList = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    recent: 0,
    uniqueDomains: 0
  });

  const subscriptionsPerPage = 10;

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${BASE_URL}/api/admin-subscribe`);
        const data = res.data || [];
        setSubscriptions(data);
        setFilteredSubscriptions(data);
        
        // Calculate stats
        const today = dayjs().startOf('day');
        const recent = data.filter(sub => 
          dayjs(sub.createdAt).isAfter(today.subtract(7, 'day'))
        ).length;
        
        const domains = new Set();
        data.forEach(sub => {
          if (sub.email) {
            const emailParts = sub.email.split('@');
            if (emailParts[1]) {
              domains.add(emailParts[1].toLowerCase());
            }
          }
        });
        
        setStats({
          total: data.length,
          recent,
          uniqueDomains: domains.size
        });
      } catch (err) {
        console.error("Failed to fetch subscriptions", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    let filtered = [...subscriptions];

    // Date filter
    if (startDate && endDate) {
      filtered = filtered.filter(subscription => {
        const created = dayjs(subscription.createdAt);
        return created.isAfter(dayjs(startDate).subtract(1, 'day')) &&
               created.isBefore(dayjs(endDate).add(1, 'day'));
      });
    }

    // Email search filter
    if (searchEmail.trim()) {
      const searchTerm = searchEmail.toLowerCase().trim();
      filtered = filtered.filter(sub => 
        sub.email?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredSubscriptions(filtered);
    setCurrentPage(1);
  }, [startDate, endDate, searchEmail, subscriptions]);

  const indexOfLast = currentPage * subscriptionsPerPage;
  const indexOfFirst = indexOfLast - subscriptionsPerPage;
  const currentSubscriptions = filteredSubscriptions.slice(indexOfFirst, indexOfLast);

  const exportData = () => {
    const exportData = filteredSubscriptions.map((sub, i) => ({
      SNo: i + 1,
      Email: sub.email,
      SubscribedOn: new Date(sub.createdAt).toLocaleString(),
      Date: dayjs(sub.createdAt).format('YYYY-MM-DD'),
      Time: dayjs(sub.createdAt).format('HH:mm:ss')
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Subscriptions");

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(fileData, `Subscriptions_${dayjs().format('YYYY-MM-DD')}.xlsx`);
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSearchEmail('');
  };

  const formatDomain = (email) => {
    if (!email) return '';
    const domain = email.split('@')[1];
    return domain ? domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1) : '';
  };

  const getTimeAgo = (dateString) => {
    try {
      return dayjs(dateString).fromNow();
    } catch (error) {
      return 'recently';
    }
  };

  return (
    <div className="subscription-container">
      {/* Header */}
      <div className="subscription-header">
        <div className="header-left">
          <h1 className="page-title">
            <span className="title-gradient">Subscribed</span> Emails
          </h1>
          <p className="page-subtitle">Manage and analyze email subscriptions</p>
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
            <FiUsers />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Subscriptions</div>
          </div>
        </div>
        <div className="stat-card recent-card">
          <div className="stat-icon">
            <FiCalendar />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.recent}</div>
            <div className="stat-label">Last 7 Days</div>
          </div>
        </div>
        <div className="stat-card domain-card">
          <div className="stat-icon">
            <FiMail />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.uniqueDomains}</div>
            <div className="stat-label">Unique Domains</div>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="filters-card">
        <div className="filters-header">
          <FiFilter className="filter-icon" />
          <h3>Filter Subscriptions</h3>
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
              <FiSearch /> Search Email
            </label>
            <Input
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Search by email address..."
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
          Showing {currentSubscriptions.length} of {filteredSubscriptions.length} subscriptions
        </span>
        {(startDate || endDate || searchEmail) && (
          <span className="active-filters">
            Filters applied: 
            {startDate && <span className="filter-tag">From {dayjs(startDate).format('MMM DD')}</span>}
            {endDate && <span className="filter-tag">To {dayjs(endDate).format('MMM DD')}</span>}
            {searchEmail && <span className="filter-tag">Search: "{searchEmail}"</span>}
          </span>
        )}
      </div>

      {/* Table Container */}
      <div className="table-container">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading subscriptions...</p>
          </div>
        ) : currentSubscriptions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📧</div>
            <h3>No subscriptions found</h3>
            <p>
              {subscriptions.length === 0 
                ? "No email subscriptions yet." 
                : "No subscriptions match your filters."}
            </p>
            {subscriptions.length > 0 && (
              <Button type="primary" onClick={clearFilters} ghost>
                Clear filters to see all subscriptions
              </Button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="subscriptions-table">
              <thead>
                <tr>
                  <th>S.NO</th>
                  <th>EMAIL</th>
                  <th>DOMAIN</th>
                  <th>SUBSCRIBED ON</th>
                  <th>TIME</th>
                </tr>
              </thead>
              <tbody>
                {currentSubscriptions.map((sub, index) => {
                  const subscribeDate = sub.createdAt ? dayjs(sub.createdAt) : dayjs();
                  return (
                    <tr key={sub._id || index} className="table-row">
                      <td className="serial-no">
                        <span className="serial-badge">{indexOfFirst + index + 1}</span>
                      </td>
                      <td className="email-cell">
                        <div className="email-content">
                          <div className="email-icon">
                            <FiMail />
                          </div>
                          <div className="email-details">
                            <a href={`mailto:${sub.email}`} className="email-address">
                              {sub.email}
                            </a>
                            <span className="email-time">
                              Added {getTimeAgo(sub.createdAt)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="domain-cell">
                        <span className="domain-tag">
                          {formatDomain(sub.email)}
                        </span>
                      </td>
                      <td className="date-cell">
                        <div className="date-content">
                          <div className="date-display">{subscribeDate.format('MMM DD, YYYY')}</div>
                          <div className="day-display">{subscribeDate.format('dddd')}</div>
                        </div>
                      </td>
                      <td className="time-cell">
                        <span className="time-display">{subscribeDate.format('hh:mm A')}</span>
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
      {!isLoading && filteredSubscriptions.length > subscriptionsPerPage && (
        <div className="pagination-wrapper">
          <Pagination
            current={currentPage}
            total={filteredSubscriptions.length}
            pageSize={subscriptionsPerPage}
            onChange={page => setCurrentPage(page)}
            showSizeChanger={false}
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} emails`}
            className="custom-pagination"
          />
        </div>
      )}
    </div>
  );
};

export default SubscriptionList;