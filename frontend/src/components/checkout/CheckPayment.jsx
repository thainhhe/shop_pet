import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import PropTypes from "prop-types";

const CheckPayment = ({ totalMoney, txt, onPaymentSuccess }) => {
  const [paidLoad, setPaidLoad] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      async function checkPay() {
        try {
          const response = await fetch(
            "https://script.google.com/macros/s/AKfycbz2uOjG74YhORzw9TtEIJHEAxtD6Y_NFSacNIIwXQywg-3lSciDpNxT-_XybWu5jGLb/exec"
          );
          const data = await response.json();

          data.data.forEach((item) => {
            const matchedDescription = item["Mô tả"]
              .toLowerCase()
              .includes(txt.toLowerCase().trim());

            const matchedValue = Number(item["Giá trị"]) === Number(totalMoney);

            if (matchedDescription && matchedValue) {
              setPaidLoad(1);
              Swal.fire({
                title: "Payment Successful!",
                text: "Thank you!",
                icon: "success",
              }).then(() => {
                onPaymentSuccess();
              });

              clearInterval(interval);
            }
          });
        } catch (err) {
          console.error("Error checking payment:", err);
        }
      }

      checkPay();
    }, 5000);

    return () => clearInterval(interval);
  }, [totalMoney, txt, onPaymentSuccess]);

  return <input type="hidden" id="paidLoad" value={paidLoad} />;
};

CheckPayment.propTypes = {
  totalMoney: PropTypes.number.isRequired,
  txt: PropTypes.string.isRequired,
  onPaymentSuccess: PropTypes.func.isRequired,
};

export default CheckPayment;
