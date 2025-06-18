import React, { useState, useRef, useEffect } from "react";
import {
	View,
	StyleSheet,
	Alert,
	Text,
	Dimensions,
	Platform,
	TouchableWithoutFeedback,
	Keyboard,
} from "react-native";
import {
	Button,
	IconButton,
	Card,
	TextInput,
	Title,
	Paragraph,
	ActivityIndicator,
	Dialog,
	Portal,
} from "react-native-paper";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Product } from "../types";
import { ProductService, MyProductsService } from "../services/api";
import { useNotifications } from "../contexts/NotificationContext";

type CameraScreenNavigationProp = StackNavigationProp<
	RootStackParamList,
	"Camera"
>;

const { width, height } = Dimensions.get("window");

export const CameraScreen: React.FC = () => {
	const navigation = useNavigation<CameraScreenNavigationProp>();
	const { addNotification } = useNotifications();
	const cameraRef = useRef<CameraView>(null);

	const [facing, setFacing] = useState<CameraType>("back");
	const [permission, requestPermission] = useCameraPermissions();
	const [capturedImage, setCapturedImage] = useState<string | null>(null);
	const [showAddProductDialog, setShowAddProductDialog] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isCameraActive, setIsCameraActive] = useState(false);

	const [productForm, setProductForm] = useState({
		name: "",
		description: "",
		price: "",
		category: "",
	});

	// Controlar quando a câmera deve estar ativa
	useFocusEffect(
		React.useCallback(() => {
			setIsCameraActive(true);
			return () => {
				setIsCameraActive(false);
			};
		}, [])
	);

	useEffect(() => {
		requestPermission();
	}, []);

	const handleTakePicture = async () => {
		if (cameraRef.current) {
			try {
				const photo = await cameraRef.current.takePictureAsync({
					quality: 0.8,
					base64: false,
				});

				if (photo) {
					setCapturedImage(photo.uri);
					setShowAddProductDialog(true);
				}
			} catch (error) {
				console.error("Erro ao tirar foto:", error);
				Alert.alert("Erro", "Não foi possível tirar a foto");
			}
		}
	};

	const handlePickImage = async () => {
		try {
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.8,
			});

			if (!result.canceled && result.assets[0]) {
				setCapturedImage(result.assets[0].uri);
				setShowAddProductDialog(true);
			}
		} catch (error) {
			console.error("Erro ao selecionar imagem:", error);
			Alert.alert("Erro", "Não foi possível selecionar a imagem");
		}
	};

	const toggleCameraFacing = () => {
		setFacing((current) => (current === "back" ? "front" : "back"));
	};

	const resetForm = () => {
		setProductForm({
			name: "",
			description: "",
			price: "",
			category: "",
		});
		setCapturedImage(null);
		setShowAddProductDialog(false);
	};

	const handleSubmitProduct = async () => {
		if (!productForm.name.trim() || !productForm.price.trim()) {
			Alert.alert("Erro", "Nome e preço são obrigatórios");
			return;
		}

		const price = parseFloat(productForm.price);
		if (isNaN(price) || price <= 0) {
			Alert.alert(
				"Erro",
				"Preço deve ser um número válido maior que zero"
			);
			return;
		}

		setIsSubmitting(true);
		try {
			const newProduct = await ProductService.addProduct({
				name: productForm.name,
				description:
					productForm.description.trim() ||
					"Produto adicionado via câmera. Este é um novo produto que foi fotografado e adicionado ao catálogo.",
				price,
				category: productForm.category || "Outros",
				image: capturedImage || "https://via.placeholder.com/300",
				inStock: true,
			});

			// Também salvar em "Meus Produtos"
			await MyProductsService.addMyProduct(newProduct);

			addNotification({
				title: "Produto adicionado!",
				message: `${newProduct.name} foi adicionado com sucesso`,
				type: "success",
			});

			Alert.alert("Sucesso!", "Produto adicionado com sucesso", [
				{
					text: "Ver produto",
					onPress: () => {
						resetForm();
						navigation.navigate("ProductDetail", {
							productId: newProduct.id,
						});
					},
				},
				{
					text: "Adicionar outro",
					onPress: resetForm,
				},
			]);
		} catch (error) {
			console.error("Erro ao adicionar produto:", error);
			Alert.alert("Erro", "Não foi possível adicionar o produto");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!permission) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" />
				<Text style={styles.loadingText}>Carregando câmera...</Text>
			</View>
		);
	}

	if (!permission.granted) {
		return (
			<View style={styles.permissionContainer}>
				<Card style={styles.permissionCard}>
					<Card.Content>
						<Title>Permissão necessária</Title>
						<Paragraph>
							Para usar a câmera e adicionar produtos, precisamos
							da sua permissão para acessar a câmera.
						</Paragraph>
						<Button
							mode="contained"
							onPress={requestPermission}
							style={styles.permissionButton}
						>
							Permitir acesso à câmera
						</Button>
					</Card.Content>
				</Card>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{isCameraActive && (
				<CameraView
					style={styles.camera}
					ref={cameraRef}
					facing={facing}
				>
					<View style={styles.cameraControls}>
						<View style={styles.topControls}>
							<IconButton
								icon="close"
								iconColor="white"
								size={28}
								onPress={() => navigation.goBack()}
								style={styles.controlButton}
							/>
							<IconButton
								icon="camera-flip"
								iconColor="white"
								size={28}
								onPress={toggleCameraFacing}
								style={styles.controlButton}
							/>
						</View>

						<View style={styles.bottomControls}>
							<IconButton
								icon="image"
								iconColor="white"
								size={32}
								onPress={handlePickImage}
								style={styles.controlButton}
							/>

							<IconButton
								icon="camera"
								iconColor="white"
								size={64}
								onPress={handleTakePicture}
								style={[
									styles.controlButton,
									styles.captureButton,
								]}
							/>

							<View style={styles.placeholder} />
						</View>
					</View>
				</CameraView>
			)}

			{!isCameraActive && (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" />
					<Text style={styles.loadingText}>Preparando câmera...</Text>
				</View>
			)}

			<Portal>
				<Dialog
					visible={showAddProductDialog}
					onDismiss={() => setShowAddProductDialog(false)}
					style={styles.dialog}
				>
					<Dialog.Title>Adicionar Produto</Dialog.Title>
					<Dialog.ScrollArea>
						<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
							<View style={styles.dialogContent}>
								{capturedImage && (
									<Card.Cover
										source={{ uri: capturedImage }}
										style={styles.previewImage}
									/>
								)}

								<TextInput
									label="Nome do produto *"
									value={productForm.name}
									onChangeText={(text) =>
										setProductForm((prev) => ({
											...prev,
											name: text,
										}))
									}
									mode="outlined"
									style={styles.input}
									disabled={isSubmitting}
								/>

								<TextInput
									label="Descrição"
									value={productForm.description}
									onChangeText={(text) =>
										setProductForm((prev) => ({
											...prev,
											description: text,
										}))
									}
									mode="outlined"
									multiline
									numberOfLines={3}
									style={styles.input}
									disabled={isSubmitting}
								/>

								<TextInput
									label="Preço *"
									value={productForm.price}
									onChangeText={(text) =>
										setProductForm((prev) => ({
											...prev,
											price: text,
										}))
									}
									mode="outlined"
									keyboardType="numeric"
									style={styles.input}
									disabled={isSubmitting}
								/>

								<TextInput
									label="Categoria"
									value={productForm.category}
									onChangeText={(text) =>
										setProductForm((prev) => ({
											...prev,
											category: text,
										}))
									}
									mode="outlined"
									style={styles.input}
									disabled={isSubmitting}
								/>
							</View>
						</TouchableWithoutFeedback>
					</Dialog.ScrollArea>
					<Dialog.Actions>
						<Button onPress={resetForm} disabled={isSubmitting}>
							Cancelar
						</Button>
						<Button
							mode="contained"
							onPress={handleSubmitProduct}
							loading={isSubmitting}
							disabled={isSubmitting}
						>
							{isSubmitting ? "Adicionando..." : "Adicionar"}
						</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "black",
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
	permissionContainer: {
		flex: 1,
		justifyContent: "center",
		padding: 20,
		backgroundColor: "#f5f5f5",
	},
	permissionCard: {
		elevation: 4,
	},
	permissionButton: {
		marginTop: 16,
	},
	camera: {
		flex: 1,
	},
	cameraControls: {
		flex: 1,
		backgroundColor: "transparent",
		justifyContent: "space-between",
	},
	topControls: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingTop: Platform.OS === "ios" ? 60 : 40,
		paddingHorizontal: 20,
	},
	bottomControls: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingBottom: Platform.OS === "ios" ? 40 : 20,
		paddingHorizontal: 20,
	},
	controlButton: {
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	captureButton: {
		backgroundColor: "rgba(255, 255, 255, 0.9)",
	},
	placeholder: {
		width: 48,
	},
	dialog: {
		maxHeight: height * 0.8,
	},
	dialogContent: {
		paddingHorizontal: 0,
	},
	previewImage: {
		height: 200,
		marginBottom: 16,
	},
	input: {
		marginBottom: 12,
	},
});
