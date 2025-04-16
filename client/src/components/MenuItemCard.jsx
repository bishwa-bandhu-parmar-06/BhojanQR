


const MenuItemCard = ({ item, onEdit, onDelete, onToggleAvailable,  }) => {
  return (
    <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-3 flex gap-3">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-16 h-16 object-cover rounded-md"
        />
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-800 truncate">{item.name}</h3>
          <p className="text-sm text-gray-600">₹{item.price}</p>
          <p className="text-sm text-blue-500">{item.category}</p>
          {item.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
          )}
          <label className="flex items-center gap-2 mt-1 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={item.available}
              onChange={() => onToggleAvailable(item._id, !item.available)}
              className="form-checkbox h-4 w-4 text-green-500 focus:ring-green-500 rounded border-gray-300"
            />
            <span>Available</span>
          </label>
        </div>
        <div className="flex flex-col gap-2 justify-center">
          <button
            onClick={() => onEdit(item)}
            className="inline-flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium py-1.5 px-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(item._id)}
            className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1.5 px-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;