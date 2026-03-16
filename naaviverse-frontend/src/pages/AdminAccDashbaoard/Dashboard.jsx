import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./Dashboard.scss";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function Dashboard() {

const [tab,setTab] = useState("pending");
const [selected,setSelected] = useState(null);
const [roleFilter,setRoleFilter] = useState("all");
const [data,setData] = useState([]);
const [showRoleDropdown,setShowRoleDropdown] = useState(false);

const dropdownRef = useRef(null);



/* ---------------- FETCH APPROVALS ---------------- */

useEffect(()=>{

axios
.get(`${BASE_URL}/api/approvals/get`)
.then(res=>{

if(res.data.status){
setData(res.data.data);
}

})
.catch(err=>{
console.log("Error fetching approvals",err);
});

},[]);



/* ---------------- CLICK OUTSIDE DROPDOWN ---------------- */

useEffect(()=>{

function handleClickOutside(event){

if(dropdownRef.current && !dropdownRef.current.contains(event.target)){
setShowRoleDropdown(false);
}

}

document.addEventListener("mousedown",handleClickOutside);

return ()=>{
document.removeEventListener("mousedown",handleClickOutside);
};

},[]);



/* ---------------- FILTER DATA ---------------- */

const filtered = data.filter(a=>{

if(a.status !== tab) return false;

if(roleFilter !== "all" && a.role?.toLowerCase() !== roleFilter.toLowerCase()){
return false;
}

return true;

});



const pendingCount = data.filter(a=>a.status==="pending").length;
const approvedCount = data.filter(a=>a.status==="approved").length;
const rejectedCount = data.filter(a=>a.status==="rejected").length;



/* ---------------- APPROVE ---------------- */

const approve = (id)=>{

axios
.put(`${BASE_URL}/api/approvals/update/${id}`,{
status:"approved"
})
.then(res=>{

if(res.data.status){

setData(prev =>
prev.map(item =>
item._id === id ? {...item,status:"approved"} : item
)
);

}

})
.catch(err=>console.log("Approve error",err));

};



/* ---------------- REJECT ---------------- */

const reject = (id)=>{

axios
.put(`${BASE_URL}/api/approvals/update/${id}`,{
status:"rejected"
})
.then(res=>{

if(res.data.status){

setData(prev =>
prev.map(item =>
item._id === id ? {...item,status:"rejected"} : item
)
);

}

})
.catch(err=>console.log("Reject error",err));

};



/* ---------------- DETAILS PAGE ---------------- */

if(selected){

return(

<div className="dashboard">

<div className="details-card">

<button
className="back-btn"
onClick={()=>setSelected(null)}
>
← Back
</button>

<div className="details-header">

<div>
<h2>{selected.businessName}</h2>
<span className={`role-tag ${selected.role?.toLowerCase()}`}>
{selected.role}
</span>
</div>

<span className={`verified-badge ${selected.status}`}>
  {selected.status === "approved"
    ? "✓ Verified"
    : selected.status === "rejected"
    ? "✕ Rejected"
    : "⏳ Pending"}
</span>

</div>


<div className="details-grid">

<div className="detail-row">
<div className="detail-label">Business Name</div>
<div className="detail-value">{selected.businessName}</div>
</div>

<div className="detail-row">
<div className="detail-label">Business Type</div>
<div className="detail-value">{selected.type}</div>
</div>

<div className="detail-row">
<div className="detail-label">Email</div>
<div className="detail-value">{selected.email}</div>
</div>

<div className="detail-row">
<div className="detail-label">Website</div>
<div className="detail-value">
<a href={selected.website} target="_blank" rel="noopener noreferrer">
{selected.website}
</a>
</div>
</div>

<div className="detail-row">
<div className="detail-label">First Name</div>
<div className="detail-value">{selected.firstName}</div>
</div>

<div className="detail-row">
<div className="detail-label">Last Name</div>
<div className="detail-value">{selected.lastName}</div>
</div>

<div className="detail-row">
<div className="detail-label">Position</div>
<div className="detail-value">{selected.position}</div>
</div>

<div className="detail-row">
<div className="detail-label">Country</div>
<div className="detail-value">{selected.country}</div>
</div>

</div>


<div className="approval-note">
<span>📧 Approval cards are emailed to the partner</span>
</div>


<div className="action-buttons">

<button
className="btn btn-outline"
onClick={()=>reject(selected._id)}
>
Reject
</button>

<button
className="btn btn-primary"
onClick={()=>approve(selected._id)}
>
Approve
</button>

</div>

</div>

</div>

);

}



/* ---------------- LIST PAGE ---------------- */

return(

<div className="dashboard">

<div className="approvals-card">

<div className="card-header">

<h2>Partner approvals</h2>


<div className="dropdown-container" ref={dropdownRef}>

<button
className="dropdown-toggle"
onClick={()=>setShowRoleDropdown(!showRoleDropdown)}
>

{roleFilter==="all" ? "All Roles" :
roleFilter==="partner" ? "Partners" : "Users"}

<span className="arrow">▼</span>

</button>


{showRoleDropdown && (

<div className="dropdown-menu">

<button
className={roleFilter==="all" ? "active" : ""}
onClick={()=>{setRoleFilter("all");setShowRoleDropdown(false);}}
>
All Roles
</button>

<button
className={roleFilter==="partner" ? "active" : ""}
onClick={()=>{setRoleFilter("partner");setShowRoleDropdown(false);}}
>
Partners
</button>

<button
className={roleFilter==="user" ? "active" : ""}
onClick={()=>{setRoleFilter("user");setShowRoleDropdown(false);}}
>
Users
</button>

</div>

)}

</div>

</div>



{/* TABS */}

<div className="tabs">

<button
className={`tab ${tab==="pending"?"active":""}`}
onClick={()=>setTab("pending")}
>
Pending <span className="count">{pendingCount}</span>
</button>

<button
className={`tab ${tab==="approved"?"active":""}`}
onClick={()=>setTab("approved")}
>
Approved <span className="count">{approvedCount}</span>
</button>

<button
className={`tab ${tab==="rejected"?"active":""}`}
onClick={()=>setTab("rejected")}
>
Rejected <span className="count">{rejectedCount}</span>
</button>

</div>



{/* TABLE */}

<div className="table-wrapper">

<table>

<thead>
<tr>
<th>Business name</th>
<th>Type</th>
<th>Email</th>
<th>Date</th>
<th>Actions</th>
</tr>
</thead>

<tbody>

{filtered.length>0 ? (

filtered.map(item=>(
<tr key={item._id}>

<td>

<div className="business-info">

<span className="business-name">
{item.businessName}
</span>

<span className={`role-badge ${item.role?.toLowerCase()}`}>
{item.role}
</span>

</div>

</td>

<td>
<span className="type-badge">
{item.type}
</span>
</td>

<td className="email-cell">
{item.email}
</td>

<td className="date-cell">
{item.date}
</td>

<td>

<div className="action-icons">

<button
className="icon-btn view"
onClick={()=>setSelected(item)}
>
👁
</button>

<button
className="icon-btn approve"
onClick={()=>approve(item._id)}
>
✓
</button>

<button
className="icon-btn reject"
onClick={()=>reject(item._id)}
>
✕
</button>

</div>

</td>

</tr>
))

) : (

<tr>
<td colSpan="5" className="no-results">
No {tab} approvals found
</td>
</tr>

)}

</tbody>

</table>

</div>

</div>

</div>

);

}