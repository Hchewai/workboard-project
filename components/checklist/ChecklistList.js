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
      <form className="checklist-create-form" onSubmit={onCreate}>
        <FormField
          label="New checklist item"
          name="label"
          value={newItem}
          onChange={(event) => onNewItemChange(event.target.value)}
          placeholder="e.g. Complete the wireframes"
          required
        />

        <Button
          type="submit"
          loading={loading}
          loadingText="Adding..."
          disabled={!newItem.trim()}
        >
          Add Item
        </Button>
      </form>

      {!items || items.length === 0 ? (
        <div className="checklist-empty">
          <p>No checklist items yet. Add your first item above.</p>
        </div>
      ) : (
        <div className="checklist-list">
          {items.map((item) => (
            <ChecklistItem
              key={item.id}
              item={item}
              onToggle={onToggle}
              loading={String(updatingItemId) === String(item.id)}
              onDelete={onDelete}
              deleting={String(deletingItemId) === String(item.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
