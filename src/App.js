import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DashHistory from './components/DashHistory';

function App() {
  const basename = process.env.NODE_ENV === 'production' ? '/SpeechInsight-Frontend' : '/';
  return (
    <Router basename={basename}>
      <div>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<DashHistory />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
