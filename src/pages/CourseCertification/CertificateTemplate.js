import React from 'react';
import './CertificateTemplate.css';

/**
 * CertificateTemplate Component
 * Displays a professional certificate with:
 * - Left side: Z1 Logo
 * - Right side: College Logo (dynamic)
 * - Center: Certificate details (student name, course, date, etc.)
 */
const CertificateTemplate = React.forwardRef(({
  studentName,
  courseName,
  completionDate,
  collegeName,
  collegeLogo,
  certificateNumber,
  principalName = 'Director',
}, ref) => {
  return (
    <div ref={ref} className="certificate-container">
      <div className="certificate-wrapper">
        {/* Certificate Border */}
        <div className="certificate-border">

          {/* Header Section */}
          <div className="certificate-header">
            {/* Left Logo - Z1 Logo */}
            <div className="logo-section left-logo">
              <img
                src="/z1logo.png"
                alt="Z1 Logo"
                className="z1-logo"
              />
              <p className="logo-label">Z1 Education</p>
            </div>

            {/* Center - Certificate Title */}
            <div className="title-section">
              <div className="certificate-title">
                Certificate of Completion
              </div>
              <div className="certificate-subtitle">
                This is to certify that
              </div>
            </div>

            {/* Right Logo - College Logo */}
            <div className="logo-section right-logo">
              {collegeLogo ? (
                <img
                  src={collegeLogo}
                  alt={`${collegeName} Logo`}
                  className="college-logo"
                />
              ) : (
                <div className="logo-placeholder">
                  <p>{collegeName}</p>
                </div>
              )}
              <p className="logo-label">{collegeName}</p>
            </div>
          </div>

          {/* Main Content Section */}
          <div className="certificate-body">
            {/* Student Name */}
            <div className="student-name-section">
              <p className="label">Student Name</p>
              <h1 className="student-name">{studentName}</h1>
              <div className="underline"></div>
            </div>

            {/* Certificate Text */}
            <div className="certificate-text">
              <p>
                has successfully completed the course
              </p>
            </div>

            {/* Course Name */}
            <div className="course-section">
              <h2 className="course-name">{courseName}</h2>
              <div className="underline"></div>
            </div>

            {/* Details Section */}
            <div className="details-section">
              <div className="detail-item">
                <span className="detail-label">Institution:</span>
                <span className="detail-value">{collegeName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Date of Completion:</span>
                <span className="detail-value">{completionDate}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Certificate No:</span>
                <span className="detail-value">{certificateNumber}</span>
              </div>
            </div>

            {/* Signature Section */}
            <div className="signature-section">
              <div className="signature-box">
                <div className="signature-line"></div>
                <p className="signature-label">{principalName}</p>
                <p className="signature-title">Principal / Director</p>
              </div>

              <div className="seal-box">
                <div className="seal">
                  <i className="fas fa-stamp seal-icon"></i>
                  <p className="seal-text">Official Seal</p>
                </div>
              </div>

              <div className="signature-box">
                <div className="signature-line"></div>
                <p className="signature-label">Z1 Admin</p>
                <p className="signature-title">Authorized By</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="certificate-footer">
            <p>This certificate is awarded in recognition of successful completion of the course.</p>
            <p className="footer-date">
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CertificateTemplate;
