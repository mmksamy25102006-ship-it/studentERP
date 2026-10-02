// src/pages/hod/HodStudentRequests.jsx
//
// Wrapper that points the existing faculty approvals
// table at the HOD student request endpoints. The layout
// and behaviour are identical to the faculty page, so
// this reuses it rather than duplicating 800 lines.

import FacultyRequests from "./../faculty/FacultyRequests";

const HodStudentRequests = () => {
  return <FacultyRequests />;
};

export default HodStudentRequests;
