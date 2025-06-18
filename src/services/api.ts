import { faker } from "@faker-js/faker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Product, User, PaginatedResponse } from "../types";

// Gerar produtos fake
export const generateFakeProducts = (count: number): Product[] => {
	const products: Product[] = [];

	for (let i = 0; i < count; i++) {
		products.push({
			id: faker.string.uuid(),
			name: faker.commerce.productName(),
			description: faker.commerce.productDescription(),
			price: parseFloat(faker.commerce.price()),
			image: faker.image.urlLoremFlickr({
				width: 300,
				height: 300,
				category: "product",
			}),
			category: faker.commerce.department(),
			inStock: faker.datatype.boolean(),
			createdAt: faker.date.past(),
			updatedAt: faker.date.recent(),
		});
	}

	return products;
};

// Gerar usuário fake
export const generateFakeUser = (): User => ({
	id: faker.string.uuid(),
	email: faker.internet.email(),
	name: faker.person.fullName(),
	phone: faker.phone.number(),
	profileImage: faker.image.avatar(),
	createdAt: faker.date.past(),
	updatedAt: faker.date.recent(),
});

// Simular API para produtos
class ProductService {
	private static products: Product[] = generateFakeProducts(10000);

	static async getProducts(
		page: number = 1,
		limit: number = 10
	): Promise<PaginatedResponse<Product>> {
		await new Promise((resolve) => setTimeout(resolve, 500)); // Simular delay da API

		const startIndex = (page - 1) * limit;
		const endIndex = startIndex + limit;
		const data = this.products.slice(startIndex, endIndex);

		return {
			data,
			page,
			limit,
			total: this.products.length,
			totalPages: Math.ceil(this.products.length / limit),
		};
	}

	static async getProduct(id: string): Promise<Product | null> {
		await new Promise((resolve) => setTimeout(resolve, 300));
		return this.products.find((product) => product.id === id) || null;
	}

	static async addProduct(
		productData: Omit<Product, "id" | "createdAt" | "updatedAt">
	): Promise<Product> {
		await new Promise((resolve) => setTimeout(resolve, 800));

		const newProduct: Product = {
			...productData,
			id: faker.string.uuid(),
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		this.products.unshift(newProduct);
		return newProduct;
	}

	static async searchProducts(
		query: string,
		page: number = 1,
		limit: number = 10
	): Promise<PaginatedResponse<Product>> {
		await new Promise((resolve) => setTimeout(resolve, 400));

		const filteredProducts = this.products.filter(
			(product) =>
				product.name.toLowerCase().includes(query.toLowerCase()) ||
				product.description
					.toLowerCase()
					.includes(query.toLowerCase()) ||
				product.category.toLowerCase().includes(query.toLowerCase())
		);

		const startIndex = (page - 1) * limit;
		const endIndex = startIndex + limit;
		const data = filteredProducts.slice(startIndex, endIndex);

		return {
			data,
			page,
			limit,
			total: filteredProducts.length,
			totalPages: Math.ceil(filteredProducts.length / limit),
		};
	}
}

// Simular API para autenticação
class AuthService {
	private static users: User[] = [generateFakeUser()];

	static async login(
		email: string,
		password: string
	): Promise<{ user: User; token: string }> {
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Simular validação (aceita qualquer email/senha para demo)
		let user = this.users.find((u) => u.email === email);

		if (!user) {
			// Criar usuário se não existir
			user = {
				id: faker.string.uuid(),
				email,
				name: faker.person.fullName(),
				phone: faker.phone.number(),
				profileImage: faker.image.avatar(),
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			this.users.push(user);
		}

		return {
			user,
			token: faker.string.alphanumeric(64),
		};
	}

	static async register(userData: {
		name: string;
		email: string;
		password: string;
	}): Promise<{ user: User; token: string }> {
		await new Promise((resolve) => setTimeout(resolve, 1200));

		const existingUser = this.users.find((u) => u.email === userData.email);
		if (existingUser) {
			throw new Error("Email já cadastrado");
		}

		const newUser: User = {
			id: faker.string.uuid(),
			email: userData.email,
			name: userData.name,
			phone: faker.phone.number(),
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		this.users.push(newUser);

		return {
			user: newUser,
			token: faker.string.alphanumeric(64),
		};
	}

	static async sendResetPasswordOTP(email: string): Promise<{ otp: string }> {
		await new Promise((resolve) => setTimeout(resolve, 800));

		const otp = faker.string.numeric(6);
		console.log(`OTP para ${email}: ${otp}`); // Em produção, seria enviado por email

		return { otp };
	}

	static async resetPassword(
		email: string,
		otp: string,
		newPassword: string
	): Promise<boolean> {
		await new Promise((resolve) => setTimeout(resolve, 600));

		// Simular validação do OTP (aceita qualquer OTP para demo)
		const user = this.users.find((u) => u.email === email);
		if (user) {
			user.updatedAt = new Date();
			return true;
		}

		return false;
	}
}

// Serviço para gerenciar produtos do usuário
class MyProductsService {
	private static STORAGE_KEY = "@photo_product_app:my_products";

	static async getMyProducts(): Promise<Product[]> {
		try {
			const data = await AsyncStorage.getItem(this.STORAGE_KEY);
			return data ? JSON.parse(data) : [];
		} catch (error) {
			console.error("Erro ao carregar meus produtos:", error);
			return [];
		}
	}

	static async addMyProduct(product: Product): Promise<void> {
		try {
			const myProducts = await this.getMyProducts();
			myProducts.unshift(product); // Adiciona no início da lista
			await AsyncStorage.setItem(
				this.STORAGE_KEY,
				JSON.stringify(myProducts)
			);
		} catch (error) {
			console.error("Erro ao salvar produto:", error);
			throw error;
		}
	}

	static async removeMyProduct(productId: string): Promise<void> {
		try {
			const myProducts = await this.getMyProducts();
			const filteredProducts = myProducts.filter(
				(p) => p.id !== productId
			);
			await AsyncStorage.setItem(
				this.STORAGE_KEY,
				JSON.stringify(filteredProducts)
			);
		} catch (error) {
			console.error("Erro ao remover produto:", error);
			throw error;
		}
	}

	static async getMyProductsPaginated(
		page: number = 1,
		limit: number = 10
	): Promise<PaginatedResponse<Product>> {
		const allProducts = await this.getMyProducts();
		const startIndex = (page - 1) * limit;
		const endIndex = startIndex + limit;
		const data = allProducts.slice(startIndex, endIndex);

		return {
			data,
			page,
			limit,
			total: allProducts.length,
			totalPages: Math.ceil(allProducts.length / limit),
		};
	}
}

export { ProductService, AuthService, MyProductsService };
