import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {

  const [overview, setOverview] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const userName = sessionStorage.getItem("userName");
  useEffect(() => {

    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:5050/api/admin/overview", {
      headers: {
        Authorization: "Bearer " + token
      }
    })
      .then(res => res.json())
      .then(data => setOverview(data))
      .catch(() => console.log("Lỗi tải dữ liệu"));

  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    navigate("/login");
  };

  const menuItems = [
    { id: "overview", label: "Tổng quan", icon: "📊" },
    { id: "poi", label: "POI", icon: "📍" },
    { id: "audio", label: "Audio", icon: "🎧" },
    { id: "translation", label: "Bản dịch", icon: "🌐" },
    { id: "history", label: "Lịch sử", icon: "📜" },
    { id: "tour", label: "Tour", icon: "🗺️" }
  ];

  const renderContent = () => {

    if (activeTab === "overview") {
      return (
        <div className="content-wrapper">

          <div className="content-header">
            <h1 className="page-title">📊 Tổng quan hệ thống</h1>
            <div className="date-display">
              {new Date().toLocaleDateString()}
            </div>
          </div>

          {overview && (
            <div className="stats-container">

              <div className="stat-card users">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>Users</h3>
                  <div className="stat-number">{overview.totalUsers}</div>
                  <div className="stat-label">Tổng người dùng</div>
                </div>
              </div>

              <div className="stat-card poi">
                <div className="stat-icon">📍</div>
                <div className="stat-info">
                  <h3>POI</h3>
                  <div className="stat-number">{overview.totalPoi}</div>
                  <div className="stat-label">Địa điểm</div>
                </div>
              </div>

              <div className="stat-card audio">
                <div className="stat-icon">🎧</div>
                <div className="stat-info">
                  <h3>Audio</h3>
                  <div className="stat-number">{overview.totalAudio}</div>
                  <div className="stat-label">Audio guide</div>
                </div>
              </div>

              <div className="stat-card tours">
                <div className="stat-icon">🗺️</div>
                <div className="stat-info">
                  <h3>Tours</h3>
                  <div className="stat-number">{overview.totalTours}</div>
                  <div className="stat-label">Tour du lịch</div>
                </div>
              </div>

            </div>
          )}

        </div>
      );
    }

    return (
      <div className="empty-state">
        <h2>Chọn mục quản lý từ menu</h2>
        <p>Vui lòng chọn chức năng ở sidebar</p>
      </div>
    );
  };

  return (
    <>
      <style>{`

      *{
        margin:0;
        padding:0;
        box-sizing:border-box;
      }

      .admin-container{
        display:flex;
        height:100vh;
        font-family:Inter,Segoe UI,sans-serif;
        background:#f1f5f9;
      }

      .sidebar{
        width:270px;
        background:linear-gradient(180deg,#1e293b 0%,#334155 100%);
        color:white;
        display:flex;
        flex-direction:column;
        box-shadow:4px 0 16px rgba(0,0,0,0.1);
      }

      .sidebar-header{
        padding:28px 24px;
        border-bottom:1px solid rgba(255,255,255,0.08);
      }

      .cms-title{
        display:flex;
        align-items:center;
        gap:10px;
        font-size:22px;
        font-weight:700;
      }

      .cms-icon{
        font-size:26px;
      }

      .sidebar-menu{
        flex:1;
        padding:20px 16px;
        display:flex;
        flex-direction:column;
        justify-content:space-evenly;
      }

      .menu-item{
        display:flex;
        align-items:center;
        gap:16px;
        padding:18px 22px;
        border-radius:10px;
        cursor:pointer;
        transition:.25s;
        font-size:17px;
        font-weight:500;
      }

      .menu-item:hover{
        background:rgba(255,255,255,0.08);
        transform:translateX(6px);
      }

      .menu-item.active{
        background:rgba(255,255,255,0.15);
        border-left:3px solid #60a5fa;
      }

      .menu-icon{
        font-size:22px;
      }

      .sidebar-footer{
        padding:20px;
      }

      .logout-btn{
        width:100%;
        padding:12px;
        border-radius:8px;
        background:rgba(239,68,68,0.15);
        border:1px solid rgba(239,68,68,0.3);
        color:#fca5a5;
        font-size:14px;
        font-weight:500;
        cursor:pointer;
        transition:.2s;
      }

      .logout-btn:hover{
        background:rgba(239,68,68,0.25);
        transform:translateY(-2px);
      }

      .main-content{
        flex:1;
        padding:36px;
        overflow-y:auto;
      }

      .content-wrapper{
        max-width:1300px;
        margin:auto;
      }

      .content-header{
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-bottom:36px;
        border-bottom:1px solid #e2e8f0;
        padding-bottom:16px;
      }

      .page-title{
        font-size:30px;
        font-weight:700;
        color:#1e293b;
      }

      .date-display{
        color:#64748b;
        font-size:14px;
      }

      .stats-container{
        display:grid;
        grid-template-columns:repeat(4,1fr);
        gap:28px;
      }

      .stat-card{
        background:white;
        padding:32px;
        border-radius:18px;
        display:flex;
        align-items:center;
        gap:20px;
        border:1px solid #e2e8f0;
        box-shadow:0 6px 18px rgba(0,0,0,0.08);
        transition:.25s;
      }

      .stat-card:hover{
        transform:translateY(-6px);
        box-shadow:0 14px 28px rgba(0,0,0,0.12);
      }

      .stat-icon{
        font-size:34px;
        width:70px;
        height:70px;
        border-radius:16px;
        display:flex;
        align-items:center;
        justify-content:center;
      }

      .stat-card.users .stat-icon{background:rgba(59,130,246,0.12);}
      .stat-card.poi .stat-icon{background:rgba(16,185,129,0.12);}
      .stat-card.audio .stat-icon{background:rgba(245,158,11,0.12);}
      .stat-card.tours .stat-icon{background:rgba(139,92,246,0.12);}

      .stat-info h3{
        font-size:13px;
        text-transform:uppercase;
        color:#64748b;
        margin-bottom:6px;
      }

      .stat-number{
        font-size:42px;
        font-weight:700;
        color:#1e293b;
      }

      .stat-label{
        font-size:13px;
        color:#94a3b8;
      }

      .empty-state{
        text-align:center;
        padding:100px 20px;
      }

      `}</style>

      <div className="admin-container">

        <div className="sidebar">

          <div className="sidebar-header">
            <div className="cms-title">
              <span className="cms-icon">👑</span>
              Xin chào, {userName}
            </div>
          </div>

          <div className="sidebar-menu">
            {menuItems.map(item => (
              <div
                key={item.id}
                className={`menu-item ${activeTab === item.id ? "active" : ""}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="menu-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>

          <div className="sidebar-footer">
            <button className="logout-btn" onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>

        </div>

        <div className="main-content">
          {renderContent()}
        </div>

      </div>
    </>
  );
}

export default AdminDashboard;