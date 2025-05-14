import React, { useState, useRef, ChangeEvent, useEffect } from 'react'; 
import { 
  MdSend, 
  MdAttachFile, 
  MdMoreVert, 
  MdEdit, 
  MdDelete, 
  MdContentCopy,
  MdImage
} from 'react-icons/md';
import './TaskComments.scss';

interface Comment {
  id: string;
  author: string;
  text: string;
  date: Date;
  files: File[];
  isEdited?: boolean;
}

interface File {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

const TaskComments: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [showMenuId, setShowMenuId] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
  };

  const handleAddComment = () => {
    if (newComment.trim() === '' && files.length === 0) return;

    if (editingCommentId) {
      setComments(comments.map(comment => 
        comment.id === editingCommentId 
          ? { 
              ...comment, 
              text: newComment,
              files: [...files],
              isEdited: true 
            } 
          : comment
      ));
      setEditingCommentId(null);
    } else {
      const comment: Comment = {
        id: Date.now().toString(),
        author: 'Current User',
        text: newComment,
        date: new Date(),
        files: [...files]
      };
      setComments([...comments, comment]);
    }

    setNewComment('');
    setFiles([]);
  };

  const handleEditComment = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      setNewComment(comment.text);
      setFiles(comment.files);
      setEditingCommentId(commentId);
      setShowMenuId(null);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter(comment => comment.id !== commentId));
    setShowMenuId(null);
  };

  const handleCopyComment = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowMenuId(null);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: Date.now().toString() + file.name,
        name: file.name,
        size: file.size,
        type: file.type
      }));
      setFiles([...files, ...newFiles]);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles(files.filter(file => file.id !== fileId));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).map(file => ({
        id: Date.now().toString() + file.name,
        name: file.name,
        size: file.size,
        type: file.type
      }));
      setFiles([...files, ...newFiles]);
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm) + ' ' + sizes[i]);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="task-comments-container">
      <h3 className="comments-title">Комментарии</h3>
      
      <div className="comments-list">
        {comments.map(comment => (
          <div key={comment.id} className="comment-item">
            <div className="comment-header">
              <div className="comment-author">{comment.author}</div>
              <div className="comment-date">
                {formatDate(comment.date)}
                {comment.isEdited && <span className="edited-label"> (изменено)</span>}
              </div>
              <div className="comment-menu" ref={menuRef}>
                <button 
                  className="menu-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenuId(comment.id === showMenuId ? null : comment.id);
                  }}
                >
                  <MdMoreVert size={18} />
                </button>
                {showMenuId === comment.id && (
                  <div className="menu-content">
                    <button onClick={() => handleEditComment(comment.id)}>
                      <MdEdit size={16} /> Редактировать
                    </button>
                    <button onClick={() => handleDeleteComment(comment.id)}>
                      <MdDelete size={16} /> Удалить
                    </button>
                    <button onClick={() => handleCopyComment(comment.text)}>
                      <MdContentCopy size={16} /> Копировать
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div 
              className="comment-text"
              dangerouslySetInnerHTML={{ 
                __html: comment.text.replace(/\n/g, '<br/>') || '<em>Нет текста</em>' 
              }} 
            />
            {comment.files.length > 0 && (
              <div className="comment-files">
                {comment.files.map(file => (
                  <div key={file.id} className="file-item">
                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                      {file.name} ({formatBytes(file.size)})
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div 
        className={`comment-editor ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="editor-toolbar">
          <button 
            className="toolbar-button"
            onClick={() => fileInputRef.current?.click()}
            title="Прикрепить файл"
          >
            <MdAttachFile size={20} />
          </button>
          <button 
            className="toolbar-button"
            onClick={() => fileInputRef.current?.click()}
            title="Добавить изображение"
          >
            <MdImage size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            style={{ display: 'none' }}
          />
        </div>
        <textarea
          className="comment-input"
          placeholder="Напишите комментарий..."
          value={newComment}
          onChange={handleCommentChange}
          rows={4}
        />
        {files.length > 0 && (
          <div className="attached-files">
            {files.map(file => (
              <div key={file.id} className="file-item">
                <span>{file.name} ({formatBytes(file.size)})</span>
                <button 
                  className="remove-file"
                  onClick={() => handleRemoveFile(file.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="editor-actions">
          <div className="drag-hint">
            {isDragging ? 'Отпустите файлы для загрузки' : 'Перетащите файлы сюда'}
          </div>
          <button 
            className="send-button"
            onClick={handleAddComment}
            disabled={newComment.trim() === '' && files.length === 0}
          >
            <MdSend size={20} />
            {editingCommentId ? 'Обновить' : 'Отправить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskComments;