import React, { useEffect, useState } from "react";
import { Card, Row, Col, Form, Badge } from "react-bootstrap";
import DataTable from "react-data-table-component";
import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import axios from "axios";
import Swal from "sweetalert2";
import { API_BASE_URL } from "../../services/apiBase";

function StudentManagement() {
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
			const data = res.data?.data || res.data || [];
			setStudents(data);
		} catch (e) {
			console.error("Error fetching students:", e);
			Swal.fire("Error!", e.response?.data?.message || "Failed to fetch students", "error");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (studentId, studentName) => {
		const result = await Swal.fire({
			title: "Are you sure?",
			text: `This will permanently delete ${studentName || "this student"}. This action cannot be undone!`,
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#d33",
			cancelButtonColor: "#3085d6",
			confirmButtonText: "Yes, delete it!",
			cancelButtonText: "Cancel",
		});

		if (!result.isConfirmed) return;

		try {
			Swal.fire({
				title: "Deleting...",
				allowOutsideClick: false,
				didOpen: () => Swal.showLoading(),
			});

			await axios.delete(`${API_BASE_URL}/api/admin/dashboard/students/${studentId}/delete/`, {
				headers: { Authorization: `Bearer ${authToken}` },
			});

			Swal.fire("Deleted!", "Student deleted successfully.", "success");
			fetchStudents(); // Refresh the list
		} catch (error) {
			console.error("Error deleting student:", error);
			Swal.fire(
				"Error!",
				error.response?.data?.message || "Failed to delete student",
				"error"
			);
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
		{ name: "Challenges Solved", selector: (row) => row.challenges_solved || 0, sortable: true },
		{
			name: "Success Rate",
			selector: (row) => row.success_rate || 0,
			sortable: true,
			cell: (row) => `${row.success_rate || 0}%`,
		},
		{
			name: "Courses",
			selector: (row) => row.total_courses || 0,
			sortable: true,
			cell: (r) => `${r.courses_completed || 0}/${r.total_courses || 0}`,
		},
		{
			name: "Completion %",
			selector: (row) => row.completion_percentage || 0,
			sortable: true,
			cell: (r) => (
				<Badge bg={r.completion_percentage >= 100 ? "success" : r.completion_percentage >= 50 ? "warning" : "secondary"}>
					{r.completion_percentage || 0}%
				</Badge>
			),
		},
		{
			name: "Actions",
			cell: (row) => (
				<button
					className="btn btn-sm btn-danger"
					onClick={() => handleDelete(row.id, row.name)}
					title="Delete Student"
				>
					<Icon name="trash" /> Delete
				</button>
			),
			ignoreRowClick: true,
			allowOverflow: true,
			button: true,
			width: "120px",
		},
	];

	const customStyles = {
		headRow: {
			style: {
				background: "linear-gradient(to right, #e0eafc, #cfdef3)",
				fontWeight: "bold",
				fontSize: "14px",
			},
		},
		rows: {
			style: {
				backgroundColor: "#f8f9fa",
				borderBottom: "1px solid #dee2e6",
				"&:hover": { backgroundColor: "#e6f0ff" },
			},
		},
		headCells: { style: { color: "#333" } },
		cells: { style: { paddingTop: "12px", paddingBottom: "12px" } },
	};

	return (
		<Layout title="Student Management" content="container">
			<Block.Head>
				<Block.HeadBetween>
					<Block.HeadContent>
						<Block.Title tag="h2">Student Management</Block.Title>
						<p className="text-muted">Manage and delete students</p>
					</Block.HeadContent>
					<Block.HeadContent>
						<div className="d-flex gap-2">
							<Form.Select
								value={selectedCollege}
								onChange={(e) => setSelectedCollege(e.target.value)}
								style={{ width: 260 }}
							>
								<option value="">All Colleges</option>
								{colleges.map((c) => (
									<option key={c.id} value={c.id}>
										{c.name}
									</option>
								))}
							</Form.Select>
							<Form.Control
								placeholder="Search name/email/college"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</div>
					</Block.HeadContent>
				</Block.HeadBetween>
			</Block.Head>

			<Block>
				<Card className="p-3">
					<DataTable
						columns={columns}
						data={filtered}
						customStyles={customStyles}
						progressPending={loading}
						pagination
						paginationPerPage={10}
						paginationRowsPerPageOptions={[10, 20, 50, 100]}
						highlightOnHover
						responsive
						noDataComponent="No students found"
					/>
				</Card>
			</Block>
		</Layout>
	);
}

export default StudentManagement;

