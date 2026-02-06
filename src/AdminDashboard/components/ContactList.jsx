import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DatePicker, Select, Pagination, Button } from 'antd';
import 'antd/dist/reset.css';
import dayjs from 'dayjs';
import { FiDownload, FiFilter, FiCalendar, FiGrid } from 'react-icons/fi';
import './ContactList.scss';
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const { Option } = Select;

const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [productFilter, setProductFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const contactsPerPage = 8;

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

    if (productFilter && productFilter !== "All") {
      filtered = filtered.filter(contact =>
        contact.product?.toLowerCase().trim() === productFilter.toLowerCase().trim()
      );
    }

    setFilteredContacts(filtered);
    setCurrentPage(1);
  }, [startDate, endDate, productFilter, contacts]);

  const totalPages = Math.ceil(filteredContacts.length / contactsPerPage);
  const indexOfLast = currentPage * contactsPerPage;
  const indexOfFirst = indexOfLast - contactsPerPage;
  const currentContacts = filteredContacts.slice(indexOfFirst, indexOfLast);

  const exportData = () => {
    const exportData = filteredContacts.map((c, i) => ({
      SNo: i + 1,
      Name: c.fullName,
      Email: c.email,
      Product: c.product,
      Mobile: c.mobile,
      Message: c.message,
      CreatedOn: new Date(c.createdAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(fileData, `Contact_List_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const productOptions = ["All", "Defence", "Ground", "Space", "Others"];

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setProductFilter('');
  };

  return (
    <div className="contact-list-container">
      {/* Header */}
      <div className="contact-header">
        <div className="header-left">
          <h1 className="page-title">
            <span className="title-gradient">Contact</span> List
          </h1>
          <p className="page-subtitle">Manage and analyze all contact submissions</p>
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

      {/* Filters Card */}
      <div className="filters-card">
        <div className="filters-header">
          <FiFilter className="filter-icon" />
          <h3>Filter Contacts</h3>
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
            />
          </div>
          
          <div className="filter-item">
            <label className="filter-label">
              <FiGrid /> Product Category
            </label>
            <Select
              value={productFilter}
              onChange={value => setProductFilter(value)}
              placeholder="All categories"
              className="category-select"
              allowClear
            >
              {productOptions.map((option, i) => (
                <Option key={i} value={option}>{option}</Option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <span className="results-count">
          Showing {currentContacts.length} of {filteredContacts.length} contacts
        </span>
        {productFilter && productFilter !== "All" && (
          <span className="active-filter">
            Filtered by: <strong>{productFilter}</strong>
          </span>
        )}
      </div>

      {/* Table Container */}
      <div className="table-container">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading contacts...</p>
          </div>
        ) : currentContacts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No contacts found</h3>
            <p>
              {contacts.length === 0 
                ? "No contacts have been submitted yet." 
                : "No contacts match your filters."}
            </p>
            {contacts.length > 0 && (
              <Button type="primary" onClick={clearFilters} ghost>
                Clear filters to see all contacts
              </Button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="contacts-table">
              <thead>
                <tr>
                  <th>S.NO</th>
                  <th>FULL NAME</th>
                  <th>EMAIL</th>
                  <th>PRODUCT</th>
                  <th>MOBILE</th>
                  <th>MESSAGE</th>
                  <th>CREATED ON</th>
                </tr>
              </thead>
              <tbody>
                {currentContacts.map((contact, index) => (
                  <tr key={contact._id || index} className="table-row">
                    <td className="serial-no">
                      <span className="serial-badge">{indexOfFirst + index + 1}</span>
                    </td>
                    <td className="name-cell">
  <div className="user-info">
    <div className="user-details">
      <span className="user-name">{contact.fullName}</span>
      <span className="user-email">{contact.email}</span>
    </div>
  </div>
</td>
                    <td>
                      <a href={`mailto:${contact.email}`} className="email-link">
                        {contact.email}
                      </a>
                    </td>
                    <td>
                      <span className={`product-tag ${contact.product?.toLowerCase()}`}>
                        {contact.product}
                      </span>
                    </td>
                    <td>
                      <div className="mobile-cell">
                        <span className="mobile-number">{contact.mobile}</span>
                      </div>
                    </td>
                    <td className="message-cell">
                      {contact.message ? (
                        <div className="message-content" title={contact.message}>
                          {contact.message.length > 40 
                            ? `${contact.message.substring(0, 40)}...` 
                            : contact.message}
                        </div>
                      ) : (
                        <span className="no-message">No message</span>
                      )}
                    </td>
                    <td className="date-cell">
                      <div className="date-content">
                        <div className="date">{dayjs(contact.createdAt).format('MMM DD, YYYY')}</div>
                        <div className="time">{dayjs(contact.createdAt).format('hh:mm A')}</div>
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
      {!isLoading && filteredContacts.length > contactsPerPage && (
        <div className="pagination-wrapper">
          <Pagination
            current={currentPage}
            total={filteredContacts.length}
            pageSize={contactsPerPage}
            onChange={page => setCurrentPage(page)}
            showSizeChanger={false}
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
            className="custom-pagination"
          />
        </div>
      )}
    </div>
  );
};

export default ContactList;