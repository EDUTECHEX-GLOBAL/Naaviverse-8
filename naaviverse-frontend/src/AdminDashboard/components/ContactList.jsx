import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DatePicker, Pagination, Button } from 'antd';
import 'antd/dist/reset.css';
import dayjs from 'dayjs';
import { FiDownload, FiFilter, FiCalendar } from 'react-icons/fi';
import './ContactList.scss';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const contactsPerPage = 10;

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${BASE_URL}/api/admin-contact`);
        setContacts(res.data);
        setFilteredContacts(res.data);
      } catch (err) {
        console.error("Failed to fetch contacts", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContacts();
  }, []);

  useEffect(() => {
    let filtered = [...contacts];

    if (startDate && endDate) {
      filtered = filtered.filter(contact => {
        const created = dayjs(contact.createdAt);
        return created.isAfter(dayjs(startDate).subtract(1, 'day')) &&
               created.isBefore(dayjs(endDate).add(1, 'day'));
      });
    }

    // Sort latest first (descending order)
    filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    setFilteredContacts(filtered);
    setCurrentPage(1);
  }, [startDate, endDate, contacts]);

  const totalPages = Math.ceil(filteredContacts.length / contactsPerPage);
  const indexOfLast = currentPage * contactsPerPage;
  const indexOfFirst = indexOfLast - contactsPerPage;
  const currentContacts = filteredContacts.slice(indexOfFirst, indexOfLast);

  const exportData = () => {
    const data = filteredContacts.map((c, i) => ({
      SNo: i + 1,
      Name: c.fullName,
      Email: c.email,
      Mobile: c.mobile,
      Message: c.message,
      CreatedOn: new Date(c.createdAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(fileData, `Contact_List_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const hasFilters = startDate || endDate;

  return (
    <div className="contact-list">
      {/* Header */}
      <div className="contact-list__header">
        <div>
          <h1 className="contact-list__title">Contact Submissions</h1>
          <p className="contact-list__subtitle">Manage and analyze all inquiries</p>
        </div>
        <div className="contact-list__actions">
          {hasFilters && (
            <Button onClick={clearFilters} icon={<FiFilter />} className="btn-outline">
              Clear
            </Button>
          )}
          <Button onClick={exportData} icon={<FiDownload />} type="primary" className="btn-primary">
            Export
          </Button>
        </div>
      </div>

      {/* Filters - Date only */}
      <div className="contact-list__filters">
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
      </div>

      {/* Stats Bar */}
      <div className="contact-list__stats">
        <span>{filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="contact-list__table-wrapper">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
          </div>
        ) : currentContacts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>No submissions found</p>
            {contacts.length > 0 && (
              <Button onClick={clearFilters} type="link">Clear filters</Button>
            )}
          </div>
        ) : (
          <table className="contact-table">
            <thead>
              <tr>
                <th className="col-sn">#</th>
                <th className="col-name">Name</th>
                <th className="col-email">Email</th>
                <th className="col-mobile">Mobile</th>
                <th className="col-message">Message</th>
                <th className="col-date">Created</th>
              </tr>
            </thead>
            <tbody>
              {currentContacts.map((contact, idx) => (
                <tr key={contact._id || idx}>
                  <td className="col-sn">{indexOfFirst + idx + 1}</td>
                  <td className="col-name">{contact.fullName}</td>
                  <td className="col-email">
                    <a href={`mailto:${contact.email}`} className="email-link">
                      {contact.email}
                    </a>
                  </td>
                  <td className="col-mobile">{contact.mobile}</td>
                  <td className="col-message">{contact.message || '—'}</td>
                  <td className="col-date">
                    <div className="date-wrap">
                      <span className="date">{dayjs(contact.createdAt).format('MMM DD, YYYY')}</span>
                      <span className="time">{dayjs(contact.createdAt).format('hh:mm A')}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && filteredContacts.length > contactsPerPage && (
        <div className="contact-list__pagination">
          <Pagination
            current={currentPage}
            total={filteredContacts.length}
            pageSize={contactsPerPage}
            onChange={setCurrentPage}
            showSizeChanger={false}
            size="small"
          />
        </div>
      )}
    </div>
  );
};

export default ContactList;