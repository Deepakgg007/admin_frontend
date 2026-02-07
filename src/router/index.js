import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { ScrollToTop, AdminRoute } from "../components";

// auths pages
import AuthLogin from "../pages/auths/AuthLogin";
import NotFound from "../pages/error/NotFound";

import UniversityCreate from "../pages/Universities/UniversityCreate";
import UniversityList from "../pages/Universities/UniversityList";
import UniversityUpdate from "../pages/Universities/UniversityUpdate";
import UniversityView from "../pages/Universities/UniversityView";

import OrganizationCreate from "../pages/Organizations/OrganizationCreate";
import OrganizationList from "../pages/Organizations/OrganizationList";
import OrganizationView from "../pages/Organizations/OrganizationView";
import OrganizationUpdate from "../pages/Organizations/OrganizationUpdate";

import CollegeCreate from "../pages/Colleges/CollegeCreate";
import CollegeList from "../pages/Colleges/CollegeList";
import CollegeView from "../pages/Colleges/CollegeView";
import CollegeUpdate from "../pages/Colleges/CollegeUpdate";

import CourseCreate from "../pages/Courses/CourseCreate";
import CourseList from "../pages/Courses/CourseList";
import CourseView from "../pages/Courses/CourseView";
import CourseUpdate from "../pages/Courses/CourseUpdate";

import SyllabusCreate from "../pages/Syllabus/SyllabusCreate";
import SyllabusList from "../pages/Syllabus/SyllabusList";
import SyllabusView from "../pages/Syllabus/SyllabusView";
import SyllabusDetail from "../pages/Syllabus/SyllabusDetail";
import SyllabusUpdate from "../pages/Syllabus/SyllabusUpdate";

import TopicCreate from "../pages/Topics/TopicCreate";
import TopicsList from "../pages/Topics/TopicsList";
import TopicView from "../pages/Topics/TopicView";
import TopicUpdate from "../pages/Topics/TopicUpdate";

import TaskManagement from "../pages/Tasks/TaskManagement";
import TaskForm from "../pages/Tasks/TaskForm";
import TaskDetail from "../pages/Tasks/TaskDetail";
import QuestionForm from "../pages/Tasks/QuestionForm";
import MCQSetForm from "../pages/Tasks/MCQSetForm";
import RichTextPageEditor from "../pages/Tasks/RichTextPageEditor";
import DocumentForm from "../pages/Tasks/DocumentForm";
import VideoForm from "../pages/Tasks/VideoForm";

import CompanyList from "../pages/Companies/CompanyList";
import CompanyCreate from "../pages/Companies/CompanyCreate";
import CompanyView from "../pages/Companies/CompanyView";
import CompanyUpdate from "../pages/Companies/CompanyUpdate";

import JobList from "../pages/Jobs/JobList";
import JobCreate from "../pages/Jobs/JobCreate";
import JobView from "../pages/Jobs/JobView";
import JobUpdate from "../pages/Jobs/JobUpdate";

import ConceptList from "../pages/Concepts/ConceptList";
import ConceptCreate from "../pages/Concepts/ConceptCreate";
import ConceptView from "../pages/Concepts/ConceptView";
import ConceptUpdate from "../pages/Concepts/ConceptUpdate";

import ConceptChallengeList from "../pages/ConceptChallenges/ConceptChallengeList";
import ConceptChallengeCreate from "../pages/ConceptChallenges/ConceptChallengeCreate";

import ChallengeList from "../pages/CodingChallenges/ChallengeList";
import ChallengeCreate from "../pages/CodingChallenges/ChallengeCreate";
import ChallengeView from "../pages/CodingChallenges/ChallengeView";

import CertificateCreate from "../pages/CourseCertification/CertificateCreate";
import CertificateList from "../pages/CourseCertification/CertificateList";
import CertificateView from "../pages/CourseCertification/CertificateView";
import CertificateUpdate from "../pages/CourseCertification/CertificateUpdate";

import QuestionBankList from "../pages/QuestionBank/QuestionBankList";
import QuestionBankCreate from "../pages/QuestionBank/QuestionBankCreate";
import QuestionBankEdit from "../pages/QuestionBank/QuestionBankEdit";
import QuestionBankView from "../pages/QuestionBank/QuestionBankView";

