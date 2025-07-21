import React, { useState, useRef, useEffect } from 'react';

export interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
  type: 'table' | 'relationship' | 'diagram';
  targetId?: string; // tableId or relationshipId
  position?: { x: number; y: number }; // for diagram comments
}

interface CommentSystemProps {
  comments: Comment[];
  onAddComment: (comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  onEditComment: (commentId: string, newText: string) => void;
  onDeleteComment: (commentId: string) => void;
  currentUser?: string;
  tables?: Array<{ id: string; name: string; type: string }>;
  relationships?: Array<{ id: string; sourceTableId: string; targetTableId: string; type: string }>;
}

interface CommentItemProps {
  comment: Comment;
  onEdit: (commentId: string, newText: string) => void;
  onDelete: (commentId: string) => void;
  currentUser?: string;
  getTableName?: (tableId: string) => string;
  getRelationshipName?: (relId: string) => string;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onEdit, onDelete, currentUser, getTableName, getRelationshipName }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editText.trim() && editText !== comment.text) {
      onEdit(comment.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(comment.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getCommentIcon = (type: Comment['type']) => {
    switch (type) {
      case 'table': return '📋';
      case 'relationship': return '🔗';
      case 'diagram': return '📊';
      default: return '💬';
    }
  };

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e0e0e0',
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ fontSize: 16, marginTop: 2 }}>
          {getCommentIcon(comment.type)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#333' }}>
              {comment.author}
            </span>
            <span style={{ fontSize: 12, color: '#666' }}>
              {formatTimestamp(comment.timestamp)}
            </span>
            {comment.type !== 'diagram' && (
              <span style={{ 
                fontSize: 11, 
                padding: '2px 6px', 
                background: '#f0f0f0', 
                borderRadius: 10,
                color: '#666'
              }}>
                {comment.type}
              </span>
            )}
            {comment.targetId && comment.type === 'table' && getTableName && (
              <span style={{ 
                fontSize: 11, 
                padding: '2px 6px', 
                background: '#e3f2fd', 
                borderRadius: 10,
                color: '#1976d2'
              }}>
                {getTableName(comment.targetId)}
              </span>
            )}
            {comment.targetId && comment.type === 'relationship' && getRelationshipName && (
              <span style={{ 
                fontSize: 11, 
                padding: '2px 6px', 
                background: '#e8f5e8', 
                borderRadius: 10,
                color: '#2e7d32'
              }}>
                {getRelationshipName(comment.targetId)}
              </span>
            )}
          </div>
          
          {isEditing ? (
            <div>
              <textarea
                ref={textareaRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  width: '100%',
                  minHeight: 60,
                  padding: 8,
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
                placeholder="Enter your comment..."
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button
                  onClick={handleSave}
                  style={{
                    padding: '4px 12px',
                    background: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    padding: '4px 12px',
                    background: '#f5f5f5',
                    color: '#666',
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 14, lineHeight: 1.4, color: '#333' }}>
              {comment.text}
            </div>
          )}
        </div>
        
        {currentUser === comment.author && !isEditing && (
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => setIsEditing(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                borderRadius: 4,
                fontSize: 12,
                color: '#666'
              }}
              title="Edit comment"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(comment.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                borderRadius: 4,
                fontSize: 12,
                color: '#d32f2f'
              }}
              title="Delete comment"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const CommentSystem: React.FC<CommentSystemProps> = ({
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  currentUser = 'User',
  tables = [],
  relationships = []
}) => {
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<Comment['type']>('diagram');
  const [targetId, setTargetId] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    onAddComment({
      text: newComment.trim(),
      author: currentUser,
      type: commentType,
      targetId: targetId || undefined
    });

    setNewComment('');
    setTargetId('');
    setCommentType('diagram');
    setShowAddForm(false);
  };

  const filteredComments = comments.filter(comment => {
    if (commentType === 'diagram') return comment.type === 'diagram';
    return comment.type === commentType && (!targetId || comment.targetId === targetId);
  });

  // Helper function to get table name by ID
  const getTableName = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    return table ? table.name : tableId;
  };

  // Helper function to get relationship display name
  const getRelationshipName = (relId: string) => {
    const rel = relationships.find(r => r.id === relId);
    if (!rel) return relId;
    const sourceName = getTableName(rel.sourceTableId);
    const targetName = getTableName(rel.targetTableId);
    return `${sourceName} → ${targetName} (${rel.type})`;
  };

  return (
    <div style={{
      background: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: 8,
      padding: 16,
      maxHeight: 400,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: '1px solid #dee2e6'
      }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#333' }}>
          💬 Comments ({comments.length})
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: '6px 12px',
            background: showAddForm ? '#6c757d' : '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {showAddForm ? 'Cancel' : 'Add Comment'}
        </button>
      </div>

      {/* Add Comment Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600 }}>
              Comment Type:
            </label>
            <select
              value={commentType}
              onChange={(e) => {
                setCommentType(e.target.value as Comment['type']);
                setTargetId(''); // Reset target when type changes
              }}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 12
              }}
            >
              <option value="diagram">📊 Diagram Comment</option>
              <option value="table">📋 Table Comment</option>
              <option value="relationship">🔗 Relationship Comment</option>
            </select>
          </div>

          {commentType === 'table' && tables.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600 }}>
                Select Table:
              </label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 12
                }}
              >
                <option value="">-- Select a table --</option>
                {tables.map(table => (
                  <option key={table.id} value={table.id}>
                    {table.name} ({table.type})
                  </option>
                ))}
              </select>
            </div>
          )}

          {commentType === 'relationship' && relationships.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600 }}>
                Select Relationship:
              </label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 12
                }}
              >
                <option value="">-- Select a relationship --</option>
                {relationships.map(rel => (
                  <option key={rel.id} value={rel.id}>
                    {getTableName(rel.sourceTableId)} → {getTableName(rel.targetTableId)} ({rel.type})
                  </option>
                ))}
              </select>
            </div>
          )}

          {(commentType === 'table' && tables.length === 0) && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ 
                padding: '8px', 
                background: '#fff3cd', 
                border: '1px solid #ffeaa7', 
                borderRadius: 4, 
                fontSize: 12, 
                color: '#856404' 
              }}>
                No tables available. Create some tables first to add table comments.
              </div>
            </div>
          )}

          {(commentType === 'relationship' && relationships.length === 0) && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ 
                padding: '8px', 
                background: '#fff3cd', 
                border: '1px solid #ffeaa7', 
                borderRadius: 4, 
                fontSize: 12, 
                color: '#856404' 
              }}>
                No relationships available. Create some relationships first to add relationship comments.
              </div>
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600 }}>
              Comment:
            </label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Enter your comment..."
              style={{
                width: '100%',
                minHeight: 60,
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 12,
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="submit"
              disabled={!newComment.trim() || (commentType !== 'diagram' && !targetId)}
              style={{
                padding: '6px 16px',
                background: (newComment.trim() && (commentType === 'diagram' || targetId)) ? '#1976d2' : '#ccc',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600,
                cursor: (newComment.trim() && (commentType === 'diagram' || targetId)) ? 'pointer' : 'not-allowed'
              }}
            >
              Add Comment
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              style={{
                padding: '6px 16px',
                background: '#f5f5f5',
                color: '#666',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filter Controls */}
      <div style={{ 
        display: 'flex', 
        gap: 8, 
        marginBottom: 12,
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setCommentType('diagram')}
          style={{
            padding: '4px 8px',
            background: commentType === 'diagram' ? '#1976d2' : '#f5f5f5',
            color: commentType === 'diagram' ? '#fff' : '#666',
            border: '1px solid #ddd',
            borderRadius: 4,
            fontSize: 11,
            cursor: 'pointer'
          }}
        >
          📊 All
        </button>
        <button
          onClick={() => setCommentType('table')}
          style={{
            padding: '4px 8px',
            background: commentType === 'table' ? '#1976d2' : '#f5f5f5',
            color: commentType === 'table' ? '#fff' : '#666',
            border: '1px solid #ddd',
            borderRadius: 4,
            fontSize: 11,
            cursor: 'pointer'
          }}
        >
          📋 Tables
        </button>
        <button
          onClick={() => setCommentType('relationship')}
          style={{
            padding: '4px 8px',
            background: commentType === 'relationship' ? '#1976d2' : '#f5f5f5',
            color: commentType === 'relationship' ? '#fff' : '#666',
            border: '1px solid #ddd',
            borderRadius: 4,
            fontSize: 11,
            cursor: 'pointer'
          }}
        >
          🔗 Relationships
        </button>
      </div>

      {/* Comments List */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        paddingRight: 4
      }}>
        {filteredComments.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#666', 
            fontSize: 14,
            padding: '20px 0'
          }}>
            No comments yet. Be the first to add one!
          </div>
        ) : (
          filteredComments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onEdit={onEditComment}
              onDelete={onDeleteComment}
              currentUser={currentUser}
              getTableName={getTableName}
              getRelationshipName={getRelationshipName}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Comment Badge Component for showing comment count on tables/relationships
interface CommentBadgeProps {
  count: number;
  onClick: () => void;
}

export const CommentBadge: React.FC<CommentBadgeProps> = ({ count, onClick }) => {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute',
        top: -8,
        right: -8,
        background: '#ff6b6b',
        color: '#fff',
        border: '2px solid #fff',
        borderRadius: '50%',
        width: 20,
        height: 20,
        fontSize: 10,
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        zIndex: 10
      }}
      title={`${count} comment${count !== 1 ? 's' : ''}`}
    >
      {count > 9 ? '9+' : count}
    </button>
  );
}; 