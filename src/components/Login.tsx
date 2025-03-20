import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { UserCircle2, KeyRound, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const storedEmployee = localStorage.getItem('currentEmployee');
    if (storedEmployee) {
      const employee = JSON.parse(storedEmployee);
      // Verify the stored employee data
      verifyStoredEmployee(employee);
    }
  }, []);

  const verifyStoredEmployee = async (storedEmployee: any) => {
    try {
      const q = query(
        collection(db, 'employees'),
        where('employeeId', '==', storedEmployee.employeeId)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // If employee exists in database, redirect to appropriate page
        navigate('/employee');
      } else {
        // If employee no longer exists, clear localStorage
        localStorage.removeItem('currentEmployee');
        toast({
          title: "Session Expired",
          description: "Please log in again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error verifying stored employee:', error);
      localStorage.removeItem('currentEmployee');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Query employees collection by employeeId
      const q = query(
        collection(db, 'employees'),
        where('employeeId', '==', employeeId)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError('Employee ID not found. Please check your credentials.');
        return;
      }

      const employeeDoc = querySnapshot.docs[0];
      const employeeData = employeeDoc.data();
      
      if (employeeData.password !== password) {
        setError('Invalid password. Please try again.');
        return;
      }

      if (employeeData.disabled) {
        setError('This account has been disabled. Please contact your administrator.');
        return;
      }

      const employeeInfo = {
        employeeId: employeeData.employeeId,
        name: employeeData.name,
        isAdmin: employeeData.isAdmin,
        department: employeeData.department
      };

      // Store employee info in localStorage
      localStorage.setItem('currentEmployee', JSON.stringify(employeeInfo));
      
      // Set session storage to track active session
      sessionStorage.setItem('sessionActive', 'true');

      toast({
        title: "Welcome back!",
        description: `Logged in as ${employeeData.name}`,
      });

      navigate('/employee');
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174')] bg-cover bg-center opacity-10" />
      </div>
      
      <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg mx-auto text-center mb-8"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2 
              }}
              className="relative"
            >
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl" />
              <div className="relative w-24 h-24 bg-white/10 rounded-full flex items-center justify-center border border-white/30 shadow-2xl">
                <Clock className="w-12 h-12 text-white" />
              </div>
            </motion.div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Employee Portal</h1>
          <p className="text-white/80">Sign in to access your dashboard</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardContent className="pt-6">
              <form onSubmit={handleLogin} className="space-y-6">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <Label htmlFor="employeeId" className="text-white">Employee ID</Label>
                  <div className="relative">
                    <UserCircle2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                    <Input
                      id="employeeId"
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="Enter your employee ID"
                      className="pl-10 h-12 bg-black/20 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus: ring-white/20"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2"
                >
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10 h-12 bg-black/20 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/20"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 text-center"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg font-medium bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all duration-300 ease-in-out hover:scale-[1.02] focus:ring-white/20"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;