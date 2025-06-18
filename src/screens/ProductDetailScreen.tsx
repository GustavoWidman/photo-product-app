import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert, Dimensions } from "react-native";
import {
	Text,
	Card,
	Title,
	Paragraph,
	Button,
	Chip,
	ActivityIndicator,
	IconButton,
	Divider,
} from "react-native-paper";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Product } from "../types";
import { ProductService } from "../services/api";
import { useNotifications } from "../contexts/NotificationContext";
import { useFavorites } from "../contexts/FavoritesContext";
import { useCart } from "../contexts/CartContext";

type ProductDetailScreenNavigationProp = StackNavigationProp<
	RootStackParamList,
	"ProductDetail"
>;
type ProductDetailScreenRouteProp = RouteProp<
	RootStackParamList,
	"ProductDetail"
>;

const { width } = Dimensions.get("window");

export const ProductDetailScreen: React.FC = () => {
	const navigation = useNavigation<ProductDetailScreenNavigationProp>();
	const route = useRoute<ProductDetailScreenRouteProp>();
	const { addNotification } = useNotifications();
	const { isFavorite, toggleFavorite } = useFavorites();
	const { addToCart, isInCart } = useCart();
	const { productId } = route.params;

	const [product, setProduct] = useState<Product | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isAddingToCart, setIsAddingToCart] = useState(false);

	useEffect(() => {
		loadProduct();
	}, [productId]);

	const loadProduct = async () => {
		try {
			const productData = await ProductService.getProduct(productId);
			setProduct(productData);
		} catch (error) {
			console.error("Erro ao carregar produto:", error);
			Alert.alert("Erro", "Não foi possível carregar o produto");
			navigation.goBack();
		} finally {
			setIsLoading(false);
		}
	};

	const handleToggleFavorite = () => {
		if (product) {
			const wasFavorite = isFavorite(product.id);
			toggleFavorite(product);
			addNotification({
				title: wasFavorite
					? "Removido dos favoritos"
					: "Adicionado aos favoritos",
				message: `${product.name} foi ${
					wasFavorite ? "removido dos" : "adicionado aos"
				} seus favoritos`,
				type: "success",
			});
		}
	};

	const handleAddToCart = async () => {
		if (!product) return;

		setIsAddingToCart(true);

		try {
			// Simular delay da API
			await new Promise((resolve) => setTimeout(resolve, 800));

			addToCart(product);

			addNotification({
				title: "Produto adicionado ao carrinho",
				message: `${product.name} foi adicionado ao seu carrinho`,
				type: "success",
			});

			Alert.alert(
				"Sucesso!",
				"Produto adicionado ao carrinho com sucesso",
				[{ text: "OK" }]
			);
		} catch (error) {
			Alert.alert(
				"Erro",
				"Não foi possível adicionar o produto ao carrinho"
			);
		} finally {
			setIsAddingToCart(false);
		}
	};

	if (isLoading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" />
				<Text style={styles.loadingText}>Carregando produto...</Text>
			</View>
		);
	}

	if (!product) {
		return (
			<View style={styles.errorContainer}>
				<Text style={styles.errorText}>Produto não encontrado</Text>
				<Button mode="contained" onPress={() => navigation.goBack()}>
					Voltar
				</Button>
			</View>
		);
	}

	return (
		<ScrollView
			style={styles.container}
			showsVerticalScrollIndicator={false}
		>
			<Card style={styles.card}>
				<View style={styles.imageContainer}>
					<Card.Cover
						source={{ uri: product.image }}
						style={styles.productImage}
					/>
					<IconButton
						icon={
							isFavorite(product.id) ? "heart" : "heart-outline"
						}
						iconColor={isFavorite(product.id) ? "#e91e63" : "#666"}
						size={28}
						style={styles.favoriteButton}
						onPress={handleToggleFavorite}
					/>
				</View>

				<View style={styles.content}>
					<View style={styles.header}>
						<Title style={styles.title}>{product.name}</Title>
						<Chip
							mode="outlined"
							style={[
								styles.stockChip,
								product.inStock
									? styles.inStockChip
									: styles.outOfStockChip,
							]}
							textStyle={styles.chipText}
						>
							{product.inStock ? "Em estoque" : "Sem estoque"}
						</Chip>
					</View>

					<Text style={styles.price}>
						R$ {product.price.toFixed(2)}
					</Text>

					<Text style={styles.category}>{product.category}</Text>

					<Divider style={styles.divider} />

					<View style={styles.descriptionSection}>
						<Title style={styles.sectionTitle}>Descrição</Title>
						<Paragraph style={styles.description}>
							{product.description}
						</Paragraph>
					</View>

					<View style={styles.infoSection}>
						<Text style={styles.infoText}>
							<Text style={styles.infoLabel}>
								Adicionado em:{" "}
							</Text>
							{new Date(product.createdAt).toLocaleDateString(
								"pt-BR"
							)}
						</Text>
						<Text style={styles.infoText}>
							<Text style={styles.infoLabel}>
								Última atualização:{" "}
							</Text>
							{new Date(product.updatedAt).toLocaleDateString(
								"pt-BR"
							)}
						</Text>
					</View>

					<Divider style={styles.divider} />

					<View style={styles.actionButtons}>
						<Button
							mode="contained"
							onPress={handleAddToCart}
							loading={isAddingToCart}
							disabled={isAddingToCart || !product.inStock}
							style={styles.addToCartButton}
							icon="cart-plus"
						>
							{isAddingToCart
								? "Adicionando..."
								: isInCart(product.id)
								? "Já no carrinho"
								: "Adicionar ao carrinho"}
						</Button>

						<Button
							mode="outlined"
							onPress={handleToggleFavorite}
							style={styles.favoriteActionButton}
							icon={
								isFavorite(product.id)
									? "heart"
									: "heart-outline"
							}
						>
							{isFavorite(product.id)
								? "Remover dos favoritos"
								: "Adicionar aos favoritos"}
						</Button>
					</View>
				</View>
			</Card>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: 16,
		color: "#666",
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	errorText: {
		fontSize: 16,
		marginBottom: 16,
		textAlign: "center",
	},
	card: {
		margin: 16,
		marginBottom: 32,
		elevation: 4,
	},
	imageContainer: {
		position: "relative",
	},
	productImage: {
		height: 300,
	},
	favoriteButton: {
		position: "absolute",
		top: 16,
		right: 16,
		backgroundColor: "rgba(255, 255, 255, 0.9)",
	},
	content: {
		padding: 20,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 12,
	},
	title: {
		flex: 1,
		fontSize: 24,
		fontWeight: "bold",
		marginRight: 12,
	},
	stockChip: {
		height: 28,
		justifyContent: "center",
		alignSelf: "flex-start",
	},
	chipText: {
		fontSize: 11,
		lineHeight: 14,
		paddingHorizontal: 4,
	},
	inStockChip: {
		backgroundColor: "#e8f5e8",
		borderColor: "#4caf50",
	},
	outOfStockChip: {
		backgroundColor: "#ffebee",
		borderColor: "#f44336",
	},
	price: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#2e7d32",
		marginBottom: 8,
	},
	category: {
		fontSize: 16,
		color: "#666",
		fontStyle: "italic",
		marginBottom: 16,
	},
	divider: {
		marginVertical: 20,
	},
	descriptionSection: {
		marginBottom: 20,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 8,
	},
	description: {
		fontSize: 16,
		lineHeight: 24,
		color: "#444",
	},
	infoSection: {
		marginBottom: 20,
		padding: 16,
		backgroundColor: "#f8f9fa",
		borderRadius: 8,
	},
	infoText: {
		fontSize: 14,
		marginBottom: 4,
		color: "#666",
	},
	infoLabel: {
		fontWeight: "bold",
		color: "#333",
	},
	actionButtons: {
		gap: 16,
	},
	addToCartButton: {
		paddingVertical: 8,
	},
	favoriteActionButton: {
		paddingVertical: 8,
	},
});
