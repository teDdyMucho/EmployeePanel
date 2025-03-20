import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EmployeePanel from './components/EmployeePanel';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/employee" element={<EmployeePanel />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;