import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createNote } from '../../services/noteService';
import type { NoteTag } from '../../types/note';

import css from './NoteForm.module.css';

interface NoteFormValues {
  title: string;
  content: string;
  tag: NoteTag;
}

interface Props {
  onClose: () => void;
}

export default function NoteForm({ onClose }: Props) {
  const queryClient = useQueryClient();

  const [values, setValues] = useState<NoteFormValues>({
    title: '',
    content: '',
    tag: 'Todo',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof NoteFormValues, string>>>(
    {}
  );

  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      onClose();
    },
  });

  const validate = (values: NoteFormValues) => {
    const newErrors: Partial<Record<keyof NoteFormValues, string>> = {};

    if (values.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (values.content.length > 500) {
      newErrors.content = 'Content is too long';
    }

    if (!values.tag) {
      newErrors.tag = 'Tag is required';
    }

    return newErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const updated = {
      ...values,
      [e.target.name]: e.target.value,
    };

    setValues(updated);
    setErrors(validate(updated));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    createMutation.mutate(values);
  };

  return (
    <form className={css.form} onSubmit={handleSubmit}>
      <div className={css.formGroup}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          className={css.input}
          value={values.title}
          onChange={handleChange}
        />
        <span className={css.error}>{errors.title}</span>
      </div>

      <div className={css.formGroup}>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          rows={8}
          className={css.textarea}
          value={values.content}
          onChange={handleChange}
        />
        <span className={css.error}>{errors.content}</span>
      </div>

      <div className={css.formGroup}>
        <label htmlFor="tag">Tag</label>
        <select
          id="tag"
          name="tag"
          className={css.select}
          value={values.tag}
          onChange={handleChange}
        >
          <option value="Todo">Todo</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Meeting">Meeting</option>
          <option value="Shopping">Shopping</option>
        </select>
        <span className={css.error}>{errors.tag}</span>
      </div>

      <div className={css.actions}>
        <button type="button" className={css.cancelButton} onClick={onClose}>
          Cancel
        </button>

        <button
          type="submit"
          className={css.submitButton}
          disabled={createMutation.isPending}
        >
          Create note
        </button>
      </div>
    </form>
  );
}