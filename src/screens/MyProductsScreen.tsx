import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Alert } from "react-native";
import {
	Text,
	Card,
	Title,
	Paragraph,
	Button,
	IconButton,
	FAB,
	ActivityIndicator,
	Chip,
} from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Product } from "../types";
import { MyProductsService } from "../services/api";

type MyProductsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Componente otimizado para produto do usuário
const MyProductCard = React.memo(
	({
		item,
		onPress,
		onDelete,
	}: {
		item: Product;
		onPress: () => void;
		onDelete: () => void;
	}) => (
		<Card style={styles.productCard} onPress={onPress}>
			<Card.Cover
				source={{ uri: item.image }}
				style={styles.productImage}
			/>
			<Card.Content style={styles.cardContent}>
				<View style={styles.productHeader}>
					<Title numberOfLines={1} style={styles.productName}>
						{item.name}
					</Title>
					<IconButton
						icon="delete"
						iconColor="#f44336"
						size={20}
						onPress={onDelete}
						style={styles.deleteButton}
					/>
				</View>

				<Paragraph numberOfLines={2} style={styles.productDescription}>
					{item.description}
				</Paragraph>

				<View style={styles.productMeta}>
					<Text style={styles.productPrice}>
						R$ {(item.price || 0).toFixed(2)}
					</Text>
				</View>

				<View style={styles.chipRow}>
					<Chip
						mode="outlined"
						compact
						textStyle={styles.chipText}
						style={[
							styles.stockChip,
							item.inStock
								? styles.inStockChip
								: styles.outOfStockChip,
						]}
					>
						{item.inStock ? "Em estoque" : "Sem estoque"}
					</Chip>
				</View>

				<Text style={styles.productCategory}>{item.category}</Text>

				<Text style={styles.productDate}>
					Adicionado em{" "}
					{new Date(item.createdAt).toLocaleDateString("pt-BR")}
				</Text>
			</Card.Content>
		</Card>
	)
);

export const MyProductsScreen: React.FC = () => {
	const navigation = useNavigation<MyProductsScreenNavigationProp>();

	const [myProducts, setMyProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Recarregar produtos quando a tela ganha foco
	useFocusEffect(
		React.useCallback(() => {
			loadMyProducts();
		}, [])
	);

	const loadMyProducts = async () => {
		try {
			setIsLoading(true);
			const products = await MyProductsService.getMyProducts();
			setMyProducts(products);
		} catch (error) {
			console.error("Erro ao carregar produtos:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteProduct = (productId: string, productName: string) => {
		Alert.alert(
			"Confirmar exclusão",
			`Tem certeza que deseja excluir "${productName}"?`,
			[
				{ text: "Cancelar", style: "cancel" },
				{
					text: "Excluir",
					style: "destructive",
					onPress: () => deleteProduct(productId),
				},
			]
		);
	};

	const deleteProduct = async (productId: string) => {
		try {
			await MyProductsService.removeMyProduct(productId);
			const updatedProducts = myProducts.filter(
				(product) => product.id !== productId
			);
			setMyProducts(updatedProducts);
		} catch (error) {
			console.error("Erro ao excluir produto:", error);
			Alert.alert("Erro", "Não foi possível excluir o produto");
		}
	};

	const renderProduct = ({ item }: { item: Product }) => (
		<MyProductCard
			item={item}
			onPress={() =>
				navigation.navigate("ProductDetail", { productId: item.id })
			}
			onDelete={() => handleDeleteProduct(item.id, item.name)}
		/>
	);

	const renderEmptyState = () => (
		<View style={styles.emptyContainer}>
			<IconButton
				icon="package-variant-closed"
				size={64}
				iconColor="#ccc"
			/>
			<Text style={styles.emptyTitle}>Nenhum produto ainda</Text>
			<Text style={styles.emptyMessage}>
				Comece adicionando produtos usando a câmera!
			</Text>
			<Button
				mode="contained"
				onPress={() => navigation.navigate("Camera")}
				style={styles.addButton}
			>
				Adicionar Produto
			</Button>
		</View>
	);

	if (isLoading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" animating={true} />
				<Text style={styles.loadingText}>
					Carregando seus produtos...
				</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<FlatList
				data={myProducts}
				renderItem={renderProduct}
				keyExtractor={(item) => item.id}
				ListEmptyComponent={renderEmptyState}
				contentContainerStyle={[
					styles.listContainer,
					myProducts.length === 0 && styles.emptyListContainer,
				]}
				showsVerticalScrollIndicator={false}
			/>

			<FAB
				icon="plus"
				style={styles.fab}
				onPress={() => navigation.navigate("Camera")}
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
		alignItems: "center",
		marginBottom: 8,
	},
	productName: {
		fontSize: 16,
		fontWeight: "bold",
		flex: 1,
	},
	deleteButton: {
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
		marginBottom: 2,
	},
	productDate: {
		fontSize: 10,
		color: "#bbb",
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
		marginBottom: 24,
		fontSize: 14,
		lineHeight: 20,
	},
	addButton: {
		paddingHorizontal: 24,
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
	fab: {
		position: "absolute",
		margin: 16,
		right: 0,
		bottom: 0,
		backgroundColor: "#6200ea",
	},
});
