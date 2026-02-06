export function PendingActionTable({ type, endpoint }) {
  const [items, setItems] = useState([]);

  const handleApprove = async (id) => {
    await api.post(`${endpoint}/approve`, { transactionId: id });
    // Refresh logic here
  };

  return (
    <div className="bg-[#0f121d] rounded-2xl border border-gray-800 overflow-hidden">
      <div className="p-5 border-b border-gray-800 font-bold uppercase text-xs tracking-widest">
        Pending {type}
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-black/20 text-gray-500 text-[10px] uppercase">
          <tr>
            <th className="p-4">User</th>
            <th className="p-4">Amount</th>
            <th className="p-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {items.map(item => (
            <tr key={item._id} className="hover:bg-white/5">
              <td className="p-4 font-medium">{item.userName}</td>
              <td className="p-4 text-indigo-400 font-bold">€{item.amount}</td>
              <td className="p-4 text-right">
                <button 
                  onClick={() => handleApprove(item._id)}
                  className="bg-green-600 hover:bg-green-500 text-[10px] font-black px-3 py-1 rounded-lg uppercase"
                >
                  Approve
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

