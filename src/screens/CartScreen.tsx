import React from "react";
import { View, StyleSheet, FlatList, Alert } from "react-native";
import {
	Text,
	Card,
	Title,
	Paragraph,
	Button,
	IconButton,
	Chip,
	Divider,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Product } from "../types";
import { useCart } from "../contexts/CartContext";

interface CartItem {
	product: Product;
	quantity: number;
}

type CartScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Componente otimizado para item do carrinho
const CartProductCard = React.memo(
	({
		item,
		onPress,
		onRemove,
	}: {
		item: CartItem;
		onPress: () => void;
		onRemove: () => void;
	}) => (
		<Card style={styles.productCard} onPress={onPress}>
			<Card.Cover
				source={{ uri: item.product.image }}
				style={styles.productImage}
			/>
			<Card.Content style={styles.cardContent}>
				<View style={styles.productHeader}>
					<Title numberOfLines={1} style={styles.productName}>
						{item.product.name}
					</Title>
					<View style={styles.headerActions}>
						<Text style={styles.quantityText}>
							Qtd: {item.quantity}
						</Text>
						<IconButton
							icon="close"
							iconColor="#f44336"
							size={20}
							onPress={onRemove}
							style={styles.removeButton}
						/>
					</View>
				</View>

				<Paragraph numberOfLines={2} style={styles.productDescription}>
					{item.product.description}
				</Paragraph>

				<View style={styles.productMeta}>
					<Text style={styles.productPrice}>
						R$ {(item.product.price || 0).toFixed(2)}
					</Text>
					<Text style={styles.totalItemPrice}>
						Total: R${" "}
						{((item.product.price || 0) * item.quantity).toFixed(2)}
					</Text>
				</View>

				<View style={styles.chipRow}>
					<Chip
						mode="outlined"
						compact
						textStyle={styles.chipText}
						style={[
							styles.stockChip,
							item.product.inStock
								? styles.inStockChip
								: styles.outOfStockChip,
						]}
					>
						{item.product.inStock ? "Em estoque" : "Sem estoque"}
					</Chip>
				</View>

				<Text style={styles.productCategory}>
					{item.product.category}
				</Text>
			</Card.Content>
		</Card>
	)
);

export const CartScreen: React.FC = () => {
	const navigation = useNavigation<CartScreenNavigationProp>();
	const { cartItems, removeFromCart, clearCart, getTotalPrice } = useCart();

	const renderProduct = ({ item }: { item: CartItem }) => (
		<CartProductCard
			item={item}
			onPress={() =>
				navigation.navigate("ProductDetail", {
					productId: item.product.id,
				})
			}
			onRemove={() => removeFromCart(item.product.id)}
		/>
	);

	const renderEmptyState = () => (
		<View style={styles.emptyContainer}>
			<IconButton icon="cart-outline" size={64} iconColor="#ccc" />
			<Text style={styles.emptyTitle}>Carrinho vazio</Text>
			<Text style={styles.emptyMessage}>
				Explore nossos produtos e adicione itens ao seu carrinho!
			</Text>
			<Button
				mode="contained"
				onPress={() => navigation.navigate("MainTabs")}
				style={styles.exploreButton}
			>
				Explorar Produtos
			</Button>
		</View>
	);

	const renderFooter = () => {
		if (cartItems.length === 0) return null;

		return (
			<View style={styles.footer}>
				<Divider style={styles.divider} />
				<View style={styles.totalContainer}>
					<Text style={styles.totalLabel}>Total:</Text>
					<Text style={styles.totalPrice}>
						R$ {getTotalPrice().toFixed(2)}
					</Text>
				</View>

				<View style={styles.buttonContainer}>
					<Button
						mode="outlined"
						onPress={clearCart}
						style={styles.clearButton}
						textColor="#f44336"
					>
						Limpar
					</Button>

					<Button
						mode="contained"
						onPress={() => {
							Alert.alert(
								"Compra Finalizada!",
								"Em um app real, você seria redirecionado para o pagamento."
							);
							clearCart();
						}}
						style={styles.checkoutButton}
					>
						Finalizar Compra
					</Button>
				</View>
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<FlatList
				data={cartItems}
				renderItem={renderProduct}
				keyExtractor={(item) => item.product.id}
				ListEmptyComponent={renderEmptyState}
				ListFooterComponent={renderFooter}
				contentContainerStyle={[
					styles.listContainer,
					cartItems.length === 0 && styles.emptyListContainer,
				]}
				showsVerticalScrollIndicator={false}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	listContainer: {
		padding: 16,
	},
	emptyListContainer: {
		flexGrow: 1,
	},
	productCard: {
		marginBottom: 16,
		elevation: 2,
	},
	cardContent: {
		paddingBottom: 16,
	},
	productImage: {
		height: 120,
	},
	productHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 8,
	},
	productName: {
		fontSize: 16,
		fontWeight: "bold",
		flex: 1,
	},
	headerActions: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	quantityText: {
		fontSize: 12,
		color: "#666",
		fontWeight: "bold",
	},
	removeButton: {
		margin: 0,
		padding: 4,
	},
	productDescription: {
		fontSize: 12,
		color: "#666",
		marginBottom: 8,
		lineHeight: 16,
		minHeight: 32,
	},
	productMeta: {
		flexDirection: "row",
		justifyContent: "flex-start",
		alignItems: "center",
		marginBottom: 8,
	},
	chipRow: {
		flexDirection: "row",
		justifyContent: "flex-start",
		marginBottom: 4,
	},
	productPrice: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#2e7d32",
	},
	totalItemPrice: {
		fontSize: 14,
		fontWeight: "bold",
		color: "#1976d2",
		marginLeft: "auto",
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
	productCategory: {
		fontSize: 11,
		color: "#999",
		fontStyle: "italic",
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 60,
	},
	emptyTitle: {
		fontSize: 18,
		marginBottom: 8,
		color: "#666",
		textAlign: "center",
	},
	emptyMessage: {
		textAlign: "center",
		color: "#999",
		paddingHorizontal: 20,
		fontSize: 14,
		lineHeight: 20,
		marginBottom: 20,
	},
	exploreButton: {
		marginTop: 16,
	},
	footer: {
		backgroundColor: "#fff",
		borderRadius: 8,
		padding: 16,
		marginTop: 16,
		elevation: 2,
	},
	divider: {
		marginBottom: 16,
	},
	totalContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	totalLabel: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
	},
	totalPrice: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#2e7d32",
	},
	buttonContainer: {
		flexDirection: "row",
		gap: 12,
	},
	clearButton: {
		flex: 3,
		borderColor: "#f44336",
	},
	checkoutButton: {
		flex: 5,
		backgroundColor: "#6200ea",
	},
});
