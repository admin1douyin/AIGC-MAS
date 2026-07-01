import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Agents from './pages/Agents';
import AgentMarket from './pages/AgentMarket';
import NewProject from './pages/NewProject';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import Assets from './pages/Assets';
import Notifications from './pages/Notifications';
import ScriptEditor from './pages/ScriptEditor';
import ChatAgent from './pages/ChatAgent';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminSettings from './pages/AdminSettings';
import VideoWorkbench from './pages/VideoWorkbench';
import AIActors from './pages/AIActors';
import { AuthProvider } from './lib/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/new" element={<NewProject />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="projects/:id/script" element={<ScriptEditor />} />
          <Route path="agents" element={<Agents />} />
          <Route path="agent-market" element={<AgentMarket />} />
          <Route path="chat" element={<ChatAgent />} />
          <Route path="chat/:projectId" element={<ChatAgent />} />
          <Route path="assets" element={<Assets />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="admin/settings" element={<AdminSettings />} />
          <Route path="ai-actors" element={<AIActors />} />
        </Route>
        <Route path="/app/projects/:id/workbench" element={<ProtectedRoute><VideoWorkbench /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
