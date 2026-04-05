import { useEffect, useState } from "react";
import styles from "../css/AudioManager.module.css";

// Icons
const ViewIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

function AudioManager() {
  const [audios, setAudios] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAudio, setEditingAudio] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  // --- STATE PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = sessionStorage.getItem("audio_manager_page");
    return savedPage ? parseInt(savedPage) : 1;
  });
  const itemsPerPage = 5; 

  const [form, setForm] = useState({
    audio_id: "",
    audio_title: "",
    audio_url: "",
    audio_text: "",
    poi_id: ""
  });
  
  const token = sessionStorage.getItem("token");

  const loadAudios = () => {
    fetch("http://localhost:5050/api/Audio", {
      headers: {
        Authorization: "Bearer " + token
      }
    })
      .then(res => res.json())
      .then(data => setAudios(data))
      .catch(() => console.log("Lỗi tải audio"));
  };

  useEffect(() => {
    sessionStorage.setItem("audio_manager_page", currentPage);
  }, [currentPage]);

  useEffect(() => {
    loadAudios();
  }, []);

  // --- LOGIC PHÂN TRANG ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = audios.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(audios.length / itemsPerPage);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const openAddForm = () => {
    setEditingAudio(null);
    setForm({
      audio_id: "",
      audio_title: "",
      audio_url: "",
      audio_text: "",
      poi_id: ""
    });
    setShowForm(true);
  };

  const openEditForm = (audio) => {
    setEditingAudio(audio);
    setForm({
      ...audio,
      audio_text: audio.audio_text || ""
    });
    setShowForm(true);
  };

  // LƯU Ý: ADMIN SUBMIT THẲNG VÀO BẢNG AUDIO
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingAudio 
      ? `http://localhost:5050/api/Audio/${editingAudio.audio_id || editingAudio.id}` 
      : "http://localhost:5050/api/Audio";
    
    const method = editingAudio ? "PUT" : "POST";

    const payload = {
      audio_id: parseInt(form.audio_id) || 0,
      audio_title: form.audio_title,
      audio_url: form.audio_url,
      audio_text: form.audio_text,
      poi_id: parseInt(form.poi_id) || 0
    };

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(payload) 
      });

      if (res.ok) {
        setShowForm(false);
        setEditingAudio(null);
        loadAudios(); 
        alert(editingAudio ? "✅ Cập nhật Audio thành công!" : "✅ Thêm Audio thành công!");
      } else {
        const errorData = await res.json();
        console.log("Chi tiết lỗi từ C#:", errorData);
        alert("❌ Thao tác thất bại! Kiểm tra lại thông tin.");
      }
    } catch (err) {
      console.error("Lỗi mạng:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa audio này?")) return;
    const res = await fetch(`http://localhost:5050/api/Audio/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token
      }
    });
    if (res.ok) {
      setSelectedAudio(null);
      loadAudios();
    }
  };

  const handlePreviewSpeak = () => {
    if (!form.audio_text) {
      alert("Vui lòng nhập nội dung!");
      return;
    }

    const text = form.audio_text;

    const speak = () => {
      const voices = window.speechSynthesis.getVoices();
      const utterance = new SpeechSynthesisUtterance(text);

      let lang = "en-US";
      if (/[àáảãạăắằẳẵặâấầẩẫậđêếềểễệôốồổỗộơớờởỡợưứừửữự]/i.test(text)) {
        lang = "vi-VN";
      } else if (/[\u4e00-\u9fff]/.test(text)) {
        lang = "zh-CN";
      }

      let selectedVoice =
        voices.find(v => v.lang === lang) ||
        voices.find(v => v.lang.startsWith(lang.split("-")[0]));

      if (!selectedVoice) {
        console.log("Không tìm thấy voice phù hợp, dùng default");
      } else {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      }

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    };

    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.onvoiceschanged = speak;
    } else {
      speak();
    }
  };
const handleGenerateAudio = async () => {
  if (!form.audio_text) {
    alert("Vui lòng nhập nội dung!");
    return;
  }

  setIsGenerating(true);

  try {
    const res = await fetch("http://localhost:5050/api/audios/tts-generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        text: form.audio_text
      })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }

    const data = await res.json();

    // 🔥 GÁN URL vào form
    setForm(prev => ({
      ...prev,
      audio_url: data.audioUrl
    }));

    alert("✅ Tạo audio thành công!");

  } catch (err) {
    console.error(err);
    alert("❌ Lỗi tạo audio!");
  } finally {
    setIsGenerating(false);
  }
};
  return (
    <div className={styles["audio-container"]}>
      <div className={styles["audio-header"]}>
        <h1>🎧 Quản lý Audio Guide</h1>
        <button className={styles["add-btn"]} onClick={openAddForm}>
          + Thêm Audio
        </button>
      </div>

      <table className={styles["audio-table"]}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tiêu đề</th>
            <th>Nội dung thuyết minh</th>
            <th>URL</th>
            <th>POI</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item, index) => {
            const audioId = item.audio_id || item.id || item.Id;
            const audioTitle = item.audio_title || item.title || item.Title;
            const audioUrl = item.audio_url || item.audioUrl || item.AudioUrl;
            const audioText = item.audio_text || "";
            const poiId = item.poi_id || item.narrationPointId || item.NarrationPointId;

            return (
              <tr key={audioId ? `audio-${audioId}` : `index-${index}`}>
                <td><code>{audioId}</code></td>
                <td>{audioTitle}</td>
                <td title={audioText}>
                  {audioText ? (
                    audioText.length > 35 ? audioText.substring(0, 35) + "..." : audioText
                  ) : (
                    <span style={{ color: "#999", fontStyle: "italic" }}>Trống</span>
                  )}
                </td>
                <td>
                  <a href={audioUrl} target="_blank" rel="noreferrer">
                    {audioUrl?.length > 30 ? audioUrl.substring(0, 30) + "..." : audioUrl}
                  </a>
                </td>
                <td>
                  <span className={styles["poi-badge"]}>{poiId}</span>
                </td>
                <td>
                  <div className={styles["action-buttons"]}>
                    <button className={`${styles["action-btn"]} ${styles["play-btn"]}`} onClick={() => window.open(audioUrl)} title="Phát URL">
                      <PlayIcon />
                    </button>
                    <button className={`${styles["action-btn"]} ${styles["view-btn"]}`} onClick={() => setSelectedAudio(item)} title="Xem chi tiết">
                      <ViewIcon />
                    </button>
                    <button className={`${styles["action-btn"]} ${styles["edit-btn"]}`} onClick={() => openEditForm(item)} title="Sửa">
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button className={`${styles["action-btn"]} ${styles["delete-btn"]}`} onClick={() => handleDelete(audioId)} title="Xóa">
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} title="Về trang đầu">&laquo;</button>
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} title="Trang trước">&lsaquo;</button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={currentPage === i + 1 ? styles.active : ""}
            >
              {i + 1}
            </button>
          ))}
          
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} title="Trang sau">&rsaquo;</button>
          <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} title="Đến trang cuối">&raquo;</button>
        </div>
      )}

      {/* Modal xem chi tiết */}
      {selectedAudio && !showForm && (() => {
        const displayId = selectedAudio.audio_id || selectedAudio.id || selectedAudio.Id;
        const displayTitle = selectedAudio.audio_title || selectedAudio.title || selectedAudio.Title;
        const displayText = selectedAudio.audio_text || selectedAudio.audioText || selectedAudio.AudioText;
        const displayUrl = selectedAudio.audio_url || selectedAudio.audioUrl || selectedAudio.AudioUrl;
        const displayPoi = selectedAudio.poi_id || selectedAudio.narrationPointId || selectedAudio.NarrationPointId;

        return (
          <div className={styles.modal}>
            <div className={styles["modal-box"]}>
              <div className={styles["modal-header"]}>
                <h2>Chi tiết Audio</h2>
                <button className={styles["modal-close-icon"]} onClick={() => setSelectedAudio(null)}>
                  <CloseIcon />
                </button>
              </div>
              <div className={styles["modal-content"]}>
                <div className={styles["form-group"]}>
                  <label>ID</label>
                  <input value={displayId || ""} disabled />
                </div>
                <div className={styles["form-group"]}>
                  <label>Tiêu đề</label>
                  <input value={displayTitle || ""} disabled />
                </div>
                <div className={styles["form-group"]}>
                  <label>Nội dung thuyết minh</label>
                  <textarea value={displayText || "Không có nội dung"} disabled rows="4" />
                </div>
                <div className={styles["form-group"]}>
                  <label>URL</label>
                  <input value={displayUrl || ""} disabled />
                </div>
                <div className={styles["form-group"]}>
                  <label>POI ID</label>
                  <input value={displayPoi || ""} disabled />
                </div>

                {displayUrl && (
                  <div className={styles["form-group"]}>
                    <label>Phát Audio URL</label>
                    <audio controls controlsList="nodownload" style={{ width: "100%" }}>
                      <source src={displayUrl} type="audio/mpeg" />
                    </audio>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal thêm / sửa */}
      {showForm && (
        <div className={styles.modal}>
          <div className={styles["modal-box"]}>
            <div className={styles["modal-header"]}>
              <h2>{editingAudio ? "Sửa Audio" : "Thêm Audio"}</h2>
              <button className={styles["modal-close-icon"]}
                onClick={() => {
                  setShowForm(false);
                  setEditingAudio(null);
                  window.speechSynthesis.cancel();
                }}
              >
                <CloseIcon />
              </button>
            </div>
            <form className={styles["modal-content"]} onSubmit={handleSubmit}>
              <div className={styles["form-group"]}>
                <label>ID</label>
                <input name="audio_id" value={form.audio_id} onChange={handleChange} disabled={editingAudio} />
              </div>
              <div className={styles["form-group"]}>
                <label>Tiêu đề</label>
                <input name="audio_title" value={form.audio_title} onChange={handleChange} required />
              </div>
              <div className={styles["form-group"]}>
                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  Nội dung thuyết minh (Text)

  <div style={{ display: "flex", gap: "6px" }}>
    <button 
      type="button" 
      onClick={handlePreviewSpeak} 
      style={{ background: "#4caf50", color: "white", border: "none", padding: "2px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
    >
      🔊 Nghe thử
    </button>

    <button 
      type="button" 
      onClick={handleGenerateAudio}
      disabled={isGenerating}
      style={{ background: "#ff9800", color: "white", border: "none", padding: "2px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
    >
      {isGenerating ? "Đang tạo..." : "🎧 Tạo file"}
    </button>
  </div>
</label>
                <textarea name="audio_text" value={form.audio_text} onChange={handleChange} rows="4" placeholder="Nhập nội dung thuyết minh vào đây..."></textarea>
              </div>
              <div className={styles["form-group"]}>
                <label>URL (Đường dẫn file Audio)</label>
                <input name="audio_url" value={form.audio_url} onChange={handleChange} required />
              </div>
              <div className={styles["form-group"]}>
                <label>POI ID</label>
                <input name="poi_id" value={form.poi_id} onChange={handleChange} required />
              </div>
              <div className={styles["modal-actions"]}>
                <button type="submit" className={`${styles["icon-btn"]} ${styles["save-btn"]}`}>
                  <i className="fa-solid fa-floppy-disk"></i> 
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AudioManager;