import { useState } from "react";

interface Item {
  _id: string;
  owner_wallet: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  createdAt: string;
  updatedAt: string;
}

interface ItemProps {
  ownedItems: Item[];
  fetchOwnedItems: () => void;
}

const MyItems: React.FC<ItemProps> = ({ ownedItems,fetchOwnedItems }) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    price: 0,
    image_url: "",
  });

  const handleEditClick = (item: Item) => {
    setSelectedItem(item);
    setEditData({
      name: item.name,
      description: item.description,
      price: item.price,
      image_url: item.image_url,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const formData = new FormData();
      formData.append("file", file);

      console.log("🚀 Uploading Image:", file.name);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("✅ Upload Response:", data);

      if (res.status === 201) {
        setEditData((prev) => ({ ...prev, image_url: data.image_url }));
      }
    }
  };

  const handleSave = async () => {
    if (!selectedItem) return;
  
    const updatedItem = {
      _id: selectedItem._id,
      owner_wallet: selectedItem.owner_wallet,
      name: editData.name || selectedItem.name,
      description: editData.description || selectedItem.description,
      price: editData.price || selectedItem.price,
      image_url: editData.image_url || selectedItem.image_url,
      createdAt: selectedItem.createdAt,
      updatedAt: new Date().toISOString(),
    };
  
    console.log("📦 Saving item:", updatedItem);
  
    await fetch(`/api/order/${selectedItem._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedItem),
    });
  
    alert("✅ Item updated!");
    setSelectedItem(null);
    fetchOwnedItems(); // 👉 ดึงข้อมูลใหม่
  };

  const handleDelete = async (itemId: string) => {
    if (confirm("ต้องการลบสินค้านี้ใช่หรือไม่?")) {
      const res = await fetch(`/api/order/${itemId}`, { method: "DELETE" });
      if (res.status === 200) {
        alert("ลบข้อมูลสำเร็จแล้ว!");
        fetchOwnedItems(); // 👉 ดึงข้อมูลใหม่
      } else {
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-2">My Items</h2>
      {ownedItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {ownedItems.map((item) => (
            <div key={item._id} className="border p-4 rounded shadow">
                <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-32 object-cover rounded mb-2"
                />
                <h3 className="font-bold">{item.name}</h3>
                <p className="text-sm">{item.description}</p>
                <p className="text-blue-500 font-bold">${item.price}</p>
                <button
                    onClick={() => handleEditClick(item)}
                    className="inline-block mt-2 bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded"
                    >
                    Edit
                </button>
                <button
                    onClick={() => handleDelete(item._id)}
                    className="inline-block mt-2 ml-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                    >
                    Delete
                </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No items found.</p>
      )}

      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Item</h2>

            {editData.image_url && (
              <img
                src={editData.image_url}
                alt="Preview"
                className="w-full h-32 object-cover rounded mb-4"
              />
            )}

            <div className="mb-3">
              <label className="block font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={editData.name}
                onChange={handleInputChange}
                className="w-full border rounded p-2 mt-1"
              />
            </div>
            <div className="mb-3">
              <label className="block font-medium">Description</label>
              <textarea
                name="description"
                value={editData.description}
                onChange={handleInputChange}
                className="w-full border rounded p-2 mt-1"
              />
            </div>
            <div className="mb-3">
              <label className="block font-medium">Price</label>
              <input
                type="number"
                name="price"
                value={editData.price}
                onChange={handleInputChange}
                className="w-full border rounded p-2 mt-1"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Upload New Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border rounded p-2 mt-1"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedItem(null)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyItems;
