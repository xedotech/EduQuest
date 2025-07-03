import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Link, Type, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CreateQuestForm = ({ onQuestCreated }) => {
  const [activeTab, setActiveTab] = useState('text');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    content: '',
    url: '',
    file: null
  });
  const [error, setError] = useState('');
  const { user } = useAuth();

  const categories = [
    'General',
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'History',
    'Literature',
    'Business',
    'Engineering'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let content = '';
      
      // Get content based on active tab
      if (activeTab === 'text') {
        content = formData.content;
      } else if (activeTab === 'url') {
        // For demo, just use the URL as content
        content = `Content from URL: ${formData.url}`;
      } else if (activeTab === 'file') {
        // For demo, simulate file content
        content = `Content from file: ${formData.file?.name || 'uploaded file'}`;
      }

      if (!content.trim()) {
        setError('Please provide some content for your quest');
        return;
      }

      if (!formData.title.trim()) {
        setError('Please provide a title for your quest');
        return;
      }

      // Call the Workers API to process content
      const response = await fetch('http://localhost:8787/content/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.accessToken || 'demo-token'}`
        },
        body: JSON.stringify({
          content: content,
          title: formData.title,
          category: formData.category,
          type: activeTab
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create quest');
      }

      // Reset form
      setFormData({
        title: '',
        category: 'General',
        content: '',
        url: '',
        file: null
      });

      // Notify parent component
      if (onQuestCreated) {
        onQuestCreated(result.quest);
      }

    } catch (error) {
      console.error('Quest creation error:', error);
      setError(error.message || 'Failed to create quest');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'text', label: 'Text', icon: Type },
    { id: 'file', label: 'File Upload', icon: Upload },
    { id: 'url', label: 'Web Link', icon: Link }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4 shadow-lg"
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Create Your Quest
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Transform your study materials into an engaging learning adventure
        </p>
      </div>

      {/* Main Form Card */}
      <div className="relative backdrop-blur-md bg-white/10 dark:bg-white/5 rounded-2xl p-8 shadow-xl border border-white/20 dark:border-white/10">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 p-[1px]">
          <div className="h-full w-full rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-md" />
        </div>

        <div className="relative z-10">
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quest Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Quest Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/20 dark:bg-white/5 border border-white/30 dark:border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter a catchy title for your quest"
              />
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl bg-white/20 dark:bg-white/5 border border-white/30 dark:border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-white appearance-none cursor-pointer"
              >
                {categories.map((category) => (
                  <option key={category} value={category} className="bg-gray-800 text-white">
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Content Input Tabs */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Content Source
              </label>
              
              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-white/10 dark:bg-white/5 rounded-xl p-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="min-h-[200px]">
                {activeTab === 'text' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      rows={8}
                      className="w-full px-4 py-3 rounded-xl bg-white/20 dark:bg-white/5 border border-white/30 dark:border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                      placeholder="Paste your study material here... (lecture notes, textbook content, etc.)"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Tip: The more detailed your content, the better your quest will be!
                    </p>
                  </motion.div>
                )}

                {activeTab === 'file' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="border-2 border-dashed border-white/30 dark:border-white/10 rounded-xl p-8 text-center hover:border-blue-500/50 transition-colors">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.docx,.txt,.md"
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:shadow-lg transition-all duration-200"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Choose File</span>
                      </label>
                      {formData.file && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          Selected: {formData.file.name}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Supported formats: PDF, DOCX, TXT, MD
                      </p>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'url' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <input
                      type="url"
                      name="url"
                      value={formData.url}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/20 dark:bg-white/5 border border-white/30 dark:border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="https://example.com/article"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Enter a URL to an article, Wikipedia page, or educational resource
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Generating Your Quest...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Quest
                </div>
              )}
            </motion.button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default CreateQuestForm;

