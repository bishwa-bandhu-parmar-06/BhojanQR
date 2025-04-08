const MenuItemCard = ({ item, onEdit, onDelete, onToggleAvailable }) => {
    return (
      <div className="bg-white shadow-md rounded-lg p-4 flex gap-4 items-center">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-20 h-20 object-cover rounded"
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{item.name}</h3>
          <p className="text-sm text-gray-600">₹{item.price}</p>
          <p className="text-sm text-blue-500">{item.category}</p>
          {item.description && (
            <p className="text-xs text-gray-500 mt-1">{item.description}</p>
          )}
          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={item.available}
              onChange={() => onToggleAvailable(item._id, !item.available)}
            />
            <span className="text-sm">Available</span>
          </label>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onEdit(item)}
            className="bg-yellow-500 text-white px-3 py-1 rounded"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(item._id)}
            className="bg-red-600 text-white px-3 py-1 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    );
  };
  

  export default MenuItemCard;