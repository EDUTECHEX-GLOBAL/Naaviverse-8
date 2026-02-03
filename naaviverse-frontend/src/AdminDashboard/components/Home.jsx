import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
  BarChart,
  Bar
} from "recharts";
import CountUp from "react-countup";
import { useMediaQuery } from 'react-responsive';
import { FiTrendingUp, FiTrendingDown, FiUsers, FiMail, FiEye } from "react-icons/fi";
import './Home.scss';

const HomeDashboard = () => {
  const [counts, setCounts] = useState({
    contacts: 0,
    visitors: 0,
    subscribers: 0,
  });

  const [loading, setLoading] = useState(true);

  // Media queries for responsive design
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 });
  
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        const [contactRes, visitorRes, subRes] = await Promise.all([
          axios.get("/api/admin-contact/count", { headers: { "Cache-Control": "no-cache" } }),
          axios.get("/api/admin-visitors/count", { headers: { "Cache-Control": "no-cache" } }),
          axios.get("/api/admin-subscribe/count", { headers: { "Cache-Control": "no-cache" } }),
        ]);

        setCounts({
          contacts: contactRes.data.count || 0,
          visitors: visitorRes.data.count || 0,
          subscribers: subRes.data.count || 0,
        });
      } catch (err) {
        console.error("Failed to fetch counts:", err);
        // Use sample data if API fails
        setCounts({
          contacts: 45,
          visitors: 128,
          subscribers: 67,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  // Sample data for charts (you can replace with real data later)
  const trendData = [
    { month: 'Jan', contacts: 30, visitors: 80, subscribers: 20 },
    { month: 'Feb', contacts: 40, visitors: 100, subscribers: 35 },
    { month: 'Mar', contacts: 35, visitors: 120, subscribers: 40 },
    { month: 'Apr', contacts: 50, visitors: 110, subscribers: 45 },
    { month: 'May', contacts: 45, visitors: 128, subscribers: 50 },
    { month: 'Jun', contacts: 55, visitors: 140, subscribers: 60 },
  ];

  const pieData = [
    { name: "Contacts", value: counts.contacts, color: '#667eea' },
    { name: "Visitors", value: counts.visitors, color: '#43e97b' },
    { name: "Subscribers", value: counts.subscribers, color: '#fe9496' },
  ];

  const statsCards = [
    {
      name: "Contacts",
      value: counts.contacts,
      icon: <FiMail />,
      color: 'linear-gradient(135deg, #667eea, #764ba2)',
      trend: 40,
      trendUp: true
    },
    {
      name: "Visitors",
      value: counts.visitors,
      icon: <FiEye />,
      color: 'linear-gradient(135deg, #43e97b, #38f9d7)',
      trend: 10,
      trendUp: false
    },
    {
      name: "Subscribers",
      value: counts.subscribers,
      icon: <FiUsers />,
      color: 'linear-gradient(135deg, #fe9496, #ff6b6b)',
      trend: 5,
      trendUp: true
    }
  ];

  return (
    <div className="home-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            Dashboard <span className="title-accent">Overview</span>
          </h1>
          <p className="dashboard-subtitle">
            Real-time insights and analytics for your platform
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statsCards.map((card, index) => (
          <div 
            key={card.name}
            className="stat-card"
            style={{ background: card.color }}
          >
            <div className="stat-card-content">
              <div className="stat-icon-wrapper">
                {card.icon}
              </div>
              
              <div className="stat-info">
                <div className="stat-category">{card.name}</div>
                <div className="stat-value">
                  {!loading ? (
                    <CountUp 
                      end={card.value} 
                      duration={2.5} 
                      separator=","
                    />
                  ) : (
                    <div className="loading-pulse">--</div>
                  )}
                </div>
                
                <div className="stat-trend">
                  <div className={`trend-indicator ${card.trendUp ? 'up' : 'down'}`}>
                    {card.trendUp ? <FiTrendingUp /> : <FiTrendingDown />}
                    <span>{card.trend}%</span>
                  </div>
                  <span className="trend-label">
                    {card.trendUp ? 'Increase' : 'Decrease'} from last month
                  </span>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="card-circle large"></div>
              <div className="card-circle small"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Area Chart - Trends */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">
              <FiTrendingUp className="chart-icon" />
              Category Trends
            </h3>
            <div className="chart-subtitle">Monthly growth across all categories</div>
          </div>
          
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="contactsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#43e97b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#43e97b" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="subscribersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fe9496" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#fe9496" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: isMobile ? 11 : 13 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: isMobile ? 11 : 13 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(203, 213, 224, 0.5)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(4px)',
                    padding: '12px',
                    fontSize: isMobile ? '12px' : '14px'
                  }}
                />
                <Legend 
                  wrapperStyle={{
                    paddingTop: '10px',
                    fontSize: isMobile ? '11px' : '13px'
                  }}
                />
                
                <Area 
                  type="monotone" 
                  dataKey="contacts" 
                  name="Contacts"
                  stroke="#667eea"
                  strokeWidth={2}
                  fill="url(#contactsGradient)" 
                  fillOpacity={1}
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                />
                
                <Area 
                  type="monotone" 
                  dataKey="visitors" 
                  name="Visitors"
                  stroke="#43e97b"
                  strokeWidth={2}
                  fill="url(#visitorsGradient)" 
                  fillOpacity={1}
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                />
                
                <Area 
                  type="monotone" 
                  dataKey="subscribers" 
                  name="Subscribers"
                  stroke="#fe9496"
                  strokeWidth={2}
                  fill="url(#subscribersGradient)" 
                  fillOpacity={1}
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">
              <FiUsers className="chart-icon" />
              Category Distribution
            </h3>
            <div className="chart-subtitle">Current distribution across all categories</div>
          </div>
          
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={isMobile ? 70 : 90}
                  innerRadius={isMobile ? 40 : 60}
                  paddingAngle={2}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Legend 
                  wrapperStyle={{
                    paddingTop: '20px',
                    fontSize: isMobile ? '11px' : '13px'
                  }}
                />
                <Tooltip 
                  formatter={(value, name, props) => [value, name]}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(203, 213, 224, 0.5)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(4px)',
                    padding: '12px',
                    fontSize: isMobile ? '12px' : '14px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional Info Section */}
      <div className="info-section">
        <div className="info-card">
          <div className="info-icon">
            <FiTrendingUp />
          </div>
          <div className="info-content">
            <h4>Performance Insights</h4>
            <p>Your platform is performing well with steady growth across all metrics.</p>
          </div>
        </div>
        
        <div className="info-card">
          <div className="info-icon">
            <FiUsers />
          </div>
          <div className="info-content">
            <h4>User Engagement</h4>
            <p>Visitor engagement has increased by 15% compared to last month.</p>
          </div>
        </div>
        
        <div className="info-card">
          <div className="info-icon">
            <FiMail />
          </div>
          <div className="info-content">
            <h4>Communication Rate</h4>
            <p>Contact submissions are up by 40%, indicating strong user interest.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;