import AISettingsList from "../pages/AISettings/AISettingsList";

import Dashboard from "../pages/Dashboard/Dashboard";
import CourseCompletionReport from "../pages/CourseCompletion/CourseCompletionReport";
import StudentReport from "../pages/Reports/StudentReport";
import StudentManagement from "../pages/Students/StudentManagement";

function Router() {
  return (
    <ScrollToTop>
      <Routes>
        <Route path="/" element={<Navigate to="/auths/auth-login" replace />} />
        <Route path="dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />

        <Route path="University">
          <Route path="create-University" element={<AdminRoute><UniversityCreate /></AdminRoute>} />
          <Route path="list-University" element={<AdminRoute><UniversityList /></AdminRoute>} />
          <Route path="update-University/:id" element={<AdminRoute><UniversityUpdate /></AdminRoute>} />
          <Route path="view-University/:id" element={<AdminRoute><UniversityView /></AdminRoute>} />
        </Route>

        <Route path="Organizations">
          <Route path="create-organization" element={<AdminRoute><OrganizationCreate /></AdminRoute>} />
          <Route path="list-organization" element={<AdminRoute><OrganizationList /></AdminRoute>} />
          <Route path="view-organization/:id" element={<AdminRoute><OrganizationView /></AdminRoute>} />
          <Route path="update-organization/:id" element={<AdminRoute><OrganizationUpdate /></AdminRoute>} />
        </Route>

        <Route path="Colleges">
          <Route path="create-college" element={<AdminRoute><CollegeCreate /></AdminRoute>} />
          <Route path="list-college" element={<AdminRoute><CollegeList /></AdminRoute>} />
          <Route path="view-college/:id" element={<AdminRoute><CollegeView /></AdminRoute>} />
          <Route path="update-college/:id" element={<AdminRoute><CollegeUpdate /></AdminRoute>} />
        </Route>

        <Route path="Courses">
          <Route path="create-course" element={<AdminRoute><CourseCreate /></AdminRoute>} />
          <Route path="list-course" element={<AdminRoute><CourseList /></AdminRoute>} />
          <Route path="view-course/:id" element={<AdminRoute><CourseView /></AdminRoute>} />
          <Route path="update-course/:id" element={<AdminRoute><CourseUpdate /></AdminRoute>} />
        </Route>

        <Route path="Syllabus">
          <Route path="create-syllabus" element={<AdminRoute><SyllabusCreate /></AdminRoute>} />
          <Route path="list-syllabus" element={<AdminRoute><SyllabusList /></AdminRoute>} />
          <Route path="view-syllabus/:id" element={<AdminRoute><SyllabusView /></AdminRoute>} />
          <Route path="detail-syllabus/:id" element={<AdminRoute><SyllabusDetail /></AdminRoute>} />
          <Route path="update-syllabus/:id" element={<AdminRoute><SyllabusUpdate /></AdminRoute>} />
        </Route>

        <Route path="Topics">
          <Route path="create-topic" element={<AdminRoute><TopicCreate /></AdminRoute>} />
          <Route path="list-topic" element={<AdminRoute><TopicsList /></AdminRoute>} />
          <Route path="view-topic/:id" element={<AdminRoute><TopicView /></AdminRoute>} />
          <Route path="update-topic/:id" element={<AdminRoute><TopicUpdate /></AdminRoute>} />
        </Route>

        <Route path="Tasks">
          <Route path="task-management" element={<AdminRoute><TaskManagement /></AdminRoute>} />
          <Route path="task-form" element={<AdminRoute><TaskForm /></AdminRoute>} />
          <Route path="task-form/:taskId" element={<AdminRoute><TaskForm /></AdminRoute>} />
          <Route path="task-detail/:taskId" element={<AdminRoute><TaskDetail /></AdminRoute>} />
          <Route path="question-form/:taskId" element={<AdminRoute><QuestionForm /></AdminRoute>} />
          <Route path="mcq-set-form/:taskId" element={<AdminRoute><MCQSetForm /></AdminRoute>} />
          <Route path="richtext-page-editor/:taskId" element={<AdminRoute><RichTextPageEditor /></AdminRoute>} />
          <Route path="richtext-page-editor/:taskId/:pageId" element={<AdminRoute><RichTextPageEditor /></AdminRoute>} />
          <Route path="document-form/:taskId" element={<AdminRoute><DocumentForm /></AdminRoute>} />
          <Route path="video-form/:taskId" element={<AdminRoute><VideoForm /></AdminRoute>} />
        </Route>

        <Route path="Companies">
          <Route path="list-company" element={<AdminRoute><CompanyList /></AdminRoute>} />
          <Route path="create-company" element={<AdminRoute><CompanyCreate /></AdminRoute>} />
          <Route path="view-company/:slug" element={<AdminRoute><CompanyView /></AdminRoute>} />
          <Route path="update-company/:slug" element={<AdminRoute><CompanyUpdate /></AdminRoute>} />
        </Route>

        <Route path="Jobs">
          <Route path="list-job" element={<AdminRoute><JobList /></AdminRoute>} />
          <Route path="create-job" element={<AdminRoute><JobCreate /></AdminRoute>} />
          <Route path="view-job/:slug" element={<AdminRoute><JobView /></AdminRoute>} />
          <Route path="update-job/:slug" element={<AdminRoute><JobUpdate /></AdminRoute>} />
        </Route>

        <Route path="Concepts">
          <Route path="list-concept" element={<AdminRoute><ConceptList /></AdminRoute>} />
          <Route path="create-concept" element={<AdminRoute><ConceptCreate /></AdminRoute>} />
          <Route path="view-concept/:slug" element={<AdminRoute><ConceptView /></AdminRoute>} />
          <Route path="update-concept/:slug" element={<AdminRoute><ConceptUpdate /></AdminRoute>} />
        </Route>

        <Route path="ConceptChallenges">
          <Route path="list-concept-challenge" element={<AdminRoute><ConceptChallengeList /></AdminRoute>} />
          <Route path="create-concept-challenge" element={<AdminRoute><ConceptChallengeCreate /></AdminRoute>} />
          <Route path="update-concept-challenge/:id" element={<AdminRoute><ConceptChallengeCreate /></AdminRoute>} />
        </Route>

        <Route path="CodingChallenges">
          <Route path="list-challenge" element={<AdminRoute><ChallengeList /></AdminRoute>} />
          <Route path="create-challenge" element={<AdminRoute><ChallengeCreate /></AdminRoute>} />
          <Route path="view-challenge/:slug" element={<AdminRoute><ChallengeView /></AdminRoute>} />
          <Route path="update-challenge/:slug" element={<AdminRoute><ChallengeCreate /></AdminRoute>} />
        </Route>

        <Route path="Certificates">
          <Route path="list-certificate" element={<AdminRoute> <CertificateList /> </AdminRoute>} />
          <Route path="create-certificate" element={<AdminRoute> <CertificateCreate /> </AdminRoute>} />
          <Route path="view-certificate/:id" element={<AdminRoute> <CertificateView /> </AdminRoute>} />
          <Route path="update-certificate/:id" element={<AdminRoute> <CertificateUpdate /> </AdminRoute>} />
        </Route>

        <Route path="QuestionBank">
          <Route path="list-questions" element={<AdminRoute> <QuestionBankList /> </AdminRoute>} />
          <Route path="create-question" element={<AdminRoute> <QuestionBankCreate /> </AdminRoute>} />
          <Route path="edit-question/:id" element={<AdminRoute> <QuestionBankEdit /> </AdminRoute>} />
          <Route path="view-question/:id" element={<AdminRoute> <QuestionBankView /> </AdminRoute>} />
        </Route>

        <Route path="AISettings">
          <Route path="list" element={<AdminRoute> <AISettingsList /> </AdminRoute>} />
        </Route>

        <Route path="CourseCompletion">
          <Route path="completion-report" element={<AdminRoute> <CourseCompletionReport /> </AdminRoute>} />
        </Route>

        <Route path="Reports">
          <Route path="students" element={<AdminRoute> <StudentReport /> </AdminRoute>} />
        </Route>

        <Route path="Students">
          <Route path="manage" element={<AdminRoute> <StudentManagement /> </AdminRoute>} />
        </Route>

        <Route path="auths">
          <Route path="auth-login" element={<AuthLogin />} />
        </Route>

        <Route path="not-found" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ScrollToTop>
  );
}

export default Router;
