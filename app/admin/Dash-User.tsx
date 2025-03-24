import React from "react";
interface UserInfo {
  _id: string;
  name: string;
  email: string;
  wallet_address: string;
  coin: number;
}

interface UserProps {
  users: UserInfo[];
  onDelete: (wallet_address: string) => void;  // เพิ่มฟังก์ชันลบ
}

const DashUser: React.FC<UserProps> = ({ users, onDelete }) => {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-700">Users</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {users.length > 0 ? (
          users.map((user) => (
            <div
              key={user._id}
              className="bg-white shadow-lg rounded-xl p-4 flex flex-col justify-between hover:shadow-2xl transition-shadow duration-300"
            >
              <div>
                <p className="font-bold text-lg mb-2">👤 {user.name}</p>
                <p className="text-gray-600 mb-1">📧 {user.email}</p>
                <p className="text-yellow-600 mb-1 font-medium">
                  💰 {user.coin.toFixed(2)} ETH
                </p>
                <p className="text-gray-500 break-all">🔗 {user.wallet_address}</p>
              </div>
              <button
                onClick={() => onDelete(user.wallet_address)}
                className="mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No users found.</p>
        )}
      </div>
    </div>
  );
};

export default DashUser;
