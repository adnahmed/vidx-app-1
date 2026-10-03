/**
 * Central API configuration
 *
 * In development: Uses localhost:8000
 * In production: Uses REACT_APP_API_URL environment variable or falls back to the production server
 */

export const API_BASE_URL =
	process.env.NODE_ENV === "development"
		? "http://localhost:8000/api"
		: process.env.REACT_APP_API_URL || "http://212.85.25.109:8000";
