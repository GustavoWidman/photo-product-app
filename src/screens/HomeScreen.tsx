import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import {
	Text,
	Searchbar,
	Card,
	Title,
	Paragraph,
	Button,
	Chip,
	Avatar,
	ActivityIndicator,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Product } from "../types";
import { ProductService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Componente separado para o Searchbar para evitar re-renderizações
const SearchBarComponent = React.memo(
	({
		value,
		onChangeText,
		style,
	}: {
		value: string;
		onChangeText: (text: string) => void;
		style: any;
	}) => (
		<Searchbar
			placeholder="Buscar produtos..."
			onChangeText={onChangeText}
			value={value}
			style={style}
			autoCapitalize="none"
			autoCorrect={false}
		/>
	)
);

export const HomeScreen: React.FC = () => {
	const navigation = useNavigation<HomeScreenNavigationProp>();
	const { user } = useAuth();

	const [products, setProducts] = useState<Product[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [inputValue, setInputValue] = useState("");
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [totalProducts, setTotalProducts] = useState(0);

	// Debounce search query
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchQuery(searchQuery);
		}, 500);

		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Sync inputValue with searchQuery
	useEffect(() => {
		setInputValue(searchQuery);
	}, [searchQuery]);

	// Execute search when debouncedSearchQuery changes
	useEffect(() => {
		loadProducts(1, debouncedSearchQuery, true);
	}, [debouncedSearchQuery]);

	const loadProducts = useCallback(
		async (pageNum = 1, search = "", refresh = false) => {
			if (isLoading && !refresh) return;

			setIsLoading(true);
			try {
				const response = search
					? await ProductService.searchProducts(search, pageNum, 10)
					: await ProductService.getProducts(pageNum, 10);

				if (pageNum === 1 || refresh) {
					setProducts(response.data);
				} else {
					setProducts((prev) => [...prev, ...response.data]);
				}

				setTotalProducts(response.total);
				setHasMore(pageNum < response.totalPages);
				setPage(pageNum);
			} catch (error) {
				console.error("Erro ao carregar produtos:", error);
			} finally {
				setIsLoading(false);
				setIsRefreshing(false);
			}
		},
		[isLoading]
	);

	useEffect(() => {
		loadProducts(1, searchQuery);
	}, []);

	const handleSearch = useCallback((query: string) => {
		setSearchQuery(query);
	}, []);

	const handleRefresh = () => {
		setIsRefreshing(true);
		loadProducts(1, searchQuery, true);
	};

	const handleLoadMore = () => {
		if (hasMore && !isLoading) {
			loadProducts(page + 1, searchQuery);
		}
	};

	const renderProduct = ({ item }: { item: Product }) => (
		<Card
			style={styles.productCard}
			onPress={() =>
				navigation.navigate("ProductDetail", { productId: item.id })
			}
		>
			<Card.Cover
				source={{ uri: item.image }}
				style={styles.productImage}
			/>
			<Card.Content style={styles.cardContent}>
				<Title numberOfLines={1}>{item.name}</Title>
				<Paragraph numberOfLines={2} style={styles.description}>
					{item.description}
				</Paragraph>
				<View style={styles.productInfo}>
					<Text style={styles.price}>R$ {item.price.toFixed(2)}</Text>
				</View>
				<View style={styles.chipRow}>
					<Chip
						mode="outlined"
						compact
						textStyle={styles.chipText}
						style={[
							styles.chip,
							item.inStock
								? styles.inStockChip
								: styles.outOfStockChip,
						]}
					>
						{item.inStock ? "Em estoque" : "Sem estoque"}
					</Chip>
				</View>
				<Text style={styles.category}>{item.category}</Text>
			</Card.Content>
		</Card>
	);

	const renderHeader = () => (
		<View style={styles.header}>
			<View style={styles.welcomeSection}>
				<Avatar.Text
					size={48}
					label={user?.name.substring(0, 2).toUpperCase() || "U"}
					style={styles.avatar}
				/>
				<View style={styles.welcomeText}>
					<Text style={styles.greeting}>
						Olá, {user?.name?.split(" ")[0] || "Usuário"}!
					</Text>
					<Text style={styles.subtitle}>
						Encontre os melhores produtos
					</Text>
				</View>
			</View>

			<SearchBarComponent
				value={searchQuery}
				onChangeText={handleSearch}
				style={styles.searchbar}
			/>

			<View style={styles.statsSection}>
				<View style={styles.statItem}>
					<Text style={styles.statNumber}>
						{totalProducts.toLocaleString()}
					</Text>
					<Text style={styles.statLabel}>Produtos</Text>
				</View>
				<View style={styles.statItem}>
					<Text style={styles.statNumber}>
						{products.filter((p) => p.inStock).length}
					</Text>
					<Text style={styles.statLabel}>Em estoque</Text>
				</View>
				<View style={styles.statItem}>
					<Text style={styles.statNumber}>
						{new Set(products.map((p) => p.category)).size}
					</Text>
					<Text style={styles.statLabel}>Categorias</Text>
				</View>
			</View>
		</View>
	);

	const renderFooter = () => {
		if (!isLoading || isRefreshing) return null;

		return (
			<View style={styles.footer}>
				<ActivityIndicator size="large" />
				<Text style={styles.loadingText}>
					Carregando mais produtos...
				</Text>
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<FlatList
				data={products}
				renderItem={renderProduct}
				keyExtractor={(item) => item.id}
				numColumns={2}
				columnWrapperStyle={styles.row}
				ListHeaderComponent={renderHeader}
				ListFooterComponent={renderFooter}
				refreshControl={
					<RefreshControl
						refreshing={isRefreshing}
						onRefresh={handleRefresh}
					/>
				}
				onEndReached={handleLoadMore}
				onEndReachedThreshold={0.5}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.listContainer}
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
	header: {
		marginBottom: 16,
	},
	welcomeSection: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 16,
	},
	avatar: {
		marginRight: 12,
	},
	welcomeText: {
		flex: 1,
	},
	greeting: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#333",
	},
	subtitle: {
		fontSize: 14,
		color: "#666",
	},
	searchbar: {
		marginBottom: 16,
	},
	statsSection: {
		flexDirection: "row",
		justifyContent: "space-around",
		backgroundColor: "white",
		padding: 16,
		borderRadius: 8,
		elevation: 2,
		marginBottom: 16,
	},
	statItem: {
		alignItems: "center",
	},
	statNumber: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#6200ea",
	},
	statLabel: {
		fontSize: 12,
		color: "#666",
	},
	row: {
		justifyContent: "space-between",
	},
	productCard: {
		flex: 1,
		margin: 4,
		elevation: 2,
	},
	cardContent: {
		paddingBottom: 16,
	},
	productImage: {
		height: 120,
	},
	description: {
		fontSize: 12,
		color: "#666",
		marginBottom: 8,
		minHeight: 32, // Garante altura mínima consistente
	},
	productInfo: {
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
	chipContainer: {
		flex: 1,
		alignItems: "flex-end",
		paddingLeft: 8,
	},
	price: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#2e7d32",
	},
	chip: {
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
	category: {
		fontSize: 10,
		color: "#999",
		fontStyle: "italic",
	},
	footer: {
		padding: 20,
		alignItems: "center",
	},
	loadingText: {
		marginTop: 8,
		color: "#666",
	},
});
