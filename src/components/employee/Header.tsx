import { motion } from "framer-motion";
import { Settings, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  currentEmployee: {
    name: string;
    isAdmin: boolean;
  } | null;
  onLogout: () => void;
}

export function Header({ currentEmployee, onLogout }: HeaderProps) {
  return (
    <header className="p-4 flex justify-between items-center bg-black/10 backdrop-blur-md">
      <motion.h1 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-bold text-white"
      >
        Employee Panel
      </motion.h1>
      
      <div className="flex items-center gap-4">
        {currentEmployee?.isAdmin && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-2"
          >
            <Link to="/admin">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </Link>
          </motion.div>
        )}
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <span className="text-white/90">Welcome, {currentEmployee?.name}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onLogout}
            className="text-white hover:bg-white/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </motion.div>
      </div>
    </header>
  );
}