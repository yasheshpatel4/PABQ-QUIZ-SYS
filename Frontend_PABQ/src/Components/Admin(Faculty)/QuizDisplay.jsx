import { useState, useEffect } from "react"
import axios from "axios"
import AdminNavbar from "../NavBar/AdminNavbar"
import { AlertCircle, LoaderCircle, Trash2, PlusCircle, Upload } from "lucide-react"
import { useNavigate } from "react-router-dom"

const QuizDisplay = () => {
  const [quiz, setQuiz] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  const noofquestion = localStorage.getItem("question")

  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get("http://localhost:8080/auth/admin/getallquiz", {
          params: { email: localStorage.getItem("adminEmail") }, 
        });
        const quizdata = Array.isArray(response.data) ? response.data : [];

        const counts = {};
        await Promise.all(
          quizdata.map(async (quiz) => {
            try {
              const countResponse = await axios.get(`http://localhost:8080/auth/admin/noofquestion/${quiz.quizid}`);
              counts[quiz.quizid] = countResponse.data;
            } catch (err) {
              console.error(`Error fetching question count for quiz ID ${quiz.quizid}:`, err);
              counts[quiz.quizid] = 0; 
            }
          })
        );

        setQuestionCounts(counts);
        setQuiz(quizdata);
      } catch (err) {
        console.error("Error fetching quizzes:", err);
        setError("Failed to fetch quizzes. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz()
  }, [])

  const handleUpdate = (id) => {
    alert(`Update functionality for quiz ID: ${ id }`)
  }

  const handleAddQuestion = (id) => {
    localStorage.setItem("quizid", id);
    navigate('/admin/addquestion')
};


  const handleUpload = (id) => {
    alert(`Upload functionality for quiz ID: ${ id }`)
  }


  const handleDelete = async (id) => {

    const confirmed = window.confirm("Are you sure you want to delete this quiz?")
    if (!confirmed) return

    try {
      await axios.delete(`http://localhost:8080/auth/admin/deletequiz/${id}`)
        setQuiz(quiz.filter((quiz) => quiz.Quizid !== id))
      alert("Quiz deleted successfully.")
    } catch (err) {
      console.error("Error deleting quiz:", err.response?.data || err.message);
      setError(err.response?.data || "Failed to delete quiz. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-gray-700 font-medium text-lg">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-red-200">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle className="w-8 h-8" />
            <h2 className="text-xl font-semibold">Error</h2>
          </div>
          <p className="text-gray-700 mb-6 text-lg">{error}</p>
          <button
            onClick={() => setError("")}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 text-lg font-semibold"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  if (!Array.isArray(quiz) || quiz.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-2xl text-gray-700 font-medium">No quizzes found.</p>
      </div>
    );
  }

  return (
    <AdminNavbar>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Quiz ID", "Subject", "Semester", "Duration", "Description", "Actions","noofquestion"].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quiz.map((item) => (
              <tr key={item.quizid} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quizid}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.QuizSubject}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.QuizSem}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.QuizDuration}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.QuizDescription}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddQuestion(item.quizid)}
                      className="p-1 text-green-600 hover:text-green-800 transition-colors duration-200"
                      title="Add question"
                    >
                      <PlusCircle className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleUpload(item.quizid)}
                      className="p-1 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                      title="Upload"
                      disabled={noofquestion.length == 0}
                    >
                    
                      <Upload className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.quizid)}
                      className="p-1 text-red-600 hover:text-red-800 transition-colors duration-200"
                      title="Remove quiz"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminNavbar>
  );
};

export default QuizDisplay