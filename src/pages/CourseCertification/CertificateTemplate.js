import React from 'react';
import './CertificateTemplate.css';

/**
 * CertificateTemplate Component - Traditional Ornate Edition
 * Displays a professional certificate with:
 * - Top Left: Z1 Logo
 * - Top Right: College Logo (dynamic)
 * - Bottom Left: Z1 Signature
 * - Bottom Right: College Signature (dynamic)
 * - Center: Certificate details (student name, course, date, score, etc.)
 * - Gold border with decorative corners
 * - Traditional certificate design
 *
 * This component is optimized for html2canvas PDF generation
 */
const CertificateTemplate = React.forwardRef(({
  studentName = "Student Name",
  courseName = "Course Name",
  completionDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  score = 100,
  passingScore = 80,
  collegeName = "Z1 Education",
  collegeLogo,
  collegeSignature,
  certificateNumber = "CERT-001",
  principalName = 'Director',
}, ref) => {
  return (
    <div ref={ref} className="certificate-container">
      <div className="certificate-wrapper">
        {/* Decorative border frame */}
        <div className="certificate-border-frame"></div>

        {/* Decorative corner pieces */}
        <div className="corner-piece corner-tl"></div>
        <div className="corner-piece corner-tr"></div>
        <div className="corner-piece corner-bl"></div>
        <div className="corner-piece corner-br"></div>

        <div className="certificate-border">
          {/* Header Section with Logos */}
          <div className="certificate-header">
            {/* Z1 Logo (Left) */}
            <div className="top-left-section">
              <div className="logo-wrapper z1-logo-wrapper">
                <img
                  src="/z1logo.png"
                  alt="Z1 Logo"
                  className="z1-logo-image"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </div>

            {/* Spacer */}
            <div className="header-spacer"></div>

            {/* College Logo (Right) */}
            <div className="top-right-section">
              <div className="logo-wrapper college-logo-wrapper">
                {collegeLogo ? (
                  <img
                    src={collegeLogo}
                    alt={`${collegeName} Logo`}
                    className="college-logo-image"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : null}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="certificate-content">
            {/* Main Title */}
            <div className="certificate-title-section">
              <h1 className="certificate-title">Certificate of Appreciation</h1>
              <div className="decorative-line"></div>
              <p className="certificate-subtitle">This Certificate is Proudly Presented to</p>
            </div>

            {/* Student Name */}
            <div className="student-name-section">
              <h2 className="student-name-ornate">{studentName}</h2>
            </div>

            {/* Achievement Text */}
            <p className="achievement-text">For Successfully Completing the Course</p>

            {/* Course Name */}
            <div className="course-section-ornate">
              <h3 className="course-name-ornate">{courseName}</h3>
            </div>

            {/* College Name */}
            <p className="college-name-text">From {collegeName}</p>

            <div className="divider-line"></div>

            {/* Details Section */}
            <div className="details-section-ornate">
              <p className="completion-date">
                Presented this {completionDate}
              </p>
              <p className="certificate-number">
                Certificate No: <span className="cert-number">CERT-{certificateNumber}</span>
              </p>
            </div>
          </div>

          {/* Signature Section */}
          <div className="signature-section-ornate">
            {/* Left Signature - Z1 Admin */}
            <div className="signature-area-ornate left-signature">
              <div className="signature-image-wrapper">
                <img
                  src="/z1-sign.png"
                  alt="Z1 Signature"
                  className="signature-img"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="signature-line-ornate"></div>
              <p className="signature-name">Z1 Administrator</p>
              <p className="signature-title-ornate">Authorized by Z1</p>
            </div>

            {/* Right Signature - College Principal */}
            <div className="signature-area-ornate right-signature">
              <div className="signature-image-wrapper">
                {collegeSignature ? (
                  <img
                    src={collegeSignature}
                    alt={`${collegeName} Signature`}
                    className="signature-img"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="signature-placeholder-ornate"></div>
                )}
              </div>
              <div className="signature-line-ornate"></div>
              <p className="signature-name">{collegeName}</p>
              <p className="signature-title-ornate">Principal / Director</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CertificateTemplate.displayName = 'CertificateTemplate';

export default CertificateTemplate;
