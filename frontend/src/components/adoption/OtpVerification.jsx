import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const OtpVerification = () => {
  const { id } = useParams(); // id của đơn nhận nuôi
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleVerify = async () => {
    try {
      const res = await axios.post(
        "/api/adoptions/verify-otp",
        { otp },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setSuccess(res.data.message);
      setTimeout(() => {
        navigate(`/adoption/${id}/payment`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Xác minh OTP thất bại.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow rounded mt-8">
      <h2 className="text-xl font-bold mb-4">Xác minh mã OTP</h2>
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Nhập mã OTP"
        className="w-full border px-3 py-2 mb-2"
      />
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      <button
        onClick={handleVerify}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        Xác minh
      </button>
    </div>
  );
};

export default OtpVerification;
