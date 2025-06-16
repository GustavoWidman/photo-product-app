import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
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
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Product } from '../types';
import { ProductService } from '../services/api';

type ProductsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const ProductsScreen: React.FC = () => {
  const navigation = useNavigation<ProductsScreenNavigationProp>();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  const loadProducts = useCallback(async (
    pageNum = 1, 
    search = '', 
    refresh = false,
    loadMore = false
  ) => {
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
        setProducts(prev => [...prev, ...response.data]);
      }
      
      setTotalProducts(response.total);
      setHasMore(pageNum < response.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setIsRefreshing(false);
    }
  }, [isLoading, isLoadingMore]);

  useEffect(() => {
    loadProducts(1, searchQuery);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
    setHasMore(true);
    loadProducts(1, query, true);
  };

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

  const renderProduct = ({ item }: { item: Product }) => (
    <Card 
      style={styles.productCard} 
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <View style={styles.cardContent}>
        <Card.Cover 
          source={{ uri: item.image }} 
          style={styles.productImage}
        />
        
        <View style={styles.productInfo}>
          <Title numberOfLines={2} style={styles.productName}>
            {item.name}
          </Title>
          
          <Paragraph numberOfLines={3} style={styles.productDescription}>
            {item.description}
          </Paragraph>
          
          <View style={styles.productMeta}>
            <Text style={styles.productPrice}>
              R$ {item.price.toFixed(2)}
            </Text>
            
            <Chip
              mode="outlined"
              compact
              textStyle={styles.chipText}
              style={[
                styles.stockChip,
                item.inStock ? styles.inStockChip : styles.outOfStockChip
              ]}
            >
              {item.inStock ? 'Em estoque' : 'Sem estoque'}
            </Chip>
          </View>
          
          <Text style={styles.productCategory}>
            {item.category}
          </Text>
          
          <Text style={styles.productDate}>
            Adicionado em {new Date(item.createdAt).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </View>
    </Card>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleSection}>
        <Title style={styles.screenTitle}>Produtos</Title>
        <Text style={styles.totalCount}>
          {totalProducts.toLocaleString()} produtos disponíveis
        </Text>
      </View>
      
      <Searchbar
        placeholder="Buscar produtos, descrição ou categoria..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
        icon="magnify"
        clearIcon="close"
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
          {searchQuery ? 'Nenhum produto encontrado' : 'Nenhum produto disponível'}
        </Title>
        <Paragraph style={styles.emptyMessage}>
          {searchQuery 
            ? 'Tente buscar com outros termos ou verifique a ortografia.'
            : 'Adicione produtos usando a câmera para começar.'
          }
        </Paragraph>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={handleRefresh}
            colors={['#6200ea']}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          products.length === 0 && styles.emptyListContainer
        ]}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: 180,
          offset: 180 * index,
          index,
        })}
      />
      
      <FAB
        icon="camera"
        style={styles.fab}
        onPress={() => navigation.navigate('Camera')}
        label="Adicionar"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    fontWeight: 'bold',
    marginBottom: 4,
  },
  totalCount: {
    fontSize: 14,
    color: '#666',
  },
  searchbar: {
    elevation: 2,
  },
  productCard: {
    marginBottom: 16,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
  },
  productImage: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  productInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  stockChip: {
    height: 24,
  },
  chipText: {
    fontSize: 10,
  },
  inStockChip: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50',
  },
  outOfStockChip: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
  },
  productCategory: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  productDate: {
    fontSize: 10,
    color: '#bbb',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    marginBottom: 8,
    color: '#666',
    textAlign: 'center',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#999',
    paddingHorizontal: 20,
    fontSize: 14,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ea',
  },
});