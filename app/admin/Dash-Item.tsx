import React from "react";


interface ItemInfo {
  _id: string;
  name: string;
  description: string;
  price: number;
  owner_wallet: string;
  image_url: string;
}

interface ItemProps {
  items: ItemInfo[];
  onDeleteItem: (id: string) => void;
}

const DashItems: React.FC<ItemProps> = ({ items, onDeleteItem }) => {
  return (
    <div >
      <h2 className="text-3xl font-bold mb-6 text-gray-700">Items Listed</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items && items.length > 0 ? (
          items.map((item) => (
            <div
              key={item._id}
              className="bg-gray-50 rounded-xl p-4 shadow hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <p className="font-bold text-xl mb-2">📦 {item.name}</p>
                <p className="text-gray-600 mb-1">📝 {item.description}</p>
                <p className="text-green-600 font-semibold mb-1">
                  💸 {item.price} USD
                </p>
                <p className="text-gray-500 mb-2 break-all">🔗 {item.owner_wallet}</p>
              </div>
              {item.image_url && (
                <div className="w-full h-40 overflow-hidden rounded-lg mb-4">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <button
                onClick={() => onDeleteItem(item._id)}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded mt-auto transition-colors"
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No items found.</p>
        )}
      </div>
    </div>
  );
};

export default DashItems;
