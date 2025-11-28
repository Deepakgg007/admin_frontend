import React, { useState, useEffect } from "react";
import { Card, Row, Col, Badge, Table, ProgressBar, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import { API_BASE_URL } from "../../services/apiBase";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);

  const authToken = localStorage.getItem("authToken") || localStorage.getItem("access_token");

  useEffect(() => {
    fetchDashboardData();
    fetchColleges();
  }, []);

  useEffect(() => {
    if (!isInitialLoad && selectedCollege !== "") {
      fetchDashboardData(false); // Don't show loading spinner for filter changes
    } else if (selectedCollege === "" && !isInitialLoad) {
      fetchDashboardData(false); // Fetch all when filter is cleared
    }
  }, [selectedCollege]);

  const fetchDashboardData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setIsFiltering(true);
      }
      setIsInitialLoad(false);

      const params = {};
      if (selectedCollege) {
        params.college = selectedCollege;
      }

      console.log('Fetching dashboard with params:', params);

      const response = await axios.get(`${API_BASE_URL}/api/admin/dashboard/analytics/`, {
        params,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // Extract data from StandardResponseMixin format: { success: true, data: {...}, message: "..." }
      const data = response.data?.data || response.data;
      console.log('📊 Dashboard Data:', data);
      console.log('Top Students:', data?.top_students);
      console.log('Top Cert Students:', data?.top_cert_students);
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
      console.error("Dashboard Error:", err);
    } finally {
      if (showLoading) {
        setLoading(false);
      } else {
        setIsFiltering(false);
      }
    }
  };

  const fetchColleges = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/colleges/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      console.log('Colleges API Response:', response.data);

      // Handle different response formats
      let collegeData = [];
      if (response.data?.data?.results) {
        collegeData = response.data.data.results;
      } else if (response.data?.results) {
        collegeData = response.data.results;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        collegeData = response.data.data;
      } else if (Array.isArray(response.data)) {
        collegeData = response.data;
      }

      console.log('Processed colleges:', collegeData);
      // Ensure collegeData is an array
      setColleges(Array.isArray(collegeData) ? collegeData : []);
    } catch (err) {
      console.error("Error fetching colleges:", err);
      setColleges([]); // Set to empty array on error
    }
  };

  if (loading) {
    return (
      <Layout title="Dashboard" content="container">
        <Block>
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 fs-5">Loading dashboard...</p>
          </div>
        </Block>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Dashboard" content="container">
        <Block>
          <Card className="border-danger shadow-sm">
            <Card.Body>
              <div className="text-center py-5">
                <Icon name="alert-circle" className="text-danger" style={{ fontSize: "4rem" }} />
                <h4 className="mt-3 text-danger">Error Loading Dashboard</h4>
                <p className="text-muted">{error}</p>
                <button className="btn btn-primary" onClick={fetchDashboardData}>
                  <Icon name="refresh" className="me-2" />
                  Retry
                </button>
              </div>
            </Card.Body>
          </Card>
        </Block>
      </Layout>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { summary, weekly_student_signup, weekly_challenge_trends, weekly_certification_trends, top_students, top_cert_students } = dashboardData;

  // Prepare chart data for weekly student signup
  const signupChartData = {
    labels: weekly_student_signup?.slice().reverse().map((week) => {
      const start = new Date(week.week_start);
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    }) || [],
    datasets: [
      {
        label: "New Students",
        data: weekly_student_signup?.slice().reverse().map((week) => week.new_students) || [],
        backgroundColor: "rgba(79, 70, 229, 0.8)",
        borderColor: "rgba(79, 70, 229, 1)",
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  // Prepare chart data for challenge trends
  const challengeChartData = {
    labels: weekly_challenge_trends?.slice().reverse().map((week) => {
      const start = new Date(week.week_start);
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    }) || [],
    datasets: [
      {
        label: "Challenge Submissions",
        data: weekly_challenge_trends?.slice().reverse().map((week) => week.submissions) || [],
        backgroundColor: "rgba(236, 72, 153, 0.1)",
        borderColor: "rgba(236, 72, 153, 1)",
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "rgba(236, 72, 153, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  // Prepare chart data for certification trends
  const certificationChartData = {
    labels: weekly_certification_trends?.slice().reverse().map((week) => {
      const start = new Date(week.week_start);
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    }) || [],
    datasets: [
      {
        label: "Certifications Completed",
        data: weekly_certification_trends?.slice().reverse().map((week) => week.completed) || [],
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "rgba(16, 185, 129, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  // Top courses bar chart
  const topCoursesData = {
    labels: summary?.top_courses_list?.slice(0, 5).map((course) => course.title) || [],
    datasets: [
      {
        label: "Students Enrolled",
        data: summary?.top_courses_list?.slice(0, 5).map((course) => course.enrollments) || [],
        backgroundColor: [
          "rgba(79, 70, 229, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(251, 191, 36, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(59, 130, 246, 0.8)",
        ],
        borderColor: [
          "rgba(79, 70, 229, 1)",
          "rgba(236, 72, 153, 1)",
          "rgba(251, 191, 36, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(59, 130, 246, 1)",
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 13,
        },
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          padding: 10,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          padding: 10,
        },
      },
    },
  };

  const topCoursesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return `Students Enrolled: ${context.parsed.x}`;
          }
        }
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          padding: 10,
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          padding: 10,
        },
      },
    },
  };

  // Stat card component
  const StatCard = ({ title, value, icon, color, gradient, trend, trendValue, link }) => {
    const cardContent = (
      <Card className="border-0 shadow-sm h-100" style={{
        background: gradient || `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        transition: "all 0.3s ease",
        cursor: link ? "pointer" : "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.08)";
      }}>
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div className="flex-grow-1">
              <h6 className="mb-2 text-uppercase" style={{ fontSize: "0.75rem", fontWeight: "600", color: "#ffffff", opacity: 0.9 }}>
                {title}
              </h6>
              <h2 className="mb-0 fw-bold" style={{ fontSize: "2rem", color: "#ffffff" }}>
                {value || 0}
              </h2>
              {trend && (
                <small className="d-flex align-items-center mt-2" style={{ color: "#ffffff", opacity: 0.9 }}>
                  <Icon name={trend === "up" ? "arrow-up" : "arrow-down"} className="me-1" />
                  {trendValue}
                </small>
              )}
            </div>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "60px",
                height: "60px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "#ffffff",
              }}
            >
              <Icon name={icon} style={{ fontSize: "1.5rem" }} />
            </div>
          </div>
        </Card.Body>
      </Card>
    );

    return link ? (
      <Link to={link} style={{ textDecoration: "none" }}>
        {cardContent}
      </Link>
    ) : cardContent;
  };

  return (
    <Layout title="Dashboard" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2" className="fw-bold">Admin Dashboard</Block.Title>
            <p className="text-muted mb-0">Comprehensive overview of system analytics and performance metrics</p>
          </Block.HeadContent>
          <Block.HeadContent>
            <button className="btn btn-primary" onClick={fetchDashboardData}>
              <Icon name="refresh" className="me-2" />
              Refresh
            </button>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      {/* Primary Stats Cards */}
      <Block>
        <Row className="g-gs">
          <Col lg="3" sm="6">
            <StatCard
              title="Total Students"
              value={summary?.total_students || 0}
              icon="users"
              color="#4F46E5"
              gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              link="/Students/manage"
            />
          </Col>
          <Col lg="3" sm="6">
            <StatCard
              title="Total Courses"
              value={summary?.total_courses || 0}
              icon="book"
              color="#10B981"
              gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
              link="/Courses/list-course"
            />
          </Col>
          <Col lg="3" sm="6">
            <StatCard
              title="Total Challenges"
              value={summary?.total_challenges || 0}
              icon="code"
              color="#EC4899"
              gradient="linear-gradient(135deg, #ec4899 0%, #be185d 100%)"
              link="/CodingChallenges/list-challenge"
            />
          </Col>
          <Col lg="3" sm="6">
            <StatCard
              title="Total Certifications"
              value={summary?.total_certifications || 0}
              icon="award"
              color="#F59E0B"
              gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
              link="/Certificates/list-certificate"
            />
          </Col>
        </Row>
      </Block>

      {/* Secondary Stats */}
      <Block>
        <Row className="g-gs">
          <Col lg="3" sm="4" xs="6">
            <Link to="/University/list-University" style={{ textDecoration: "none" }}>
              <Card className="text-center border-0 shadow-sm h-100" style={{ cursor: "pointer", transition: "all 0.3s ease" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.08)";
                }}>
                <Card.Body className="p-3">
                  <div className="mb-2" style={{ fontSize: "1.5rem", color: "#6B7280" }}>
                    <Icon name="building" />
                  </div>
                  <h5 className="mb-0 fw-bold">{summary?.total_universities || 0}</h5>
                  <small className="text-muted">Universities</small>
                </Card.Body>
              </Card>
            </Link>
          </Col>
          <Col lg="3" sm="4" xs="6">
            <Link to="/Organizations/list-organization" style={{ textDecoration: "none" }}>
              <Card className="text-center border-0 shadow-sm h-100" style={{ cursor: "pointer", transition: "all 0.3s ease" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.08)";
                }}>
                <Card.Body className="p-3">
                  <div className="mb-2" style={{ fontSize: "1.5rem", color: "#6B7280" }}>
                    <Icon name="briefcase" />
                  </div>
                  <h5 className="mb-0 fw-bold">{summary?.total_organizations || 0}</h5>
                  <small className="text-muted">Organizations</small>
                </Card.Body>
              </Card>
            </Link>
          </Col>
          <Col lg="3" sm="4" xs="6">
            <Link to="/Colleges/list-college" style={{ textDecoration: "none" }}>
              <Card className="text-center border-0 shadow-sm h-100" style={{ cursor: "pointer", transition: "all 0.3s ease" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.08)";
                }}>
                <Card.Body className="p-3">
                  <div className="mb-2" style={{ fontSize: "1.5rem", color: "#6B7280" }}>
                    <Icon name="home-alt" />
                  </div>
                  <h5 className="mb-0 fw-bold">{summary?.total_colleges || 0}</h5>
                  <small className="text-muted">Colleges</small>
                </Card.Body>
              </Card>
            </Link>
          </Col>
          <Col lg="3" sm="4" xs="6">
            <Card className="text-center border-0 shadow-sm h-100" style={{ transition: "all 0.3s ease" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.08)";
              }}>
              <Card.Body className="p-3">
                <div className="mb-2" style={{ fontSize: "1.5rem", color: "#6B7280" }}>
                  <Icon name="check-circle" />
                </div>
                <h5 className="mb-0 fw-bold">{summary?.cert_pass_rate || 0}%</h5>
                <small className="text-muted">Pass Rate</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Block>

      {/* Charts Row */}
      <Block>
        <Row className="g-gs">
          <Col lg="8">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <Card.Title tag="h5" className="mb-0 fw-bold">Weekly Student Signups</Card.Title>
                  <Badge bg="primary" className="px-3 py-2">Last 8 Weeks</Badge>
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                <div style={{ height: "350px" }}>
                  <Bar data={signupChartData} options={chartOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg="4">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <Card.Title tag="h5" className="mb-0 fw-bold">Top Courses</Card.Title>
                  <Badge bg="info" className="px-3 py-2">By Enrollments</Badge>
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                <div style={{ height: "350px" }}>
                  <Bar data={topCoursesData} options={topCoursesChartOptions} />
                </div>
                {summary?.top_courses_list?.length > 0 && (
                  <div className="mt-4">
                    <h6 className="mb-3 text-muted text-uppercase" style={{ fontSize: "0.75rem", fontWeight: "600" }}>
                      Enrollment Details
                    </h6>
                    {summary.top_courses_list.slice(0, 5).map((course, idx) => (
                      <div key={idx} className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                        <div className="d-flex align-items-center flex-grow-1">
                          <div
                            className="rounded me-3"
                            style={{
                              width: "4px",
                              height: "30px",
                              backgroundColor: [
                                "rgba(79, 70, 229, 1)",
                                "rgba(236, 72, 153, 1)",
                                "rgba(251, 191, 36, 1)",
                                "rgba(16, 185, 129, 1)",
                                "rgba(59, 130, 246, 1)",
                              ][idx]
                            }}
                          />
                          <span className="text-truncate" style={{ maxWidth: "150px" }} title={course.title}>
                            {course.title}
                          </span>
                        </div>
                        <div className="text-end">
                          <Badge bg="primary" className="px-3 py-2">
                            <Icon name="users" className="me-1" style={{ fontSize: "0.85rem" }} />
                            {course.enrollments} Students
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Block>

      {/* Trend Charts */}
      <Block>
        <Row className="g-gs">
          <Col lg="6">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <Card.Title tag="h5" className="mb-0 fw-bold">Challenge Submissions</Card.Title>
                  <Icon name="code" className="text-primary" />
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                <div style={{ height: "300px" }}>
                  <Line data={challengeChartData} options={chartOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg="6">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <Card.Title tag="h5" className="mb-0 fw-bold">Certification Completions</Card.Title>
                  <Icon name="award" className="text-success" />
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                <div style={{ height: "300px" }}>
                  <Line data={certificationChartData} options={chartOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Block>

      {/* Top Students Tables */}
      <Block>
        <Row className="g-gs">
          <Col lg="6">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom py-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Card.Title tag="h5" className="mb-0 fw-bold">
                    <Icon name="trophy" className="me-2 text-warning" />
                    Top Coding Students
                  </Card.Title>
                  <Badge bg="warning" className="px-3 py-2">Leaderboard</Badge>
                </div>
                <Row>
                  <Col md="6">
                    <Form.Group>
                      <Form.Select
                        value={selectedCollege}
                        onChange={(e) => setSelectedCollege(e.target.value)}
                        size="sm"
                        disabled={isFiltering}
                      >
                        <option value="">All Colleges</option>
                        {Array.isArray(colleges) && colleges.map((college) => (
                          <option key={college.id} value={college.id}>
                            {college.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  {isFiltering && (
                    <Col md="6" className="d-flex align-items-center">
                      <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                        <span className="visually-hidden">Filtering...</span>
                      </div>
                      <small className="text-muted">Filtering...</small>
                    </Col>
                  )}
                </Row>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0 ps-4" style={{ width: "60px" }}>Rank</th>
                        <th className="border-0">Student</th>
                        <th className="border-0 text-center">Solved</th>
                        <th className="border-0 text-center">Points</th>
                        <th className="border-0 text-center pe-4">Streak</th>
                      </tr>
                    </thead>
                    <tbody>
                      {top_students?.length > 0 ? (
                        top_students.slice(0, 10).map((student, index) => (
                          <tr key={index} style={{ transition: "background-color 0.2s" }}>
                            <td className="ps-4">
                              {index === 0 ? (
                                <Badge bg="warning" className="px-3 py-2">
                                  <Icon name="trophy" className="me-1" />
                                  1st
                                </Badge>
                              ) : index === 1 ? (
                                <Badge bg="secondary" className="px-3 py-2">
                                  <Icon name="medal" className="me-1" />
                                  2nd
                                </Badge>
                              ) : index === 2 ? (
                                <Badge bg="info" className="px-3 py-2">
                                  <Icon name="medal" className="me-1" />
                                  3rd
                                </Badge>
                              ) : (
                                <span className="text-muted">#{index + 1}</span>
                              )}
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center me-2" style={{ width: "32px", height: "32px" }}>
                                  <span className="text-primary fw-bold" style={{ fontSize: "0.75rem" }}>
                                    {(student.full_name || student.username || "U")[0].toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="fw-semibold">{student.full_name || student.username}</div>
                                </div>
                              </div>
                            </td>
                            <td className="text-center">
                              <Badge bg="success" className="px-3 py-1">{student.problems_solved || 0}</Badge>
                            </td>
                            <td className="text-center fw-semibold">{student.total_score || 0}</td>
                            <td className="text-center pe-4">
                              <Badge bg="primary" className="px-3 py-1">
                                <Icon name="fire" className="me-1" />
                                {student.current_streak || 0}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center text-muted py-5">
                            <Icon name="inbox" className="mb-2" style={{ fontSize: "2rem" }} />
                            <div>No data available</div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg="6">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom py-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Card.Title tag="h5" className="mb-0 fw-bold">
                    <Icon name="award" className="me-2 text-success" />
                    Top Certification Achievers
                  </Card.Title>
                  <Badge bg="success" className="px-3 py-2">Certified</Badge>
                </div>
                <Row>
                  <Col md="6">
                    <Form.Group>
                      <Form.Select
                        value={selectedCollege}
                        onChange={(e) => setSelectedCollege(e.target.value)}
                        size="sm"
                        disabled={isFiltering}
                      >
                        <option value="">All Colleges</option>
                        {Array.isArray(colleges) && colleges.map((college) => (
                          <option key={college.id} value={college.id}>
                            {college.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  {isFiltering && (
                    <Col md="6" className="d-flex align-items-center">
                      <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                        <span className="visually-hidden">Filtering...</span>
                      </div>
                      <small className="text-muted">Filtering...</small>
                    </Col>
                  )}
                </Row>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0 ps-4" style={{ width: "60px" }}>Rank</th>
                        <th className="border-0">Student</th>
                        <th className="border-0">Certification</th>
                        <th className="border-0 text-center pe-4">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {top_cert_students?.length > 0 ? (
                        top_cert_students.slice(0, 10).map((student, index) => (
                          <tr key={index} style={{ transition: "background-color 0.2s" }}>
                            <td className="ps-4">
                              {index === 0 ? (
                                <Badge bg="warning" className="px-3 py-2">
                                  <Icon name="trophy" className="me-1" />
                                  1st
                                </Badge>
                              ) : index === 1 ? (
                                <Badge bg="secondary" className="px-3 py-2">
                                  <Icon name="medal" className="me-1" />
                                  2nd
                                </Badge>
                              ) : index === 2 ? (
                                <Badge bg="info" className="px-3 py-2">
                                  <Icon name="medal" className="me-1" />
                                  3rd
                                </Badge>
                              ) : (
                                <span className="text-muted">#{index + 1}</span>
                              )}
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center me-2" style={{ width: "32px", height: "32px" }}>
                                  <span className="text-success fw-bold" style={{ fontSize: "0.75rem" }}>
                                    {(student.full_name || student.username || "U")[0].toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="fw-semibold">{student.full_name || student.username}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="text-truncate d-inline-block" style={{ maxWidth: "150px" }}>
                                {student.cert_name || "—"}
                              </span>
                            </td>
                            <td className="text-center pe-4">
                              <Badge bg={student.score >= 80 ? "success" : student.score >= 60 ? "warning" : "danger"} className="px-3 py-1">
                                {student.score}%
                              </Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center text-muted py-5">
                            <Icon name="inbox" className="mb-2" style={{ fontSize: "2rem" }} />
                            <div>No data available</div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Block>

      {/* Performance Metrics */}
      <Block>
        <Row className="g-gs">
          <Col lg="12">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom py-3">
                <Card.Title tag="h5" className="mb-0 fw-bold">
                  <Icon name="activity" className="me-2 text-primary" />
                  System Performance Metrics
                </Card.Title>
              </Card.Header>
              <Card.Body className="p-4">
                <Row className="g-4">
                  <Col md="4">
                    <div className="text-center p-4 border rounded-3 h-100" style={{ background: "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)" }}>
                      <div className="mb-3" style={{ fontSize: "2rem", color: "#667eea" }}>
                        <Icon name="check-circle" />
                      </div>
                      <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: "0.75rem", fontWeight: "600" }}>
                        Certification Pass Rate
                      </h6>
                      <h2 className="mb-0 fw-bold" style={{ color: "#667eea" }}>
                        {summary?.cert_pass_rate || 0}%
                      </h2>
                      <ProgressBar
                        now={summary?.cert_pass_rate || 0}
                        variant="primary"
                        className="mt-3"
                        style={{ height: "8px", borderRadius: "4px" }}
                      />
                    </div>
                  </Col>
                  <Col md="4">
                    <div className="text-center p-4 border rounded-3 h-100" style={{ background: "linear-gradient(135deg, #ec489915 0%, #be185d15 100%)" }}>
                      <div className="mb-3" style={{ fontSize: "2rem", color: "#ec4899" }}>
                        <Icon name="book-open" />
                      </div>
                      <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: "0.75rem", fontWeight: "600" }}>
                        Avg Enrollments/Student
                      </h6>
                      <h2 className="mb-0 fw-bold" style={{ color: "#ec4899" }}>
                        {summary?.avg_enrollments_per_student?.toFixed(1) || 0}
                      </h2>
                      <div className="mt-3 text-muted small">
                        <Icon name="book" className="me-1" />
                        Per student average
                      </div>
                    </div>
                  </Col>
                  <Col md="4">
                    <div className="text-center p-4 border rounded-3 h-100" style={{ background: "linear-gradient(135deg, #f59e0b15 0%, #d9770615 100%)" }}>
                      <div className="mb-3" style={{ fontSize: "2rem", color: "#f59e0b" }}>
                        <Icon name="file-text" />
                      </div>
                      <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: "0.75rem", fontWeight: "600" }}>
                        Total Cert Attempts
                      </h6>
                      <h2 className="mb-0 fw-bold" style={{ color: "#f59e0b" }}>
                        {summary?.total_cert_attempts || 0}
                      </h2>
                      <div className="mt-3 text-muted small">
                        <Icon name="clock" className="me-1" />
                        All time attempts
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Block>
    </Layout>
  );
}

export default Dashboard;
