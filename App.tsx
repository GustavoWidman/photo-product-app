import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Provider as PaperProvider } from "react-native-paper";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { AppNavigator } from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/contexts/AuthContext";
import { NotificationProvider } from "./src/contexts/NotificationContext";
import { FavoritesProvider } from "./src/contexts/FavoritesContext";
import { CartProvider } from "./src/contexts/CartContext";
import { theme } from "./src/utils/theme";

export default function App() {
	useEffect(() => {
		// Configurar permissões de notificação
		configurarNotificacoes();
	}, []);

	const configurarNotificacoes = async () => {
		if (Platform.OS === "android") {
			await Notifications.setNotificationChannelAsync("default", {
				name: "default",
				importance: Notifications.AndroidImportance.MAX,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: "#6200ea",
			});
		}

		const { status: existingStatus } =
			await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;

		if (existingStatus !== "granted") {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}

		if (finalStatus !== "granted") {
			console.log("Permissão de notificação não concedida");
			return;
		}
	};

	return (
		<PaperProvider theme={theme}>
			<AuthProvider>
				<NotificationProvider>
					<FavoritesProvider>
						<CartProvider>
							<StatusBar
								style="light"
								backgroundColor="#6200ea"
							/>
							<AppNavigator />
						</CartProvider>
					</FavoritesProvider>
				</NotificationProvider>
			</AuthProvider>
		</PaperProvider>
	);
}
