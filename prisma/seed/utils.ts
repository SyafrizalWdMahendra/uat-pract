const featuresProject1 = [
  { title: "Authentication", project_id: 1 },
  { title: "Identity Verification", project_id: 1 },
  { title: "Payment", project_id: 1 },
  { title: "Take Test", project_id: 1 },
  { title: "Dashboard", project_id: 1 },
  { title: "History", project_id: 1 },
  { title: "Settings", project_id: 1 },
];

const featuresProject2 = [
  { title: "LOGIN", project_id: 2 },
  { title: "DASHBOARD", project_id: 2 },
  { title: "INBOX LEAD", project_id: 2 },
  { title: "QUOTATION INBOX DETAIL", project_id: 2 },
  { title: "ADD QUOTATION", project_id: 2 },
  { title: "MANAGE CASE STUDIES", project_id: 2 },
  { title: "MANAGE CONTACT US", project_id: 2 },
  { title: "MANAGE FAQ", project_id: 2 },
  { title: "QUOTATION TRAFFIC", project_id: 2 },
  { title: "TOP PIC", project_id: 2 },
  { title: "TOP SERVICE", project_id: 2 },
  { title: "QUOTATION TRENDS", project_id: 2 },
  { title: "ACCOUNT SETTINGS", project_id: 2 },
  { title: "NOTIFICATION SETTING", project_id: 2 },
  { title: "NOTIFICATION PAGE", project_id: 2 },
];

const testScenariosFeature1 = [
  { code: "A-TC-001", test_case: "Login Success", feature_id: 1 },
  { code: "A-TC-002", test_case: "Login Failed (empty email)", feature_id: 1 },
  {
    code: "A-TC-003",
    test_case: "Login Failed (empty password)",
    feature_id: 1,
  },
  { code: "A-TC-004", test_case: "Login Failed (false email)", feature_id: 1 },
  {
    code: "A-TC-005",
    test_case: "Login Failed (false password)",
    feature_id: 1,
  },
  { code: "A-TC-006", test_case: "Register Success", feature_id: 1 },
  {
    code: "A-TC-007",
    test_case: "Register Failed (empty name)",
    feature_id: 1,
  },
];

const testScenariosFeature2 = [
  { code: "IV-TC-001", test_case: "Success KTP upload", feature_id: 2 },
  { code: "IV-TC-002", test_case: "Success KTP take picture", feature_id: 2 },
  {
    code: "IV-TC-003",
    test_case: "Failed KTP upload file type",
    feature_id: 2,
  },
  {
    code: "IV-TC-004",
    test_case: "Failed KTP upload file size",
    feature_id: 2,
  },
  {
    code: "IV-TC-009",
    test_case: "Correct identity information",
    feature_id: 2,
  },
  { code: "IV-TC-010", test_case: "Edit identity information", feature_id: 2 },
  { code: "IV-TC-011", test_case: "Empty identity information", feature_id: 2 },
  { code: "IV-TC-012", test_case: "Correct selfie", feature_id: 2 },
  { code: "IV-TC-013", test_case: "Incorrect selfie", feature_id: 2 },
];

const docUrl = {
  docUrl1: {
    doc_url:
      "https://docs.google.com/spreadsheets/d/1Z-JmMcbabGlOv-tdg44hxFSUd8KhEOlvA9g2Rg8rFz8/edit?gid=1977878089#gid=1977878089",
  },
  docUrl2: {
    doc_url:
      "https://docs.google.com/spreadsheets/d/1sC1LEp09JjiFfj7UidEzVHO5DYpqJ88BN3MzgGStqkU/edit?gid=488765021#gid=488765021",
  },
};

export {
  featuresProject1,
  featuresProject2,
  testScenariosFeature1,
  testScenariosFeature2,
  docUrl,
};
