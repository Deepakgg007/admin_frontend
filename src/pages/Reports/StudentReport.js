import React, { useEffect, useState } from "react";
import { Card, Row, Col, Form, Badge } from "react-bootstrap";
import DataTable from "react-data-table-component";
import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import axios from "axios";
import { API_BASE_URL } from "../../services/apiBase";

function StudentReport() {
	const [loading, setLoading] = useState(true);
	const [students, setStudents] = useState([]);
	const [colleges, setColleges] = useState([]);
	const [selectedCollege, setSelectedCollege] = useState("");
	const [search, setSearch] = useState("");

	const authToken = localStorage.getItem("authToken") || localStorage.getItem("access_token");

	useEffect(() => {
		fetchColleges();
	}, []);

	useEffect(() => {
		fetchStudents();
	}, [selectedCollege]);

	const fetchColleges = async () => {
		try {
			const res = await axios.get(`${API_BASE_URL}/api/colleges/`, {
				headers: { Authorization: `Bearer ${authToken}` },
				params: { per_page: 1000 },
			});
			setColleges(res.data?.data || res.data?.results || []);
		} catch (e) {
			console.error(e);
		}
	};

	const fetchStudents = async () => {
		try {
			setLoading(true);
			const res = await axios.get(`${API_BASE_URL}/api/admin/dashboard/students-report/`, {
				headers: { Authorization: `Bearer ${authToken}` },
				params: selectedCollege ? { college_id: selectedCollege } : {},
			});
			setStudents(res.data?.data || res.data || []);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	const filtered = students.filter((s) => {
		if (!search) return true;
		const q = search.toLowerCase();
		return (
			(s.name || "").toLowerCase().includes(q) ||
			(s.email || "").toLowerCase().includes(q) ||
			(s.college_name || "").toLowerCase().includes(q)
		);
	});

	const columns = [
		{ name: "Name", selector: (row) => row.name, sortable: true, wrap: true },
		{ name: "Email", selector: (row) => row.email, sortable: true },
		{ name: "College", selector: (row) => row.college_name || "—", sortable: true },
		{ name: "Challenges Solved", selector: (row) => row.challenges_solved, sortable: true },
		{ name: "Success Rate", selector: (row) => row.success_rate, sortable: true, cell: (row) => `${row.success_rate}%` },
		{ name: "Courses", selector: (row) => row.total_courses, sortable: true, cell: (r) => `${r.courses_completed}/${r.total_courses}` },
		{ name: "Completion %", selector: (row) => row.completion_percentage, sortable: true, cell: (r) => (
			<Badge bg={r.completion_percentage >= 100 ? "success" : r.completion_percentage >= 50 ? "warning" : "secondary"}>
				{r.completion_percentage}%
			</Badge>
		) },
	];

	// Calculate overview metrics
	const metrics = {
		totalStudents: students.length,
		averageCompletion: students.length ? 
			(students.reduce((sum, s) => sum + (s.completion_percentage || 0), 0) / students.length).toFixed(1) : 0,
		totalCourses: students.reduce((sum, s) => sum + (s.total_courses || 0), 0),
		completedCourses: students.reduce((sum, s) => sum + (s.courses_completed || 0), 0),
	};

	return (
		<Layout title="Student Report" content="container">
			<Block.Head>
				<Block.HeadBetween>
					<Block.HeadContent>
						<Block.Title tag="h2">Student Report</Block.Title>
						<p className="text-muted">Filter by college and review student performance</p>
					</Block.HeadContent>
					<Block.HeadContent>
						<div className="d-flex gap-2">
							<Form.Select value={selectedCollege} onChange={(e) => setSelectedCollege(e.target.value)} style={{ width: 260 }}>
								<option value="">All Colleges</option>
								{colleges.map((c) => (
									<option key={c.id} value={c.id}>{c.name}</option>
								))}
							</Form.Select>
							<Form.Control placeholder="Search name/email/college" value={search} onChange={(e) => setSearch(e.target.value)} />
						</div>
					</Block.HeadContent>
				</Block.HeadBetween>
			</Block.Head>

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
										<Icon name="percent" className="text-success fs-4" />
									</div>
									<div className="ms-3">
										<div className="fs-6 text-muted mb-1">Average Completion</div>
										<h4 className="mb-0">{metrics.averageCompletion}%</h4>
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
										<Icon name="book" className="text-info fs-4" />
									</div>
									<div className="ms-3">
										<div className="fs-6 text-muted mb-1">Total Courses</div>
										<h4 className="mb-0">{metrics.totalCourses}</h4>
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
										<Icon name="check-circle" className="text-warning fs-4" />
									</div>
									<div className="ms-3">
										<div className="fs-6 text-muted mb-1">Completed Courses</div>
										<h4 className="mb-0">{metrics.completedCourses}</h4>
									</div>
								</div>
							</Card.Body>
						</Card>
					</Col>
				</Row>
			</Block>

			<Block>
				<Card className="border-0 shadow-sm">
					<Card.Body>
						<DataTable
							columns={columns}
							data={filtered}
							progressPending={loading}
							pagination
							paginationPerPage={10}
							paginationRowsPerPageOptions={[10, 20, 50]}
							highlightOnHover
							responsive
							noDataComponent="No students found"
						/>
					</Card.Body>
				</Card>
			</Block>
		</Layout>
	);
}

export default StudentReport;
