import { createContext, useContext, useReducer } from "react";
import { adoptionAPI } from "../services/api";

const AdoptionContext = createContext();

const initialState = {
  applications: [],
  currentApplication: null,
  loading: false,
  error: null,
};

const adoptionReducer = (state, action) => {
  switch (action.type) {
    case "ADOPTION_START":
      return {
        ...state,
        loading: true,
        error: null,
      };
    case "ADOPTION_SUCCESS":
      return {
        ...state,
        loading: false,
        error: null,
        [action.key]: action.payload,
      };
    case "ADOPTION_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export function AdoptionProvider({ children }) {
  const [state, dispatch] = useReducer(adoptionReducer, initialState);

  const submitApplication = async (petId, applicationData) => {
    try {
      dispatch({ type: "ADOPTION_START" });
      const response = await adoptionAPI.submitApplication(
        petId,
        applicationData
      );
      dispatch({
        type: "ADOPTION_SUCCESS",
        key: "currentApplication",
        payload: response.data.application,
      });
      return { success: true, application: response.data.application };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to submit application";
      dispatch({ type: "ADOPTION_ERROR", payload: message });
      return { success: false, error: message };
    }
  };

  const getMyApplications = async (params) => {
    try {
      dispatch({ type: "ADOPTION_START" });
      const response = await adoptionAPI.getMyApplications(params);
      dispatch({
        type: "ADOPTION_SUCCESS",
        key: "applications",
        payload: response.data.applications,
      });
      return { success: true, applications: response.data.applications };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch applications";
      dispatch({ type: "ADOPTION_ERROR", payload: message });
      return { success: false, error: message };
    }
  };

  const getAdoptionById = async (id) => {
    try {
      dispatch({ type: "ADOPTION_START" });
      const response = await adoptionAPI.getAdoptionById(id);
      dispatch({
        type: "ADOPTION_SUCCESS",
        key: "currentApplication",
        payload: response.data.application,
      });
      return { success: true, application: response.data.application };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch application";
      dispatch({ type: "ADOPTION_ERROR", payload: message });
      return { success: false, error: message };
    }
  };

  const updateAdoptionStatus = async (id, status, notes) => {
    try {
      dispatch({ type: "ADOPTION_START" });
      const response = await adoptionAPI.updateAdoptionStatus(
        id,
        status,
        notes
      );
      dispatch({
        type: "ADOPTION_SUCCESS",
        key: "currentApplication",
        payload: response.data.application,
      });
      return { success: true, application: response.data.application };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update application status";
      dispatch({ type: "ADOPTION_ERROR", payload: message });
      return { success: false, error: message };
    }
  };

  const cancelApplication = async (id) => {
    try {
      dispatch({ type: "ADOPTION_START" });
      await adoptionAPI.cancelApplication(id);

      // Update applications list by removing the cancelled one
      const updatedApplications = state.applications.filter(
        (app) => app._id !== id
      );
      dispatch({
        type: "ADOPTION_SUCCESS",
        key: "applications",
        payload: updatedApplications,
      });

      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to cancel application";
      dispatch({ type: "ADOPTION_ERROR", payload: message });
      return { success: false, error: message };
    }
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const value = {
    ...state,
    submitApplication,
    getMyApplications,
    getAdoptionById,
    updateAdoptionStatus,
    cancelApplication,
    clearError,
  };

  return (
    <AdoptionContext.Provider value={value}>
      {children}
    </AdoptionContext.Provider>
  );
}

export function useAdoption() {
  const context = useContext(AdoptionContext);
  if (!context) {
    throw new Error("useAdoption must be used within an AdoptionProvider");
  }
  return context;
}
