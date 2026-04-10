import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import MainNavBar from './pages/MainNavBar'
import AdminNavBar from './admin/AdminNavBar'
import StudentNavBar from './student/StudentNavBar'
import TeacherNavBar from './teacher/TeacherNavBar'
import Home from './pages/Home'
import AdminLogin from './pages/AdminLogin'
import StudentLogin from './pages/StudentLogin'
import TeacherLogin from './pages/TeacherLogin'
import PageNotFound from './pages/PageNotFound'
import AdminHome from './admin/AdminHome'
import AddStudent from './admin/AddStudent'
import AddTeacher from './admin/AddTeacher'
import ViewAllStudents from './admin/ViewAllStudents'
import ViewAllTeachers from './admin/ViewAllTeachers'
import AddSubject from './admin/AddSubject'
import ViewAllSubjects from './admin/ViewAllSubjects'
import StudentHome from './student/StudentHome'
import StudentProfile from './student/StudentProfile'
import StudentViewSubjects from './student/ViewSubjects'
import StudentSubjectProjects from './student/SubjectProjects'
import StudentProjectGroups from './student/ProjectGroups'
import TeacherHome from './teacher/TeacherHome'
import TeacherProfile from './teacher/TeacherProfile'
import TeacherViewSubjects from './teacher/ViewSubjects'
import TeacherSubjectProjects from './teacher/SubjectProjects'
import TeacherProjectGroups from './teacher/ProjectGroups'
import TeacherAddSubject from './teacher/AddSubject'
import TeacherMonitorProgress from './teacher/MonitorProgress'
import TeacherReviewSubmissions from './teacher/ReviewSubmissions'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicOnlyRoute from './routes/PublicOnlyRoute'
import { initializeFrontendDataStores } from './api/bootstrapService'

initializeFrontendDataStores()

function AppContent() {
  const { role } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route element={<MainNavBar />}>
            <Route path="/" element={<Home />} />
            <Route path="/adminlogin" element={<AdminLogin />} />
            <Route path="/studentlogin" element={<StudentLogin />} />
            <Route path="/studentregister" element={<Navigate to="/studentlogin" replace />} />
            <Route path="/teacherlogin" element={<TeacherLogin />} />
            <Route path="/teacherregister" element={<Navigate to="/teacherlogin" replace />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route path="/admin" element={<AdminNavBar />}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<AdminHome />} />
            <Route path="addstudent" element={<AddStudent />} />
            <Route path="addteacher" element={<AddTeacher />} />
            <Route path="viewallstudents" element={<ViewAllStudents />} />
            <Route path="viewallteachers" element={<ViewAllTeachers />} />
            <Route path="addsubject" element={<AddSubject />} />
            <Route path="viewallsubjects" element={<ViewAllSubjects />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRole="student" />}>
          <Route path="/student" element={<StudentNavBar />}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<StudentHome />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="viewsubjects" element={<StudentViewSubjects />} />
            <Route path="subjectprojects/:coursecode" element={<StudentSubjectProjects />} />
            <Route path="projectgroups/:projectId" element={<StudentProjectGroups />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRole="teacher" />}>
          <Route path="/teacher" element={<TeacherNavBar />}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<TeacherHome />} />
            <Route path="profile" element={<TeacherProfile />} />
            <Route path="viewsubjects" element={<TeacherViewSubjects />} />
            <Route path="subjectprojects/:coursecode" element={<TeacherSubjectProjects />} />
            <Route path="projectgroups/:projectId" element={<TeacherProjectGroups />} />
            <Route path="addsubject" element={<TeacherAddSubject />} />
            <Route path="monitorprogress/:projectId" element={<TeacherMonitorProgress />} />
            <Route path="reviewsubmissions/:projectId" element={<TeacherReviewSubmissions />} />
          </Route>
        </Route>

        <Route
          path="*"
          element={role ? <Navigate to={`/${role}/home`} replace /> : <PageNotFound />}
        />
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
