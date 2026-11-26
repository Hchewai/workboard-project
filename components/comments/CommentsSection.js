"use client";

import { useCallback, useEffect, useState } from "react";

import api from "../../lib/api";
import Button from "../ui/Button";
import FormField from "../ui/FormField";
import CommentItem from "./CommentItem";

export default function CommentsSection({ commentableType, commentableId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  // Retrieve comments for the current project or task.
  const requestComments = useCallback(async () => {
    const response = await api.get(
      `/comments/${commentableType}s/${commentableId}`,
    );

    return Array.isArray(response.data) ? response.data : response.data.data;
  }, [commentableType, commentableId]);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const commentData = await requestComments();
      setComments(commentData);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to load comments.");
    } finally {
      setLoading(false);
    }
  }, [requestComments]);

  useEffect(() => {
    if (commentableId && commentableType) {
      fetchComments();
    }
  }, [commentableId, commentableType, fetchComments]);

  // Create a new comment.
  async function handleCreateComment(event) {
    event.preventDefault();

    const content = newComment.trim();

    if (!content) return;

    try {
      setActionLoading(true);
      setActionError("");

      const existingIds = new Set(
        comments.map((comment) => String(comment.id)),
      );

      await api.post("/comments", {
        commentable_id: commentableId,
        commentable_type: commentableType,
        content,
      });

      let createdComment = null;

      // Wait for the API to process the new comment.
      for (let attempt = 0; attempt < 15; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const updatedComments = await requestComments();

        createdComment = updatedComments.find(
          (comment) =>
            comment.content === content && !existingIds.has(String(comment.id)),
        );

        if (createdComment) {
          setComments(updatedComments);
          setNewComment("");
          break;
        }
      }

      if (!createdComment) {
        setActionError(
          "The API accepted your comment, but it hasn't appeared yet. Please refresh shortly.",
        );
      }
    } catch (error) {
      setActionError(
        error.response?.data?.message || "Unable to create comment.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  // Open the inline editor for a comment.
  function handleEditComment(comment) {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
    setActionError("");
  }

  // Cancel editing.
  function handleCancelEdit() {
    setEditingCommentId(null);
    setEditContent("");
    setActionError("");
  }

  // Save an edited comment.
  async function handleSaveComment(comment) {
    const content = editContent.trim();

    if (!content) return;

    try {
      setActionLoading(true);
      setActionError("");

      await api.put(`/comments/${comment.id}`, {
        commentable_id: commentableId,
        commentable_type: commentableType,
        content,
      });

      let updatedComment = null;

      for (let attempt = 0; attempt < 15; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const updatedComments = await requestComments();

        updatedComment = updatedComments.find(
          (item) => String(item.id) === String(comment.id),
        );

        if (updatedComment?.content === content) {
          setComments(updatedComments);
          setEditingCommentId(null);
          setEditContent("");
          break;
        }
      }

      if (!updatedComment || updatedComment.content !== content) {
        setActionError(
          "The API accepted your update, but the changes haven't appeared yet. Please refresh shortly.",
        );
      }
    } catch (error) {
      setActionError(
        error.response?.data?.message || "Unable to update comment.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  // Delete a comment.
  async function handleDeleteComment(comment) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setActionError("");

      await api.delete(`/comments/${comment.id}`);

      let commentDeleted = false;

      for (let attempt = 0; attempt < 15; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const updatedComments = await requestComments();

        commentDeleted = !updatedComments.some(
          (item) => String(item.id) === String(comment.id),
        );

        if (commentDeleted) {
          setComments(updatedComments);
          break;
        }
      }

      if (!commentDeleted) {
        setActionError(
          "The API accepted the deletion, but the comment is still appearing. Please refresh shortly.",
        );
      }
    } catch (error) {
      setActionError(
        error.response?.data?.message || "Unable to delete comment.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <section className="project-detail-card comments-section">
      <div className="comments-header">
        <h2>Comments</h2>
        <p>Discussion and updates relating to this {commentableType}.</p>
      </div>

      <form className="comment-create-form" onSubmit={handleCreateComment}>
        <FormField
          label="Add a comment"
          name="newComment"
          type="textarea"
          value={newComment}
          onChange={(event) => setNewComment(event.target.value)}
          placeholder="Write your comment..."
          required
        />

        <Button
          type="submit"
          loading={actionLoading}
          loadingText="Posting..."
          disabled={!newComment.trim()}
        >
          Post Comment
        </Button>
      </form>

      {actionError && <p className="form-error">{actionError}</p>}

      {loading ? (
        <p>Loading comments...</p>
      ) : error ? (
        <p className="form-error">{error}</p>
      ) : comments.length === 0 ? (
        <div className="comments-empty">
          <p>No comments yet. Start the discussion above.</p>
        </div>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isEditing={String(editingCommentId) === String(comment.id)}
              editContent={editContent}
              onEditChange={setEditContent}
              onEdit={handleEditComment}
              onSave={handleSaveComment}
              onCancel={handleCancelEdit}
              onDelete={handleDeleteComment}
              loading={actionLoading}
            />
          ))}
        </div>
      )}
    </section>
  );
}
