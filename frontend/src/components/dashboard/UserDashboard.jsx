import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Coins, 
  Star, 
  BookOpen, 
  Users, 
  Target,
  TrendingUp,
  Award,
  Zap,
  Crown
} from 'lucide-react';

const UserDashboard = () => {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getXPProgress = () => {
    const currentLevelXP = (userProfile.level - 1) * 100;
    const nextLevelXP = userProfile.level * 100;
    const progress = ((userProfile.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.min(progress, 100);
  };

  const getLevelIcon = (level) => {
    if (level >= 10) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (level >= 5) return <Award className="w-6 h-6 text-purple-500" />;
    return <Star className="w-6 h-6 text-blue-500" />;
  };

  const stats = [
    {
      label: 'Total XP',
      value: userProfile.xp.toLocaleString(),
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      label: 'Coins',
      value: userProfile.coins.toLocaleString(),
      icon: <Coins className="w-6 h-6 text-yellow-600" />,
      color: 'from-yellow-600 to-yellow-700'
    },
    {
      label: 'Quests Completed',
      value: '0', // Will be dynamic later
      icon: <Target className="w-6 h-6 text-green-500" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Rank',
      value: '#--', // Will be dynamic later
      icon: <TrendingUp className="w-6 h-6 text-blue-500" />,
      color: 'from-blue-500 to-indigo-500'
    }
  ];

  const quickActions = [
    {
      title: 'Create Quest',
      description: 'Upload content and generate a new quest',
      icon: <BookOpen className="w-8 h-8" />,
      color: 'from-blue-500 to-purple-500',
      action: () => navigate('/create-quest')
    },
    {
      title: 'Browse Quests',
      description: 'Explore community-created quests',
      icon: <Users className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-500',
      action: () => console.log('Browse Quests')
    },
    {
      title: 'Leaderboard',
      description: 'See how you rank against others',
      icon: <Trophy className="w-8 h-8" />,
      color: 'from-green-500 to-teal-500',
      action: () => console.log('Leaderboard')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome back, {userProfile.displayName}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {userProfile.department} • Level {userProfile.level}
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-white/20 dark:bg-white/5 border border-white/30 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
            >
              Sign Out
            </button>
          </div>
        </motion.div>

        {/* User Level Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative backdrop-blur-md bg-white/10 dark:bg-white/5 rounded-2xl p-6 shadow-xl border border-white/20 dark:border-white/10">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 p-[1px]">
              <div className="h-full w-full rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-md" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getLevelIcon(userProfile.level)}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Level {userProfile.level}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {userProfile.xp} XP
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Next Level</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {userProfile.level * 100} XP
                  </p>
                </div>
              </div>
              
              {/* XP Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getXPProgress()}%` }}
                  transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full shadow-lg"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {Math.round(getXPProgress())}% to next level
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="relative backdrop-blur-md bg-white/10 dark:bg-white/5 rounded-2xl p-6 shadow-xl border border-white/20 dark:border-white/10 cursor-pointer"
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${stat.color}/20 p-[1px]`}>
                <div className="h-full w-full rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-md" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  {stat.icon}
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={action.action}
                className="relative backdrop-blur-md bg-white/10 dark:bg-white/5 rounded-2xl p-6 shadow-xl border border-white/20 dark:border-white/10 text-left hover:shadow-2xl transition-all duration-200"
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${action.color}/20 p-[1px]`}>
                  <div className="h-full w-full rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-md" />
                </div>
                
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} text-white mb-4 shadow-lg`}>
                    {action.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {action.description}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative backdrop-blur-md bg-white/10 dark:bg-white/5 rounded-2xl p-6 shadow-xl border border-white/20 dark:border-white/10"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gray-500/10 via-gray-400/10 to-gray-500/10 p-[1px]">
            <div className="h-full w-full rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-md" />
          </div>
          
          <div className="relative z-10 text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Ready to Start Your First Quest?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Upload your study materials and transform them into engaging learning adventures.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Create Your First Quest
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard;

