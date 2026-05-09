import axios from "./api";

export const buyrazorpay = async () => {
  try {
    // ✅ get order properly from backend
    const { data: order } = await axios.post("/auth/v1/api/payment/create-order");

    console.log("ORDER:", order);

    const options = {
      key: "rzp_test_SlbwSMBJafTPK6",
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,

      name: "StackLoop Premium",
      description: "Unlock exclusive content and features with StackLoop Premium subscription.",

      handler: async function (response) {
        console.log("PAYMENT RESPONSE:", response);
        try {
          const res = await axios.post("/auth/v1/api/payment/verify", response);
          if (res.data.success) {
            alert("Payment successful! Premium unlocked 🎉");
            window.location.reload(); // Reload to refresh user status
          } else {
            alert("Payment verification failed ❌");
          }
        } catch (err) {
          console.error("Verify error:", err);
        }
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (err) {
    console.error("Payment error:", err);
    throw err;
  }
};
