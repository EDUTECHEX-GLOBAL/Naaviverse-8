import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DatePicker, Select, Button, Pagination } from 'antd';
import 'antd/dist/reset.css';
import dayjs from 'dayjs';
import { useMediaQuery } from 'react-responsive';

const { Option } = Select;

const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [productFilter, setProductFilter] = useState('');
  const isMobile = useMediaQuery({ maxWidth: 767 });
  
  

  const contactsPerPage = 5;

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await axios.get("/api/admin-contact");
        setContacts(res.data);
        setFilteredContacts(res.data);
      } catch (err) {
        console.error("Failed to fetch contacts", err);
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

  return (
    <div className="container-fluid contact" style={{ minHeight: '100vh', backgroundColor: '#f4f6f9', padding: '30px' }}>
      {/* Header */}
      
<div
        className="mb-4"
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'row' : 'row',
          justifyContent: isMobile ? 'flex-start' : 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: '10px',
          width: '100%'
        }}
>
  <h1
    className="m-0"
    style={{
      color: 'black',
      fontWeight: 'bold',
      fontSize: window.innerWidth < 768 ? '22px' : '2rem',
      width: window.innerWidth < 768 ? '70%' : 'auto'
    }}
  >
    Contact Us
  </h1>

  <Button
    type="primary"
    onClick={exportData}
    style={{
      backgroundColor: '#198754',
      borderColor: '#00B5F9',
      borderRadius: '20px',
      padding: '8px 20px',
      fontWeight: 'bold',
      width: window.innerWidth < 768 ? '30%' : 'auto'
    }}
  >
    Export
  </Button>
</div>

      {/* Filters */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <label htmlFor="startDate" className="form-label text-success fw-semibold">Start Date</label>
          <DatePicker
            id="startDate"
            style={{ width: '100%' }}
            value={startDate}
            onChange={setStartDate}
            format="YYYY-MM-DD"
          />
        </div>
        <div className="col-12 col-md-4">
          <label htmlFor="endDate" className="form-label text-success fw-semibold">End Date</label>
          <DatePicker
            id="endDate"
            style={{ width: '100%' }}
            value={endDate}
            onChange={setEndDate}
            format="YYYY-MM-DD"
          />
        </div>
        <div className="col-12 col-md-4">
          <label htmlFor="productFilter" className="form-label text-success fw-semibold">Product Category</label>
          <Select
            id="productFilter"
            style={{ width: '100%' }}
            value={productFilter}
            onChange={value => setProductFilter(value)}
            placeholder="Select Product"
          >
            {productOptions.map((option, i) => (
              <Option key={i} value={option}>{option}</Option>
            ))}
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-3 shadow-sm" style={{ borderRadius: '10px' }}>
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>S.No</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Product Category</th>
                <th>Mobile</th>
                <th>Message</th>
                <th>Created On</th>
              </tr>
            </thead>
            <tbody>
              {currentContacts.map((contact, index) => (
                <tr key={contact._id} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                  <td>{indexOfFirst + index + 1}</td>
                  <td>{contact.fullName}</td>
                  <td>{contact.email}</td>
                  <td>{contact.product}</td>
                  <td>{contact.mobile}</td>
                  <td>{contact.message}</td>
                  <td>{new Date(contact.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-center my-5">
        <Pagination
          current={currentPage}
          total={filteredContacts.length}
          pageSize={contactsPerPage}
          onChange={page => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};

export default ContactList;
