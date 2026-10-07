// src/utils/facultyRoles.js

import API from "../api";

const normaliseId = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

// Builds a facultyId -> "principal" | "hod" | "faculty" map
// from the shared faculty list.
//
// The backend is the authority on this and usually annotates
// each request with requesterRole. Until that is deployed a
// request has no role information, so the pages that act on
// the principal's rules still have to resolve it themselves.
export const loadFacultyRoles = async () => {
  try {
    const response = await API.get("/faculty");

    const list = Array.isArray(response.data)
      ? response.data
      : response.data?.faculty || [];

    const roles = {};

    list.forEach((member) => {
      const key = normaliseId(member.facultyId);

      if (!key) {
        return;
      }

      roles[key] = member.isPrincipal
        ? "principal"
        : member.isHod
          ? "hod"
          : "faculty";
    });

    return roles;
  } catch (error) {
    console.error("Faculty Role Lookup Error:", error);

    return {};
  }
};

// The backend's requesterRole wins when it is present. The
// map is only there for a request the server has not
// annotated, and plain "faculty" is the safe default: it
// hides an approval button rather than inventing one.
export const resolveRequesterRole = (
  request = {},
  roles = {}
) => {
  const declared = request.requesterRole;

  if (
    declared === "principal" ||
    declared === "hod" ||
    declared === "faculty"
  ) {
    return declared;
  }

  return roles[normaliseId(request.facultyId)] || "faculty";
};