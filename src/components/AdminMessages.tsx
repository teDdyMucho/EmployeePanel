import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Message } from "@/types/employee";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, User } from "lucide-react";

interface AdminMessagesProps {
  messages: Message[];
  employees: { id: string; name: string; employeeId: string }[];
  onMessageSent: () => void;
}

const AdminMessages = ({ messages, employees, onMessageSent }: AdminMessagesProps) => {
  const [newMessage, setNewMessage] = useState({
    sender: "Admin",
    message: "",
    recipientId: "all_employees",
    timestamp: Timestamp.now(),
  });

  const handleMessageInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewMessage(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRecipientChange = (value: string) => {
    setNewMessage(prev => ({
      ...prev,
      recipientId: value,
    }));
  };

  const handleCreateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "messages"), {
        ...newMessage,
        recipientId: newMessage.recipientId === "all" ? "all_employees" : newMessage.recipientId,
        timestamp: Timestamp.now(),
      });
      setNewMessage({
        sender: "Admin",
        message: "",
        recipientId: "all_employees",
        timestamp: Timestamp.now(),
      });
      onMessageSent();
    } catch (error) {
      console.error("Error creating message:", error);
    }
  };

  return (
    <Card className="glassmorphism">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          Manage Messages
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateMessage} className="grid gap-4">
          <Select
            value={newMessage.recipientId}
            onValueChange={handleRecipientChange}
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Select recipient" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_employees">All Employees</SelectItem>
              {employees.map(emp => (
                <SelectItem key={emp.employeeId} value={emp.employeeId}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <textarea
            name="message"
            placeholder="Message"
            value={newMessage.message}
            onChange={handleMessageInputChange}
            className="flex h-20 w-full rounded-md border bg-white/10 border-white/20 px-3 py-2 text-base text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 md:text-sm"
          />
          
          <Button 
            type="submit" 
            className="bg-white/20 hover:bg-white/30 text-white border-0"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        </form>

        <motion.div 
          className="mt-8 divide-y divide-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="py-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-white/70" />
                    </div>
                    <div>
                      <span className="font-medium text-white">{message.sender}</span>
                      {message.recipientId && (
                        <span className="text-sm text-white/70 ml-2">
                          to: {message.recipientId === "all_employees" ? "All Employees" : 
                              employees.find(emp => emp.employeeId === message.recipientId)?.name || 
                              message.recipientId}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-white/50">
                    {message.timestamp?.toDate().toLocaleString()}
                  </span>
                </div>
                <p className="mt-2 text-white/90 pl-10">{message.message}</p>
                {message.reply && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-10 mt-2 p-3 bg-white/5 rounded-lg"
                  >
                    <p className="text-sm text-white/70">Reply from {message.reply.sender}:</p>
                    <p className="mt-1 text-white">{message.reply.message}</p>
                    <span className="text-xs text-white/50">
                      {message.reply.timestamp.toDate().toLocaleString()}
                    </span>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default AdminMessages;