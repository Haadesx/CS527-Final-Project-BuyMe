import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Loader from '../components/Loader';
import { format } from 'date-fns';
import { FaUserCircle, FaUserTie } from 'react-icons/fa';
import { Fade } from 'react-awesome-reveal';

const QuestionAndAnswerScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [loading, setLoading] = useState(false);

  const sortedQuestions = [...questions].sort(
    (a, b) => new Date(b.asked_at) - new Date(a.asked_at)
  );

  const fetchUnansweredQuestions = async () => {
    try {
      const { data } = await axios.get('/api/question/all', {
        headers: { Authorization: `Bearer ${userInfo.data}` },
      });
      setQuestions(data?.data || []);
    } catch (err) {
      console.error('Failed to fetch questions', err);
    }
  };

  useEffect(() => {
    fetchUnansweredQuestions();
  }, []);

  const answerQuestion = async (id) => {
    const answer = prompt('Enter your response:');
    if (!answer) return;
    try {
      await axios.post(
        `/api/question/answer/${id}`,
        { answer_text: answer },
        {
          headers: { Authorization: `Bearer ${userInfo.data}` },
        }
      );
      fetchUnansweredQuestions();
    } catch (err) {
      console.error('Error submitting answer:', err);
    }
  };

  const postQuestion = async () => {
    if (!questionText.trim()) return;
    try {
      await axios.post(
        '/api/question',
        {
          user_id: userInfo.user_id,
          question_text: questionText,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.data}` },
        }
      );
      setQuestionText('');
      fetchUnansweredQuestions();
    } catch (err) {
      console.error('Failed to post question:', err);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Fade triggerOnce direction="up">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2 uppercase tracking-widest">Concierge Service</h1>
            <p className="text-gray-300/60 font-light italic">Direct communication with The Vault representatives.</p>
          </div>
        </Fade>

        {/* Input Area */}
        <Fade triggerOnce direction="up" delay={100}>
          <div className="bg-gray-900 p-6 border border-gray-700/20 shadow-lg mb-12 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-900 via-gold-400 to-emerald-900"></div>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={3}
              className="w-full bg-transparent border-b border-gray-700/30 text-white p-2 focus:outline-none focus:border-gray-700 transition-colors font-serif resize-none placeholder-charcoal-900/30"
              placeholder="How may we assist you today?"
            ></textarea>
            <div className="flex justify-end mt-4">
              <button
                onClick={postQuestion}
                className="px-8 py-2 bg-gray-800 text-blue-400 font-serif tracking-widest hover:bg-emerald-800 transition-all shadow-md"
              >
                INQUIRE
              </button>
            </div>
          </div>
        </Fade>

        {/* Chat Stream */}
        <div className="space-y-8">
          {sortedQuestions.map((q, index) => (
            <Fade key={q.question_id} triggerOnce direction="up" delay={index * 50}>
              <div className="flex flex-col space-y-4">

                {/* User Question */}
                <div className="self-end max-w-[80%]">
                  <div className="bg-gray-900 border border-gray-700/20 p-6 shadow-sm relative">
                    <div className="flex items-center justify-between mb-2 border-b border-gray-700/10 pb-2">
                      <div className="flex items-center">
                        <FaUserCircle className="w-5 h-5 text-blue-400 mr-2" />
                        <span className="text-xs uppercase tracking-widest text-white font-bold">You</span>
                      </div>
                      <span className="text-[10px] text-gray-300/40">{format(new Date(q.asked_at), 'PP p')}</span>
                    </div>
                    <p className="text-gray-300 font-light leading-relaxed">{q.question_text}</p>
                  </div>
                </div>

                {/* Rep Response */}
                {q.answer_text ? (
                  <div className="self-start max-w-[80%]">
                    <div className="bg-gray-800 p-6 shadow-md relative text-cream-50 border border-gray-700/30">
                      <div className="flex items-center justify-between mb-2 border-b border-gray-700/20 pb-2">
                        <div className="flex items-center">
                          <FaUserTie className="w-5 h-5 text-blue-400 mr-2" />
                          <span className="text-xs uppercase tracking-widest text-blue-400 font-bold">The Vault</span>
                        </div>
                        <span className="text-[10px] text-cream-50/40">{format(new Date(q.answered_at), 'PP p')}</span>
                      </div>
                      <p className="font-light leading-relaxed">{q.answer_text}</p>
                    </div>
                  </div>
                ) : userInfo?.role === 'rep' || userInfo?.role === 'admin' ? (
                  <div className="self-start">
                    <button
                      onClick={() => answerQuestion(q.question_id)}
                      className="text-xs uppercase tracking-widest text-white hover:text-blue-400 transition-colors font-bold border-b border-emerald-900 hover:border-gray-700 pb-1"
                    >
                      Reply to Inquiry
                    </button>
                  </div>
                ) : (
                  <div className="self-start text-xs text-gray-300/40 italic pl-2">
                    Awaiting response from a representative...
                  </div>
                )}

              </div>
            </Fade>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionAndAnswerScreen;
