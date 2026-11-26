"use client";

import { useCallback, useEffect, useState } from "react";

import api from "../../lib/api";
import Button from "../ui/Button";
import FormField from "../ui/FormField";
import CommentItem from "./CommentItem";

export default function CommentsSection({ commentableType, commentableId }) {
  // Store the comments associated with the current project or task.
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for creating a new comment and editing an existing one.
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");

  // Shared loading and error states for comment actions.
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  // Retrieve comments for the current project or task.
  const requestComments = useCallback(async () => {
    // Build the endpoint using the type and ID passed in through props.
    const response = await api.get(
      `/comments/${commentableType}s/${commentableId}`,
    );

    // Handle either a direct array response or an array nested inside response.data.data.
    return Array.isArray(response.data) ? response.data : response.data.data;
  }, [commentableType, commentableId]);

  // Fetch comments and update the component's state.
  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const commentData = await requestComments();
      setComments(commentData);
    } catch (error) {
      // Display the API's error message, or a fallback if one is unavailable.
      setError(error.response?.data?.message || "Unable to load comments.");
    } finally {
      // Stop the loading state whether the request succeeds or fails.
      setLoading(false);
    }
  }, [requestComments]);

  // Fetch comments when the component mounts or its target project/task changes.
  useEffect(() => {
    if (commentableId && commentableType) {
      fetchComments();
    }
  }, [commentableId, commentableType, fetchComments]);

  // Create a new comment.
  async function handleCreateComment(event) {
    // Prevent the browser's default form submission and page refresh.
    event.preventDefault();

    // Remove whitespace from the beginning and end of the comment.
    const content = newComment.trim();

    // Do not submit an empty comment.
    if (!content) return;

    try {
      setActionLoading(true);
      setActionError("");

      // Record existing comment IDs so the newly created comment can be identified.
      const existingIds = new Set(
        comments.map((comment) => String(comment.id)),
      );

      // Send the new comment and its associated project/task details to the API.
      await api.post("/comments", {
        commentable_id: commentableId,
        commentable_type: commentableType,
        content,
      });

      let createdComment = null;

      // Wait for the API to process the new comment.
      // Poll the comments endpoint until the new comment appears or attempts run out.
      for (let attempt = 0; attempt < 15; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const updatedComments = await requestComments();

        // Find the comment by its content and confirm its ID did not exist previously.
        createdComment = updatedComments.find(
          (comment) =>
            comment.content === content && !existingIds.has(String(comment.id)),
        );

        if (createdComment) {
          // Update the displayed comments and clear the input field.
          setComments(updatedComments);
          setNewComment("");
          break;
        }
      }

      // Inform the user if the API accepted the request but the comment
      // could not be found within the polling period.
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
    // Store the ID of the comment being edited.
    setEditingCommentId(comment.id);

    // Populate the editor with the comment's existing content.
    setEditContent(comment.content);

    setActionError("");
  }

  // Cancel editing.
  function handleCancelEdit() {
    // Reset the editing state and clear the temporary content.
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

      // Send the updated comment content to the API.
      await api.put(`/comments/${comment.id}`, {
        commentable_id: commentableId,
        commentable_type: commentableType,
        content,
      });

      let updatedComment = null;

      // Poll the API until the updated comment content is returned.
      for (let attempt = 0; attempt < 15; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const updatedComments = await requestComments();

        // Find the comment being edited using its ID.
        // String conversion allows comparison if IDs have different data types.
        updatedComment = updatedComments.find(
          (item) => String(item.id) === String(comment.id),
        );

        if (updatedComment?.content === content) {
          // Update the comment list and close the inline editor.
          setComments(updatedComments);
          setEditingCommentId(null);
          setEditContent("");
          break;
        }
      }

      // Display an error if the updated content was not confirmed.
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
    // Ask the user to confirm before performing a destructive action.
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment? This action cannot be undone.",
    );

    // Stop the function if the user cancels the confirmation.
    if (!confirmed) return;

    try {
      setActionLoading(true);
      setActionError("");

      // Send a DELETE request using the comment's ID.
      await api.delete(`/comments/${comment.id}`);

      let commentDeleted = false;

      // Poll the API until the deleted comment no longer appears in the response.
      for (let attempt = 0; attempt < 15; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const updatedComments = await requestComments();

        // Check whether the comment's ID is absent from the updated list.
        commentDeleted = !updatedComments.some(
          (item) => String(item.id) === String(comment.id),
        );

        if (commentDeleted) {
          setComments(updatedComments);
          break;
        }
      }

      // Inform the user if the comment is still present after polling.
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

      {/* Form for submitting a new comment. */}
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
          // Prevent submission if the comment is empty or only whitespace.
          disabled={!newComment.trim()}
        >
          Post Comment
        </Button>
      </form>

      {/* Display errors from creating, editing or deleting comments. */}
      {actionError && <p className="form-error">{actionError}</p>}

      {/* Render the appropriate content based on the comments' loading and data states. */}
      {loading ? (
        <p>Loading comments...</p>
      ) : error ? (
        <p className="form-error">{error}</p>
      ) : comments.length === 0 ? (
        <div className="comments-empty">
          <p>No comments yet. Start the discussion above.</p>
        </div>
      ) : (
        // Render an individual CommentItem component for each comment.
        <div className="comments-list">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              // Only the comment whose ID matches editingCommentId enters edit mode.
              isEditing={String(editingCommentId) === String(comment.id)}
              editContent={editContent}
              onEditChange={setEditContent}
              // Pass the comment action handlers down to each CommentItem.
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
