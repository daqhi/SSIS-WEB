import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function App(){
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(()=> {
    fetch(`${API}/api/items`)
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(err => console.error("fetch items err", err));
  }, []);

  async function addItem(e){
    e.preventDefault();
    if(!name) return;
    const res = await fetch(`${API}/api/items`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({name, description})
    });
    if(res.ok){
      const newItem = await res.json();
      setItems(prev => [newItem, ...prev]);
      setName(""); setDescription("");
    } else {
      console.error("create failed", await res.text());
    }
  }

  async function deleteItem(id){
    const res = await fetch(`${API}/api/items/${id}`, { method: "DELETE" });
    if(res.status === 204){
      setItems(prev => prev.filter(it => it.id !== id));
    } else {
      console.error("delete failed", await res.text());
    }
  }

  return (
    <div style={{padding: 20, fontFamily: "sans-serif"}}>
      <h1>Items</h1>
      <form onSubmit={addItem} style={{marginBottom: 12}}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="name" required />
        <input value={description} onChange={e=>setDescription(e.target.value)} placeholder="description" />
        <button type="submit">Add</button>
      </form>

      <ul>
        {items.map(it => (
          <li key={it.id} style={{marginBottom:8}}>
            <strong>{it.name}</strong> — {it.description}
            <button onClick={()=>deleteItem(it.id)} style={{marginLeft:8}}>Delete</button>
            <div style={{fontSize:12, color:"#666"}}>{it.created_at}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
