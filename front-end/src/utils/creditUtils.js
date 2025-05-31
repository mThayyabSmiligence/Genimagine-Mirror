import { axiosPrivate } from "../API's/axios"; 

// Check if credits should be fetched today
export const shouldFetchCreditsToday = () => {
  const lastFetchDate = localStorage.getItem("lastCreditsFetchDate");
  const today = new Date().toISOString().split("T")[0];
   console.log("lastFetchDate:", lastFetchDate);
  console.log("today:", today);
  return lastFetchDate !== today;
};

export const updateCreditsInLocalStorage = async () => {
  const userDataRaw = localStorage.getItem("user_data");

  if (!userDataRaw) {
    console.warn("Missing user data or token. Cannot fetch credits.");
    return;
  }

  const { user_id } = JSON.parse(userDataRaw);

  if (shouldFetchCreditsToday()) {
    try {
      const res = await axiosPrivate.get(`/get-total-credits/${user_id}`);
      const data = res.data;

      if (res.status === 200) {
        localStorage.setItem("credit_balance", data.credits);
        localStorage.setItem("lastCreditsFetchDate", new Date().toISOString().split("T")[0]);

        const updatedCredits = localStorage.getItem("credit_balance")
        console.log("Credits updated in localStorage:", updatedCredits);
      } else {
        console.error("Error fetching credits:", data?.message || "Unexpected error.");
      }
    } catch (err) {
      console.error("Error fetching credits:", err);
    }
  } else {
    console.log("Using cached credits from localStorage for today.");
  }
};
