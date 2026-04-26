function getCurrentUserEmail() {
  return Session.getActiveUser().getEmail();
}

function isTeacher() {
  var email = getCurrentUserEmail();
  var teacherEmails = getTeacherEmails();
  return teacherEmails.indexOf(email) !== -1;
}

function assertTeacherRole() {
  if (!isTeacher()) {
    throw new Error('権限がありません。教師アカウントでログインしてください。');
  }
}

function validateUuid(uuid) {
  var uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
