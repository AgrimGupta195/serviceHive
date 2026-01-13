import axios from "axios"

const axiosInstance = axios.create({
    baseURL:"http://localhost:5000",
    withCredentials:true
})

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        // Any status code within the range of 2xx
        return response;
    },
    (error) => {
        // Handle different types of errors
        if (error.response) {
            // The server responded with a status code outside the 2xx range
            const { status, data } = error.response;
            
            switch (status) {
                case 400:
                    console.error("Bad Request:", data);
                    break;
                case 401:
                    console.error("Unauthorized:", data);
                    // You could redirect to login page or refresh token here
                    break;
                case 403:
                    console.error("Forbidden:", data);
                    break;
                case 404:
                    console.error("Not Found:", data);
                    break;
                case 500:
                    console.error("Server Error:", data);
                    break;
                default:
                    console.error(`Error (${status}):`, data);
            }
        } else if (error.request) {
            // The request was made but no response was received
            // This usually means CORS error, network error, or server is down
            if (error.request.status === 0) {
                console.error("Network Error: Unable to connect to server. Please check if the backend server is running.");
            } else {
                console.error("Network Error: No response received", error.request);
            }
        } else {
            // Something happened in setting up the request
            console.error("Error:", error.message);
        }

        // You can customize the error object before rejecting
        return Promise.reject({
            message: 
                error.response?.data?.message || 
                (error.request?.status === 0 
                    ? "Unable to connect to server. Please ensure the backend server is running on http://localhost:5000"
                    : error.message || "Unknown error occurred"),
            status: error.response?.status || (error.request?.status === 0 ? 0 : null),
            data: error.response?.data,
        });
    }
);
export default axiosInstance