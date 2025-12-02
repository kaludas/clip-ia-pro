import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Collaborator {
  id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  username?: string;
  avatar_url?: string;
  online: boolean;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  timestamp_seconds?: number;
  created_at: string;
  username?: string;
  avatar_url?: string;
}

export const useCollaboration = (projectId: string) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const collaborationChannel = supabase.channel(`project:${projectId}`);

    // Track presence
    collaborationChannel
      .on('presence', { event: 'sync' }, () => {
        const state = collaborationChannel.presenceState();
        const users = new Set<string>();
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            users.add(presence.user_id);
          });
        });
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', leftPresences);
      });

    // Listen to new comments
    collaborationChannel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_comments',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('New comment:', payload);
          fetchComments();
        }
      );

    // Listen to new collaborators
    collaborationChannel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_collaborators',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('Collaborator change:', payload);
          fetchCollaborators();
        }
      );

    collaborationChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        const user = (await supabase.auth.getUser()).data.user;
        if (user) {
          await collaborationChannel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      }
    });

    setChannel(collaborationChannel);

    // Fetch initial data
    fetchCollaborators();
    fetchComments();

    return () => {
      collaborationChannel.unsubscribe();
    };
  }, [projectId]);

  const fetchCollaborators = async () => {
    const { data, error } = await supabase
      .from('project_collaborators')
      .select(`
        id,
        user_id,
        role,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .eq('project_id', projectId);

    if (error) {
      console.error('Error fetching collaborators:', error);
      return;
    }

    const collaboratorsWithProfiles = data.map((collab: any) => ({
      id: collab.id,
      user_id: collab.user_id,
      role: collab.role,
      username: collab.profiles?.username,
      avatar_url: collab.profiles?.avatar_url,
      online: onlineUsers.has(collab.user_id)
    }));

    setCollaborators(collaboratorsWithProfiles);
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('project_comments')
      .select(`
        id,
        user_id,
        content,
        timestamp_seconds,
        created_at,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return;
    }

    const commentsWithProfiles = data.map((comment: any) => ({
      id: comment.id,
      user_id: comment.user_id,
      content: comment.content,
      timestamp_seconds: comment.timestamp_seconds,
      created_at: comment.created_at,
      username: comment.profiles?.username,
      avatar_url: comment.profiles?.avatar_url
    }));

    setComments(commentsWithProfiles);
  };

  const addComment = async (content: string, timestampSeconds?: number) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { error } = await supabase
      .from('project_comments')
      .insert({
        project_id: projectId,
        user_id: user.id,
        content,
        timestamp_seconds: timestampSeconds
      });

    if (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  const addCollaborator = async (email: string, role: 'editor' | 'viewer') => {
    // This would typically involve inviting a user by email
    // For now, this is a placeholder
    console.log('Invite collaborator:', email, role);
  };

  return {
    collaborators,
    comments,
    onlineUsers,
    addComment,
    addCollaborator,
    isConnected: channel?.state === 'joined'
  };
};
