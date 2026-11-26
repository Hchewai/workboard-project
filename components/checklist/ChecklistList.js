import ChecklistItem from "./ChecklistItem";
import Button from "../ui/Button";
import FormField from "../ui/FormField";

export default function ChecklistList({
  items,
  newItem,
  onNewItemChange,
  onCreate,
  loading,
  onToggle,
  updatingItemId,
  onDelete,
  deletingItemId,
}) {
  return (
    <>
      {/* Form for entering and submitting a new checklist item. */}
      <form className="checklist-create-form" onSubmit={onCreate}>
        <FormField
          label="New checklist item"
          name="label"
          value={newItem}
          // Update the parent's state whenever the input value changes.
          onChange={(event) => onNewItemChange(event.target.value)}
          placeholder="e.g. Complete the wireframes"
          required
        />

        <Button
          type="submit"
          // Show a loading state while the new item is being created.
          loading={loading}
          loadingText="Adding..."
          // Disable submission if the input is empty or contains only whitespace.
          disabled={!newItem.trim()}
        >
          Add Item
        </Button>
      </form>

      {/* Display an empty-state message when there are no checklist items. */}
      {!items || items.length === 0 ? (
        <div className="checklist-empty">
          <p>No checklist items yet. Add your first item above.</p>
        </div>
      ) : (
        // Render a ChecklistItem component for each item in the array.
        <div className="checklist-list">
          {items.map((item) => (
            <ChecklistItem
              // React uses the unique ID to keep track of each rendered item.
              key={item.id}
              item={item}
              // Pass the parent's toggle handler to the individual item.
              onToggle={onToggle}
              // Compare IDs as strings to handle possible number/string differences.
              // Only the item currently being updated receives the loading state.
              loading={String(updatingItemId) === String(item.id)}
              onDelete={onDelete}
              // Only the item currently being deleted receives the deleting state.
              deleting={String(deletingItemId) === String(item.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
