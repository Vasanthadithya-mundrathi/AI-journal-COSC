import React, { useState, useEffect } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Load journal entries on component mount
  useEffect(() => {
    fetchEntries();
  }, []);

  // Fetch all journal entries
  const fetchEntries = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/journal/entries`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  // Create new journal entry
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/journal/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newEntry = await response.json();
        setEntries([newEntry, ...entries]);
        setFormData({ title: '', content: '' });
        setShowForm(false);
        setAiAnalysis(null);
      }
    } catch (error) {
      console.error('Error creating entry:', error);
    } finally {
      setLoading(false);
    }
  };

  // Real-time AI analysis
  const analyzeContent = async (content) => {
    if (!content.trim() || content.length < 20) {
      setAiAnalysis(null);
      return;
    }

    setAnalyzing(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/journal/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content }),
      });

      if (response.ok) {
        const analysis = await response.json();
        setAiAnalysis(analysis);
      }
    } catch (error) {
      console.error('Error analyzing content:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  // Handle content change with debounced analysis
  const handleContentChange = (e) => {
    const content = e.target.value;
    setFormData({ ...formData, content });

    // Debounce AI analysis
    clearTimeout(window.analysisTimeout);
    window.analysisTimeout = setTimeout(() => {
      analyzeContent(content);
    }, 1000);
  };

  // Delete journal entry
  const deleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/journal/entries/${entryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEntries(entries.filter(entry => entry.id !== entryId));
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  // Get mood emoji
  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      happy: '😊', sad: '😢', excited: '🎉', anxious: '😰',
      reflective: '🤔', grateful: '🙏', frustrated: '😤',
      content: '😌', overwhelmed: '🤯', hopeful: '🌟',
      angry: '😠', peaceful: '🕊️'
    };
    return moodEmojis[mood] || '📝';
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-purple-100">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI-Powered Journal
              </h1>
              <p className="text-gray-600 mt-2">Capture your thoughts, discover your mood</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {showForm ? '✕ Cancel' : '+ New Entry'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* New Entry Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-8 mb-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Write New Entry</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Give your entry a title..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={formData.content}
                  onChange={handleContentChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 h-40 resize-none"
                  placeholder="Share your thoughts, feelings, and experiences..."
                  required
                />
              </div>

              {/* AI Analysis Preview */}
              {(analyzing || aiAnalysis) && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
                  <h3 className="font-semibold text-gray-700 mb-2">🤖 AI Analysis</h3>
                  {analyzing ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-b-transparent"></div>
                      <span className="text-sm text-gray-600">Analyzing your mood and content...</span>
                    </div>
                  ) : aiAnalysis && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getMoodEmoji(aiAnalysis.mood)}</span>
                        <span className="font-medium capitalize text-gray-700">{aiAnalysis.mood}</span>
                      </div>
                      <p className="text-sm text-gray-600 italic">"{aiAnalysis.summary}"</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-b-transparent"></div>
                      <span>Saving & Analyzing...</span>
                    </div>
                  ) : (
                    'Save Entry'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ title: '', content: '' });
                    setAiAnalysis(null);
                  }}
                  className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Journal Entries Timeline */}
        <div className="space-y-6">
          {entries.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No entries yet</h3>
              <p className="text-gray-500 mb-6">Start your journaling journey by creating your first entry</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Write First Entry
              </button>
            </div>
          ) : (
            entries.map((entry, index) => (
              <div key={entry.id} className="relative">
                {/* Timeline line */}
                {index < entries.length - 1 && (
                  <div className="absolute left-8 top-16 w-0.5 h-full bg-gradient-to-b from-purple-300 to-blue-300"></div>
                )}
                
                {/* Timeline dot */}
                <div className="absolute left-6 top-6 w-4 h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full border-4 border-white shadow-lg"></div>
                
                {/* Entry card */}
                <div className="ml-16 bg-white rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{entry.title}</h3>
                        <p className="text-sm text-gray-500">{formatDate(entry.created_at)}</p>
                      </div>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-2 hover:bg-red-50 rounded-lg"
                        title="Delete entry"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap">{entry.content}</p>
                    
                    {/* AI Analysis */}
                    {(entry.mood || entry.summary) && (
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-700 flex items-center">
                            <span className="mr-2">🤖</span>
                            AI Analysis
                          </h4>
                        </div>
                        
                        <div className="space-y-2">
                          {entry.mood && (
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                              <span className="font-medium text-gray-700 capitalize">
                                Mood: {entry.mood}
                              </span>
                            </div>
                          )}
                          
                          {entry.summary && (
                            <p className="text-sm text-gray-600 italic pl-2 border-l-2 border-purple-300">
                              "{entry.summary}"
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;