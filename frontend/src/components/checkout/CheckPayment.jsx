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
            "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLgihw2ZLxz8aYvp9JdZsk0Pd533aO6cveBrd4DuFA4pCR_O-nOPassMWkw5YouUvruiFjxsxrZ92HplVWMm83q1ZSoczDfEZlgKAQrcER_7N4fwW7sZF7T5-vyuA0zt_RJXGdkswgZk66b_3_E04L6Juv_ihIpry-w_oQLuHYPYm20RIbNKAS5iBizu1NNR6D9jUIbOTnS_mSRHOdzU2Us3vbhQ-ev9uCeIFjh6us733FBdr3bcwHyPLRKoTRGGvEY74qnHa-Cz4UI3-B5prU5UlLOZuA&lib=MUV9qdfEa1GfZ5HKODxbIsb6um8U_97m1"
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
                text: "Thank you. Enjoy your meal!",
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
