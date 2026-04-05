import { useState, useEffect } from "react";
import { 
    Headphones, Plus, Trash2, Edit, Play, 
    Music, Search, 
} from "lucide-react";
import styles from "../css/SellerAudioManager.module.css";

const SellerAudioManager = () => {
    const [audios, setAudios] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentAudio, setCurrentAudio] = useState(null);
    const [loading, setLoading] = useState(false); 
    const [isGenerating, setIsGenerating] = useState(false);
    const [voices, setVoices] = useState([]);
    useEffect(() => {
    const synth = window.speechSynthesis;

    const loadVoices = () => {
        const availableVoices = synth.getVoices();
        setVoices(availableVoices);
    };

    loadVoices();
    // Chống lỗi danh sách rỗng trên Chrome/Edge
    if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = loadVoices;
    }
}, []);
    // ĐÃ DỌN DẸP: Xóa is_active
    const [formData, setFormData] = useState({ 
        title: "", 
        url: "",
        audio_text: "",
    
    });
 const handleTTS = async () => {
    if (!formData.audio_text) {
        alert("Vui lòng nhập nội dung thuyết minh!");
        return;
    }

    const synth = window.speechSynthesis;
    synth.cancel(); // Dừng ngay lập tức các âm thanh cũ

    try {
        // 1. Nhận diện ngôn ngữ từ API
        const detectRes = await fetch(
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURI(formData.audio_text)}`
        );
        const data = await detectRes.json();
        const detectedLang = data[2]; 
        console.log("Ngôn ngữ phát hiện:", detectedLang);

        const utterance = new SpeechSynthesisUtterance(formData.audio_text);

        // 2. Lấy danh sách giọng nói mới nhất (phòng trường hợp state chưa nạp kịp)
        const currentVoices = voices.length > 0 ? voices : synth.getVoices();

        // 3. Tìm giọng đọc phù hợp
        // Ưu tiên 1: Khớp ngôn ngữ nhận diện (ưu tiên giọng Google vì mượt hơn)
        // Ưu tiên 2: Giọng tiếng Việt
        // Ưu tiên 3: Giọng mặc định đầu tiên của hệ thống
        const matchedVoice = currentVoices.find(v => v.lang.startsWith(detectedLang) && v.name.includes("Google")) ||
                             currentVoices.find(v => v.lang.startsWith(detectedLang)) ||
                             currentVoices.find(v => v.lang.startsWith("vi")) ||
                             currentVoices[0];

        if (matchedVoice) {
            utterance.voice = matchedVoice;
            utterance.lang = matchedVoice.lang;
        } else {
            utterance.lang = 'vi-VN'; // Fallback cuối cùng
        }

        // Cấu hình thêm cho giọng đọc hay hơn
        utterance.rate = 1.0; // Tốc độ (0.1 đến 10)
        utterance.pitch = 1.0; // Cao độ (0 đến 2)

        synth.speak(utterance);

    } catch (error) {
        console.error("Lỗi TTS:", error);
        // Fallback nhanh nếu API nhận diện lỗi để Seller không phải chờ
        const utterance = new SpeechSynthesisUtterance(formData.audio_text);
        utterance.lang = 'vi-VN';
        synth.speak(utterance);
    }
};

    const token = sessionStorage.getItem("token");
const handleGenerateAudio = async () => {
    if (!formData.audio_text) {
        alert("Vui lòng nhập nội dung trước!");
        return;
    }

    setIsGenerating(true);

    try {
        const res = await fetch("http://localhost:5050/api/audios/tts-generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                text: formData.audio_text
            })
        });

        if (!res.ok) {
            throw new Error("Generate thất bại");
        }

        const data = await res.json();

        // 👉 GÁN URL vào input
        setFormData(prev => ({
            ...prev,
            url: data.audioUrl
        }));

        alert("✅ Đã tạo file audio!");

    } catch (err) {
        console.error(err);
        alert("❌ Lỗi tạo audio!");
    } finally {
        setIsGenerating(false);
    }
};
    const fetchAudios = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:5050/api/audios/my-stall-audios", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setAudios(Array.isArray(data) ? data : []);
            } else {
                console.error("Lỗi Server:", res.status);
                setAudios([]); 
            }
        } catch (err) {
            console.error("Lỗi kết nối:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        if (token) fetchAudios(); 
    }, [token]);

    const handleOpenAdd = () => {
        setIsEditing(false);
        // ĐÃ DỌN DẸP: Xóa is_active
        setFormData({ title: "", url: "", audio_text: "", poi_id: "" });
        setShowModal(true);
    };

    const handleOpenEdit = (audio) => {
        setIsEditing(true);
        setCurrentAudio(audio);
        // ĐÃ DỌN DẸP: Xóa is_active
        setFormData({ 
            title: audio.title || audio.audio_title || "", 
            url: audio.url || audio.audio_url || "",
            audio_text: audio.audio_text || "",
            poi_id: audio.poi_id || audio.narrationPointId || ""
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
       e.preventDefault();

    // ✅ Lấy stall của user để biết narrationPointId
    const stallRes = await fetch("http://localhost:5050/api/Stalls", {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
    });
    const stallData = await stallRes.json();
     console.log("Stall data:", stallData);  // 👈 xem log này
    console.log("narrationPointId:", stallData[0]?.narrationPointId, stallData[0]?.NarrationPointId);
    const narrationPointId = stallData[0]?.narrationPointId || stallData[0]?.NarrationPointId;
console.log("narrationPointId =", narrationPointId); 
    const requestBody = {
        entityType: "Audio",
        entityId: isEditing ? (currentAudio.id || currentAudio.audio_id) : 0,
        newDataJson: JSON.stringify({
            title: formData.title,           // ✅ đổi từ audio_title
            audioUrl: formData.url,          // ✅ đổi từ audio_url
            audioText: formData.audio_text,  // ✅ đổi từ audio_text
            narrationPointId: narrationPointId  // ✅ tự lấy, không để user nhập
        }),
        status: "Pending"
    };

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            if (res.ok) {
                alert("🚀 Yêu cầu đã được gửi tới Admin phê duyệt!");
                setShowModal(false);
                fetchAudios();
            } else {
                alert("❌ Có lỗi xảy ra khi gửi yêu cầu!");
            }
        } catch (err) {
            console.error("Lỗi gửi yêu cầu:", err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn chắc chắn muốn xóa audio này? Tác vụ này có thể cần Admin duyệt.")) return;
        
        try {
            const res = await fetch(`http://localhost:5050/api/requests`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    entityType: "Audio",
                    entityId: id,
                    newDataJson: JSON.stringify({ action: "DELETE" }),
                    status: "Pending"
                })
            });

            if (res.ok) {
                alert("🗑️ Yêu cầu xóa đã được gửi cho Admin!");
                fetchAudios();
            }
        } catch (error) {
            console.error("Lỗi xóa:", error);
        }
    };

    const filteredAudios = audios.filter(a => 
        (a.title || a.audio_title || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.searchBar}>
                    <Search size={18} className={styles.searchIcon} />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm file audio..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className={styles.addBtn} onClick={handleOpenAdd}>
                    <Plus size={18} /> Thêm Audio mới
                </button>
            </div>

            {loading ? (
                <div className={styles.emptyState}>
                    <p>Đang tải danh sách âm thanh...</p>
                </div>
            ) : (
                <div className={styles.audioGrid}>
    {filteredAudios.map((audio, index) => {
        const audioId = audio.id || audio.audio_id || audio.Id;
        const title = audio.title || audio.audio_title || audio.Title || "Chưa có tiêu đề";
        const url = audio.url || audio.audio_url || audio.audioUrl || audio.AudioUrl || "";
        const text = audio.audio_text || audio.audioText || audio.AudioText || "";
        
        const status = audio.status || audio.Status || "Approved"; 
        
        return (
            <div key={audioId || index} className={styles.audioCard}>
                <div className={styles.audioIcon}>
                    <Music size={24} />
                </div>
                <div className={styles.audioInfo}>
                    <h3>{title}</h3> 
                    
                    <p title={url} style={{ fontSize: '12px', color: '#0066cc', marginBottom: '4px', wordBreak: 'break-all' }}>
                        🔗 {url.length > 40 ? url.substring(0, 40) + "..." : (url || "Chưa có URL")}
                    </p> 
                    
                    <p title={text} style={{ fontSize: '13px', color: '#555', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        📝 {text || "Chưa có nội dung thuyết minh"}
                    </p>
                    
                    <div style={{ marginTop: "10px", marginBottom: "4px" }}>
                        <span style={{ 
                            padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold",
                            backgroundColor: (status === 'Pending' || status === 'Chờ duyệt') ? '#ff9800' : (status === 'Rejected' || status === 'Từ chối') ? '#f44336' : '#4caf50',
                            color: 'white'
                        }}>
                            {(status === 'Pending' || status === 'Chờ duyệt') && "⏳ Đang chờ duyệt"}
                            {(status === 'Approved' || status === 'Đã duyệt') && "✅ Đã duyệt (Live)"}
                            {(status === 'Rejected' || status === 'Từ chối') && "❌ Bị từ chối"}
                        </span>
                    </div>
                    
                    {status === "Rejected" && audio.admin_note && (
                        <small style={{ color: "red", display: "block", marginTop: "4px" }}>Lý do: {audio.admin_note}</small>
                    )}
                </div>
                
                <div className={styles.audioActions}>
                    {url && (
                        <button onClick={() => window.open(url, "_blank")} title="Nghe thử" style={{ color: "#4caf50" }}>
                            <Play size={16} />
                        </button>
                    )}
                    <button onClick={() => handleOpenEdit(audio)} title="Chỉnh sửa">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(audioId)} className={styles.deleteBtn} title="Xóa">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        );
    })}
</div>
            )}

            {!loading && filteredAudios.length === 0 && (
                <div className={styles.emptyState}>
                    <Headphones size={48} />
                    <p>Địa điểm của bạn hiện chưa có file audio nào hoặc không tìm thấy kết quả.</p>
                </div>
            )}

            {/* Modal Thêm/Sửa */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>{isEditing ? "Cập nhật Audio" : "Thêm Audio mới"}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label>Tiêu đề Audio</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Nội dung thuyết minh (Text)</label>
                                <div style={{ position: 'relative' }}>
                                    <textarea 
                                        rows="4"
                                        value={formData.audio_text}
                                        onChange={(e) => setFormData({...formData, audio_text: e.target.value})}
                                        placeholder="Nhập nội dung để chuyển thành giọng nói..."
                                    ></textarea>
                                    <div className={styles.ttsActionButtons}>
                                       
                                {/* Nút nghe thử loa máy tính (Free) */}
                                <button type="button" className={styles.previewBtn} onClick={handleTTS}>
                                    <Headphones size={14} /> Nghe thử 
                                </button>
                                
                                {/* Nút tạo file thật (Dùng FPT AI) */}
                                <button type="button" className={styles.genBtn}
                                        onClick={handleGenerateAudio}
                                        disabled={isGenerating}>
                                        {isGenerating ? "Đang tạo..." : " Tạo file"}
                                    </button>
                            </div>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Đường dẫn file (URL)</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={formData.url}
                                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => {
                                    window.speechSynthesis.cancel(); // Dừng đọc khi đóng modal
                                    setShowModal(false);
                                }}>Hủy</button>
                                <button type="submit" className={styles.submitBtn}>Gửi yêu cầu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerAudioManager;