import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChatsCircle, ChatCircleDots, PaperPlaneRight } from 'phosphor-react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import { useChatStore } from '../../src/store/chatStore';
import { useAuthStore } from '../../src/store/authStore';
import { ChatMessage } from '../../src/types';
import Avatar from '../../src/components/ui/Avatar';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function MessageBubble({ msg, isMe, isRead }: { msg: ChatMessage; isMe: boolean; isRead: boolean }) {
  return (
    <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
      {!isMe && (
        <Avatar uri={msg.userAvatar} name={msg.userName} size={30} />
      )}
      <View style={[styles.bubbleWrap, isMe && styles.bubbleWrapMe]}>
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
          {!isMe && (
            <Text style={styles.bubbleSender}>{msg.userName}</Text>
          )}
          <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{msg.content}</Text>
          <View style={styles.bubbleFooter}>
            <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>
              {formatTime(msg.createdAt)}
            </Text>
          </View>
        </View>
        {isMe && (
          <Text style={[styles.readStatus, { color: isRead ? Colors.primary : Colors.text.disabled }]}>
            {isRead ? '✓✓' : '✓'}
          </Text>
        )}
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const chats = useChatStore((s) => s.chats);
  const messages = useChatStore((s) => s.messages);
  const fetchMessages = useChatStore((s) => s.fetchMessages);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const markChatRead = useChatStore((s) => s.markChatRead);
  const user = useAuthStore((s) => s.user);

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const chat = chats.find((c) => c.id === chatId);

  useEffect(() => {
    if (chatId) {
      fetchMessages(chatId);
      markChatRead(chatId);
    }
  }, [chatId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    const content = text.trim();
    if (!content || sending) return;
    setText('');
    setSending(true);
    try {
      await sendMessage(chatId, content);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.text.primary} weight="regular" />
        </TouchableOpacity>

        {/* Avatar */}
        <View style={styles.headerAvatar}>
          {chat?.classroomThumbnail ? (
            <Image source={{ uri: chat.classroomThumbnail }} style={styles.headerAvatarImg} />
          ) : (
            <View style={styles.headerAvatarFallback}>
              <ChatsCircle size={18} color={Colors.primary} weight="regular" />
            </View>
          )}
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{chat?.name ?? 'Чат'}</Text>
          {chat?.description ? (
            <Text style={styles.headerSub} numberOfLines={1}>{chat.description}</Text>
          ) : (
            <View style={styles.headerBadgeRow}>
              <View style={styles.headerActiveDot} />
              <Text style={styles.headerBadgeText}>
                {chat?.classroomId ? 'Чат курса' : 'Личный чат'}
              </Text>
            </View>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => {
            const isMe = item.userId === user?.id;
            const isRead = isMe && messages.slice(index + 1).some((m) => m.userId !== user?.id);
            return <MessageBubble msg={item} isMe={isMe} isRead={isRead} />;
          }}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                <ChatCircleDots size={32} color={Colors.primary} weight="regular" />
              </View>
              <Text style={styles.emptyText}>Напишите первое сообщение</Text>
            </View>
          }
        />

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Сообщение..."
            placeholderTextColor={Colors.text.disabled}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={1000}
            returnKeyType="default"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
            activeOpacity={0.8}
          >
            <PaperPlaneRight size={16} color="#fff" weight="fill" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  backBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    flexShrink: 0,
  },
  headerAvatarImg: { width: '100%', height: '100%' },
  headerAvatarFallback: {
    flex: 1,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 15, fontWeight: '700', color: Colors.text.primary },
  headerSub: { fontSize: 12, color: Colors.text.secondary, marginTop: 1 },
  headerBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  headerActiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  headerBadgeText: { fontSize: 11, color: Colors.primary, lineHeight: 16 },

  // Messages
  messagesList: { padding: Spacing.md, gap: 8, flexGrow: 1 },

  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 8 },
  msgRowMe: { flexDirection: 'row-reverse' },

  bubbleWrap: {
    flex: 1,
    alignItems: 'flex-start',
  },
  bubbleWrapMe: {
    alignItems: 'flex-end',
  },

  bubble: {
    maxWidth: '85%',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 3,
  },
  bubbleOther: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bubbleMe: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleSender: { fontSize: 12, fontWeight: '700', color: Colors.primary, marginBottom: 1 },
  bubbleText: { fontSize: 15, color: Colors.text.primary, lineHeight: 20 },
  bubbleTextMe: { color: '#fff' },
  bubbleFooter: { flexDirection: 'row', alignSelf: 'flex-end' },
  bubbleTime: { fontSize: 11, color: Colors.text.disabled },
  bubbleTimeMe: { color: 'rgba(255,255,255,0.6)' },
  readStatus: { fontSize: 12, alignSelf: 'flex-end', marginTop: 2, marginRight: 2 },

  // Empty
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 80 },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${Colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { ...Typography.body, color: Colors.text.secondary },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text.primary,
    maxHeight: 120,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
