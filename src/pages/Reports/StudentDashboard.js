import { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Spinner, Badge, ProgressBar, Table, Form, Button, Alert } from "react-bootstrap";
import { Icon } from "../../components";
import { API_BASE_URL } from "../../services/apiBase";
import axios from "axios";
import Layout from "../../layout/default";
import Block from "../../components/Block/Block";

function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState("");

  const authToken = localStorage.getItem("authToken");

  // Fetch colleges
  const fetchColleges = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/colleges/`, {
        headers: { Authorization: `Bearer ${authToken}` },
        params: { per_page: 1000 }
      });
      setColleges(response.data?.data || response.data?.results || []);
    } catch (error) {
      console.error("Error fetching colleges:", error);
    }
  }, [authToken]);

  // Fetch all students
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCollege) {
        params.college_id = selectedCollege;
      }

      const response = await axios.get(`${API_BASE_URL}/api/admin/dashboard/students-report/`, {
        headers: { Authorization: `Bearer ${authToken}` },
        params
      });

      const data = response.data?.students || response.data?.data || [];
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  }, [authToken, selectedCollege]);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredStudents(
      students.filter(
        (student) =>
          (student.name || "").toLowerCase().includes(query) ||
          (student.email || "").toLowerCase().includes(query) ||
          (student.college_name || "").toLowerCase().includes(query)
      )
    );
  };

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setDetailsLoading(true);

    try {
      // Fetch submission stats from backend
      let codingStats = { attempted: 0, solved: 0, failed: 0, success_rate: 0 };
      let companyStats = { attempted: 0, solved: 0, failed: 0, success_rate: 0 };
      let enrollments = [];

      try {
        const submissionResponse = await axios.get(`${API_BASE_URL}/api/admin/dashboard/students/${student.id}/submissions/`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        if (submissionResponse.data?.data) {
          const data = submissionResponse.data.data;
          codingStats = data.coding_challenges || codingStats;
          companyStats = data.company_challenges || companyStats;
          enrollments = data.enrollments || [];
        }
      } catch (err) {
        console.warn("Could not fetch submission stats:", err);
      }

      // Calculate course stats from enrollments
      const totalCourses = enrollments.length || student.total_courses || 0;
      const coursesCompleted = enrollments.filter(e => parseFloat(e.progress_percentage) === 100).length || student.courses_completed || 0;
      const averageProgress = totalCourses > 0
        ? Math.round(enrollments.reduce((sum, e) => sum + (parseFloat(e.progress_percentage) || 0), 0) / totalCourses)
        : student.completion_percentage || 0;

      // Total stats
      const totalAttempted = codingStats.attempted + companyStats.attempted;
      const totalSolved = codingStats.solved + companyStats.solved;
      const totalFailed = codingStats.failed + companyStats.failed;

      const details = {
        student_id: student.id,
        student_name: student.name,
        student_email: student.email,
        total_courses: totalCourses,
        courses_completed: coursesCompleted,
        average_progress: averageProgress,
        enrollments: enrollments,
        coding_challenges: codingStats,
        company_challenges: companyStats,
        coding_stats: {
          total_attempted: totalAttempted,
          total_solved: totalSolved,
          total_failed: totalFailed,
          success_rate: totalAttempted > 0 ? Math.round((totalSolved / totalAttempted) * 100) : 0,
        }
      };

      setStudentDetails(details);
    } catch (error) {
      console.error("Error fetching student details:", error);
      // Fallback with default values
      const details = {
        student_id: student.id,
        student_name: student.name,
        student_email: student.email,
        total_courses: student.total_courses || 0,
        courses_completed: student.courses_completed || 0,
        average_progress: student.completion_percentage || 0,
        enrollments: [],
        coding_challenges: { attempted: 0, solved: 0, failed: 0, success_rate: 0 },
        company_challenges: { attempted: 0, solved: 0, failed: 0, success_rate: 0 },
        coding_stats: { total_attempted: 0, total_solved: 0, total_failed: 0, success_rate: 0 }
      };
      setStudentDetails(details);
    } finally {
      setDetailsLoading(false);
    }
  };

  const StudentListTable = () => (
    <div>
      <Row className="g-3 mb-3">
        <Col md={3}>
          <Form.Select
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
          >
            <option value="">All Colleges</option>
            {colleges.map(college => (
              <option key={college.id} value={college.id}>{college.name}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Search student by name or email..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </Col>
        <Col md={3}>
          <Button variant="outline-primary" className="w-100" onClick={fetchStudents}>
            <Icon name="refresh-cw" /> Refresh
          </Button>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading students...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <Alert variant="info">
          {searchQuery ? "No students found matching your search." : "No students found."}
        </Alert>
      ) : (
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th className="border-0 ps-4">Student Name</th>
                <th className="border-0">Email</th>
                <th className="border-0">College</th>
                <th className="border-0 text-center">Courses Completed</th>
                <th className="border-0 text-center">Total Courses</th>
                <th className="border-0 text-center">Completion %</th>
                <th className="border-0 text-center pe-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td className="ps-4">
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center me-2"
                        style={{ width: "40px", height: "40px" }}
                      >
                        <span className="text-primary fw-bold">
                          {student.name && student.name[0] ? student.name[0].toUpperCase() : '?'}
                        </span>
                      </div>
                      <span className="fw-semibold">{student.name || 'N/A'}</span>
                    </div>
                  </td>
                  <td>{student.email || 'N/A'}</td>
                  <td>{student.college_name || 'N/A'}</td>
                  <td className="text-center">
                    <Badge bg={student.courses_completed > 0 ? "success" : "secondary"}>
                      {student.courses_completed || 0}
                    </Badge>
                  </td>
                  <td className="text-center">
                    <Badge bg="info">{student.total_courses || 0}</Badge>
                  </td>
                  <td className="text-center">
                    <Badge bg={
                      student.completion_percentage >= 75 ? "success" :
                      student.completion_percentage >= 50 ? "warning" : "secondary"
                    }>
                      {student.completion_percentage || 0}%
                    </Badge>
                  </td>
                  <td className="text-center pe-4">
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => handleSelectStudent(student)}
                    >
                      <Icon name="view" /> View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );

  const StudentDetailsView = () => (
    <div>
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-circle bg-light border border-primary d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: "80px", height: "80px" }}
          >
            <span style={{ fontSize: "2rem", fontWeight: "bold", color: "#4f46e5" }}>
              {studentDetails?.student_name && studentDetails.student_name[0] ? studentDetails.student_name[0].toUpperCase() : '?'}
            </span>
          </div>
          <div>
            <h3 className="mb-0">{studentDetails?.student_name}</h3>
            <small className="text-muted">{studentDetails?.student_email}</small>
          </div>
        </div>
        <Button
          variant="outline-secondary"
          onClick={() => {
            setSelectedStudent(null);
            setStudentDetails(null);
          }}
        >
          <Icon name="arrow-left" /> Back to List
        </Button>
      </div>

      {detailsLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading student details...</p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <Row className="g-3 mb-4">
            <Col lg={3} md={6}>
              <Card className="text-center border-0 shadow-sm h-100">
                <Card.Body className="p-3">
                  <Icon name="book" size="2x" className="text-primary mb-2" />
                  <h5 className="mb-0 fw-bold">{studentDetails?.total_courses}</h5>
                  <small className="text-muted">Courses Enrolled</small>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6}>
              <Card className="text-center border-0 shadow-sm h-100">
                <Card.Body className="p-3">
                  <Icon name="check-circle" size="2x" className="text-success mb-2" />
                  <h5 className="mb-0 fw-bold">{studentDetails?.courses_completed}</h5>
                  <small className="text-muted">Courses Completed</small>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6}>
              <Card className="text-center border-0 shadow-sm h-100">
                <Card.Body className="p-3">
                  <Icon name="trend-up" size="2x" className="text-warning mb-2" />
                  <h5 className="mb-0 fw-bold">{studentDetails?.average_progress}%</h5>
                  <small className="text-muted">Average Progress</small>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6}>
              <Card className="text-center border-0 shadow-sm h-100">
                <Card.Body className="p-3">
                  <Icon name="code" size="2x" className="text-info mb-2" />
                  <h5 className="mb-0 fw-bold">{studentDetails?.coding_stats?.total_attempted}</h5>
                  <small className="text-muted">Total Challenges</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Coding Challenges Section */}
          <Row className="g-3 mb-4">
            <Col lg={6}>
              <Card className="shadow-sm border-0 h-100">
                <Card.Header className="bg-primary text-white border-0 py-3">
                  <Card.Title className="mb-0 fw-bold d-flex align-items-center">
                    <Icon name="code" className="me-2" />
                    Coding Challenges
                  </Card.Title>
                </Card.Header>
                <Card.Body className="p-4">
                  <Row className="g-3 mb-4">
                    <Col md={4}>
                      <div className="text-center p-3 bg-light rounded">
                        <h6 className="text-muted mb-2">Attempted</h6>
                        <h2 className="mb-0 fw-bold text-warning">
                          {studentDetails?.coding_challenges?.attempted}
                        </h2>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="text-center p-3 bg-light rounded">
                        <h6 className="text-muted mb-2">Solved</h6>
                        <h2 className="mb-0 fw-bold text-success">
                          {studentDetails?.coding_challenges?.solved}
                        </h2>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="text-center p-3 bg-light rounded">
                        <h6 className="text-muted mb-2">Failed</h6>
                        <h2 className="mb-0 fw-bold text-danger">
                          {studentDetails?.coding_challenges?.failed}
                        </h2>
                      </div>
                    </Col>
                  </Row>

                  <div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted fw-semibold">Success Rate</span>
                      <span className="fw-bold">{studentDetails?.coding_challenges?.success_rate}%</span>
                    </div>
                    <ProgressBar
                      now={studentDetails?.coding_challenges?.success_rate || 0}
                      variant={
                        studentDetails?.coding_challenges?.success_rate >= 80 ? "success" :
                        studentDetails?.coding_challenges?.success_rate >= 60 ? "info" :
                        studentDetails?.coding_challenges?.success_rate >= 40 ? "warning" : "danger"
                      }
                      style={{ height: "10px" }}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card className="shadow-sm border-0 h-100">
                <Card.Header className="bg-info text-white border-0 py-3">
                  <Card.Title className="mb-0 fw-bold d-flex align-items-center">
                    <Icon name="briefcase" className="me-2" />
                    Company Challenges
                  </Card.Title>
                </Card.Header>
                <Card.Body className="p-4">
                  <Row className="g-3 mb-4">
                    <Col md={4}>
                      <div className="text-center p-3 bg-light rounded">
                        <h6 className="text-muted mb-2">Attempted</h6>
                        <h2 className="mb-0 fw-bold text-warning">
                          {studentDetails?.company_challenges?.attempted}
                        </h2>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="text-center p-3 bg-light rounded">
                        <h6 className="text-muted mb-2">Solved</h6>
                        <h2 className="mb-0 fw-bold text-success">
                          {studentDetails?.company_challenges?.solved}
                        </h2>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="text-center p-3 bg-light rounded">
                        <h6 className="text-muted mb-2">Failed</h6>
                        <h2 className="mb-0 fw-bold text-danger">
                          {studentDetails?.company_challenges?.failed}
                        </h2>
                      </div>
                    </Col>
                  </Row>

                  <div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted fw-semibold">Success Rate</span>
                      <span className="fw-bold">{studentDetails?.company_challenges?.success_rate}%</span>
                    </div>
                    <ProgressBar
                      now={studentDetails?.company_challenges?.success_rate || 0}
                      variant={
                        studentDetails?.company_challenges?.success_rate >= 80 ? "success" :
                        studentDetails?.company_challenges?.success_rate >= 60 ? "info" :
                        studentDetails?.company_challenges?.success_rate >= 40 ? "warning" : "danger"
                      }
                      style={{ height: "10px" }}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Enrolled Courses Table */}
          <Row className="g-3">
            <Col lg={12}>
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-white border-bottom py-3">
                  <Card.Title className="mb-0 fw-bold">
                    <Icon name="book" className="me-2" />
                    Enrolled Courses
                  </Card.Title>
                </Card.Header>
                <Card.Body className="p-0">
                  {studentDetails?.enrollments && studentDetails.enrollments.length > 0 ? (
                    <div className="table-responsive">
                      <Table hover className="mb-0">
                        <thead className="bg-light">
                          <tr>
                            <th className="border-0 ps-4">Course</th>
                            <th className="border-0">Enrollment Status</th>
                            <th className="border-0 text-center">Progress</th>
                            <th className="border-0 text-center">Last Accessed</th>
                            <th className="border-0 text-center pe-4">Status Badge</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentDetails.enrollments.map((enrollment, idx) => {
                            const progress = parseFloat(enrollment.progress_percentage) || 0;
                            const lastAccessed = enrollment.last_accessed
                              ? new Date(enrollment.last_accessed).toLocaleDateString()
                              : "Not yet accessed";

                            return (
                              <tr key={idx}>
                                <td className="ps-4">
                                  <span className="fw-semibold">{enrollment.course_title || 'N/A'}</span>
                                </td>
                                <td>
                                  <Badge bg={
                                    enrollment.enrollment_status === 'completed' ? 'success' :
                                    enrollment.enrollment_status === 'in_progress' ? 'info' :
                                    enrollment.enrollment_status === 'dropped' ? 'danger' : 'secondary'
                                  }>
                                    {enrollment.enrollment_status || 'enrolled'}
                                  </Badge>
                                </td>
                                <td className="text-center">
                                  <div className="d-flex align-items-center gap-2">
                                    <ProgressBar
                                      now={progress}
                                      style={{ height: "6px", minWidth: "100px" }}
                                      variant={progress >= 80 ? "success" : progress >= 50 ? "info" : "warning"}
                                    />
                                    <small className="fw-semibold">{progress}%</small>
                                  </div>
                                </td>
                                <td className="text-center">
                                  <small className="text-muted">{lastAccessed}</small>
                                </td>
                                <td className="text-center pe-4">
                                  {progress === 100 ? (
                                    <Badge bg="success">
                                      <Icon name="check-circle" className="me-1" />
                                      Completed
                                    </Badge>
                                  ) : (
                                    <Badge bg="warning">
                                      <Icon name="clock" className="me-1" />
                                      {progress}% Done
                                    </Badge>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <Alert variant="info" className="m-4 mb-0">
                      No course enrollments found for this student.
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );

  return (
    <Layout title="Student Dashboard" content="container">
      <Block.Head>
        <Block.HeadContent>
          <Block.Title tag="h2">
            <Icon name="users" className="me-2" />
            Student Dashboard
          </Block.Title>
          <p className="text-muted">
            {selectedStudent
              ? "View detailed student performance and progress"
              : "Monitor student enrollment, course completion, and coding statistics"}
          </p>
        </Block.HeadContent>
      </Block.Head>

      <Block>
        <Card className="shadow-sm border-0">
          <Card.Body className="p-4">
            {selectedStudent && studentDetails ? (
              <StudentDetailsView />
            ) : (
              <StudentListTable />
            )}
          </Card.Body>
        </Card>
      </Block>
    </Layout>
  );
}

export default StudentDashboard;
