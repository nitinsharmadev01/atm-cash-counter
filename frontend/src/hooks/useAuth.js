import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { getSessionUser } from "../services/authApi";

export const useAuth = () => {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { login, logout } = useAuthStore();

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await getSessionUser();
        login(response.data.user);
      } catch (error) {
        logout();
      } finally {
        setIsCheckingAuth(false);
      }
    };

    verifySession();
  }, [login, logout]);

  return { isCheckingAuth };
};

// import { useState, useEffect } from "react";
// import { useAuthStore } from "../store/authStore";
// import { getSessionUser } from "../services/authApi";

// export const useAuth = () => {
//   const [isCheckingAuth, setIsCheckingAuth] = useState(true);

//   // Explicit selectors (Bulletproof approach)
//   const login = useAuthStore((state) => state.login);
//   const logout = useAuthStore((state) => state.logout);

//   useEffect(() => {
//     const verifySession = async () => {
//       try {
//         const response = await getSessionUser();
//         login(response.data.user);
//       } catch (error) {
//         logout();
//       } finally {
//         setIsCheckingAuth(false);
//       }
//     };

//     verifySession();
//   }, [login, logout]);

//   return { isCheckingAuth };
// };
