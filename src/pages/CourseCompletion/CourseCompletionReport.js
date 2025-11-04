import React, { useState, useEffect } from "react";
import { Card, Row, Col, Badge, Table, Tabs, Tab, Form } from "react-bootstrap";
import axios from "axios";
import DataTable from "react-data-table-component";
import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import { API_BASE_URL } from "../../services/apiBase";
import Swal from "sweetalert2";

function CourseCompletionReport() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [activeTab, setActiveTab] = useState("completed");
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState("");

  const authToken = localStorage.getItem("authToken") || localStorage.getItem("access_token");

  // Calculate metrics using useMemo to optimize performance
  const metrics = React.useMemo(() => {
    if (!reportData?.completed_courses) return {
      totalStudents: 0,
      averageProgress: 0,
      completionRate: 0,
      totalHours: 0
    };

    const totalEnrollments = (reportData.completed_courses || []).length + (reportData.students_without_certificates || []).length;
    const completedCount = (reportData.completed_courses || []).length;

    // Calculate total progress including both completed and in-progress courses
    const allCourses = [
      ...(reportData.completed_courses || []),
      ...(reportData.students_without_certificates || [])
    ];

    const totalProgress = allCourses.reduce((sum, course) => sum + (course.progress_percentage || 0), 0);
    
    // Get unique student count
    const uniqueStudents = new Set(allCourses.map(c => c.student_email));

    return {
      totalStudents: uniqueStudents.size,
      averageProgress: totalEnrollments ? (totalProgress / totalEnrollments).toFixed(1) : 0,
      completionRate: totalEnrollments ? ((completedCount / totalEnrollments) * 100).toFixed(1) : 0,
      totalHours: allCourses.reduce((sum, course) => sum + (course.estimated_hours || 0), 0)
    };
  }, [reportData]);

  useEffect(() => {
    fetchReportData();
    fetchColleges();
  }, [selectedCollege]);

  const fetchColleges = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/colleges/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setColleges(response.data?.results || response.data?.data || []);
    } catch (error) {
      console.error("Error fetching colleges:", error);
    }
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = selectedCollege ? { college_id: selectedCollege } : {};
      
      // First try the completion report endpoint
      let response = await axios.get(`${API_BASE_URL}/api/admin/dashboard/completion-report/`, {
        params,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // If no data found, try fetching from enrollments
      if (!response.data?.data?.completed_courses?.length) {
        const enrollResponse = await axios.get(`${API_BASE_URL}/api/student/enrollments/`, {
          params,
          headers: { Authorization: `Bearer ${authToken}` },
        });

        // Process enrollment data to find completed courses
        const enrollments = enrollResponse.data?.results || [];
        const completedCourses = enrollments.filter(enroll => enroll.progress_percentage >= 100);

        if (completedCourses.length > 0) {
          response.data = {
            data: {
              completed_courses: completedCourses,
              students_with_certificates: [],
              completed_without_certificates: completedCourses,
              summary: {
                total_completed_courses: completedCourses.length,
                total_completed_without_certs: completedCourses.length,
                total_students_with_certs: 0,
                unique_students_certified: 0,
                unique_students_completed: new Set(completedCourses.map(c => c.student_email)).size
              }
            },
            message: "Course completion report fetched successfully.",
            success: true
          };
        }
      }

      // Debug log to check the response data
      console.log('Report Data:', response.data);

      // Ensure we're getting the data correctly
      const data = response.data?.data || response.data;
      
      // Make sure completed_courses array exists
      if (!data.completed_courses) {
        data.completed_courses = [];
      }
      
      // Add courses with 100% progress to completed_courses if they're not already there
      if (data.students_without_certificates) {
        const completedButNotListed = data.students_without_certificates.filter(
          course => course.progress_percentage >= 100 && 
            !data.completed_courses.some(
              completedCourse => 
                completedCourse.student_email === course.student_email && 
                completedCourse.course_id === course.course_id
            )
        );
        
        data.completed_courses = [...data.completed_courses, ...completedButNotListed];
      }

      setReportData(data);
    } catch (error) {
      console.error("Error fetching report:", error);
      Swal.fire("Error", "Failed to load completion report", "error");
    } finally {
      setLoading(false);
    }
  };

  const completedColumns = [
    {
      name: "Student Name",
      selector: (row) => row.student_name,
      sortable: true,
      wrap: true,
    },
    {
      name: "Email",
      selector: (row) => row.student_email,
      sortable: true,
    },
    {
      name: "College",
      selector: (row) => row.college_name || "—",
      sortable: true,
    },
    {
      name: "Course",
      selector: (row) => row.course_title,
      sortable: true,
      wrap: true,
    },
    {
      name: "Progress",
      selector: (row) => row.progress_percentage,
      sortable: true,
      cell: (row) => (
        <Badge bg={row.progress_percentage >= 100 ? "success" : "warning"}>
          {row.progress_percentage}%
        </Badge>
      ),
    },
    {
      name: "Completed At",
      selector: (row) => row.completed_at ? new Date(row.completed_at).toLocaleDateString() : "—",
      sortable: true,
    },
    {
      name: "Certificate",
      cell: (row) => (
        <Badge bg={row.has_certificate ? "success" : "secondary"}>
          {row.has_certificate ? "Yes" : "No"}
        </Badge>
      ),
    },
  ];

  const certificatesColumns = [
    {
      name: "Student Name",
      selector: (row) => row.student_name,
      sortable: true,
      wrap: true,
    },
    {
      name: "Email",
      selector: (row) => row.student_email,
      sortable: true,
    },
    {
      name: "College",
      selector: (row) => row.college_name || "—",
      sortable: true,
    },
    {
      name: "Course",
      selector: (row) => row.course_title,
      sortable: true,
      wrap: true,
    },
    {
      name: "Certification",
      selector: (row) => row.certification_title,
      sortable: true,
      wrap: true,
    },
    {
      name: "Score",
      selector: (row) => row.score,
      sortable: true,
      cell: (row) => (
        <Badge bg={row.score >= 80 ? "success" : row.score >= 60 ? "warning" : "danger"}>
          {row.score}%
        </Badge>
      ),
    },
    {
      name: "Issued At",
      selector: (row) => row.certificate_issued_at ? new Date(row.certificate_issued_at).toLocaleDateString() : "—",
      sortable: true,
    },
  ];

  const withoutCertColumns = [
    {
      name: "Student Name",
      selector: (row) => row.student_name,
      sortable: true,
      wrap: true,
    },
    {
      name: "Email",
      selector: (row) => row.student_email,
      sortable: true,
    },
    {
      name: "College",
      selector: (row) => row.college_name || "—",
      sortable: true,
    },
    {
      name: "Course",
      selector: (row) => row.course_title,
      sortable: true,
      wrap: true,
    },
    {
      name: "Progress",
      selector: (row) => row.progress_percentage,
      sortable: true,
      cell: (row) => (
        <Badge bg="success">{row.progress_percentage}%</Badge>
      ),
    },
    {
      name: "Completed At",
      selector: (row) => row.completed_at ? new Date(row.completed_at).toLocaleDateString() : "—",
      sortable: true,
    },
    {
      name: "Status",
      cell: (row) => (
        <Badge bg={row.certification_exists ? "warning" : "info"}>
          {row.certification_exists ? "Cert Available" : "No Cert"}
        </Badge>
      ),
    },
  ];

  if (loading) {
    return (
      <Layout title="Course Completion Report" content="container">
        <Block>
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </Block>
      </Layout>
    );
  }

  return (
    <Layout title="Course Completion Report" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Course Completion & Certification Report</Block.Title>
            <p className="text-muted">Track course completions and certificate issuance</p>
          </Block.HeadContent>
          <Block.HeadContent>
            <Form.Select
              style={{ width: "250px" }}
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
            >
              <option value="">All Colleges</option>
              {colleges.map((college) => (
                <option key={college.id} value={college.id}>
                  {college.name}
                </option>
              ))}
            </Form.Select>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      {reportData?.summary && (
        <Block>
          <Row className="g-gs">
            <Col lg="3" sm="6">
              <Card className="border-0 shadow-sm text-center">
                <Card.Body className="p-4">
                  <Icon name="check-circle" className="text-success mb-2" style={{ fontSize: "2rem" }} />
                  <h3 className="mb-0">{reportData.summary.total_completed_courses}</h3>
                  <p className="text-muted mb-0">Completed Courses</p>
                </Card.Body>
              </Card>
            </Col>
            <Col lg="3" sm="6">
              <Card className="border-0 shadow-sm text-center">
                <Card.Body className="p-4">
                  <Icon name="award" className="text-warning mb-2" style={{ fontSize: "2rem" }} />
                  <h3 className="mb-0">{reportData.summary.total_students_with_certs}</h3>
                  <p className="text-muted mb-0">With Certificates</p>
                </Card.Body>
              </Card>
            </Col>
            <Col lg="3" sm="6">
              <Card className="border-0 shadow-sm text-center">
                <Card.Body className="p-4">
                  <Icon name="alert-circle" className="text-danger mb-2" style={{ fontSize: "2rem" }} />
                  <h3 className="mb-0">{reportData.summary.total_completed_without_certs}</h3>
                  <p className="text-muted mb-0">Without Certificates</p>
                </Card.Body>
              </Card>
            </Col>
            <Col lg="3" sm="6">
              <Card className="border-0 shadow-sm text-center">
                <Card.Body className="p-4">
                  <Icon name="users" className="text-primary mb-2" style={{ fontSize: "2rem" }} />
                  <h3 className="mb-0">{reportData.summary.unique_students_certified}</h3>
                  <p className="text-muted mb-0">Unique Certified</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Block>
      )}

      {/* Overview Cards */}
      <Block>
        <Row className="g-gs">
          <Col sm="6" lg="3">
            <Card>
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="rounded-circle d-flex align-items-center justify-content-center" 
                       style={{ width: 48, height: 48, background: '#e3f2fd' }}>
                    <Icon name="users" className="text-primary fs-4" />
                  </div>
                  <div className="ms-3">
                    <div className="fs-6 text-muted mb-1">Total Students</div>
                    <h4 className="mb-0">{metrics.totalStudents}</h4>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col sm="6" lg="3">
            <Card>
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="rounded-circle d-flex align-items-center justify-content-center" 
                       style={{ width: 48, height: 48, background: '#e8f5e9' }}>
                    <Icon name="activity" className="text-success fs-4" />
                  </div>
                  <div className="ms-3">
                    <div className="fs-6 text-muted mb-1">Average Progress</div>
                    <h4 className="mb-0">{metrics.averageProgress}%</h4>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col sm="6" lg="3">
            <Card>
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="rounded-circle d-flex align-items-center justify-content-center" 
                       style={{ width: 48, height: 48, background: '#e3f2fd' }}>
                    <Icon name="check-circle" className="text-info fs-4" />
                  </div>
                  <div className="ms-3">
                    <div className="fs-6 text-muted mb-1">Completion Rate</div>
                    <h4 className="mb-0">{metrics.completionRate}%</h4>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col sm="6" lg="3">
            <Card>
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="rounded-circle d-flex align-items-center justify-content-center" 
                       style={{ width: 48, height: 48, background: '#fff8e1' }}>
                    <Icon name="clock" className="text-warning fs-4" />
                  </div>
                  <div className="ms-3">
                    <div className="fs-6 text-muted mb-1">Total Hours</div>
                    <h4 className="mb-0">{metrics.totalHours}h</h4>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Block>

      {/* Detailed Tables */}
      <Block>
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="border-bottom"
            >
              <Tab
                eventKey="completed"
                title={
                  <span>
                    <Icon name="check-circle" className="me-2" />
                    Completed Courses ({reportData?.completed_courses?.length || 0})
                  </span>
                }
              >
                <div className="p-4">
                  <DataTable
                    columns={completedColumns}
                    data={reportData?.completed_courses || []}
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[10, 20, 50]}
                    highlightOnHover
                    responsive
                    noDataComponent="No completed courses found"
                  />
                </div>
              </Tab>

              <Tab
                eventKey="certificates"
                title={
                  <span>
                    <Icon name="award" className="me-2" />
                    With Certificates ({reportData?.students_with_certificates?.length || 0})
                  </span>
                }
              >
                <div className="p-4">
                  <DataTable
                    columns={certificatesColumns}
                    data={reportData?.students_with_certificates || []}
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[10, 20, 50]}
                    highlightOnHover
                    responsive
                    noDataComponent="No certificates found"
                  />
                </div>
              </Tab>

              <Tab
                eventKey="without-cert"
                title={
                  <span>
                    <Icon name="alert-circle" className="me-2" />
                    Without Certificates ({reportData?.students_without_certificates?.length || 0})
                  </span>
                }
              >
                <div className="p-4">
                  <DataTable
                    columns={withoutCertColumns}
                    data={reportData?.students_without_certificates || []}
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[10, 20, 50]}
                    highlightOnHover
                    responsive
                    noDataComponent="No records found"
                  />
                </div>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Block>
    </Layout>
  );
}

export default CourseCompletionReport;