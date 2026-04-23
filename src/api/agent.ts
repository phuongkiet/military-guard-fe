import axios from "axios";
import type { AxiosError, AxiosResponse } from "axios";

type ApiErrorPayload = {
	status?: number;
	title?: string;
	detail?: string;
	instance?: string;
	message?: string;
	errors?: unknown;
};

export type ApiError = {
	status: number;
	message: string;
	errors?: unknown;
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
const ACCESS_TOKEN_KEY = "accessToken";

export const getAccessToken = () => {
	return localStorage.getItem(ACCESS_TOKEN_KEY) ?? localStorage.getItem("token");
};

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

const extractApiErrorMessage = (error: AxiosError<ApiErrorPayload>) => {
	const payload = error.response?.data;

	if (payload?.detail && payload.detail.trim().length > 0) {
		return payload.detail;
	}

	if (payload?.message && payload.message.trim().length > 0) {
		return payload.message;
	}

	if (payload?.title && payload.title.trim().length > 0) {
		return payload.title;
	}

	return error.message ?? "Unexpected server error";
};

const agent = axios.create({
	baseURL: API_BASE_URL,
	timeout: 15000,
	withCredentials: false,
});

agent.interceptors.request.use(
	(config) => {
		const token = getAccessToken();

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		if (!(config.data instanceof FormData) && !config.headers["Content-Type"]) {
			config.headers["Content-Type"] = "application/json";
		}

		return config;
	},
	(error) => Promise.reject(error),
);

agent.interceptors.response.use(
	(response) => response,
	(error: AxiosError<ApiErrorPayload>) => {
		const status = error.response?.status ?? 500;
		const message = extractApiErrorMessage(error);

		const normalizedError: ApiError = {
			status,
			message,
			errors: error.response?.data?.errors,
		};

		return Promise.reject(normalizedError);
	},
);

export const setAccessToken = (token: string | null) => {
	if (token) {
		localStorage.setItem(ACCESS_TOKEN_KEY, token);
		return;
	}

	localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const requests = {
	get: <T>(url: string, params?: Record<string, unknown>) =>
		agent.get<T>(url, { params }).then(responseBody),
	post: <T>(url: string, body?: unknown) => agent.post<T>(url, body).then(responseBody),
	put: <T>(url: string, body?: unknown) => agent.put<T>(url, body).then(responseBody),
	patch: <T>(url: string, body?: unknown) => agent.patch<T>(url, body).then(responseBody),
	delete: <T>(url: string) => agent.delete<T>(url).then(responseBody),
};

export default agent;
