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
import { FiDownload, FiFilter, FiCalendar, FiMail, FiSearch, FiUsers, FiClock } from 'react-icons/fi';
import './SubscriptionList.scss';

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
        
        const today = dayjs().startOf('day');
        const recent = data.filter(sub => 
          dayjs(sub.createdAt).isAfter(today.subtract(7, 'day'))
        ).length;
        
        const domains = new Set();
        data.forEach(sub => {
          if (sub.email) {
            const domain = sub.email.split('@')[1];
            if (domain) domains.add(domain.toLowerCase());
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

    if (startDate && endDate) {
      filtered = filtered.filter(sub => {
        const created = dayjs(sub.createdAt);
        return created.isAfter(dayjs(startDate).subtract(1, 'day')) &&
               created.isBefore(dayjs(endDate).add(1, 'day'));
      });
    }

    if (searchEmail.trim()) {
      const term = searchEmail.toLowerCase().trim();
      filtered = filtered.filter(sub => 
        sub.email?.toLowerCase().includes(term)
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
      SubscribedOn: dayjs(sub.createdAt).format('MMM DD, YYYY hh:mm A'),
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

  const getDomain = (email) => {
    if (!email) return '';
    const domain = email.split('@')[1];
    return domain ? domain.split('.')[0] : '';
  };

  return (
    <div className="subscription-list">
      {/* Header - Compact */}
      <div className="subscription-list__header">
        <div>
          <h1 className="subscription-list__title">Email Subscriptions</h1>
          <p className="subscription-list__subtitle">Manage and analyze subscriber data</p>
        </div>
        <div className="subscription-list__actions">
          <Button onClick={clearFilters} icon={<FiFilter />} className="btn-outline">
            Clear
          </Button>
          <Button onClick={exportData} icon={<FiDownload />} type="primary" className="btn-primary">
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards - Compact */}
      <div className="subscription-list__stats">
        <div className="stat-card">
          <FiUsers className="stat-icon total" />
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>
        <div className="stat-card">
          <FiCalendar className="stat-icon recent" />
          <div>
            <div className="stat-value">{stats.recent}</div>
            <div className="stat-label">Last 7 days</div>
          </div>
        </div>
        <div className="stat-card">
          <FiMail className="stat-icon domain" />
          <div>
            <div className="stat-value">{stats.uniqueDomains}</div>
            <div className="stat-label">Domains</div>
          </div>
        </div>
      </div>

      {/* Filters - Minimal */}
      <div className="subscription-list__filters">
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
          <div className="filter-label"><FiSearch /> Email</div>
          <Input
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="Search email..."
            className="filter-search"
            allowClear
          />
        </div>
        {(startDate || endDate || searchEmail) && (
          <div className="filter-item filter-clear">
            <Button onClick={clearFilters} size="small" type="text">
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="subscription-list__summary">
        <span>{filteredSubscriptions.length} subscriber{filteredSubscriptions.length !== 1 ? 's' : ''}</span>
        {searchEmail && <span className="summary-badge">Search: {searchEmail}</span>}
        {(startDate || endDate) && <span className="summary-badge">Date range</span>}
      </div>

      {/* Table */}
      <div className="subscription-list__table-wrapper">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
          </div>
        ) : currentSubscriptions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📧</div>
            <p>No subscriptions found</p>
            {subscriptions.length > 0 && (
              <Button onClick={clearFilters} type="link">Clear filters</Button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="compact-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Email</th>
                  <th>Domain</th>
                  <th>Subscribed</th>
                </tr>
              </thead>
              <tbody>
                {currentSubscriptions.map((sub, idx) => (
                  <tr key={sub._id || idx}>
                    <td className="col-sn">{indexOfFirst + idx + 1}</td>
                    <td className="col-email">
                      <div className="email-cell">
                        <FiMail className="email-icon" />
                        <a href={`mailto:${sub.email}`} className="email-link">
                          {sub.email}
                        </a>
                      </div>
                    </td>
                    <td className="col-domain">
                      <span className="domain-badge">{getDomain(sub.email)}</span>
                    </td>
                    <td className="col-date">
                      <div className="date-cell">
                        <span>{dayjs(sub.createdAt).format('MMM DD, YYYY')}</span>
                        <span className="time">{dayjs(sub.createdAt).format('hh:mm A')}</span>
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
      {!isLoading && filteredSubscriptions.length > subscriptionsPerPage && (
        <div className="subscription-list__pagination">
          <Pagination
            current={currentPage}
            total={filteredSubscriptions.length}
            pageSize={subscriptionsPerPage}
            onChange={setCurrentPage}
            showSizeChanger={false}
            size="small"
          />
        </div>
      )}
    </div>
  );
};

export default SubscriptionList;