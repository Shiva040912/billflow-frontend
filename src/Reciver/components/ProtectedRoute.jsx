import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  const accessToken = localStorage.getItem(
    "billFlowAccessToken",
  );

  const user = localStorage.getItem("billFlowUser");

  if (!accessToken || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;