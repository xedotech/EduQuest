import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import CreateQuestForm from '../components/quest/CreateQuestForm';

const CreateQuestPage = () => {
  const [questCreated, setQuestCreated] = useState(null);
  const navigate = useNavigate();

  const handleQuestCreated = (quest) => {
    setQuestCreated(quest);
    // Auto-redirect to dashboard after 3 seconds
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (questCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto"
        >
          {/* Success Card */}
          <div className="relative backdrop-blur-md bg-white/10 dark:bg-white/5 rounded-2xl p-8 shadow-xl border border-white/20 dark:border-white/10">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/20 via-blue-500/20 to-purple-500/20 p-[1px]">
              <div className="h-full w-full rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-md" />
            </div>
            
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-blue-500 mb-6 shadow-lg"
              >
                <CheckCircle className="w-8 h-8 text-white" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Quest Created Successfully! 🎉
              </h2>
              
              <div className="space-y-3 mb-6">
                <div className="p-4 rounded-xl bg-white/20 dark:bg-white/5 border border-white/30 dark:border-white/10">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {questCreated.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Category: {questCreated.category}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Levels: {questCreated.levels?.length || 1}
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your quest has been generated and is ready to play! 
                Redirecting to dashboard in 3 seconds...
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackToDashboard}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Go to Dashboard Now
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={handleBackToDashboard}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/20 dark:bg-white/5 border border-white/30 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/10 transition-all duration-200 backdrop-blur-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </motion.div>

        {/* Create Quest Form */}
        <CreateQuestForm onQuestCreated={handleQuestCreated} />
      </div>
    </div>
  );
};

export default CreateQuestPage;

