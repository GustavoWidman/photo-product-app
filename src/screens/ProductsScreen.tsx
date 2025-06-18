import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import {
	Text,
	Searchbar,
	Card,
	Title,
	Paragraph,
	Chip,
	ActivityIndicator,
	IconButton,
	FAB,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Product } from "../types";
import { ProductService } from "../services/api";

type ProductsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

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

// Componente otimizado para produto
const ProductCard = React.memo(
	({ item, onPress }: { item: Product; onPress: () => void }) => (
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
						R$ {item.price.toFixed(2)}
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

export const ProductsScreen: React.FC = () => {
	const navigation = useNavigation<ProductsScreenNavigationProp>();

	const [products, setProducts] = useState<Product[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
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

	const loadProducts = useCallback(
		async (pageNum = 1, search = "", refresh = false, loadMore = false) => {
			if ((isLoading || isLoadingMore) && !refresh) return;

			if (loadMore) {
				setIsLoadingMore(true);
			} else {
				setIsLoading(true);
			}

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
				setIsLoadingMore(false);
				setIsRefreshing(false);
			}
		},
		[isLoading, isLoadingMore]
	);

	useEffect(() => {
		loadProducts(1, debouncedSearchQuery);
	}, []);

	// Reagir às mudanças no debouncedSearchQuery
	useEffect(() => {
		setPage(1);
		setHasMore(true);
		loadProducts(1, debouncedSearchQuery, true);
	}, [debouncedSearchQuery]);

	const handleSearch = useCallback((query: string) => {
		setSearchQuery(query);
	}, []);

	const handleRefresh = () => {
		setIsRefreshing(true);
		setPage(1);
		setHasMore(true);
		loadProducts(1, searchQuery, true);
	};

	const handleLoadMore = () => {
		if (hasMore && !isLoading && !isLoadingMore) {
			loadProducts(page + 1, searchQuery, false, true);
		}
	};

	const renderProduct = useCallback(
		({ item }: { item: Product }) => (
			<ProductCard
				item={item}
				onPress={() =>
					navigation.navigate("ProductDetail", { productId: item.id })
				}
			/>
		),
		[navigation]
	);

	const keyExtractor = useCallback((item: Product) => item.id, []);

	const renderHeader = () => (
		<View style={styles.header}>
			<View style={styles.titleSection}>
				<Title style={styles.screenTitle}>Produtos</Title>
				<Text style={styles.totalCount}>
					{totalProducts.toLocaleString()} produtos disponíveis
				</Text>
			</View>

			<SearchBarComponent
				value={searchQuery}
				onChangeText={handleSearch}
				style={styles.searchbar}
			/>
		</View>
	);

	const renderFooter = () => {
		if (!isLoadingMore) return null;

		return (
			<View style={styles.footer}>
				<ActivityIndicator size="large" />
				<Text style={styles.loadingText}>
					Carregando mais produtos...
				</Text>
			</View>
		);
	};

	const renderEmptyState = () => {
		if (isLoading) return null;

		return (
			<View style={styles.emptyContainer}>
				<IconButton
					icon="package-variant-closed"
					size={64}
					iconColor="#ccc"
				/>
				<Title style={styles.emptyTitle}>
					{searchQuery
						? "Nenhum produto encontrado"
						: "Nenhum produto disponível"}
				</Title>
				<Paragraph style={styles.emptyMessage}>
					{searchQuery
						? "Tente buscar com outros termos ou verifique a ortografia."
						: "Adicione produtos usando a câmera para começar."}
				</Paragraph>
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<FlatList
				data={products}
				renderItem={renderProduct}
				keyExtractor={keyExtractor}
				ListHeaderComponent={renderHeader}
				ListFooterComponent={renderFooter}
				ListEmptyComponent={renderEmptyState}
				refreshControl={
					<RefreshControl
						refreshing={isRefreshing}
						onRefresh={handleRefresh}
						colors={["#6200ea"]}
					/>
				}
				onEndReached={handleLoadMore}
				onEndReachedThreshold={0.5}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={[
					styles.listContainer,
					products.length === 0 && styles.emptyListContainer,
				]}
				// Performance optimizations
				maxToRenderPerBatch={5}
				initialNumToRender={10}
				windowSize={10}
				removeClippedSubviews={true}
				updateCellsBatchingPeriod={50}
				scrollEventThrottle={16}
			/>

			<FAB
				icon="camera"
				style={styles.fab}
				onPress={() => navigation.navigate("Camera")}
				label="Adicionar"
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
	header: {
		marginBottom: 16,
	},
	titleSection: {
		marginBottom: 16,
	},
	screenTitle: {
		fontSize: 28,
		fontWeight: "bold",
		marginBottom: 4,
	},
	totalCount: {
		fontSize: 14,
		color: "#666",
	},
	searchbar: {
		marginBottom: 16,
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
		minHeight: 32, // Garante altura mínima consistente
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
	footer: {
		padding: 20,
		alignItems: "center",
	},
	loadingText: {
		marginTop: 8,
		color: "#666",
		fontSize: 14,
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
	},
	fab: {
		position: "absolute",
		margin: 16,
		right: 0,
		bottom: 0,
		backgroundColor: "#6200ea",
	},
});
