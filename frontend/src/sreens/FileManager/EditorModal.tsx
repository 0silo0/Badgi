import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Text from '@tiptap/extension-text';
import { FiX, FiSave } from 'react-icons/fi';

interface EditorModalProps {
  content: string;
  onSave: (content: string) => Promise<void>;
  onClose: () => void;
  isPlainText?: boolean;
}

export const EditorModal = ({ 
  content, 
  onSave, 
  onClose,
  isPlainText = false 
}: EditorModalProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Отключаем ненужные функции для plain text

      }),
      Text,
    ],
    content: isPlainText ? content : `<p>${content}</p>`,
    editorProps: {
      attributes: {
        class: isPlainText ? 'plain-text-editor' : 'rich-text-editor',
      },
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleSave = async () => {
    if (!editor) return;
    setIsSaving(true);
    try {
      // Всегда сохраняем как HTML, но с сохранением форматирования
      const contentToSave = isPlainText 
        ? editor.getText() 
        : editor.getHTML();
      await onSave(contentToSave);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="editor-modal">
      <div className="editor-modal__container" ref={modalRef}>
        <div className="editor-modal__header">
          <h3>Редактирование документа</h3>
          <div className="editor-modal__actions">
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="save-button"
            >
              <FiSave /> {isSaving ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button 
              onClick={onClose}
              className="close-button"
            >
              <FiX />
            </button>
          </div>
        </div>
        <div className="editor-modal__content">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};