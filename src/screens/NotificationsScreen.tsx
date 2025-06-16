import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  IconButton,
  Chip,
  Divider,
} from 'react-native-paper';
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationData } from '../types';

export const NotificationsScreen: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications 
  } = useNotifications();

  const getNotificationIcon = (type: NotificationData['type']) => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'warning':
        return 'alert';
      case 'error':
        return 'alert-circle';
      default:
        return 'information';
    }
  };

  const getNotificationColor = (type: NotificationData['type']) => {
    switch (type) {
      case 'success':
        return '#4caf50';
      case 'warning':
        return '#ff9800';
      case 'error':
        return '#f44336';
      default:
        return '#2196f3';
    }
  };

  const renderNotification = ({ item }: { item: NotificationData }) => (
    <Card 
      style={[
        styles.notificationCard,
        !item.read && styles.unreadCard
      ]}
      onPress={() => !item.read && markAsRead(item.id)}
    >
      <Card.Content>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationIcon}>
            <IconButton
              icon={getNotificationIcon(item.type)}
              iconColor={getNotificationColor(item.type)}
              size={24}
            />
          </View>
          
          <View style={styles.notificationContent}>
            <Title style={styles.notificationTitle}>{item.title}</Title>
            <Paragraph style={styles.notificationMessage}>
              {item.message}
            </Paragraph>
            
            <View style={styles.notificationFooter}>
              <Text style={styles.notificationTime}>
                {new Date(item.createdAt).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              
              <View style={styles.notificationBadges}>
                <Chip
                  mode="outlined"
                  compact
                  textStyle={styles.chipText}
                  style={[
                    styles.typeChip,
                    { borderColor: getNotificationColor(item.type) }
                  ]}
                >
                  {item.type}
                </Chip>
                
                {!item.read && (
                  <Chip
                    mode="flat"
                    compact
                    textStyle={styles.chipText}
                    style={styles.unreadChip}
                  >
                    Nova
                  </Chip>
                )}
              </View>
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <IconButton
        icon="bell-outline"
        size={64}
        iconColor="#ccc"
      />
      <Title style={styles.emptyTitle}>Nenhuma notificação</Title>
      <Paragraph style={styles.emptyMessage}>
        Quando você receber notificações, elas aparecerão aqui.
      </Paragraph>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerInfo}>
        <Title style={styles.headerTitle}>Notificações</Title>
        {unreadCount > 0 && (
          <Paragraph style={styles.headerSubtitle}>
            {unreadCount} não lida{unreadCount > 1 ? 's' : ''}
          </Paragraph>
        )}
      </View>
      
      {notifications.length > 0 && (
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <Button
              mode="text"
              onPress={markAllAsRead}
              compact
            >
              Marcar todas como lidas
            </Button>
          )}
          
          <Button
            mode="text"
            onPress={clearNotifications}
            compact
            textColor="#d32f2f"
          >
            Limpar todas
          </Button>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
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
  header: {
    marginBottom: 16,
  },
  headerInfo: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#666',
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  notificationCard: {
    elevation: 2,
    backgroundColor: 'white',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#6200ea',
    backgroundColor: '#fafafa',
  },
  notificationHeader: {
    flexDirection: 'row',
  },
  notificationIcon: {
    marginRight: 8,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    lineHeight: 20,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  notificationBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  typeChip: {
    height: 24,
  },
  unreadChip: {
    height: 24,
    backgroundColor: '#e3f2fd',
  },
  chipText: {
    fontSize: 10,
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    marginBottom: 8,
    color: '#666',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#999',
    paddingHorizontal: 20,
  },
});