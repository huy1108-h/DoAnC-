import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch("http://localhost:5050/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName, password }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      alert(data);
      return;
    }

    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("role", data.role);
    sessionStorage.setItem("userName",userName);

    alert("Đăng nhập thành công!");

    if (data.role && data.role.toLowerCase() === "admin") {
  navigate("/admin");
} else {
  navigate("/");
}
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .login-page {
          font-family: 'Be Vietnam Pro', sans-serif;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* NAVBAR — đồng bộ Home: padding 0 60px */
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 60px;
          height: 70px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .navbar-brand {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a1a;
          cursor: pointer;
          user-select: none;
        }

        .navbar-actions { display: flex; gap: 12px; }

        .btn-outline {
          padding: 8px 20px;
          border: 2px solid #e8542a;
          color: #e8542a;
          background: transparent;
          border-radius: 6px;
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-outline:hover { background: #e8542a; color: #fff; }

        .btn-primary {
          padding: 8px 20px;
          background: #e8542a;
          color: #fff;
          border: 2px solid #e8542a;
          border-radius: 6px;
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary:hover { background: #c94220; border-color: #c94220; }

        /* HERO — đồng bộ Home: height 70vh, min-height 420px */
             .hero {
          position: relative;
          height: calc(100vh - 70px);
          min-height: 500px;
          background-image: url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80');
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }


        .hero-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
        }

        .hero-content {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 80px;
          width: 100%;
          max-width: 1100px;
          padding: 0 60px;
        }

        /* HERO TEXT — đồng bộ Home: font-size 3.2rem */
        .hero-text {
          color: #fff;
          text-align: center;
          flex: 1;
          max-width: 440px;
        }

        .hero-text h1 {
          font-size: 3.2rem;
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 14px;
          text-shadow: 0 2px 16px rgba(0,0,0,0.4);
        }

        .hero-text p {
          font-size: 1.15rem;
          opacity: 0.9;
          text-shadow: 0 1px 8px rgba(0,0,0,0.4);
          line-height: 1.6;
        }

        /* LOGIN CARD */
        .login-card {
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(12px);
          border-radius: 16px;
          padding: 44px 40px 40px;
          width: 380px;
          flex-shrink: 0;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .login-card-header { text-align: center; margin-bottom: 28px; }
        .login-card-header .icon { font-size: 2rem; margin-bottom: 8px; }
        .login-card-header h2 {
          font-size: 1.6rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 4px;
        }
        .login-card-header p { font-size: 0.875rem; color: #888; }

        .divider {
          height: 2px;
          background: linear-gradient(to right, transparent, #e8542a, transparent);
          margin-bottom: 28px;
          opacity: 0.5;
        }

        .form-group { margin-bottom: 18px; }

        .form-group label {
          display: block;
          font-size: 0.78rem;
          font-weight: 600;
          color: #555;
          margin-bottom: 7px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-group input {
          width: 100%;
          padding: 12px 16px;
          border: 1.5px solid #e5e5e5;
          border-radius: 8px;
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 0.95rem;
          color: #1a1a1a;
          background: #fafafa;
          transition: all 0.2s;
          outline: none;
        }
        .form-group input:focus {
          border-color: #e8542a;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(232,84,42,0.1);
        }
        .form-group input::placeholder { color: #bbb; }

        .forgot-link {
          text-align: right;
          margin-top: -10px;
          margin-bottom: 22px;
        }
        .forgot-link a {
          font-size: 0.8rem;
          color: #e8542a;
          text-decoration: none;
          font-weight: 500;
        }

        .btn-login {
          width: 100%;
          padding: 13px;
          background: #e8542a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(232,84,42,0.35);
        }
        .btn-login:hover { background: #c94220; box-shadow: 0 6px 20px rgba(232,84,42,0.45); }
        .btn-login:active { transform: scale(0.99); }
        .btn-login:disabled { opacity: 0.7; cursor: not-allowed; }

        .login-footer-note {
          text-align: center;
          margin-top: 22px;
          font-size: 0.875rem;
          color: #888;
        }
        .login-footer-note a {
          color: #e8542a;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
        }
        .login-footer-note a:hover { text-decoration: underline; }

        /* FOOTER — đồng bộ Home */
        .footer {
          text-align: center;
          padding: 24px 20px;
          background: #111;
          color: rgba(255,255,255,0.7);
          font-size: 0.875rem;
          margin-top: auto;
        }

        @media (max-width: 820px) {
          .navbar { padding: 0 20px; }
          .hero-content { flex-direction: column; gap: 36px; padding: 24px 20px; }
          .hero-text h1 { font-size: 2rem; }
          .login-card { width: 100%; max-width: 400px; }
        }
      `}</style>

      <div className="login-page">
        {/* NAVBAR */}
        <nav className="navbar">
          <div className="navbar-brand" onClick={() => navigate("/")}>
            🍜 Phố Ẩm Thực
          </div>
          <div className="navbar-actions">
            <button className="btn-outline" onClick={() => navigate("/login")}>Đăng nhập</button>
            <button className="btn-primary" onClick={() => navigate("/register")}>Đăng ký</button>
          </div>
        </nav>

        {/* HERO */}
        <div className="hero">
          <div className="hero-overlay" />
          <div className="hero-content">
            <div className="hero-text">
              <h1>Khám Phá Phố Ẩm Thực</h1>
              <p>Hệ thống thuyết minh cho từng địa điểm</p>
            </div>

            <div className="login-card">
              <div className="login-card-header">
                <div className="icon">🍜</div>
                <h2>Đăng nhập</h2>
                <p>Chào mừng bạn trở lại!</p>
              </div>
              <div className="divider" />

              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>Tên đăng nhập</label>
                  <input
                    placeholder="Nhập tên đăng nhập"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mật khẩu</label>
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="forgot-link">
                  <a href="#">Quên mật khẩu?</a>
                </div>

                <button className="btn-login" type="submit" disabled={loading}>
                  {loading ? "Đang xử lý..." : "Đăng nhập"}
                </button>
              </form>

              <div className="login-footer-note">
                Chưa có tài khoản?{" "}
                <a onClick={() => navigate("/register")}>Đăng ký ngay</a>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="footer">
          © 2026 Phố Ẩm Thực — Guide System
        </footer>
      </div>
    </>
  );
}

export default Login;