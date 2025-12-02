import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Users, MessageCircle, UserPlus, Send, Clock, 
  Circle, CheckCircle2 
} from "lucide-react";
import { useCollaboration } from "@/hooks/useCollaboration";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface CollaborationPanelProps {
  projectId: string;
}

export const CollaborationPanel = ({ projectId }: CollaborationPanelProps) => {
  const { 
    collaborators, 
    comments, 
    onlineUsers,
    addComment, 
    addCollaborator,
    isConnected 
  } = useCollaboration(projectId);
  
  const [newComment, setNewComment] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer');

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addComment(newComment);
      setNewComment("");
      toast.success("Commentaire ajouté");
    } catch (error) {
      toast.error("Erreur lors de l'ajout du commentaire");
    }
  };

  const handleInviteCollaborator = async () => {
    if (!inviteEmail.trim()) return;

    try {
      await addCollaborator(inviteEmail, inviteRole);
      setInviteEmail("");
      toast.success(`Invitation envoyée à ${inviteEmail}`);
    } catch (error) {
      toast.error("Erreur lors de l'invitation");
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-primary';
      case 'editor': return 'bg-accent';
      case 'viewer': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center gap-2 glass px-3 py-2 rounded-lg">
        {isConnected ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-sm">Temps réel actif</span>
          </>
        ) : (
          <>
            <Circle className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Connexion...</span>
          </>
        )}
      </div>

      {/* Collaborators Section */}
      <div className="glass-hover p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Collaborateurs ({collaborators.length})
          </h3>
        </div>

        <div className="space-y-3 mb-6">
          {collaborators.map((collaborator) => (
            <div key={collaborator.id} className="flex items-center gap-3 glass p-3 rounded-lg">
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={collaborator.avatar_url} />
                  <AvatarFallback>
                    {collaborator.username?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                {onlineUsers.has(collaborator.user_id) && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">
                  {collaborator.username || 'Utilisateur'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {onlineUsers.has(collaborator.user_id) ? 'En ligne' : 'Hors ligne'}
                </div>
              </div>
              <Badge className={`${getRoleColor(collaborator.role)} text-xs`}>
                {collaborator.role}
              </Badge>
            </div>
          ))}
        </div>

        {/* Invite Collaborator */}
        <div className="space-y-3 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <UserPlus className="w-4 h-4 text-primary" />
            Inviter un collaborateur
          </div>
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="email@exemple.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <div className="flex gap-2">
              <select
                className="flex-1 glass px-3 py-2 rounded-lg text-sm"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
              <Button 
                onClick={handleInviteCollaborator}
                size="sm"
                disabled={!inviteEmail.trim()}
              >
                Inviter
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="glass-hover p-6 rounded-2xl">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-primary" />
          Commentaires ({comments.length})
        </h3>

        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Aucun commentaire pour le moment
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="glass p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.avatar_url} />
                    <AvatarFallback>
                      {comment.username?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">
                        {comment.username || 'Utilisateur'}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(comment.created_at), { 
                          addSuffix: true,
                          locale: fr 
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90">{comment.content}</p>
                    {comment.timestamp_seconds !== null && comment.timestamp_seconds !== undefined && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        @ {comment.timestamp_seconds}s
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Comment */}
        <div className="space-y-2 pt-4 border-t border-border/50">
          <Textarea
            placeholder="Ajouter un commentaire..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <Button 
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="w-full gap-2"
          >
            <Send className="w-4 h-4" />
            Envoyer
          </Button>
        </div>
      </div>
    </div>
  );
};
