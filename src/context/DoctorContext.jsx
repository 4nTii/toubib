import { createContext, useContext, useState, useEffect } from "react";
import { getDoctorInfo, updateDoctorProfile } from "../services/doctorService";
import { useAuth } from "./AuthContext";

const DoctorContext = createContext(null);

export function DoctorProvider({ children }) {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDoctorInfo = async () => {
    if (!user?.isDoctor) {
      setDoctor(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const result = await getDoctorInfo();

    if (result && result.status) {
      setDoctor(result.data.doctor);
    } else {
      setDoctor(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDoctorInfo();
  }, [user]);

  const updateDoctor = async (fields, photoFile = null) => {
    const result = await updateDoctorProfile(fields, photoFile);

    if (result.success) {
      await fetchDoctorInfo();
    }

    return result;
  };

  const value = {
    doctor,
    isLoading,
    fetchDoctorInfo,
    updateDoctor,
  };

  return (
    <DoctorContext.Provider value={value}>{children}</DoctorContext.Provider>
  );
}

export function useDoctor() {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error("useDoctor must be used within a DoctorProvider");
  }
  return context;
}
