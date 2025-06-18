export interface User {
	id: string;
	email: string;
	name: string;
	phone?: string;
	profileImage?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	image: string;
	category: string;
	inStock: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface AuthState {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
}

export interface NotificationData {
	id: string;
	title: string;
	message: string;
	type: "info" | "success" | "warning" | "error";
	read: boolean;
	createdAt: Date;
}

export interface PaginatedResponse<T> {
	data: T[];
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterCredentials {
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
}

export interface ResetPasswordData {
	email: string;
	otp?: string;
	newPassword?: string;
}

export type RootStackParamList = {
	Login: undefined;
	Register: undefined;
	ForgotPassword: undefined;
	ResetPassword: { email: string };
	MainTabs: undefined;
	ProductDetail: { productId: string };
	Camera: undefined;
	Profile: undefined;
	EditProfile: undefined;
	Notifications: undefined;
	Favorites: undefined;
	MyProducts: undefined;
	Cart: undefined;
};

export type MainTabParamList = {
	Home: undefined;
	Products: undefined;
	Camera: undefined;
	Profile: undefined;
	Notifications: undefined;
};
