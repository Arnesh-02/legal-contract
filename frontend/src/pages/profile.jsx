import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/auth-context";
import { updateProfile, uploadProfilePhoto } from "../api/auth"; 
import { User, Mail, Briefcase, Tag, Camera, Save, Loader, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const getDefaultAvatar = (name) => {
    if (!name) return "";
    return name.trim().charAt(0).toUpperCase();
};

export default function ProfilePage() {
    const { user, refreshUserProfile } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [profile, setProfile] = useState({
        name: user?.name || "",
        email: user?.email || "",
        company: user?.company || "", 
        role: user?.role || "", 
        picture: user?.picture || "",
    });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        setProfile({
            name: user?.name || "",
            email: user?.email || "",
            company: user?.company || "",
            role: user?.role || "",
            picture: user?.picture || "",
        });
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const pickFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const reader = new FileReader();

        reader.onload = async () => {
            const dataUrl = reader.result;
            setProfile(prev => ({ ...prev, picture: dataUrl }));

            try {
                await uploadProfilePhoto({ data_url: dataUrl });
                await refreshUserProfile();
                alert("Photo uploaded successfully!");
            } catch (err) {
                alert("Photo upload failed");
                console.error("Photo upload error:", err);
            } finally {
                setUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const save = async () => {
        setSaving(true);
        try {
            const { name, company, role } = profile;
            await updateProfile({ name, company, role }); 
            await refreshUserProfile();
            alert("Profile updated successfully!");
        } catch (err) {
            console.error("Profile save error:", err);
            alert("Save failed");
        } finally {
            setSaving(false);
        }
    };
    
    const avatarSource = profile.picture;
    const defaultInitial = getDefaultAvatar(profile.name || user?.email);

    return (
        <div className="page-container-app">
            <div className="container profile-page-container">
                <button className="back-btn" onClick={() => navigate('/dashboard')}>
                    <ChevronLeft size={20} /> Back to Dashboard
                </button>
                <div className="app-panel profile-panel">
                    <div className="app-panel-header">
                        <h2><User size={28} style={{ marginRight: '10px' }} /> User Profile</h2>
                    </div>
                    
                    <div className="profile-photo-section">
                        {avatarSource ? (
                            <img 
                                src={avatarSource} 
                                alt="User Avatar" 
                                className="profile-avatar-large"
                            />
                        ) : (
                            <div className="profile-avatar-default">
                                {defaultInitial}
                            </div>
                        )}
                        
                        <button 
                            className="photo-upload-btn" 
                            onClick={() => fileInputRef.current.click()}
                            disabled={uploading || saving}
                        >
                            {uploading ? <Loader size={18} className="spinner" /> : <Camera size={18} />}
                            {uploading ? "Uploading..." : "Change Photo"}
                        </button>
                        
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={pickFile} 
                            ref={fileInputRef} 
                            style={{ display: 'none' }}
                            disabled={uploading || saving}
                        />
                    </div>

                    <div className="profile-form">
                        
                        <div className="form-group-icon">
                            <label><User size={16} /> Full Name</label>
                            <input 
                                name="name"
                                value={profile.name} 
                                onChange={handleChange}
                                disabled={saving || uploading}
                            />
                        </div>
                        
                        <div className="form-group-icon">
                            <label><Mail size={16} /> Email (read-only)</label>
                            <input 
                                name="email"
                                value={profile.email} 
                                readOnly 
                                disabled 
                                className="read-only-input"
                            />
                        </div>
                        
                        <div className="form-group-icon">
                            <label><Briefcase size={16} /> Company Name</label>
                            <input 
                                name="company"
                                value={profile.company} 
                                onChange={handleChange}
                                disabled={saving || uploading}
                            />
                        </div>
                        
                        <div className="form-group-icon">
                            <label><Tag size={16} /> Role</label>
                            <input 
                                name="role"
                                value={profile.role} 
                                onChange={handleChange}
                                disabled={saving || uploading}
                            />
                        </div>
                    </div>

                    <button 
                        onClick={save} 
                        disabled={saving || uploading || !user} 
                        className="profile-save-btn"
                    >
                        {saving ? (
                            <div className="flex-center">
                                <Loader size={20} className="spinner spin-fast" /> Saving...
                            </div>
                        ) : (
                            <div className="flex-center">
                                <Save size={20} /> Save Changes
                            </div>
                        )}
                    </button>
                    
                </div>
            </div>
        </div>
    );
}