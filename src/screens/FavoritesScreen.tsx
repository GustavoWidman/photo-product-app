import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import {
	Text,
	Card,
	Title,
	Paragraph,
	Button,
	IconButton,
	Chip,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Product } from "../types";
import { useFavorites } from "../contexts/FavoritesContext";

type FavoritesScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Componente otimizado para produto favorito
const FavoriteProductCard = React.memo(
	({
		item,
		onPress,
		onRemove,
	}: {
		item: Product;
		onPress: () => void;
		onRemove: () => void;
	}) => (
		<Card style={styles.productCard} onPress={onPress}>
			<Card.Cover
				source={{ uri: item.image }}
				style={styles.productImage}
			/>
			<Card.Content style={styles.cardContent}>
				<Title numberOfLines={1} style={styles.productName}>
					{item.name}
				</Title>

				<Paragraph numberOfLines={2} style={styles.productDescription}>
					{item.description}
				</Paragraph>

				<View style={styles.productMeta}>
					<Text style={styles.productPrice}>
						R$ {(item.price || 0).toFixed(2)}
					</Text>

					<IconButton
						icon="heart"
						iconColor="#e91e63"
						size={20}
						onPress={onRemove}
						style={styles.removeButton}
					/>
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
			</Card.Content>
		</Card>
	)
);

export const FavoritesScreen: React.FC = () => {
	const navigation = useNavigation<FavoritesScreenNavigationProp>();
	const { favorites, removeFromFavorites } = useFavorites();

	const renderProduct = ({ item }: { item: Product }) => (
		<FavoriteProductCard
			item={item}
			onPress={() =>
				navigation.navigate("ProductDetail", { productId: item.id })
			}
			onRemove={() => removeFromFavorites(item.id)}
		/>
	);

	const renderEmptyState = () => (
		<View style={styles.emptyContainer}>
			<IconButton icon="heart-outline" size={64} iconColor="#ccc" />
			<Text style={styles.emptyTitle}>Nenhum favorito ainda</Text>
			<Text style={styles.emptyMessage}>
				Explore nossos produtos e adicione seus favoritos aqui!
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

	return (
		<View style={styles.container}>
			<FlatList
				data={favorites}
				renderItem={renderProduct}
				keyExtractor={(item) => item.id}
				ListEmptyComponent={renderEmptyState}
				contentContainerStyle={[
					styles.listContainer,
					favorites.length === 0 && styles.emptyListContainer,
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
	productInfo: {
		flex: 1,
		padding: 16,
		justifyContent: "space-between",
	},
	productName: {
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 4,
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
	productPrice: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#2e7d32",
	},
	removeButton: {
		margin: 0,
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
	chipRow: {
		flexDirection: "row",
		justifyContent: "flex-start",
		marginBottom: 4,
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
		fontSize: 20,
		marginBottom: 8,
		color: "#666",
	},
	emptyMessage: {
		textAlign: "center",
		color: "#999",
		paddingHorizontal: 20,
		marginBottom: 24,
		lineHeight: 20,
	},
	exploreButton: {
		paddingHorizontal: 24,
	},
});
