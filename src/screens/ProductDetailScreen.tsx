import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
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
} from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Product } from '../types';
import { ProductService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotifications } from '../contexts/NotificationContext';

type ProductDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProductDetail'>;
type ProductDetailScreenRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

const { width } = Dimensions.get('window');

export const ProductDetailScreen: React.FC = () => {
  const navigation = useNavigation<ProductDetailScreenNavigationProp>();
  const route = useRoute<ProductDetailScreenRouteProp>();
  const { addNotification } = useNotifications();
  const { productId } = route.params;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    loadProduct();
    checkFavoriteStatus();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const productData = await ProductService.getProduct(productId);
      setProduct(productData);
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      Alert.alert('Erro', 'Não foi possível carregar o produto');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      if (favorites) {
        const favoriteList = JSON.parse(favorites);
        setIsFavorite(favoriteList.includes(productId));
      }
    } catch (error) {
      console.error('Erro ao verificar favoritos:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      let favoriteList: string[] = favorites ? JSON.parse(favorites) : [];
      
      if (isFavorite) {
        favoriteList = favoriteList.filter(id => id !== productId);
        setIsFavorite(false);
        addNotification({
          title: 'Removido dos favoritos',
          message: `${product?.name} foi removido dos seus favoritos`,
          type: 'info',
        });
      } else {
        favoriteList.push(productId);
        setIsFavorite(true);
        addNotification({
          title: 'Adicionado aos favoritos',
          message: `${product?.name} foi adicionado aos seus favoritos`,
          type: 'success',
        });
      }
      
      await AsyncStorage.setItem('favorites', JSON.stringify(favoriteList));
    } catch (error) {
      console.error('Erro ao atualizar favoritos:', error);
      Alert.alert('Erro', 'Não foi possível atualizar favoritos');
    }
  };

  const handleAddToCart = async () => {
    if (!product?.inStock) {
      Alert.alert('Produto indisponível', 'Este produto está fora de estoque');
      return;
    }
    
    setIsAddingToCart(true);
    
    // Simular adição ao carrinho
    setTimeout(() => {
      setIsAddingToCart(false);
      addNotification({
        title: 'Produto adicionado!',
        message: `${product?.name} foi adicionado ao seu carrinho`,
        type: 'success',
      });
      
      Alert.alert(
        'Sucesso!',
        'Produto adicionado ao carrinho',
        [
          { text: 'Continuar comprando', style: 'default' },
          { text: 'Ver carrinho', style: 'default' },
        ]
      );
    }, 1500);
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
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Card.Cover 
          source={{ uri: product.image }} 
          style={styles.productImage}
        />
        <IconButton
          icon={isFavorite ? 'heart' : 'heart-outline'}
          iconColor={isFavorite ? '#e91e63' : '#666'}
          size={28}
          style={styles.favoriteButton}
          onPress={toggleFavorite}
        />
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Title style={styles.title}>{product.name}</Title>
          <Chip
            mode="outlined"
            style={[
              styles.stockChip,
              product.inStock ? styles.inStockChip : styles.outOfStockChip
            ]}
          >
            {product.inStock ? 'Em estoque' : 'Sem estoque'}
          </Chip>
        </View>
        
        <Text style={styles.price}>R$ {product.price.toFixed(2)}</Text>
        <Text style={styles.category}>{product.category}</Text>
        
        <Divider style={styles.divider} />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Paragraph style={styles.description}>
            {product.description}
          </Paragraph>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data de cadastro:</Text>
            <Text style={styles.infoValue}>
              {new Date(product.createdAt).toLocaleDateString('pt-BR')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Última atualização:</Text>
            <Text style={styles.infoValue}>
              {new Date(product.updatedAt).toLocaleDateString('pt-BR')}
            </Text>
          </View>
        </View>
        
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleAddToCart}
            style={styles.addToCartButton}
            disabled={!product.inStock || isAddingToCart}
            loading={isAddingToCart}
          >
            {isAddingToCart 
              ? 'Adicionando...' 
              : product.inStock 
                ? 'Adicionar ao carrinho' 
                : 'Produto indisponível'
            }
          </Button>
          
          <Button
            mode="outlined"
            onPress={toggleFavorite}
            style={styles.favoriteActionButton}
            icon={isFavorite ? 'heart' : 'heart-outline'}
          >
            {isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    height: width * 0.6,
    borderRadius: 0,
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 16,
  },
  stockChip: {
    alignSelf: 'flex-start',
  },
  inStockChip: {
    backgroundColor: '#e8f5e8',
  },
  outOfStockChip: {
    backgroundColor: '#ffebee',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  actions: {
    marginTop: 20,
    gap: 12,
  },
  addToCartButton: {
    paddingVertical: 8,
  },
  favoriteActionButton: {
    paddingVertical: 8,
  },
});