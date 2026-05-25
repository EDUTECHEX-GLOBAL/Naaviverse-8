import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DatePicker, Select, Pagination, Button } from 'antd';
import 'antd/dist/reset.css';
import dayjs from 'dayjs';
import { FiDownload, FiFilter, FiCalendar, FiGrid } from 'react-icons/fi';
import './ContactList.scss';

const { Option } = Select;
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [productFilter, setProductFilter] = useState('');
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

  const getProductColor = (product) => {
    switch(product?.toLowerCase()) {
      case 'defence': return 'product-defence';
      case 'ground': return 'product-ground';
      case 'space': return 'product-space';
      default: return 'product-others';
    }
  };

  return (
    <div className="contact-list">
      {/* Header Section - Compact, No Bell Icon */}
      <div className="contact-list__header">
        <div>
          <h1 className="contact-list__title">Contact Submissions</h1>
          <p className="contact-list__subtitle">Manage and analyze all inquiries</p>
        </div>
        <div className="contact-list__actions">
          <Button onClick={clearFilters} icon={<FiFilter />} className="btn-outline">
            Clear
          </Button>
          <Button onClick={exportData} icon={<FiDownload />} type="primary" className="btn-primary">
            Export
          </Button>
        </div>
      </div>

      {/* Filters Section */}
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
        <div className="filter-item">
          <div className="filter-label"><FiGrid /> Product</div>
          <Select
            value={productFilter}
            onChange={setProductFilter}
            placeholder="All"
            className="filter-select"
            allowClear
          >
            {productOptions.map(opt => (
              <Option key={opt} value={opt}>{opt}</Option>
            ))}
          </Select>
        </div>
        {(startDate || endDate || productFilter) && (
          <div className="filter-item filter-clear">
            <Button onClick={clearFilters} icon={<FiFilter />} size="small" type="text">
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div className="contact-list__stats">
        <span>{filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}</span>
        {productFilter && productFilter !== "All" && <span className="stats-badge">{productFilter}</span>}
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
          <div className="table-responsive">
            <table className="compact-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Product</th>
                  <th>Mobile</th>
                  <th>Message</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {currentContacts.map((contact, idx) => (
                  <tr key={contact._id || idx}>
                    <td className="col-sn">{indexOfFirst + idx + 1}</td>
                    <td className="col-name">
                      <div>
                        <div>{contact.fullName}</div>
                        <div className="text-muted small">{contact.email}</div>
                      </div>
                    </td>
                    <td className="col-email">
                      <a href={`mailto:${contact.email}`} className="email-link">
                        {contact.email}
                      </a>
                    </td>
                    <td className="col-product">
                      <span className={`product-badge ${getProductColor(contact.product)}`}>
                        {contact.product || 'N/A'}
                      </span>
                    </td>
                    <td className="col-mobile">{contact.mobile}</td>
                    <td className="col-message">
                      <div className="message-truncate" title={contact.message}>
                        {contact.message?.substring(0, 35) || '—'}
                        {contact.message?.length > 35 ? '...' : ''}
                      </div>
                    </td>
                    <td className="col-date">
                      <div className="date-compact">
                        <span>{dayjs(contact.createdAt).format('MMM DD, YYYY')}</span>
                        <span className="time">{dayjs(contact.createdAt).format('hh:mm A')}</span>
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