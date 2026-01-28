import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DatePicker, Button, Pagination } from 'antd';
import 'antd/dist/reset.css';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useMediaQuery } from 'react-responsive';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const VisitorsList = () => {
  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const visitorsPerPage = 5;

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const res = await axios.get('/api/admin-visitors');
        setVisitors(res.data);
        setFilteredVisitors(res.data);
      } catch (err) {
        console.error("Error fetching visitors", err);
      }
    };
    fetchVisitors();
  }, []);

  useEffect(() => {
    let filtered = [...visitors];
    if (startDate && endDate) {
      filtered = filtered.filter(visitor => {
        const created = dayjs(visitor.createdAt);
        return created.isSameOrAfter(dayjs(startDate), 'day') &&
               created.isSameOrBefore(dayjs(endDate), 'day');
      });
    }
    setFilteredVisitors(filtered);
    setCurrentPage(1);
  }, [startDate, endDate, visitors]);

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
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Visitors");

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(fileData, `Visitors_List_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div
      className="container"
      style={{
        minHeight: '100vh',
        backgroundColor: '#f4f6f9',
        paddingTop: '30px',
        paddingLeft: '30px',
        paddingRight: '30px'
      }}
    >
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
                style={{
                  color: 'black',
                  fontWeight: 'bold',
                  fontSize: isMobile ? '22px' : '36px',
                  width: isMobile ? '70%' : 'auto'
                }}
              >
                Visitors List
              </h1>
              <Button
                type="primary"
                onClick={exportData}
                style={{
                  backgroundColor: '#198754',
                  borderColor: '#198754',
                  borderRadius: '20px',
                  padding: isMobile ?  '8px 20px' : '8px 24px',
                  width: isMobile ? '30%' : 'auto',
                  alignItems: isMobile? 'left': 'auto',
                }}
              >
                Export
              </Button>
            </div>
      
      {/* Filters */}
      <div className="row g-3 mb-4 mt-45">
        <div className="col-md-3 col-sm-6">
          <label htmlFor="startDate" style={{ color: '#198754', fontWeight: 600, fontSize: '1.2rem' }}>
            Start Date
          </label>
          <DatePicker
            id="startDate"
            style={{ width: '100%', borderRadius: '8px' }}
            value={startDate}
            onChange={setStartDate}
            format="YYYY-MM-DD"
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <label htmlFor="endDate" style={{ color: '#198754', fontWeight: 600, fontSize: '1.2rem' }}>
            End Date
          </label>
          <DatePicker
            id="endDate"
            style={{ width: '100%', borderRadius: '8px' }}
            value={endDate}
            onChange={setEndDate}
            format="YYYY-MM-DD"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card p-3 shadow-sm" style={{ borderRadius: '10px'}}>
        <div className="table-responsive">
           <table className="table table-bordered">
            <thead>
              <tr>
                <th>S.No</th>
                <th>IP</th>
                <th>City</th>
                <th>Region</th>
                <th>Postal Code</th>
                <th>Country</th>
                <th>Created On</th>
              </tr>
            </thead>
          <tbody>
            {currentVisitors.map((visitor, index) => (
              <tr key={visitor._id} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                <td>{indexOfFirst + index + 1}</td>
                <td>{visitor.ip}</td>
                <td>{visitor.city}</td>
                <td>{visitor.region}</td>
                <td>{visitor.postalCode}</td>
                <td>{visitor.country}</td>
                <td>{new Date(visitor.createdAt).toLocaleString()}</td>
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
          total={filteredVisitors.length}
          pageSize={visitorsPerPage}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};

export default VisitorsList;
