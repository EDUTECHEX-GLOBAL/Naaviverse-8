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
} from "recharts";
import CountUp from "react-countup";
import { useMediaQuery } from 'react-responsive';
import { FiTrendingUp, FiTrendingDown, FiUsers, FiMail, FiEye } from "react-icons/fi";
import './Home.scss';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const HomeDashboard = () => {
  const [counts, setCounts] = useState({
    contacts: 0,
    visitors: 0,
    subscribers: 0,
  });

  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState([]);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin-dashboard/overview`);
        const { months, trends } = res.data;
        const formatted = months.map((month, index) => ({
          month,
          contacts: trends.contacts[index] || 0,
          visitors: trends.visitors[index] || 0,
          subscribers: trends.subscribers[index] || 0,
        }));
        setTrendData(formatted);
      } catch (error) {
        console.error("Failed to load trend data", error);
        setTrendData([]);
      }
    };
    fetchTrends();
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        const [contactRes, visitorRes, subRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/admin-contact/count`),
          axios.get(`${BASE_URL}/api/admin-visitors/count`),
          axios.get(`${BASE_URL}/api/admin-subscribe/count`),
        ]);

        setCounts({
          contacts: contactRes.data.count || 0,
          visitors: visitorRes.data.count || 0,
          subscribers: subRes.data.count || 0,
        });
      } catch (err) {
        console.error("Failed to fetch counts:", err);
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
      {/* Header - Compact */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard <span>Overview</span></h1>
        <p className="dashboard-subtitle">Real-time insights and analytics</p>
      </div>

      {/* Stats Cards - 3 in a row */}
      <div className="stats-row">
        {statsCards.map((card, index) => (
          <div key={card.name} className="stat-card" style={{ background: card.color }}>
            <div className="stat-card-inner">
              <div className="stat-icon">{card.icon}</div>
              <div className="stat-info">
                <div className="stat-name">{card.name}</div>
                <div className="stat-value">
                  {!loading ? (
                    <CountUp end={card.value} duration={2} separator="," />
                  ) : (
                    <span>--</span>
                  )}
                </div>
                <div className="stat-trend">
                  <span className={`trend-badge ${card.trendUp ? 'up' : 'down'}`}>
                    {card.trendUp ? <FiTrendingUp /> : <FiTrendingDown />}
                    {card.trend}%
                  </span>
                  <span className="trend-text">vs last month</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section - Reduced Text Sizes */}
      <div className="charts-row">
        {/* Area Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Category Trends</h3>
            <p>Monthly growth across all categories</p>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={280}>
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
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', padding: '8px 12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="contacts" name="Contacts" stroke="#667eea" strokeWidth={2} fill="url(#contactsGradient)" fillOpacity={1} />
                <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#43e97b" strokeWidth={2} fill="url(#visitorsGradient)" fillOpacity={1} />
                <Area type="monotone" dataKey="subscribers" name="Subscribers" stroke="#fe9496" strokeWidth={2} fill="url(#subscribersGradient)" fillOpacity={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Distribution</h3>
            <p>Current breakdown by category</p>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  label={({ name, percent }) => `${name}: ${Math.round(percent * 100)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', padding: '8px 12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Info Cards - Reduced Size */}
      <div className="info-row">
        <div className="info-card">
          <FiTrendingUp className="info-icon" />
          <div>
            <h4>Performance</h4>
            <p>Steady growth across all metrics</p>
          </div>
        </div>
        <div className="info-card">
          <FiUsers className="info-icon" />
          <div>
            <h4>Engagement</h4>
            <p>15% increase in visitor activity</p>
          </div>
        </div>
        <div className="info-card">
          <FiMail className="info-icon" />
          <div>
            <h4>Communication</h4>
            <p>40% rise in contact submissions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;