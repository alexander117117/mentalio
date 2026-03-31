import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Chat, ChatMessage } from '../types';

interface ChatStore {
  chats: Chat[];
  messages: ChatMessage[];
  isLoading: boolean;

  fetchChats: () => Promise<void>;
  createChat: (name: string, classroomId?: string) => Promise<string>;
  fetchMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, content: string) => Promise<void>;
  addMember: (chatId: string, userId: string) => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  messages: [],
  isLoading: false,

  fetchChats: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    set({ isLoading: true });

    // Step 1: get chat_ids where user is member
    const { data: memberships } = await supabase
      .from('chat_members')
      .select('chat_id')
      .eq('user_id', user.id);
    const memberChatIds = (memberships ?? []).map((m: any) => m.chat_id);

    // Step 2: query chats created by user OR in membership list
    let query = supabase
      .from('chats')
      .select('*, classrooms(thumbnail_url)')
      .order('created_at', { ascending: false });

    if (memberChatIds.length > 0) {
      query = query.or(`created_by.eq.${user.id},id.in.(${memberChatIds.join(',')})`);
    } else {
      query = query.eq('created_by', user.id);
    }

    const { data, error } = await query;
    if (error || !data) { set({ isLoading: false }); return; }

    // Step 3: fetch last message for each chat
    const chats: Chat[] = await Promise.all(
      data.map(async (chat: any) => {
        const { data: msgs } = await supabase
          .from('chat_messages')
          .select('content, created_at, user_id')
          .eq('chat_id', chat.id)
          .order('created_at', { ascending: false })
          .limit(1);
        const last = msgs?.[0];
        let lastUserName = '';
        if (last) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', last.user_id)
            .single();
          lastUserName = prof?.name ?? '';
        }
        return {
          id: chat.id,
          name: chat.name,
          classroomId: chat.classroom_id ?? undefined,
          classroomThumbnail: chat.classrooms?.thumbnail_url ?? undefined,
          createdBy: chat.created_by,
          createdAt: chat.created_at,
          lastMessage: last
            ? { content: last.content, createdAt: last.created_at, userName: lastUserName }
            : undefined,
        };
      })
    );

    set({ chats, isLoading: false });
  },

  createChat: async (name, classroomId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('unauthenticated');

    const { data: chat, error } = await supabase
      .from('chats')
      .insert({ name, classroom_id: classroomId ?? null, created_by: user.id })
      .select('*, classrooms(thumbnail_url)')
      .single();
    if (error) throw new Error(error.message);

    // Add creator as member so they can write messages
    await supabase.from('chat_members').insert({ chat_id: chat.id, user_id: user.id });

    const newChat: Chat = {
      id: chat.id,
      name: chat.name,
      classroomId: chat.classroom_id ?? undefined,
      classroomThumbnail: chat.classrooms?.thumbnail_url ?? undefined,
      createdBy: chat.created_by,
      createdAt: chat.created_at,
    };
    set({ chats: [newChat, ...get().chats] });
    return chat.id;
  },

  fetchMessages: async (chatId) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('id, chat_id, user_id, content, created_at')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error || !data) return;

    // Fetch unique profiles
    const userIds = [...new Set(data.map((m: any) => m.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .in('id', userIds);
    const profileMap: Record<string, { name: string; avatar_url?: string }> = {};
    (profiles ?? []).forEach((p: any) => { profileMap[p.id] = p; });

    const messages: ChatMessage[] = data.map((m: any) => ({
      id: m.id,
      chatId: m.chat_id,
      userId: m.user_id,
      userName: profileMap[m.user_id]?.name ?? 'Пользователь',
      userAvatar: profileMap[m.user_id]?.avatar_url ?? undefined,
      content: m.content,
      createdAt: m.created_at,
    }));

    set({ messages });
  },

  sendMessage: async (chatId, content) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('unauthenticated');

    // Insert without join
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({ chat_id: chatId, user_id: user.id, content })
      .select('id, chat_id, user_id, content, created_at')
      .single();
    if (error) throw new Error(error.message);

    // Get sender profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, avatar_url')
      .eq('id', user.id)
      .single();

    const newMsg: ChatMessage = {
      id: data.id,
      chatId: data.chat_id,
      userId: data.user_id,
      userName: profile?.name ?? 'Пользователь',
      userAvatar: profile?.avatar_url ?? undefined,
      content: data.content,
      createdAt: data.created_at,
    };

    set({ messages: [...get().messages, newMsg] });
    set({
      chats: get().chats.map((c) =>
        c.id === chatId
          ? { ...c, lastMessage: { content, createdAt: newMsg.createdAt, userName: newMsg.userName } }
          : c
      ),
    });
  },

  addMember: async (chatId, userId) => {
    await supabase.from('chat_members').upsert({ chat_id: chatId, user_id: userId });
  },
}));
